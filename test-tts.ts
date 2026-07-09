import { GoogleGenAI, Modality } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: "Hello world",
      config: { responseModalities: [Modality.AUDIO] }
    });
    console.log("Success with Modality.AUDIO:", !!res.candidates[0].content.parts[0].inlineData);
  } catch (e) {
    console.error("Error Modality:", e.message);
  }
}
run();
