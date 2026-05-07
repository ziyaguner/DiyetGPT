import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    console.log("--- KULLANILABİLİR MODELLER ---");
    if (data.models) {
      data.models.forEach(m => {
        console.log(`Model: ${m.name} (Desteklenenler: ${m.supportedGenerationMethods.join(", ")})`);
      });
    } else {
      console.log("Modeller listelenemedi. Yanıt:", JSON.stringify(data, null, 2));
    }
    console.log("-------------------------------");
  } catch (error) {
    console.error("Modeller çekilirken hata oluştu:", error);
  }
}

listModels();
