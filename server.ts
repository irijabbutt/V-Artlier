import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Modality } from "@google/genai";
import dotenv from "dotenv";
import cron from "node-cron";
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import axios from 'axios';

dotenv.config();

// Firebase Admin config comes from environment variables (populated from the
// FB_PROJECTID / FB_FIRESTOREDATABASEID repository secrets), not a committed file.
const firebaseProjectId = process.env.FB_PROJECTID;
const firestoreDatabaseId = process.env.FB_FIRESTOREDATABASEID || "(default)";

if (!firebaseProjectId) {
  console.error("FB_PROJECTID env var is not set. Firestore Admin calls will fail.");
}

// Initialize Admin SDK with config for Firestore cross-project access
if (!getApps().length) {
  initializeApp({
    projectId: firebaseProjectId,
  });
}
// Ensure we use the correct database instance
const db = getFirestore(firestoreDatabaseId);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper for CMA ingestion
async function ingestCMAArtworks() {
    console.log("Ingesting artworks from Cleveland Museum of Art API...");
    try {
        const response = await axios.get('https://openaccess-api.clevelandart.org/api/artworks/', {
            params: {
                limit: 10,
                has_image: 1
            }
        });
        const artworks = response.data.data;
        
        for (const art of artworks) {
            let enDesc = `A masterfully crafted artwork titled '${art.title}'. Part of the Cleveland Museum of Art collection.`;
            let urDesc = `${art.title} کلیولینڈ میوزیم آف آرٹ کے مجموعہ کا ایک شاندار شاہکار ہے۔`;

            const prompt = `Generate a 2-paragraph professional museum description in English and a poetic translation in Urdu for this artwork:
            Title: ${art.title}
            Artist: ${art.creators?.[0]?.description || 'Unknown'}
            Medium: ${art.type}
            Origin: ${art.culture?.[0] || 'Unknown'}
            
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
                title: art.title || 'Untitled Masterpiece',
                artist_name: art.creators?.[0]?.description ? art.creators[0].description.split(' (')[0] : (art.creators?.[0]?.name || 'Unknown Master Artist'),
                artist_bio: art.creators?.[0]?.description || '',
                image_url: art.images?.web?.url || '',
                origin_country: art.culture?.[0] || 'Global Collection',
                medium: art.type || 'Painting',
                dimensions: art.dimensions || 'Dimensions variable',
                year_created: art.creation_date_earliest || 2024,
                rating: 5,
                text_description: enDesc,
                text_description_urdu: urDesc,
                is_published: true,
                audio_description_url: 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg',
                audio_urdu_url: 'https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg',
                created_at: new Date().toISOString()
            };
            // Only ingest if it has a title and image
            if (artData.title && artData.image_url) {
                await db.collection('artworks').doc(artData.id).set(artData, { merge: true });
            }
        }
        console.log("CMA Ingestion complete.");
    } catch (error) {
        console.error("CMA Ingestion failed:", error);
    }
}

// Helper for Met Museum ingestion
async function ingestMetArtworks() {
    console.log("Ingesting artworks from Met Museum API...");
    try {
        const response = await axios.get('https://collectionapi.metmuseum.org/public/collection/v1/search?q=statue&hasImages=true');
        if (!response.data || !response.data.objectIDs) return;
        const objectIDs = response.data.objectIDs.slice(0, 5);
        
        for (const objectID of objectIDs) {
            const artRes = await axios.get(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectID}`);
            const art = artRes.data;
            
            // Generate descriptions using Gemini
            const prompt = `Generate a 2-paragraph professional museum description in English and a poetic translation in Urdu for this artwork:
            Title: ${art.title}
            Artist: ${art.artistDisplayName}
            Medium: ${art.medium}
            Origin: ${art.country || art.culture}
            
            Format as JSON: {"en": "...", "ur": "..."}`;
            
            let enDesc = `A significant piece from the Metropolitan Museum of Art: ${art.title}.`;
            let urDesc = `${art.title} میٹروپولیٹن میوزیم آف آرٹ کا ایک اہم شاہکار ہے۔`;
            
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
                title: art.title || 'Untitled Masterpiece',
                artist_name: art.artistDisplayName || 'Unknown Master Artist',
                image_url: art.primaryImage || '',
                origin_country: art.country || art.culture || 'Unknown',
                medium: art.medium || 'Painting',
                dimensions: art.dimensions || 'Dimensions variable',
                year_created: art.objectBeginDate || 2024,
                rating: 5,
                text_description: enDesc,
                text_description_urdu: urDesc,
                is_published: true,
                audio_description_url: 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg',
                audio_urdu_url: 'https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg',
                created_at: new Date().toISOString()
            };
            if (artData.title && artData.image_url) {
                await db.collection('artworks').doc(artData.id).set(artData, { merge: true });
            }
        }
        console.log("Met Ingestion complete.");
    } catch (error) {
        console.error("Met Ingestion failed:", error);
    }
}

// Schedule task to fetch new artworks every hour
cron.schedule('0 * * * *', async () => {
    console.log('Running automatic artwork ingestion...');
    await ingestCMAArtworks();
    await ingestMetArtworks();
});

// API endpoint to trigger manual ingestion
app.post("/api/ingest-artworks", async (req, res) => {
    try {
        console.log("Ingestion requested...");
        await ingestCMAArtworks();
        await ingestMetArtworks();
        res.json({ message: "Ingestion started successfully" });
    } catch (error: any) {
        console.error("Ingestion route failed:", error);
        res.status(500).json({ error: `Ingestion failed: ${error.message || 'Unknown'}` });
    }
});

// API endpoint to enrich description using Gemini 3.5 Flash with Google Search Grounding
app.post("/api/enrich-description", async (req, res) => {
  try {
    const { title, artist, origin } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const prompt = `Research the historical artwork titled "${title}" by artist "${artist || 'Unknown'}" from "${origin || 'Unknown'}". 
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
        responseMimeType: "application/json",
      }
    });

    const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error("No description text generated from Gemini");
    }

    const data = JSON.parse(rawText.trim());
    res.json(data);
  } catch (error: any) {
    console.error("Error in enrich-description:", error);
    res.status(500).json({ error: error.message || "Failed to enrich description" });
  }
});

// API endpoint for Urdu Text-To-Speech using Gemini 3.1 Flash TTS
app.post("/api/urdu-tts", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    // Clean text and keep clean, high-performance TTS streaming
    const cleanText = text.replace(/["'“”«»]/g, " ");

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Speak this Urdu text in a clear, natural, beautiful voice: ${cleanText}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Puck' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        throw new Error("No audio data returned from Gemini TTS");
      }

      res.json({ audioBase64: base64Audio });
    } catch (apiError: any) {
      if (apiError.message?.includes("429") || apiError.status === 429) {
        return res.status(429).json({ error: "Voice synthesis quota exceeded. Please wait a moment and try again." });
      }
      throw apiError;
    }
  } catch (error: any) {
    console.error("Error in urdu-tts:", error);
    res.status(500).json({ error: error.message || "Failed to generate Urdu TTS" });
  }
});

// Integrate Vite middleware for development or serve built files for production
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
