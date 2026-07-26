// server.js (backend - Pure MongoDB)
import express from 'express';
import bcrypt from 'bcrypt';
import path from 'path';
import session from 'express-session';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from "fs";
import multer from "multer";
import crypto from "crypto";
import { GoogleGenerativeAI } from "@google/generative-ai";
import iyzipay from "./iyzico.js";
import { connectToMongoDB, User, Package, ConsumedFood, BurnedExercise, WaterIntake } from './mongodb.js';
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

// Statik Dosyaları Sunma (Frontend React Build'i için)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

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
// Özellik Kullanım Kontrol ve Artırma Middleware/Fonksiyonu (MongoDB)
const limitChecker = (featureName, fieldName) => {
    return async (req, res, next) => {
        if (!req.session.ID) {
            return res.status(401).json({ error: 'Yetkilendirme hatası. Giriş yapın.' });
        }
        const ID = req.session.ID;
        
        try {
            // Kullanım bilgilerini çek ve gerekirse sıfırla
            const userState = await getAndResetUsage(ID);
            
            if (!userState) {
                 return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
            }

            const { PackageName, Limits } = userState;
            const limitInfo = Limits[featureName];

            // Premium paket her zaman sınırsız
            if (PackageName === 'Premium') {
                return next();
            }

            // Limit kontrolü
            if (limitInfo && limitInfo.limit !== null && limitInfo.used >= limitInfo.limit) {
                return res.status(403).json({ 
                    error: `${featureName} kullanım limitinizi aştınız. Lütfen paketinizi yükseltin.`,
                    limitExceeded: true,
                    feature: featureName,
                    used: limitInfo.used,
                    limit: limitInfo.limit,
                    packageName: PackageName
                });
            }

            // Limit aşılmadıysa, kullanımı 1 artır (MongoDB)
            const updateField = fieldName === 'PhotoAnalysisUsed' ? 'photoAnalysisUsed' : 
                                fieldName === 'MealSuggestionUsed' ? 'mealSuggestionUsed' : 'bloodTestUsed';
            await User.findByIdAndUpdate(ID, { $inc: { [updateField]: 1 } });

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

// --- API ROTLARI ---

app.post(['/register', '/api/register'], async (req, res) => {
    const { name, email, password, age, weight, height, gender, activityLevel } = req.body;
    console.log('Kayıt isteği alındı (MongoDB):', { name, email, age });
    
    if (!name || !email || !password || !age || !weight || !height || !gender || !activityLevel) {
        return res.status(400).json({ message: 'Lütfen tüm kayıt alanlarını doldurun.' });
    }
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // E-posta kontrolü (MongoDB)
        const userExists = await User.findOne({ email: email.toLowerCase() });

        if (userExists) {
            console.log('HATA: E-posta zaten kullanımda:', email);
            return res.status(409).json({ message: 'Bu e-posta adresi zaten kullanımda.' });
        }
        
        const newUser = new User({
            name,
            email: email.toLowerCase(),
            passwordHash: hashedPassword,
            age: parseInt(age),
            weight: parseFloat(weight),
            height: parseFloat(height),
            gender,
            activityLevel
        });

        await newUser.save();

        console.log(`Kullanıcı '${email}' MongoDB'ye kaydedildi.`);
        res.status(201).json({ message: 'Kayıt başarılı!' });
        
    } catch (err) {
        console.error('Kayıt hatası (MongoDB):', err);
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

// Kullanıcı Limitlerini Çekme ve Aylık Sıfırlama Fonksiyonu (MongoDB)
const getAndResetUsage = async (ID) => {
    try {
        const user = await User.findById(ID);
        if (!user) return null;

        const pkg = await Package.findOne({ packageId: user.packageId || 1 }) || {
            name: 'Free',
            photoAnalysisLimit: 5,
            mealSuggestionLimit: 5,
            bloodTestLimit: 1
        };

        const now = new Date();
        let needsReset = false;

        if (pkg.name !== 'Premium') {
            const lastReset = user.lastUsageReset ? new Date(user.lastUsageReset) : new Date(0);
            if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
                needsReset = true;
            }
        }

        if (needsReset) {
            user.photoAnalysisUsed = 0;
            user.mealSuggestionUsed = 0;
            user.bloodTestUsed = 0;
            user.lastUsageReset = new Date();
            await user.save();
        }

        return {
            PackageName: pkg.name,
            Limits: {
                PhotoAnalysis: { used: user.photoAnalysisUsed || 0, limit: pkg.photoAnalysisLimit },
                MealSuggestion: { used: user.mealSuggestionUsed || 0, limit: pkg.mealSuggestionLimit },
                BloodTest: { used: user.bloodTestUsed || 0, limit: pkg.bloodTestLimit }
            }
        };

    } catch (err) {
        console.error("Kullanım bilgileri hatası (MongoDB):", err);
        return {
            PackageName: 'Free',
            Limits: {
                PhotoAnalysis: { used: 0, limit: 5 },
                MealSuggestion: { used: 0, limit: 5 },
                BloodTest: { used: 0, limit: 1 }
            }
        };
    }
};




app.post(['/login', '/api/login'], async (req, res) => {
    const { email, password } = req.body;
    console.log(`Giriş denemesi (MongoDB): ${email}`);

    try {
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.log(`HATA: Kullanıcı bulunamadı: ${email}`);
            return res.status(401).json({ message: 'E-posta veya parola yanlış.' });
        }

        console.log(`Kullanıcı bulundu: ${user.name}. Şifre karşılaştırılıyor...`);
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);

        if (passwordMatch) {
            req.session.ID = String(user._id);
            req.session.userEmail = user.email;
            
            const userData = {
                id: String(user._id),
                email: user.email,
                name: user.name,
                loggedIn: true,
                age: user.age || undefined,
                weight: user.weight || undefined,
                height: user.height || undefined,
                gender: user.gender || undefined,
                activityLevel: user.activityLevel || undefined,
                subscriptionStatus: user.subscriptionStatus || 'free',
                dailyCalorieGoal: user.dailyCalorieGoal || 2000,
                weightUnit: user.weightUnit || 'kg',
                heightUnit: user.heightUnit || 'cm'
            };
            
            console.log('Giriş başarılı, session oluşturuldu (MongoDB).');
            return res.status(200).json(userData);
        } else {
            console.log('HATA: Şifre yanlış.');
            return res.status(401).json({ message: 'E-posta veya parola yanlış.' });
        }
    } catch (err) {
        console.error('Giriş hatası (MongoDB):', err);
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

// Kullanıcı bilgilerini getir (MongoDB)
app.get('/api/user', async (req, res) => {
    if (!req.session.ID) {
        return res.status(401).json({ loggedIn: false });
    }
    
    try {
        const ID = req.session.ID;
        const userPackageState = await getAndResetUsage(ID); 
        
        const user = await User.findById(ID);
        
        if (user) {
            return res.json({
                id: String(user._id),
                name: user.name,
                email: user.email,
                dailyCalorieGoal: user.dailyCalorieGoal || 2000,
                age: user.age,
                weight: user.weight,
                height: user.height,
                weightUnit: user.weightUnit || 'kg',
                heightUnit: user.heightUnit || 'cm',
                gender: user.gender,
                activityLevel: user.activityLevel,
                loggedIn: true,
                packageInfo: userPackageState
            });
        } else {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
        }
    } catch (err) {
        console.error("Kullanıcı bilgileri hatası (MongoDB):", err);
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
        
        await User.findByIdAndUpdate(ID, {
            packageId: packageId,
            subscriptionStatus: packageName,
            subscriptionEndDate: packageId > 1 ? subscriptionEnds : null,
            photoAnalysisUsed: 0,
            mealSuggestionUsed: 0,
            bloodTestUsed: 0,
            lastUsageReset: new Date()
        });
            
        res.json({ 
            success: true, 
            message: `${packageName} paketine başarıyla geçildi!`,
            newPackageId: packageId 
        });

    } catch (error) {
        console.error('Abonelik hatası (MongoDB):', error);
        res.status(500).json({ error: 'Abonelik hatası.' });
    }
});

// Helper for Iyzico
const generateId = () => crypto.randomBytes(16).toString('hex');

// Iyzico Checkout Form Initialization (MongoDB)
app.post('/api/payment/checkout-form', async (req, res) => {
    try {
        if (!req.session || !req.session.ID) {
            return res.status(401).json({ message: 'Lütfen giriş yapın.' });
        }
        
        const { packageId, price, packageName } = req.body;
        if (!packageId || !price || !packageName) {
            return res.status(400).json({ message: 'Paket bilgileri eksik.' });
        }

        const user = await User.findById(req.session.ID);

        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }

        const protocol = req.protocol || 'http';
        const host = req.get('host');
        const callbackUrl = `${protocol}://${host}/api/payment/callback`;

        const request = {
            locale: iyzipay.LOCALE.TR,
            conversationId: generateId(),
            price: price.toString(),
            paidPrice: price.toString(),
            currency: iyzipay.CURRENCY.TRY,
            basketId: `B-${packageId}-${user._id}`,
            paymentGroup: iyzipay.PAYMENT_GROUP.SUBSCRIPTION,
            callbackUrl: callbackUrl,
            enabledInstallments: [2, 3, 6, 9],
            buyer: {
                id: String(user._id),
                name: user.name.split(' ')[0] || 'Diyet',
                surname: user.name.split(' ')[1] || 'Kullanıcısı',
                gsmNumber: '+905324000000',
                email: user.email,
                identityNumber: '74300864791',
                lastLoginDate: '2023-10-05 12:43:35',
                registrationDate: '2023-04-21 15:12:09',
                registrationAddress: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
                ip: '85.34.78.112',
                city: 'Istanbul',
                country: 'Turkey',
                zipCode: '34732'
            },
            shippingAddress: {
                contactName: user.name,
                city: 'Istanbul',
                country: 'Turkey',
                address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
                zipCode: '34732'
            },
            billingAddress: {
                contactName: user.name,
                city: 'Istanbul',
                country: 'Turkey',
                address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
                zipCode: '34732'
            },
            basketItems: [
                {
                    id: packageId.toString(),
                    name: packageName,
                    category1: 'Subscription',
                    category2: 'Health',
                    itemType: iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
                    price: price.toString()
                }
            ]
        };

        iyzipay.checkoutFormInitialize.create(request, (err, result) => {
            if (err) {
                console.error('Iyzico Initialize Error:', err);
                return res.status(500).json({ message: 'Ödeme sistemiyle iletişim kurulamadı.' });
            }
            if (result.status === 'success') {
                req.session.paymentConversationId = request.conversationId;
                req.session.pendingPackageId = packageId;
                
                res.json({
                    token: result.token,
                    checkoutFormContent: result.checkoutFormContent,
                    tokenExpireTime: result.tokenExpireTime,
                    paymentPageUrl: result.paymentPageUrl
                });
            } else {
                console.error('Iyzico Initialize Failed:', result.errorMessage);
                res.status(400).json({ message: result.errorMessage });
            }
        });

    } catch (error) {
        console.error('Checkout form error:', error);
        res.status(500).json({ message: 'Ödeme formu oluşturulamadı.' });
    }
});

// Iyzico Callback (MongoDB)
app.post('/api/payment/callback', async (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).send('Token eksik.');
    }

    const request = {
        locale: iyzipay.LOCALE.TR,
        conversationId: generateId(),
        token: token
    };

    iyzipay.checkoutForm.retrieve(request, async (err, result) => {
        if (err) {
            console.error('Iyzico Retrieve Error:', err);
            return res.redirect('http://localhost:5173/payment-fail');
        }

        if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
            try {
                const basketIdParts = result.basketId.split('-');
                const packageId = parseInt(basketIdParts[1], 10);
                const userId = basketIdParts[2];

                const pkgDoc = await Package.findOne({ packageId });
                const packageName = pkgDoc ? pkgDoc.name : 'Premium';

                const subscriptionEnds = new Date();
                subscriptionEnds.setMonth(subscriptionEnds.getMonth() + 1);

                await User.findByIdAndUpdate(userId, {
                    packageId: packageId,
                    subscriptionStatus: packageName,
                    subscriptionEndDate: subscriptionEnds
                });
                
                const clientHost = req.get('referer') ? new URL(req.get('referer')).origin : `${req.protocol}://${req.get('host')}`;
                return res.redirect(`${clientHost}/payment-success`);
            } catch (dbError) {
                console.error('Callback DB Error (MongoDB):', dbError);
                const clientHost = req.get('referer') ? new URL(req.get('referer')).origin : `${req.protocol}://${req.get('host')}`;
                return res.redirect(`${clientHost}/payment-fail`);
            }
        } else {
            console.error('Payment not successful:', result.errorMessage);
            const clientHost = req.get('referer') ? new URL(req.get('referer')).origin : `${req.protocol}://${req.get('host')}`;
            return res.redirect(`${clientHost}/payment-fail`);
        }
    });
});

// Çıkış işlemi
app.post('/logout', async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Çıkış hatası:', err);
            return res.status(500).json({ message: 'Çıkış işlemi başarısız.' });
        }

        res.clearCookie('connect.sid');
        res.json({ message: 'Çıkış başarılı!' });
    });
});

// KULLANICI PROFİLİNİ GÜNCELLEME ENDPOINT'İ (MongoDB)
app.put('/api/user/profile', async (req, res) => {
    if (!req.session.ID) {
        return res.status(401).json({ message: 'Yetkisiz erişim.' });
    }

    const { name, email, age, weight, height, gender, activityLevel, dailyCalorieGoal } = req.body;
    const ID = req.session.ID;

    if (!name || !email || !age || !weight || !height || !gender || !activityLevel) {
        return res.status(400).json({ message: 'Lütfen tüm alanları doldurun.' });
    }

    try {
        await User.findByIdAndUpdate(ID, {
            name,
            email: email.toLowerCase(),
            age,
            weight,
            height,
            gender,
            activityLevel,
            dailyCalorieGoal: dailyCalorieGoal || 2000
        });
        
        res.status(200).json({ message: 'Profil başarıyla güncellendi!' });
    } catch (error) {
        console.error('Profil güncelleme hatası (MongoDB):', error);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// YEMEK EKLEME ENDPOINT'İ (MongoDB)
app.post('/api/add-food', async (req, res) => {
  try {
    const userId = req.session?.ID ?? req.body.ID ?? req.body.UserID ?? null;
    const { foodId, name, calories, protein, carbs, fat, amount, meal, date } = req.body;
    const dateParam = date || new Date().toISOString().slice(0,10);
    
    if (!userId) return res.status(401).json({ message: 'Yetkisiz.' });

    if (!name || calories == null) {
        return res.status(400).json({ message: 'Eksik veri: İsim ve kalori zorunludur.' });
    }

    const newFood = new ConsumedFood({
      userId,
      foodId,
      name,
      calories,
      protein: protein || 0,
      carbs: carbs || 0,
      fat: fat || 0,
      amount: amount || 100,
      mealTime: meal,
      date: dateParam
    });

    await newFood.save();

    console.log(`[MongoDB] Yemek Kaydedildi: ${name} (${calories} kcal) - UserID: ${userId}`);
    return res.status(201).json({ message: 'Yemek başarıyla eklendi.', id: String(newFood._id) });
  } catch (err) {
    console.error('[MongoDB HATA] Yemek eklenemedi:', err);
    return res.status(500).json({ message: err.message });
  }
});

// EGZERSİZ EKLEME ENDPOINT'İ (MongoDB)
app.post('/api/add-exercise', async (req, res) => {
    try {
        const { exerciseId, name, minutes, totalCaloriesBurned, date } = req.body;
        const userId = req.session.ID;

        if (!userId) return res.status(401).json({ message: 'Yetkisiz.' });
        
        const newExercise = new BurnedExercise({
            userId,
            exerciseId,
            name,
            minutes,
            totalCaloriesBurned,
            date: date || new Date().toISOString().slice(0,10)
        });

        await newExercise.save();
        
        console.log(`[MongoDB] Egzersiz Kaydedildi: ${name} (${totalCaloriesBurned} kcal) - UserID: ${userId}`);
        res.status(200).json({ message: 'Egzersiz eklendi', id: String(newExercise._id) });
    } catch (error) {
        console.error('[MongoDB HATA] Egzersiz eklenemedi:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// SU EKLEME ENDPOINT'İ (MongoDB)
app.post('/api/add-water', async (req, res) => {
    try {
        const { amount, date } = req.body;
        const userId = req.session.ID;

        if (!userId) return res.status(401).json({ message: 'Yetkisiz.' });
        
        const newWater = new WaterIntake({
            userId,
            amount,
            date: date || new Date().toISOString().slice(0,10)
        });

        await newWater.save();
        
        console.log(`[MongoDB] Su Kaydedildi: ${amount}ml - UserID: ${userId}`);
        res.status(200).json({ message: 'Su eklendi', id: String(newWater._id) });
    } catch (error) {
        console.error('[MongoDB HATA] Su eklenemedi:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// GÜNLÜK VERİLERİ ÇEKME ENDPOINT'İ (MongoDB)
app.get('/api/daily-logs', async (req, res) => {
    try {
        const userId = req.session.ID;
        const date = req.query.date;
        if (!userId || !date) return res.status(401).json({ message: 'Eksik bilgi.' });
        
        const rawFoods = await ConsumedFood.find({ userId, date });
        const rawExercises = await BurnedExercise.find({ userId, date });
        const waterDocs = await WaterIntake.find({ userId, date });

        const totalWaterIntake = waterDocs.reduce((sum, w) => sum + w.amount, 0);

        const consumedFoods = rawFoods.map(f => ({
            id: String(f._id),
            ID: String(f._id),
            name: f.name,
            Name: f.name,
            totalCalories: f.calories,
            Calories: f.calories,
            totalProtein: f.protein,
            Protein: f.protein,
            totalCarbs: f.carbs,
            Carbs: f.carbs,
            totalFat: f.fat,
            Fat: f.fat,
            amount: f.amount,
            Amount: f.amount,
            mealTime: f.mealTime,
            MealTime: f.mealTime,
            date: f.date,
            Date: f.date
        }));

        const burnedExercises = rawExercises.map(e => ({
            id: String(e._id),
            ID: String(e._id),
            name: e.name,
            Name: e.name,
            minutes: e.minutes,
            Minutes: e.minutes,
            totalCaloriesBurned: e.totalCaloriesBurned,
            TotalCaloriesBurned: e.totalCaloriesBurned,
            date: e.date,
            Date: e.date
        }));

        res.status(200).json({
            consumedFoods,
            burnedExercises,
            totalWaterIntake
        });
    } catch (error) {
        console.error('Günlük veri çekme hatası (MongoDB):', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// YEMEK KAYDINI SİLME ENDPOINT'İ (MongoDB)
app.delete('/api/delete-food/:id', async (req, res) => {
  if (!req.session.ID) return res.status(401).json({ message: 'Yetkisiz.' });
  try {
    const deleted = await ConsumedFood.findOneAndDelete({ _id: req.params.id, userId: req.session.ID });
    if (deleted) return res.status(200).json({ message: 'Silindi.' });
    return res.status(404).json({ message: 'Bulunamadı.' });
  } catch (err) {
    res.status(500).json({ message: 'Hata.' });
  }
});

// EGZERSİZ KAYDINI SİLME ENDPOINT'İ (MongoDB)
app.delete('/api/delete-exercise/:id', async (req, res) => {
    if (!req.session.ID) return res.status(401).json({ message: 'Yetkisiz.' });
    try {
        const deleted = await BurnedExercise.findOneAndDelete({ _id: req.params.id, userId: req.session.ID });
        if (deleted) return res.status(200).json({ message: 'Silindi.' });
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
    // Pure MongoDB Veritabanı Bağlantısı
    await connectToMongoDB();

    app.listen(port, () => {
      console.log(`Sunucu http://localhost:${port} adresinde çalışıyor (Pure MongoDB 🚀)`);
    });

    // React Router Catch-All (Tüm sayfa route'larını index.html'e yönlendir)
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api/')) {
            return res.status(404).json({ message: 'API Endpoint bulunamadı.' });
        }
        
        const indexPath = path.join(__dirname, '../frontend/dist/index.html');
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            res.status(404).send('Frontend build (dist/index.html) bulunamadı. Lütfen "npm run build" çalıştırın.');
        }
    });
  } catch (error) {
    console.error('Sunucu başlatılamadı:', error);
    process.exit(1); // Kritik bir hata varsa uygulamayı sonlandır
  }
};

// Sunucuyu başlatma fonksiyonunu çağırıyoruz
startServer();  