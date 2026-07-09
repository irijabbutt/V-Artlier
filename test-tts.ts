import { GoogleGenAI, Modality } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const res = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: 'Say cheerfully: Have a wonderful day!' }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    console.log("Success with Modality.AUDIO:", !!res.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data);
  } catch (e: any) {
    console.error("Error Modality:", e.message);
  }
}
run();
