// src/pages/PhotoAnalysis.tsx
import React, { useCallback, useMemo, useState } from "react";

type NutritionItem = {
  name: string;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  serving?: { amount?: number; unit?: string };
};

type AnalysisJSON = {
  items: NutritionItem[];
  total: {
    calories: number;
    protein_g: number;
    fat_g: number;
    carbs_g: number;
  };
  confidence?: number; // 0..1
};

type GeminiCandidate = {
  content?: { parts?: Array<{ text?: string }> };
};

type GeminiResponse = {
  candidates?: GeminiCandidate[];
};

const SAFE_PROMPT = `
Aşağıdaki fotoğrafta görünen YEMEĞİ analiz et.
Sadece şu JSON formatında, başka açıklama yapmadan cevap ver:

{
  "items": [
    {
      "name": "string",
      "calories": number,
      "protein_g": number,
      "fat_g": number,
      "carbs_g": number,
      "serving": { "amount": number, "unit": "g" }
    }
  ],
  "total": {
    "calories": number,
    "protein_g": number,
    "fat_g": number,
    "carbs_g": number
  },
  "confidence": number
}

- "items" içinde fotoğrafta ayırt edebildiğin ana bileşenleri ayrı ayrı yaz.
- "total" alanı items değerlerinin toplamı olsun.
- Değerler KESİN JSON olsun, string içinde JSON verme, yorum ekleme.
- Emin değilsen "confidence"ı düşük ver (0.0-1.0).
`;

function dataUrlToBase64(dataUrl: string) {
  // "data:image/jpeg;base64,AAAA..." -> "AAAA..."
  const [, base64] = dataUrl.split(",");
  return base64 ?? dataUrl;
}

export default function PhotoAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [jsonResult, setJsonResult] = useState<AnalysisJSON | null>(null);
  const [rawText, setRawText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canAnalyze = useMemo(() => !!file && !loading, [file, loading]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setJsonResult(null);
    setRawText(null);

    const f = e.target.files?.[0];
    if (!f) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    if (!f.type.startsWith("image/")) {
      setError("Lütfen bir görüntü dosyası seçin (jpg/png).");
      return;
    }

    setFile(f);

    // Önizleme
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(f);
  }, []);

  // --------- V1: Hızlı demo (frontend'ten doğrudan Gemini) -----------
  // ⚠️ Güvenli değil. Sadece lokal test için! Üretimde KULLANMA.
  const analyzeOnClient = useCallback(async () => {
    if (!file || !previewUrl) return;

    try {
      setLoading(true);
      setError(null);
      setJsonResult(null);
      setRawText(null);

      const base64 = dataUrlToBase64(previewUrl);
      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              { text: SAFE_PROMPT },
              { inlineData: { mimeType: file.type, data: base64 } },
            ],
          },
        ],
      };

      // !!! Buraya geçici key koyarsan repo'ya commit etme.
      const apiKey = ""; // <- sadece lokal test için geçici koyabilirsin
      if (!apiKey) {
        setError("Lütfen geçici test için apiKey gir ya da backend versiyonunu kullan.");
        return;
      }

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result: GeminiResponse = await res.json();
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

      if (!text) {
        setError("Modelden yanıt alınamadı.");
        return;
      }

      // JSON bekliyoruz. Parse etmeyi dene.
      try {
        const parsed: AnalysisJSON = JSON.parse(text);
        setJsonResult(parsed);
      } catch {
        // JSON değilse ham metni göster
        setRawText(text);
      }
    } catch (err: any) {
      console.error(err);
      setError("Analiz sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [file, previewUrl]);

  // --------- V2: Güvenli versiyon (backend üzerinden) -----------
  // Prod için BUNU kullan. Aşağıdaki /api/gemini/photo-analyze endpoint'ini yazacağız.
  const analyzeViaServer = useCallback(async () => {
    if (!file || !previewUrl) return;

    try {
      setLoading(true);
      setError(null);
      setJsonResult(null);
      setRawText(null);

      const base64 = dataUrlToBase64(previewUrl);

      const res = await fetch("/api/gemini/photo-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: SAFE_PROMPT,
          image: { mimeType: file.type, data: base64 },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Sunucu hatası");
      }

      const data = (await res.json()) as { text: string };
      const text = data.text ?? "";

      if (!text) {
        setError("Modelden yanıt alınamadı.");
        return;
      }
      try {
        const parsed: AnalysisJSON = JSON.parse(text);
        setJsonResult(parsed);
      } catch {
        setRawText(text);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Analiz sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [file, previewUrl]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">📸 Fotoğraf Analizi</h1>

      <div className="mb-4 space-y-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          capture="environment"
        />
        {previewUrl && (
          <img
            src={previewUrl}
            alt="preview"
            style={{ maxWidth: "100%", borderRadius: 12 }}
          />
        )}
      </div>

      <div className="flex gap-8 mb-4">
        <button
          disabled={!canAnalyze}
          onClick={analyzeOnClient}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid #ddd",
            cursor: canAnalyze ? "pointer" : "not-allowed",
          }}
          title="Sadece lokal test içindir (güvenli değil)."
        >
          Hızlı Test (Doğrudan Gemini)
        </button>

        <button
          disabled={!canAnalyze}
          onClick={analyzeViaServer}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid #ddd",
            cursor: canAnalyze ? "pointer" : "not-allowed",
          }}
          title="Önerilen: API anahtarı backend’de güvenli."
        >
          Güvenli Analiz (Backend üzerinden)
        </button>
      </div>

      {loading && <div>Analiz yapılıyor...</div>}
      {error && <div style={{ color: "crimson" }}>{error}</div>}

      {jsonResult && (
        <div style={{ marginTop: 16 }}>
          <h2 className="text-xl font-semibold mb-2">🔎 Analiz Sonucu (JSON)</h2>

          <div
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
              <h3 style={{ marginBottom: 8 }}>Toplam</h3>
              <div>Kalori: {jsonResult.total.calories}</div>
              <div>Protein: {jsonResult.total.protein_g} g</div>
              <div>Yağ: {jsonResult.total.fat_g} g</div>
              <div>Karbonhidrat: {jsonResult.total.carbs_g} g</div>
              {typeof jsonResult.confidence === "number" && (
                <div>Güven: {(jsonResult.confidence * 100).toFixed(0)}%</div>
              )}
            </div>

            {jsonResult.items?.map((it, idx) => (
              <div key={idx} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                <h3 style={{ marginBottom: 8 }}>{it.name || `Öğe ${idx + 1}`}</h3>
                <div>Kalori: {it.calories}</div>
                <div>Protein: {it.protein_g} g</div>
                <div>Yağ: {it.fat_g} g</div>
                <div>Karbonhidrat: {it.carbs_g} g</div>
                {it.serving?.amount && it.serving?.unit && (
                  <div>Porsiyon: {it.serving.amount} {it.serving.unit}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {rawText && (
        <div style={{ marginTop: 16 }}>
          <h2 className="text-xl font-semibold mb-2">📄 Model Metni (JSON değilse)</h2>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "#f7f7f7",
              border: "1px solid #eee",
              borderRadius: 12,
              padding: 12,
            }}
          >
            {rawText}
          </pre>
        </div>
      )}
    </div>
  );
}
