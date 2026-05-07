// server/index.js
// Basit Express sunucusu - düzeltilmiş ve CommonJS formatına alındı
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '12mb' })); // büyük base64 resimler için limit yükseltildi

const API_KEY = process.env.API_KEY || 'YOUR_API_KEY_HERE';

// Basit test route
app.get('/', (req, res) => {
  res.send('✅ Express server çalışıyor!');
});

// --- CHAT ENDPOINT ---
// Bu endpoint, istemciden gelen mesajı alıp dış bir LLM servisine iletir.
// Not: Gerçek kullanımda API_KEY'i .env ile saklayın.
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Mesaj gerekli' });

    // Not: Node 18+ global fetch destekliyorsa bu çalışır. Aksi hâlde node-fetch ekleyin.
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: message }] }],
        }),
      }
    );

    if (!response.ok) {
      const txt = await response.text();
      console.error('Gemini hatası:', response.status, txt);
      return res.status(502).json({ error: 'LLM servisi hatası' });
    }

    const data = await response.json();
    const botResponse =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Üzgünüm, yanıt alınamadı.';

    res.json({ reply: botResponse });
  } catch (err) {
    console.error('Chat endpoint hatası:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

/**
 * Fotoğraf analizi (basit heuristic)
 * -> İstemciden base64 (data:image/..;base64,...) gönderin.
 * -> Sunucu base64'ü decode eder, boyutuna göre kaba bir kalori/makro tahmini döndürür.
 *
 * NOT: Bu bir yer tutucudur. Gerçek, güvenilir besin tahmini için:
 *  - Görüntü sınıflandırma + yemek tanıma modeli (ör. özel ML/vision API)
 *  - Yiyecek veritabanı (kalori/makro verileri)
 * gereklidir. Burada minimal, offline çalışacak bir heuristic sağlanmıştır.
 */
app.post('/analyze-photo', (req, res) => {
  try {
    let { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 gerekli' });
    }

    // Eğer data URI şeklindeyse başlığı çıkar
    imageBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const buffer = Buffer.from(imageBase64, 'base64');
    const sizeBytes = buffer.length;
    const sizeKB = sizeBytes / 1024;

    // Basit heuristic: base64 boyutundan yemeğin "görüntü büyüklüğü" tahmini (çok kaba)
    // Not: Bu kesinlikle doğru değil; yalnızca demo/tahmin amaçlı.
    // Ayarlamalar: daha yüksek boyut -> daha yüksek kalori tahmini (örnek heuristik).
    const baseCalories = Math.max(50, Math.min(1200, Math.round(sizeKB * 6))); // 6 kcal per KB örnek
    // Rassalize ama deterministik bir dağılım: (protein 15%, fat 30%, carbs 55%)
    const proteinGrams = Math.round((baseCalories * 0.15) / 4);
    const fatGrams = Math.round((baseCalories * 0.30) / 9);
    const carbsGrams = Math.round((baseCalories * 0.55) / 4);

    // Tahmin güveni (basit): boyut ne kadar büyükse biraz daha yüksek güvenlik varsayıyoruz (0.2 - 0.6 arası)
    const confidence = Math.max(0.15, Math.min(0.75, Math.round((Math.log(sizeKB + 1) / 5) * 100) / 100));

    res.json({
      ok: true,
      sizeKB: Math.round(sizeKB),
      estimatedCalories: baseCalories,
      macros: {
        proteinGrams,
        fatGrams,
        carbsGrams,
      },
      confidence,
      note:
        'Bu bir yaklaşık tahmindir. Daha doğru sonuç için görüntü-ML tabanlı bir servis bağlayın.',
    });
  } catch (error) {
    console.error('analyze-photo hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Tek kez dinleme (önceden iki defa çağrılıyordu — düzeltildi)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server http://localhost:${PORT} adresinde çalışıyor (port ${PORT})`);
});
