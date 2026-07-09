var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_node_cron = __toESM(require("node-cron"), 1);
var import_app = require("firebase-admin/app");
var import_firestore = require("firebase-admin/firestore");
var import_axios = __toESM(require("axios"), 1);
import_dotenv.default.config();
var firebaseProjectId = process.env.FB_PROJECTID;
var firestoreDatabaseId = process.env.FB_FIRESTOREDATABASEID || "(default)";
if (!firebaseProjectId) {
  console.error("FB_PROJECTID env var is not set. Firestore Admin calls will fail.");
}
if (!(0, import_app.getApps)().length) {
  (0, import_app.initializeApp)({
    projectId: firebaseProjectId
  });
}
var db = (0, import_firestore.getFirestore)(firestoreDatabaseId);
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var ai = new import_genai.GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
async function ingestCMAArtworks() {
  console.log("Ingesting artworks from Cleveland Museum of Art API...");
  try {
    const response = await import_axios.default.get("https://openaccess-api.clevelandart.org/api/artworks/", {
      params: {
        limit: 10,
        has_image: 1
      }
    });
    const artworks = response.data.data;
    for (const art of artworks) {
      let enDesc = `A masterfully crafted artwork titled '${art.title}'. Part of the Cleveland Museum of Art collection.`;
      let urDesc = `${art.title} \u06A9\u0644\u06CC\u0648\u0644\u06CC\u0646\u0688 \u0645\u06CC\u0648\u0632\u06CC\u0645 \u0622\u0641 \u0622\u0631\u0679 \u06A9\u06D2 \u0645\u062C\u0645\u0648\u0639\u06C1 \u06A9\u0627 \u0627\u06CC\u06A9 \u0634\u0627\u0646\u062F\u0627\u0631 \u0634\u0627\u06C1\u06A9\u0627\u0631 \u06C1\u06D2\u06D4`;
      const prompt = `Generate a 2-paragraph professional museum description in English and a poetic translation in Urdu for this artwork:
            Title: ${art.title}
            Artist: ${art.creators?.[0]?.description || "Unknown"}
            Medium: ${art.type}
            Origin: ${art.culture?.[0] || "Unknown"}
            
            Format as JSON: {"en": "...", "ur": "..."}`;
      try {
        const result = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }]
        });
        const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (responseText) {
          const jsonStr = responseText.match(/\{[\s\S]*\}/)?.[0];
          if (jsonStr) {
            const parsed = JSON.parse(jsonStr);
            enDesc = parsed.en || enDesc;
            urDesc = parsed.ur || urDesc;
          }
        }
      } catch (e) {
        console.error("Gemini enrichment failed for CMA piece:", e);
      }
      const artData = {
        id: art.id.toString(),
        title: art.title || "Untitled Masterpiece",
        artist_name: art.creators?.[0]?.description ? art.creators[0].description.split(" (")[0] : art.creators?.[0]?.name || "Unknown Master Artist",
        artist_bio: art.creators?.[0]?.description || "",
        image_url: art.images?.web?.url || "",
        origin_country: art.culture?.[0] || "Global Collection",
        medium: art.type || "Painting",
        dimensions: art.dimensions || "Dimensions variable",
        year_created: art.creation_date_earliest || 2024,
        rating: 5,
        text_description: enDesc,
        text_description_urdu: urDesc,
        is_published: true,
        audio_description_url: "https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg",
        audio_urdu_url: "https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg",
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (artData.title && artData.image_url) {
        await db.collection("artworks").doc(artData.id).set(artData, { merge: true });
      }
    }
    console.log("CMA Ingestion complete.");
  } catch (error) {
    console.error("CMA Ingestion failed:", error);
  }
}
async function ingestMetArtworks() {
  console.log("Ingesting artworks from Met Museum API...");
  try {
    const response = await import_axios.default.get("https://collectionapi.metmuseum.org/public/collection/v1/search?q=statue&hasImages=true");
    if (!response.data || !response.data.objectIDs) return;
    const objectIDs = response.data.objectIDs.slice(0, 5);
    for (const objectID of objectIDs) {
      const artRes = await import_axios.default.get(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectID}`);
      const art = artRes.data;
      const prompt = `Generate a 2-paragraph professional museum description in English and a poetic translation in Urdu for this artwork:
            Title: ${art.title}
            Artist: ${art.artistDisplayName}
            Medium: ${art.medium}
            Origin: ${art.country || art.culture}
            
            Format as JSON: {"en": "...", "ur": "..."}`;
      let enDesc = `A significant piece from the Metropolitan Museum of Art: ${art.title}.`;
      let urDesc = `${art.title} \u0645\u06CC\u0679\u0631\u0648\u067E\u0648\u0644\u06CC\u0679\u0646 \u0645\u06CC\u0648\u0632\u06CC\u0645 \u0622\u0641 \u0622\u0631\u0679 \u06A9\u0627 \u0627\u06CC\u06A9 \u0627\u06C1\u0645 \u0634\u0627\u06C1\u06A9\u0627\u0631 \u06C1\u06D2\u06D4`;
      try {
        const result = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }]
        });
        const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (responseText) {
          const jsonStr = responseText.match(/\{[\s\S]*\}/)?.[0];
          if (jsonStr) {
            const parsed = JSON.parse(jsonStr);
            enDesc = parsed.en || enDesc;
            urDesc = parsed.ur || urDesc;
          }
        }
      } catch (e) {
        console.error("Gemini enrichment failed for Met piece:", e);
      }
      const artData = {
        id: `met_${art.objectID}`,
        title: art.title || "Untitled Masterpiece",
        artist_name: art.artistDisplayName || "Unknown Master Artist",
        image_url: art.primaryImage || "",
        origin_country: art.country || art.culture || "Unknown",
        medium: art.medium || "Painting",
        dimensions: art.dimensions || "Dimensions variable",
        year_created: art.objectBeginDate || 2024,
        rating: 5,
        text_description: enDesc,
        text_description_urdu: urDesc,
        is_published: true,
        audio_description_url: "https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg",
        audio_urdu_url: "https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg",
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (artData.title && artData.image_url) {
        await db.collection("artworks").doc(artData.id).set(artData, { merge: true });
      }
    }
    console.log("Met Ingestion complete.");
  } catch (error) {
    console.error("Met Ingestion failed:", error);
  }
}
import_node_cron.default.schedule("0 * * * *", async () => {
  console.log("Running automatic artwork ingestion...");
  await ingestCMAArtworks();
  await ingestMetArtworks();
});
app.post("/api/ingest-artworks", async (req, res) => {
  try {
    console.log("Ingestion requested...");
    await ingestCMAArtworks();
    await ingestMetArtworks();
    res.json({ message: "Ingestion started successfully" });
  } catch (error) {
    console.error("Ingestion route failed:", error);
    res.status(500).json({ error: `Ingestion failed: ${error.message || "Unknown"}` });
  }
});
app.post("/api/enrich-description", async (req, res) => {
  try {
    const { title, artist, origin } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    const prompt = `Research the historical artwork titled "${title}" by artist "${artist || "Unknown"}" from "${origin || "Unknown"}". 
Using Google Search to verify accurate details, write a highly descriptive, professional 3-sentence museum curator note in English about its history, style, and significance.
Then, translate or adapt this into elegant, flowing, poetic Urdu (approx 3 sentences).
Return the response as a JSON object with two fields:
{
  "text_description": "...",
  "text_description_urdu": "..."
}`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });
    const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error("No description text generated from Gemini");
    }
    const data = JSON.parse(rawText.trim());
    res.json(data);
  } catch (error) {
    console.error("Error in enrich-description:", error);
    res.status(500).json({ error: error.message || "Failed to enrich description" });
  }
});
app.post("/api/urdu-tts", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }
    const cleanText = text.replace(/["'“”«»]/g, " ");
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Speak this Urdu text in a clear, natural, beautiful voice: ${cleanText}` }] }],
        config: {
          responseModalities: [import_genai.Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Puck" }
            }
          }
        }
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        throw new Error("No audio data returned from Gemini TTS");
      }
      res.json({ audioBase64: base64Audio });
    } catch (apiError) {
      if (apiError.message?.includes("429") || apiError.status === 429) {
        return res.status(429).json({ error: "Voice synthesis quota exceeded. Please wait a moment and try again." });
      }
      throw apiError;
    }
  } catch (error) {
    console.error("Error in urdu-tts:", error);
    res.status(500).json({ error: error.message || "Failed to generate Urdu TTS" });
  }
});
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}
start();
//# sourceMappingURL=server.cjs.map
