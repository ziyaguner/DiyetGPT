<![CDATA[<div align="center">
  <h1>🍏 DiyetGPT — Yapay Zeka Destekli Diyet Asistanı 🤖</h1>
  <p><strong>Akıllı kalori takibi, AI yemek analizi, tarif önerisi ve kan tahlili yorumlama — hepsi tek platformda.</strong></p>

  <br/>

  ![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white)
  ![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
  ![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
  ![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)
  ![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
  ![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)
  ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
  ![License](https://img.shields.io/badge/Lisans-MIT-green?style=for-the-badge)

</div>

---

## 📖 Proje Hakkında

**DiyetGPT**, sağlıklı beslenme ve kalori yönetimini herkes için erişilebilir kılmak amacıyla geliştirilmiş, tam kapsamlı (full-stack) bir web uygulamasıdır.

Kullanıcılar günlük yedikleri yemekleri ve yaptıkları egzersizleri kaydedebilir, su tüketimlerini takip edebilir ve **Google Gemini 2.5 Flash** yapay zeka modeli sayesinde:

- 📸 Yemek fotoğrafı yükleyerek **anında kalori ve makro besin analizi** alabilir,
- 🧑‍🍳 Elindeki malzemeleri yazarak **AI destekli sağlıklı tarif önerisi** alabilir,
- 🩸 Kan tahlili sonuçlarını yükleyerek **yapay zeka ile sağlık yorumları** alabilir,
- 📊 VKİ, BMR, günlük kalori ihtiyacı gibi **sağlık metriklerini canlı olarak** görüntüleyebilir.

Uygulama, modern bir kullanıcı deneyimi sunmak için **Glassmorphism** tasarım dili, **Dark Mode** desteği ve **Framer Motion** animasyonları ile donatılmıştır.

---

## ✨ Özellikler

### 🔐 Kimlik Doğrulama ve Kullanıcı Yönetimi
| Özellik | Açıklama |
|---|---|
| **Kayıt Ol** | İsim, e-posta, şifre, yaş, boy, kilo, cinsiyet ve aktivite seviyesi ile detaylı kayıt |
| **Giriş Yap** | E-posta + şifre ile güvenli oturum açma (bcrypt şifreleme) |
| **Oturum Yönetimi** | Express-Session ile 24 saatlik güvenli oturum |
| **Hata Yönetimi** | Yanlış şifre/e-posta durumunda kullanıcı dostu bildirimler (beyaz ekran hatası düzeltildi) |

### 📊 Ana Dashboard (Kontrol Paneli)
| Özellik | Açıklama |
|---|---|
| **Günlük Kalori Özeti** | Alınan kalori, yakılan kalori ve net kalori kartları |
| **Makro Besin Takibi** | Protein, karbonhidrat ve yağ dağılımı |
| **Su Tüketimi Takibi** | Bardak bardak su ekleme ve günlük hedef takibi |
| **Haftalık Grafik** | Recharts ile görselleştirilmiş kalori trendi |
| **Tarih Gezintisi** | İleri-geri ok tuşlarıyla günler arası geçiş |

### 🍽️ Yemek ve Egzersiz Yönetimi
| Özellik | Açıklama |
|---|---|
| **Yemek Arama** | 500+ yiyecek içeren yerleşik Türkçe gıda veritabanı |
| **Kategoriye Göre Filtreleme** | Et, süt, meyve, sebze, tahıl vb. kategorilerde göz atma |
| **Yemek Ekleme/Silme** | Porsiyon miktarı ile öğüne yemek ekleme ve kaldırma |
| **Egzersiz Kaydı** | Hazır egzersiz listesinden seçerek dakika girme ve yakılan kalori hesaplama |

### 🤖 Yapay Zeka (AI) Özellikleri
| Özellik | Açıklama |
|---|---|
| **📸 Fotoğraf Analizi** | Yemeğinizin fotoğrafını çekin veya yükleyin — AI kalori, protein, karbonhidrat ve yağ değerlerini tahmin etsin |
| **🧑‍🍳 Yemek Önerisi Sihirbazı** | Dolabınızdaki malzemeleri yazın — AI size sağlıklı bir tarif, adım adım yapılış ve gerekli malzeme listesi sunsun |
| **🩸 Kan Tahlili Analizi** | Kan tahlili sonuçlarınızın fotoğrafını yükleyin — AI değerlerinizi yorumlayarak beslenme tavsiyeleri versin |
| **💬 DiyetGPT Chat** | Beslenme, diyet ve sağlık hakkında yapay zeka ile sohbet edin |

### 👤 Profil Yönetimi
| Özellik | Açıklama |
|---|---|
| **Kişisel Bilgiler** | İsim, e-posta, yaş, boy, kilo, cinsiyet ve aktivite seviyesi düzenleme |
| **Canlı Sağlık Metrikleri** | Bilgiler değiştikçe VKİ, BMR, günlük kalori ve su ihtiyacı anlık güncellenir |
| **Abonelik Durumu** | Profilde mevcut paket kartı ve paketlere hızlı geçiş |
| **SQLite'a Kalıcı Kayıt** | Tüm profil değişiklikleri veritabanına kaydedilir |

### 💎 Premium Paket Sistemi
| Paket | Fiyat | Fotoğraf Analizi | Yemek Önerisi | Kan Tahlili |
|---|---|---|---|---|
| **Basic** | Ücretsiz | 1/ay | 1/ay | 1/ay |
| **Normal** | $1/ay | 15/ay | 5/ay | 1/ay |
| **Premium** | $2/ay | ♾️ Sınırsız | ♾️ Sınırsız | ♾️ Sınırsız |

- Şık ve modern satın alma (checkout) dialog penceresi
- Backend tarafında güvenli limit kontrolü (`limitChecker` middleware)
- Aylık otomatik kullanım sıfırlama

### 🎨 Arayüz ve Tasarım
- **Glassmorphism UI** — Buzlu cam efektli modern kartlar
- **Dark Mode / Light Mode** — Tek tıkla tema geçişi
- **Framer Motion Animasyonları** — Sayfa geçişleri ve bileşen animasyonları
- **Tam Responsive** — Masaüstü, tablet ve mobil uyumlu
- **Gradient Butonlar** — Zümrüt yeşilinden deniz mavisine canlı degrade renkler

---

## 🛠️ Teknoloji Yığını (Tech Stack)

### Frontend
| Teknoloji | Sürüm | Kullanım Amacı |
|---|---|---|
| React | 18.3 | UI bileşen mimarisi |
| Vite | 6.x | Hızlı geliştirme sunucusu ve build aracı |
| TypeScript | 5.9 | Tip güvenliği |
| TailwindCSS | 4.x | Utility-first CSS framework |
| Framer Motion | 12.x | Animasyonlar ve geçiş efektleri |
| Recharts | 3.x | Kalori grafikleri |
| Axios | 1.11 | HTTP istemcisi |
| Lucide React | 0.540 | İkon seti |
| Radix UI | - | Dialog, Select, Progress vb. headless bileşenler |
| React Router | - | Sayfa yönlendirme |
| Sonner | - | Toast bildirimleri |

### Backend
| Teknoloji | Sürüm | Kullanım Amacı |
|---|---|---|
| Node.js | 22.x | Sunucu çalışma ortamı |
| Express.js | 5.x | RESTful API framework |
| SQLite3 | - | İlişkisel veritabanı |
| Google Generative AI | 0.24 | Gemini 2.5 Flash — Görüntü analizi & metin üretimi |
| Bcrypt | - | Şifre hash'leme |
| Express-Session | - | Oturum yönetimi |
| Multer | - | Dosya/fotoğraf yükleme |
| Dotenv | - | Ortam değişkenleri |
| CORS | - | Cross-Origin kaynak paylaşımı |
| Nodemon | - | Geliştirme sırasında otomatik yeniden başlatma |

---

## 📂 Proje Yapısı

```
DiyetGPT/
├── 📁 backend/                    # Sunucu tarafı
│   ├── server.js                  # Ana sunucu dosyası (tüm API endpoint'leri)
│   ├── database.sqlite            # SQLite veritabanı dosyası
│   ├── .env                       # Ortam değişkenleri (API key, port, secret)
│   ├── package.json               # Backend bağımlılıkları
│   ├── nodemon.json               # Nodemon yapılandırması
│   └── 📁 uploads/               # Yüklenen fotoğraflar (geçici)
│
├── 📁 frontend/                   # İstemci tarafı
│   ├── 📁 src/
│   │   ├── 📁 pages/
│   │   │   ├── Dashboard.tsx      # Ana panel (tüm sekmeler: kalori, profil, AI özellikleri)
│   │   │   ├── Login.tsx          # Giriş sayfası
│   │   │   ├── Register.tsx       # Kayıt sayfası
│   │   │   ├── PhotoAnalysis.tsx  # Fotoğraf analizi sayfası
│   │   │   ├── main.tsx           # Uygulama giriş noktası ve Router
│   │   │   ├── Index.tsx          # Yönlendirme sayfası
│   │   │   └── NotFound.tsx       # 404 sayfası
│   │   └── index.css              # Global stiller
│   ├── 📁 components/ui/         # Radix UI tabanlı yeniden kullanılabilir bileşenler
│   ├── 📁 lib/                   # Yardımcı fonksiyonlar (cn utility)
│   ├── vite.config.ts            # Vite yapılandırması (proxy dahil)
│   ├── tailwind.config.js        # Tailwind yapılandırması
│   └── package.json              # Frontend bağımlılıkları
│
├── 📁 data/                      # Statik veri dosyaları
│   ├── foods.ts                  # 500+ Türkçe yiyecek veritabanı (kalori, makro değerler)
│   ├── diets.ts                  # Popüler diyet programları (Akdeniz, Keto, vb.)
│   └── mockContent.ts            # Örnek tarifler ve egzersiz verileri
│
├── package.json                  # Kök bağımlılıklar (concurrently ile tek komut çalıştırma)
├── README.md                     # Bu dosya
└── .gitignore                    # Git'ten hariç tutulan dosyalar
```

---

## 🗄️ Veritabanı Şeması (SQLite)

### 📋 Packages (Abonelik Paketleri)
| Sütun | Tip | Açıklama |
|---|---|---|
| PackageID | INTEGER PK | Paket ID (1, 2, 3) |
| Name | TEXT | Paket adı (Free, Normal, Premium) |
| PhotoAnalysisLimit | INTEGER | Aylık fotoğraf analizi limiti (NULL = sınırsız) |
| MealSuggestionLimit | INTEGER | Aylık yemek önerisi limiti |
| BloodTestLimit | INTEGER | Aylık kan tahlili limiti |

### 👤 Users (Kullanıcılar)
| Sütun | Tip | Açıklama |
|---|---|---|
| ID | INTEGER PK | Otomatik artan kullanıcı ID |
| Name | TEXT | Kullanıcı adı |
| Email | TEXT UNIQUE | E-posta adresi |
| PasswordHash | TEXT | Bcrypt ile hashlenmiş şifre |
| Age, Weight, Height | INTEGER/REAL | Fiziksel özellikler |
| Gender | TEXT | Cinsiyet (male/female) |
| ActivityLevel | TEXT | Aktivite seviyesi |
| PackageID | INTEGER | Aktif paket (FK → Packages) |
| PhotoAnalysisUsed | INTEGER | Bu ay kullanılan fotoğraf analizi sayısı |
| MealSuggestionUsed | INTEGER | Bu ay kullanılan yemek önerisi sayısı |
| BloodTestUsed | INTEGER | Bu ay kullanılan kan tahlili sayısı |
| LastUsageReset | TEXT | Son kullanım sıfırlama tarihi |
| dailyCalorieGoal | INTEGER | Günlük kalori hedefi |

### 🍕 ConsumedFoods (Tüketilen Gıdalar)
| Sütun | Tip | Açıklama |
|---|---|---|
| ID | INTEGER PK | Kayıt ID |
| UserID | INTEGER | Kullanıcı ID |
| Name | TEXT | Yemeğin adı |
| Calories, Protein, Carbs, Fat | REAL | Besin değerleri |
| Amount | REAL | Porsiyon miktarı (gram) |
| MealTime | TEXT | Öğün zamanı |
| Date | TEXT | Tarih (YYYY-MM-DD) |

### 🏃 BurnedExercises (Yapılan Egzersizler)
| Sütun | Tip | Açıklama |
|---|---|---|
| ID | INTEGER PK | Kayıt ID |
| UserID | INTEGER | Kullanıcı ID |
| Name | TEXT | Egzersiz adı |
| Minutes | INTEGER | Süre (dakika) |
| TotalCaloriesBurned | INTEGER | Yakılan toplam kalori |
| Date | TEXT | Tarih |

### 💧 WaterIntake (Su Tüketimi)
| Sütun | Tip | Açıklama |
|---|---|---|
| ID | INTEGER PK | Kayıt ID |
| UserID | INTEGER | Kullanıcı ID |
| Amount | INTEGER | Su miktarı (ml) |
| Date | TEXT | Tarih |

---

## 🔌 API Endpoint'leri

### Kimlik Doğrulama
| Method | Endpoint | Açıklama |
|---|---|---|
| `POST` | `/register` | Yeni kullanıcı kaydı |
| `POST` | `/login` | Giriş yapma |
| `POST` | `/logout` | Çıkış yapma |
| `GET` | `/api/user` | Oturumdaki kullanıcı bilgilerini getir |

### Profil
| Method | Endpoint | Açıklama |
|---|---|---|
| `PUT` | `/api/user/profile` | Profil bilgilerini güncelle (SQLite'a kaydet) |
| `POST` | `/api/subscribe` | Paket yükseltme |

### Günlük Takip
| Method | Endpoint | Açıklama |
|---|---|---|
| `POST` | `/api/add-food` | Yemek kaydı ekle |
| `DELETE` | `/api/delete-food/:id` | Yemek kaydı sil |
| `POST` | `/api/add-exercise` | Egzersiz kaydı ekle |
| `DELETE` | `/api/delete-exercise/:id` | Egzersiz kaydı sil |
| `POST` | `/api/add-water` | Su tüketimi ekle |
| `GET` | `/api/daily-logs?date=YYYY-MM-DD` | Günlük tüm kayıtları getir |

### Yapay Zeka (AI)
| Method | Endpoint | Middleware | Açıklama |
|---|---|---|---|
| `POST` | `/api/analyze-image` | `limitChecker('PhotoAnalysis')` | Yemek fotoğrafı analizi |
| `POST` | `/api/generate-recipe` | `limitChecker('MealSuggestion')` | AI yemek tarifi önerisi |
| `POST` | `/api/analyze-blood-test` | `limitChecker('BloodTest')` | Kan tahlili yorumlama |
| `POST` | `/api/diet-gpt` | — | DiyetGPT sohbet |

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- **Node.js** v16 veya üzeri
- **npm** (Node.js ile birlikte gelir)
- **Google Gemini API Anahtarı** → [Google AI Studio](https://aistudio.google.com/apikey) üzerinden ücretsiz alabilirsiniz

### 1. Projeyi Klonlayın
```bash
git clone https://github.com/KULLANICI_ADINIZ/DiyetGPT.git
cd DiyetGPT
```

### 2. Ortam Değişkenlerini Ayarlayın
`backend/` klasörü içinde bir `.env` dosyası oluşturun:
```env
PORT=5000
SESSION_SECRET=buraya-gizli-bir-anahtar-yazin
GEMINI_API_KEY=buraya-google-gemini-api-anahtarinizi-yazin
```

### 3. Bağımlılıkları Yükleyin
```bash
# Kök dizinde (hem frontend hem backend bağımlılıklarını yükler)
npm install

# Backend bağımlılıkları
cd backend && npm install && cd ..

# Frontend bağımlılıkları
cd frontend && npm install && cd ..
```

### 4. Projeyi Başlatın
```bash
npm run dev
```

Bu komut `concurrently` paketi sayesinde **frontend ve backend'i aynı anda** başlatır:
- 🖥️ **Frontend:** http://localhost:5173
- ⚙️ **Backend:** http://localhost:5000

---

## 🔒 Güvenlik Notları

- Şifreler **bcrypt** ile hash'lenerek saklanır, düz metin olarak tutulmaz
- Oturumlar **express-session** ile yönetilir (24 saat süreli cookie)
- API anahtarı `.env` dosyasında saklanır, frontend'e **asla** gönderilmez
- CORS politikası sadece yetkili origin'lere izin verir
- `.gitignore` dosyası ile hassas dosyalar (`node_modules`, `.env`, `database.sqlite`, `uploads/`) Git'e eklenmez

---

## 🤝 Katkıda Bulunma

Bu proje geliştirilmeye açıktır! Katkıda bulunmak için:

1. Bu repoyu **fork** edin
2. Yeni bir **branch** oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi **commit** edin (`git commit -m 'Yeni özellik eklendi'`)
4. Branch'inizi **push** edin (`git push origin feature/yeni-ozellik`)
5. Bir **Pull Request** açın

Karşılaştığınız hataları **Issues** sekmesinden bildirebilirsiniz.

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

---

<div align="center">
  <p>⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!</p>
  <p>Made with ❤️ and 🤖 AI</p>
</div>
]]>
