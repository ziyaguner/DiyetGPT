// server.js (backend)
import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';
import path from 'path';
import session from 'express-session';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from "fs";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";
dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const chatModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
const visionModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const upload = multer({ dest: "uploads/" });

// Ortam değişkenlerini .env dosyasından yükleyin
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;


// CORS Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174',],
  credentials: true
}));

// Middleware'ler
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true })); // extended: true yapın

// Oturum (Session) ayarları
app.use(session({
    secret: process.env.SESSION_SECRET || 'cok-gizli-bir-anahtar',
    resave: false,
    saveUninitialized: false, // false yapın
    cookie: {
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 saat
    }
}));
// Özellik Kullanım Kontrol ve Artırma Middleware/Fonksiyonu
const limitChecker = (featureName, fieldName) => {
    return async (req, res, next) => {
        if (!req.session.ID) {
            return res.status(401).json({ error: 'Yetkilendirme hatası. Giriş yapın.' });
        }
        const ID = req.session.ID;
        
        try {
            // Kullanım bilgilerini çek ve gerekirse sıfırla
            const userState = await getAndResetUsage(ID, db);
            
            if (!userState) {
                 return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
            }

            const { PackageName, Limits } = userState;
            const limitInfo = Limits[featureName];

            // Premium paket her zaman sınırsız
            if (PackageName === 'Premium') {
                return next();
            }

            // Limit kontrolü (limit NULL değilse ve kullanılan limit aşıyorsa)
            if (limitInfo.limit !== null && limitInfo.used >= limitInfo.limit) {
                return res.status(403).json({ 
                    error: `${featureName} kullanım limitinizi aştınız. Lütfen paketinizi yükseltin.`,
                    limitExceeded: true,
                    feature: featureName,
                    used: limitInfo.used,
                    limit: limitInfo.limit,
                    packageName: PackageName
                });
            }

            // Limit aşılmadıysa, kullanımı 1 artır
            await db.run(`UPDATE Users SET ${fieldName} = ${fieldName} + 1 WHERE ID = ?`, [ID]);

            next();

        } catch (error) {
            console.error(`Limit kontrolü hatası (${featureName}):`, error);
            res.status(500).json({ error: 'Sunucu hatası, limit kontrolü yapılamadı.' });
        } 
        
    };
};
// Fotoğraf analizi endpoint'i
app.post('/api/analyze-image', limitChecker('PhotoAnalysis', 'PhotoAnalysisUsed'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Resim yüklenmedi." });
    }

    // Dosyayı Base64 formatına çevir
    const imagePath = req.file.path;
    const imageData = fs.readFileSync(imagePath).toString("base64");
    
    // Yukarıda tanımlanan visionModel'i kullanıyoruz
    const model = visionModel;

    const prompt = `
        Bu bir yemek fotoğrafı. Lütfen bu yemeği analiz et ve şu bilgileri içeren bir JSON objesi döndür:
        {
            "name": "yemeğin ismi",
            "calories": kalori_miktarı (sayı),
            "protein": protein_miktarı (sayı),
            "carbs": karbonhidrat_miktarı (sayı),
            "fat": yağ_miktarı (sayı),
            "grams": porsiyon_ağırlığı (sayı, gram cinsinden)
        }
        Sadece JSON objesini döndür, başka açıklama yazma.
    `;

    const result = await model.generateContent([
        prompt,
        {
            inlineData: {
                data: imageData,
                mimeType: req.file.mimetype
            }
        }
    ]);
    
    const response = await result.response;
    let text = response.text();

    // Temizlik: Markdown işaretlerini kaldır (```json ve ```)
    text = text.replace(/```json|```/g, "").trim();

    // Geçici dosyayı sil
    fs.unlinkSync(imagePath);

    // JSON olarak parse edip frontend'e gönderiyoruz ki frontend string parse ile uğraşmasın
    try {
        const jsonResponse = JSON.parse(text);
        // Frontend "analysis" içinde JSON string bekliyor olabilir veya direkt obje. 
        // Dashboard.tsx koduna uyumlu olması için string olarak gönderip orada parse ettirebiliriz 
        // VEYA frontend kodunu da düzelteceğiz. Şimdilik obje dönelim.
        res.json({ analysis: text }); 
    } catch (e) {
        console.error("AI JSON formatında vermedi:", text);
        res.json({ analysis: text }); // Hatalı format olsa da metni dön
    }

  } catch (error) {
    console.error("Fotoğraf analizi hatası:", error);
    // Hata olsa bile temp dosyayı silmeye çalış
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: "Sunucu hatası, analiz yapılamadı." });
  }
});
//Kan Anilizi
app.post('/api/analyze-blood-test', limitChecker('BloodTest', 'BloodTestUsed'), async (req, res) => {
  try {
    const { bloodTestResults, imageData } = req.body;

    if (!bloodTestResults && !imageData) {
      return res.status(400).json({ message: 'Kan testi sonuçları veya görsel verisi eksik.' });
    }

    const promptText = `
      Sen DiyetGPT sağlık asistanısın. Aşağıdaki kan testi verilerini analiz et:
      ${bloodTestResults ? "Metin Verisi: " + bloodTestResults : ""}
      ${imageData ? "(Ek olarak bir laboratuvar raporu fotoğrafı gönderildi)" : ""}
      
      Lütfen şunları yap:
      1. Önemli değerleri (Vitamin, Mineral, Kolesterol vb.) kontrol et.
      2. Referans dışı (yüksek/düşük) değerleri belirt.
      3. Bu değerlere göre beslenme tavsiyeleri ver.
      4. KESİNLİKLE tıbbi tanı koyma ve bir doktora danışılması gerektiğini vurgula.
    `;

    let parts = [{ text: promptText }];
    
    if (imageData) {
      parts.push({
        inlineData: {
          mimeType: "image/png", // Genellikle frontend'den base64 png gelir
          data: imageData
        }
      });
    }

    const result = await visionModel.generateContent(parts);
    const response = await result.response;
    const reply = response.text();

    res.json({ reply });

  } catch (error) {
    console.error('Kan testi analizi backend hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası, analiz yapılamadı.' });
  }
});

let db;

async function connectToDatabase() {
    try {
        const dbPath = path.join(__dirname, 'database.sqlite');
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });
        console.log(`SQLite veritabanına bağlandı! Dosya yolu: ${dbPath}`);
        
        // Tabloları kontrol et ve yoksa oluştur
        await ensureTableExists();
    } catch (err) {
        console.error('Veritabanı bağlantısı başarısız:', err);
    }
}

async function ensureTableExists() {
    try {
        console.log('Veritabanı şeması kontrol ediliyor...');

        // 1. Packages Tablosu
        await db.run(`
            CREATE TABLE IF NOT EXISTS Packages (
                PackageID INTEGER PRIMARY KEY,
                Name TEXT NOT NULL,
                PhotoAnalysisLimit INTEGER,
                MealSuggestionLimit INTEGER,
                BloodTestLimit INTEGER
            )
        `);

        // Varsayılan paketleri ekle (yoksa)
        const packagesCount = await db.get('SELECT COUNT(*) as count FROM Packages');
        if (packagesCount.count === 0) {
            await db.run(`
                INSERT INTO Packages (PackageID, Name, PhotoAnalysisLimit, MealSuggestionLimit, BloodTestLimit) VALUES
                (1, 'Free', 5, 5, 1),
                (2, 'Normal', 20, 20, 5),
                (3, 'Premium', NULL, NULL, NULL)
            `);
            console.log('Varsayılan paketler eklendi.');
        }

        // 2. Users Tablosu
        await db.run(`
            CREATE TABLE IF NOT EXISTS Users (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                Name TEXT NOT NULL,
                Email TEXT UNIQUE NOT NULL,
                PasswordHash TEXT NOT NULL,
                Age INTEGER,
                Weight REAL,
                Height REAL,
                Gender TEXT,
                ActivityLevel TEXT,
                SubscriptionStatus TEXT NOT NULL DEFAULT 'free',
                SubscriptionEndDate TEXT,
                PackageID INTEGER DEFAULT 1,
                PhotoAnalysisUsed INTEGER DEFAULT 0,
                MealSuggestionUsed INTEGER DEFAULT 0,
                BloodTestUsed INTEGER DEFAULT 0,
                LastUsageReset TEXT DEFAULT CURRENT_TIMESTAMP,
                dailyCalorieGoal INTEGER,
                weightUnit TEXT DEFAULT 'kg',
                heightUnit TEXT DEFAULT 'cm',
                CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. ConsumedFoods Tablosu
        await db.run(`
            CREATE TABLE IF NOT EXISTS ConsumedFoods (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                UserID INTEGER NOT NULL,
                FoodID TEXT,
                Name TEXT NOT NULL,
                Calories REAL NOT NULL,
                Protein REAL,
                Carbs REAL,
                Fat REAL,
                Amount REAL,
                MealTime TEXT,
                Date TEXT NOT NULL,
                CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 4. BurnedExercises Tablosu
        await db.run(`
            CREATE TABLE IF NOT EXISTS BurnedExercises (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                UserID INTEGER NOT NULL,
                ExerciseID TEXT,
                Name TEXT NOT NULL,
                Minutes INTEGER NOT NULL,
                TotalCaloriesBurned INTEGER NOT NULL,
                Date TEXT NOT NULL,
                CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 5. WaterIntake Tablosu
        await db.run(`
            CREATE TABLE IF NOT EXISTS WaterIntake (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                UserID INTEGER NOT NULL,
                Amount INTEGER NOT NULL,
                Date TEXT NOT NULL,
                CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Veritabanı doluluk kontrolü logu
        const foodCount = await db.get('SELECT COUNT(*) as count FROM ConsumedFoods');
        const waterCount = await db.get('SELECT COUNT(*) as count FROM WaterIntake');
        const userCount = await db.get('SELECT COUNT(*) as count FROM Users');
        
        console.log('--- Veritabanı Durum Özeti ---');
        console.log(`Kayıtlı Kullanıcı: ${userCount.count}`);
        console.log(`Toplam Yemek Kaydı: ${foodCount.count}`);
        console.log(`Toplam Su Kaydı: ${waterCount.count}`);
        console.log('------------------------------');

        console.log('Veritabanı şeması başarıyla güncellendi.');
    } catch (error) {
        console.error('Tablo oluşturma/kontrol hatası:', error);
    }
}

// --- API ROTLARI ---

app.post('/register', async (req, res) => {
    const { name, email, password, age, weight, height, gender, activityLevel } = req.body;
    console.log('Kayıt isteği alındı:', { name, email, age });
    
    if (!name || !email || !password || !age || !weight || !height || !gender || !activityLevel) {
        return res.status(400).json({ message: 'Tüm alanlar gerekli.' });
    }
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Şifre başarıyla hashlendi.');
        
        // E-posta kontrolü
        const userExists = await db.get('SELECT 1 FROM Users WHERE Email = ?', [email]);

        if (userExists) {
            console.log('HATA: E-posta zaten kullanımda:', email);
            return res.status(409).json({ message: 'Bu e-posta adresi zaten kullanımda.' });
        }
        
        await db.run(`
            INSERT INTO Users (Name, Email, PasswordHash, Age, Weight, Height, Gender, ActivityLevel) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [name, email, hashedPassword, parseInt(age), parseFloat(weight), parseFloat(height), gender, activityLevel]);

        console.log(`Kullanıcı '${email}' başarıyla kaydedildi.`);
        res.status(201).json({ message: 'Kayıt başarılı!' });
        
    } catch (err) {
        console.error('Kayıt hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası: ' + err.message });
    }
});
// AI Sohbet endpoint'i
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    // Chat geçmişi başlat
    const chat = chatModel.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Sen DiyetGPT adında uzman bir diyetisyen, spor hocası ve sağlıklı yaşam koçusun. Kısa, motive edici ve net cevaplar ver." }],
        },
        {
          role: "model",
          parts: [{ text: "Anlaşıldı! Ben DiyetGPT. Sağlıklı yaşam hedeflerine ulaşman için buradayım. Nasıl yardımcı olabilirim?" }],
        },
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();
    
    res.json({ reply: text });

  } catch (err) {
    console.error("Chat hatası:", err);
    res.status(500).json({ reply: "Şu an bağlantıda bir sorun var, lütfen biraz sonra tekrar dene." });
  }
});

// Kullanıcı Limitlerini Çekme ve Aylık Sıfırlama Fonksiyonu
// Kullanıcının paketini ve limitlerini çeker, bir ay geçtiyse kullanımları sıfırlar.
const getAndResetUsage = async (ID, db) => {
    try {
        let user = await db.get(`
            SELECT 
                u.PackageID, u.SubscriptionEndDate, u.PhotoAnalysisUsed, u.MealSuggestionUsed, u.BloodTestUsed, u.LastUsageReset,
                p.Name AS PackageName, p.PhotoAnalysisLimit, p.MealSuggestionLimit, p.BloodTestLimit
            FROM Users u
            JOIN Packages p ON u.PackageID = p.PackageID
            WHERE u.ID = ?
        `, [ID]);

        if (!user) {
            return null;
        }

        const now = new Date();
        let needsReset = false;

        if (user.PackageName !== 'Premium') {
            const lastReset = user.LastUsageReset ? new Date(user.LastUsageReset) : new Date(0);
            if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
                needsReset = true;
            }
        }
        
        if (needsReset) {
            await db.run(`
                UPDATE Users SET 
                    PhotoAnalysisUsed = 0, 
                    MealSuggestionUsed = 0, 
                    BloodTestUsed = 0,
                    LastUsageReset = CURRENT_TIMESTAMP
                WHERE ID = ?
            `, [ID]);
            user.PhotoAnalysisUsed = 0;
            user.MealSuggestionUsed = 0;
            user.BloodTestUsed = 0;
        }

        return {
            ...user,
            Limits: {
                PhotoAnalysis: { used: user.PhotoAnalysisUsed, limit: user.PhotoAnalysisLimit },
                MealSuggestion: { used: user.MealSuggestionUsed, limit: user.MealSuggestionLimit },
                BloodTest: { used: user.BloodTestUsed, limit: user.BloodTestLimit }
            }
        };

    } catch (err) {
        console.error("Kullanım bilgileri hatası:", err);
        throw err;
    }
};




app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`Giriş denemesi: ${email}`);

    try {
        const user = await db.get('SELECT ID, Name, Email, PasswordHash, Age, Weight, Height, Gender, ActivityLevel, SubscriptionStatus FROM Users WHERE Email = ?', [email]);

        if (!user) {
            console.log(`HATA: Kullanıcı bulunamadı: ${email}`);
            return res.status(401).json({ message: 'E-posta veya parola yanlış.' });
        }

        console.log(`Kullanıcı bulundu: ${user.Name}. Şifre karşılaştırılıyor...`);
        const passwordMatch = await bcrypt.compare(password, user.PasswordHash);
        console.log(`Şifre eşleşme sonucu: ${passwordMatch}`);

        if (passwordMatch) {
            req.session.ID = user.ID;
            req.session.userEmail = user.Email;
            
            const userData = {
                id: user.ID,
                email: user.Email,
                name: user.Name,
                loggedIn: true,
                age: user.Age || undefined,
                weight: user.Weight || undefined,
                height: user.Height || undefined,
                gender: user.Gender || undefined,
                activityLevel: user.ActivityLevel || undefined,
                subscriptionStatus: user.SubscriptionStatus || 'free',
                weightUnit: 'kg',
                heightUnit: 'cm'
            };
            
            console.log('Giriş başarılı, session oluşturuldu.');
            return res.status(200).json(userData);
        } else {
            console.log('HATA: Şifre yanlış.');
            return res.status(401).json({ message: 'E-posta veya parola yanlış.' });
        }
    } catch (err) {
        console.error('Giriş hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// Oturum kontrolü middleware'i
app.use((req, res, next) => {
    if (process.env.NODE_ENV === "development") {
        console.log("Session:", req.session);
    }
    next();
});

// Kullanıcı bilgilerini getir
app.get('/api/user', async (req, res) => {
    if (!req.session.ID) {
        return res.status(401).json({ loggedIn: false });
    }
    
    try {
        const ID = req.session.ID;
        const userPackageState = await getAndResetUsage(ID, db); 
        
        let userData = await db.get(`
            SELECT 
                Name, Email, dailyCalorieGoal, age, weight, height, weightUnit, heightUnit, gender, activityLevel
            FROM Users 
            WHERE ID = ?
        `, [ID]);
        
        if (userData) {
            return res.json({
                ...userData,
                loggedIn: true,
                packageInfo: userPackageState
            });
        } else {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
        }
    } catch (err) {
        console.error("Kullanıcı bilgileri hatası:", err);
        res.status(500).json({ error: 'Sunucu hatası.' });
    }
});
app.post('/api/subscribe', async (req, res) => {
    if (!req.session.ID) {
        return res.status(401).json({ error: 'Yetkilendirme hatası.' });
    }
    const { packageId, packageName } = req.body;
    const ID = req.session.ID;

    if (!packageId || !packageName) {
        return res.status(400).json({ error: 'Paket bilgisi eksik.' });
    }

    try {
        const subscriptionEnds = new Date();
        subscriptionEnds.setMonth(subscriptionEnds.getMonth() + 1); 
        
        await db.run(`
            UPDATE Users SET 
                PackageID = ?, 
                SubscriptionEndDate = ?,
                PhotoAnalysisUsed = 0, 
                MealSuggestionUsed = 0, 
                BloodTestUsed = 0,
                LastUsageReset = CURRENT_TIMESTAMP
            WHERE ID = ?
        `, [packageId, packageId > 1 ? subscriptionEnds.toISOString() : null, ID]);
            
        res.json({ 
            success: true, 
            message: `${packageName} paketine başarıyla geçildi!`,
            newPackageId: packageId 
        });

    } catch (error) {
        console.error('Abonelik hatası:', error);
        res.status(500).json({ error: 'Abonelik hatası.' });
    }
});

// Çıkış işlemi
app.post('/logout', async (req, res) => {
    // Eğer frontend logout çağrısında weight/waist gönderirse kaydet
    

    req.session.destroy((err) => {
        if (err) {
            console.error('Çıkış hatası:', err);
            return res.status(500).json({ message: 'Çıkış işlemi başarısız.' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Çıkış başarılı!' });
    });
});
// KULLANICI PROFİLİNİ GÜNCELLEME ENDPOINT'İ
app.put('/api/user/profile', async (req, res) => {
    if (!req.session.ID) {
        return res.status(401).json({ message: 'Yetkisiz erişim.' });
    }

    const { name, email, age, weight, height, gender, activityLevel } = req.body;
    const ID = req.session.ID;

    if (!name || !email || !age || !weight || !height || !gender || !activityLevel) {
        return res.status(400).json({ message: 'Lütfen tüm alanları doldurun.' });
    }

    try {
        await db.run(`
            UPDATE Users 
            SET Name = ?, Email = ?, Age = ?, Weight = ?, Height = ?, Gender = ?, ActivityLevel = ?
            WHERE ID = ?
        `, [name, email, age, weight, height, gender, activityLevel, ID]);
        
        res.status(200).json({ message: 'Profil başarıyla güncellendi!' });
    } catch (error) {
        console.error('Profil güncelleme hatası:', error);
        if (error.code === 'SQLITE_CONSTRAINT' || error.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ message: 'Bu e-posta adresi başka bir hesap tarafından kullanılıyor.' });
        }
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});




app.post('/api/add-food', async (req, res) => {
  try {
    const UserID = req.session?.ID ?? req.body.ID ?? req.body.UserID ?? null;
    const { foodId, name, calories, protein, carbs, fat, amount, meal, date } = req.body;
    const DateParam = date || new Date().toISOString().slice(0,10);

    console.log('--- Yemek Ekleme İsteği Detayı ---');
    console.log(`Gelen Veri:`, { foodId, name, calories, protein, carbs, fat, amount, meal, date });
    console.log(`UserID: ${UserID}`);
    
    if (!UserID) return res.status(401).json({ message: 'Yetkisiz.' });

    if (!name || calories == null) {
        console.log(`HATA: Eksik veri saptandı! Name: ${name}, Calories: ${calories}`);
        return res.status(400).json({ message: 'Eksik veri: İsim ve kalori zorunludur.' });
    }

    const result = await db.run(`
      INSERT INTO ConsumedFoods (UserID, FoodID, Name, Calories, Protein, Carbs, Fat, Amount, MealTime, Date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [UserID, foodId, name, calories, protein, carbs, fat, amount, meal, DateParam]);

    console.log(`[DB] Yemek Kaydedildi: ${name} (${calories} kcal) - UserID: ${UserID}`);
    return res.status(201).json({ message: 'Yemek başarıyla eklendi.', id: result.lastID });
  } catch (err) {
    console.error('[DB HATA] Yemek eklenemedi:', err);
    return res.status(500).json({ message: err.message });
  }
});






// Egzersiz ekleme endpoint'i
// Egzersiz ekleme endpoint'i
app.post('/api/add-exercise', async (req, res) => {
    try {
        const { exerciseId, name, minutes, totalCaloriesBurned, date } = req.body;
        const UserID = req.session.ID;

        if (!UserID) return res.status(401).json({ message: 'Yetkisiz.' });
        
        const result = await db.run(`
            INSERT INTO BurnedExercises (UserID, ExerciseID, Name, Minutes, TotalCaloriesBurned, Date)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [UserID, exerciseId, name, minutes, totalCaloriesBurned, date]);
        
        console.log(`[DB] Egzersiz Kaydedildi: ${name} (${totalCaloriesBurned} kcal) - UserID: ${UserID}`);
        res.status(200).json({ message: 'Egzersiz eklendi', id: result.lastID });
    } catch (error) {
        console.error('[DB HATA] Egzersiz eklenemedi:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

app.post('/api/add-water', async (req, res) => {
    try {
        const { amount, date } = req.body;
        const UserID = req.session.ID;

        if (!UserID) return res.status(401).json({ message: 'Yetkisiz.' });
        
        const result = await db.run(`
            INSERT INTO WaterIntake (UserID, Amount, Date)
            VALUES (?, ?, ?)
        `, [UserID, amount, date]);
        
        console.log(`[DB] Su Kaydedildi: ${amount}ml - UserID: ${UserID}`);
        res.status(200).json({ message: 'Su eklendi', id: result.lastID });
    } catch (error) {
        console.error('[DB HATA] Su eklenemedi:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Günlük verileri çekme endpoint'i
app.get('/api/daily-logs', async (req, res) => {
    try {
        const ID = req.session.ID;
        const date = req.query.date;
        if (!ID || !date) return res.status(401).json({ message: 'Eksik bilgi.' });
        
        const consumedFoods = await db.all('SELECT * FROM ConsumedFoods WHERE UserID = ? AND Date = ?', [ID, date]);
        const burnedExercises = await db.all('SELECT * FROM BurnedExercises WHERE UserID = ? AND Date = ?', [ID, date]);
        const waterResult = await db.get('SELECT SUM(Amount) as totalWater FROM WaterIntake WHERE UserID = ? AND Date = ?', [ID, date]);

        res.status(200).json({
            consumedFoods,
            burnedExercises,
            totalWaterIntake: waterResult ? (waterResult.totalWater || 0) : 0
        });
    } catch (error) {
        console.error('Günlük veri çekme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});


// YEMEK KAYDINI SİLME ENDPOINT'İ
app.delete('/api/delete-food/:id', async (req, res) => {
  if (!req.session.ID) return res.status(401).json({ message: 'Yetkisiz.' });
  try {
    const result = await db.run('DELETE FROM ConsumedFoods WHERE ID = ? AND UserID = ?', [req.params.id, req.session.ID]);
    if (result.changes > 0) return res.status(200).json({ message: 'Silindi.' });
    return res.status(404).json({ message: 'Bulunamadı.' });
  } catch (err) {
    res.status(500).json({ message: 'Hata.' });
  }
});

app.delete('/api/delete-exercise/:id', async (req, res) => {
    if (!req.session.ID) return res.status(401).json({ message: 'Yetkisiz.' });
    try {
        const result = await db.run('DELETE FROM BurnedExercises WHERE ID = ? AND UserID = ?', [req.params.id, req.session.ID]);
        if (result.changes > 0) return res.status(200).json({ message: 'Silindi.' });
        return res.status(404).json({ message: 'Bulunamadı.' });
    } catch (error) {
        res.status(500).json({ message: 'Hata.' });
    }
});
// Yemek tarifi API endpoint'i


app.post('/api/generate-recipe',limitChecker('MealSuggestion', 'MealSuggestionUsed'), async (req, res) => {
  try {
    const { ingredients: userIngredients, mode } = req.body;

    if (!userIngredients || !Array.isArray(userIngredients) || userIngredients.length === 0) {
      return res.status(400).json({ error: 'Geçerli bir malzeme listesi gerekli.' });
    }

    const ingredientList = userIngredients.join(', ');
    let prompt;

    if (mode === 'strict') {
      prompt = `Sen DiyetGPT adında bir sağlık koçusun. Aşağıdaki malzemeleri kullanarak ve DIŞARIDAN BAŞKA HİÇBİR ANA MALZEME EKLEMEDEN sağlıklı bir yemek tarifi oluştur: ${ingredientList}.
Lütfen cevabını SADECE aşağıdaki JSON formatında ver, markdown işaretleri veya başka hiçbir açıklama ekleme:
{
  "recipe": "Tarifin başlığı ve detaylı adım adım hazırlanışı",
  "ingredients": ["Kullanılan Malzeme 1", "Kullanılan Malzeme 2"]
}`;
    } else {
      prompt = `Sen DiyetGPT adında bir sağlık koçusun. Aşağıdaki malzemeleri İÇEREN sağlıklı bir yemek tarifi oluştur: ${ingredientList}. Gerekirse bu malzemelere ek olarak yaygın bulunan başka malzemeler de ekleyebilirsin.
Lütfen cevabını SADECE aşağıdaki JSON formatında ver, markdown işaretleri veya başka hiçbir açıklama ekleme:
{
  "recipe": "Tarifin başlığı ve detaylı adım adım hazırlanışı",
  "ingredients": ["Kullanılan Malzeme 1", "Kullanılan Malzeme 2"]
}`;
    }

    const result = await visionModel.generateContent(prompt);
    const response = await result.response;
    let fullText = response.text();
    
    // Temizle ve Parse et
    fullText = fullText.replace(/```json|```/g, "").trim();
    let parsedData;
    try {
        parsedData = JSON.parse(fullText);
    } catch (e) {
        console.error("Yemek tarifi JSON parse hatası:", fullText);
        return res.status(500).json({ error: 'Yapay zeka formatı anlaşılamadı.' });
    }

    const recipeText = parsedData.recipe || "Tarif oluşturulamadı.";
    const geminiIngredients = parsedData.ingredients || [];

    // Malzemeleri renklendirme için hazırlıyoruz: Hangisi kullanıcıdan, hangisi değil?
    const categorizedIngredients = geminiIngredients.map((ingName) => {
      const isUserIngredient = userIngredients.some((userIng) => ingName.toLowerCase().includes(userIng.toLowerCase()));
      return {
        name: ingName,
        isUserIngredient: isUserIngredient
      };
    });

    // Frontend'e yapılandırılmış veri gönderiyoruz.
    res.json({
      recipe: recipeText,
      ingredients: categorizedIngredients
    });

  } catch (error) {
    console.error('Gemini API hatası:', error);
    res.status(500).json({ error: 'Yemek önerileri alınırken bir hata oluştu.' });
  }
});





// Sunucuyu başlatmak için asenkron bir fonksiyon oluşturuyoruz
const startServer = async () => {
  try {
    // Önce veritabanı bağlantısının tamamlanmasını bekliyoruz.
    await connectToDatabase();
    
    // Veritabanı hazır olduğunda sunucuyu dinlemeye başlıyoruz.
    app.listen(port, '0.0.0.0', () => {
      console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
    });
  } catch (error) {
    console.error('Sunucu başlatılamadı:', error);
    process.exit(1); // Kritik bir hata varsa uygulamayı sonlandır
  }
};

// Sunucuyu başlatma fonksiyonunu çağırıyoruz
startServer();  