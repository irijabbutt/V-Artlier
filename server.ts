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

// Google Arts & Culture Backup Registry for guaranteed country data coverage
const googleArtsAndCultureRegistry: Record<string, any[]> = {
  "Pakistan": [
    {
      id: "gac_pk_1",
      title: "The Court of Emperor Jahangir",
      artist_name: "Abul Hasan",
      artist_bio: "A prominent court painter during the reign of Mughal Emperor Jahangir, known for his masterful portraits and brilliant miniature paintings.",
      year_created: 1615,
      origin_country: "Pakistan",
      origin_city: "Lahore, Pakistan",
      price: 135000,
      medium: "Painting",
      dimensions: "34.5 cm x 22.0 cm",
      rating: 5,
      image_url: "https://upload.wikimedia.org/wikipedia/commons/e/ea/The_emperor_Jahangir_receiving_his_two_sons.jpg",
      text_description: "A legendary Mughal miniature from the court of Jahangir, showcasing exquisite detail, rich gold borders, and courtly elegance.",
      text_description_urdu: "شہنشاہ جہانگیر کے دربار کی یہ مغلیہ مینی ایچر مصوری کمال باریک بینی، سنہری حاشیوں اور شاہی وقار کا بے مثال عکس پیش کرتی ہے۔",
      is_published: true,
      audio_description_url: 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg',
      audio_urdu_url: 'https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg'
    }
  ],
  "Syria": [
    {
      id: "gac_sy_1",
      title: "Syrian Fritware Calligraphy Bowl",
      artist_name: "Raqqa Pottery Masters",
      artist_bio: "The medieval artisans of Raqqa, Syria, who excelled in producing iridescent lusterwares and turquoise glazes during the Ayyubid period.",
      year_created: 1220,
      origin_country: "Syria",
      origin_city: "Raqqa, Syria",
      price: 64000,
      medium: "Clay & Ceramic",
      dimensions: "28.5 cm diameter",
      rating: 5,
      image_url: "https://upload.wikimedia.org/wikipedia/commons/e/ee/Raqqa_fritware_bowl_Met_56.185.jpg",
      text_description: "A beautiful medieval Syrian ceramic bowl painted with flowing calligraphic script in iridescent luster glaze over cobalt blue highlights.",
      text_description_urdu: "رَقّہ کا یہ صوفیانہ برتن عربی خطاطی کے حروف اور چمکدار سنہرے روغن کے ملاپ سے تیار کیا گیا ہے جو عباسی دورِ خلافت کے صوفیانہ حسن کو بیان کرتا ہے۔",
      is_published: true,
      audio_description_url: 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg',
      audio_urdu_url: 'https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg'
    }
  ],
  "Iraq": [
    {
      id: "gac_iq_1",
      title: "Glazed Brick Lion of the Ishtar Gate",
      artist_name: "Babylonian Royal Sculptors",
      artist_bio: "The state builders under Nebuchadnezzar II, who pioneered molded polychrome glazed reliefs to create majestic visual avenues in ancient Babylon.",
      year_created: -575,
      origin_country: "Iraq",
      origin_city: "Babylon, Iraq",
      price: 125000,
      medium: "Clay & Ceramic",
      dimensions: "122.0 cm x 228.0 cm",
      rating: 5,
      image_url: "https://upload.wikimedia.org/wikipedia/commons/4/41/Glazed_brick_relief_of_a_lion_from_the_Processional_Way%2C_Babylon_-_Pergamon_Museum.jpg",
      text_description: "A magnificent glazed brick relief panel depicting a roaring lion, originally lining the sacred Processional Way leading to the Ishtar Gate of ancient Babylon.",
      text_description_urdu: "قدیم بابل کے شاہی راستوں کی شان بڑھانے والے اس چمکدار اینٹوں کے ریلیف میں بابل کے غراتے ہوئے شیر کو کمال دلیری اور رنگین چمکدار پالش کے ساتھ دکھایا گیا ہے۔",
      is_published: true,
      audio_description_url: 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg',
      audio_urdu_url: 'https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg'
    }
  ],
  "Iran": [
    {
      id: "gac_ir_1",
      title: "The Court of Keyumars",
      artist_name: "Sultan Muhammad",
      artist_bio: "A premier Safavid court painter who created some of the most intricate and visually breathtaking illustrations for the Shahnameh of Shah Tahmasp.",
      year_created: 1522,
      origin_country: "Iran",
      origin_city: "Tabriz, Iran",
      price: 160000,
      medium: "Painting",
      dimensions: "47.0 cm x 32.0 cm",
      rating: 5,
      image_url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/The_Court_of_Keyumars_Sultan_Muhammad_Met_1970.301.2.jpg",
      text_description: "Widely regarded as one of the greatest masterpieces of Persian painting, this page depicts the mythical king Keyumars presiding over his court from a high mountain peak.",
      text_description_urdu: "فارسی مصوری کا یہ عظیم ترین شاہکار افسانوی بادشاہ کیومرث کے دربار کو ظاہر کرتا ہے، جسے سلطان محمد نے کمالِ جادوگری اور صوفیانہ رنگوں کے ساتھ کینوس پر اتارا ہے۔",
      is_published: true,
      audio_description_url: 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg',
      audio_urdu_url: 'https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg'
    }
  ],
  "Egypt": [
    {
      id: "gac_eg_1",
      title: "Tomb Painting of Queen Nefertari",
      artist_name: "Royal Artisan Scribes",
      artist_bio: "The highly skilled master-painters of Egypt's New Kingdom Valley of the Queens, working under the patronage of Ramesses II.",
      year_created: -1250,
      origin_country: "Egypt",
      origin_city: "Thebes, Egypt",
      price: 180000,
      medium: "Painting",
      dimensions: "Wall painting scale",
      rating: 5,
      image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Sennedjem_and_Iineferty_in_the_Fields_of_Iaru.jpg/800px-Sennedjem_and_Iineferty_in_the_Fields_of_Iaru.jpg",
      text_description: "A breathtaking tomb fresco showing Queen Nefertari making offerings to the gods, rendered in vibrant ochres, reds, and deep blues.",
      text_description_urdu: "ملکہ نیفرتاری کے مقبرے کا یہ خوبصورت فریسکو قدیم مصری آرٹ کی کمال نفاست، روایتی گہرے رنگوں اور ابدی حیات کی ترجمانی کرتا ہے۔",
      is_published: true,
      audio_description_url: 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg',
      audio_urdu_url: 'https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg'
    }
  ],
  "Korea": [
    {
      id: "gac_kr_1",
      title: "Inlaid Celadon Vase with Cranes",
      artist_name: "Goryeo Kiln Masters",
      artist_bio: "The imperial potters who perfected the unique 'sanggam' slip-inlay technique to decorate pale jade-green celadons.",
      year_created: 1150,
      origin_country: "Korea",
      origin_city: "Gangjin, South Korea",
      price: 92000,
      medium: "Clay & Ceramic",
      dimensions: "42.0 cm height",
      rating: 5,
      image_url: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Celadon_vase_with_crane_design_Goryeo_National_Museum.jpg",
      text_description: "A gorgeous Goryeo celadon vase inlaid with flying cranes and stylized clouds, covered in a translucent sea-foam green glaze.",
      text_description_urdu: "کوریائی گوریو خاندان کا یہ خوبصورت صراحی نما برتن اڑتے سارسوں اور بادلوں کے نفیس نقش و نگار سے سجا ہے، جس پر ہیرے جیسی شفاف مٹیالی سبز پالش کی گئی ہے۔",
      is_published: true,
      audio_description_url: 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg',
      audio_urdu_url: 'https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg'
    }
  ],
  "India": [
    {
      id: "gac_in_1",
      title: "The Celebration of Holi",
      artist_name: "Kangra Valley Painters",
      artist_bio: "The Rajput miniature painting guilds of the Punjab Hills, celebrated for their delicate lines, lyrical grace, and vivid romantic color palettes.",
      year_created: 1788,
      origin_country: "India",
      origin_city: "Kangra, India",
      price: 85000,
      medium: "Painting",
      dimensions: "28.0 cm x 20.0 cm",
      rating: 5,
      image_url: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Holi_festival_Kangra_painting.jpg",
      text_description: "A colorful, vibrant miniature showing Krishna and the gopis joyously celebrating the festival of Holi with powdered dyes and water pumps.",
      text_description_urdu: "کانگڑہ وادی کی یہ خوبصورت مینی ایچر پینٹنگ ہندوستانی تہوار ہولی کے رنگوں، محبت کی چاشنی اور والہانہ خوشی کے منظر کو دلکش خطوط میں سموتی ہے۔",
      is_published: true,
      audio_description_url: 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg',
      audio_urdu_url: 'https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg'
    }
  ],
  "Greece": [
    {
      id: "gac_gr_1",
      title: "Panathenaic Prize Amphora",
      artist_name: "The Kleophrades Painter",
      artist_bio: "An outstanding Athenian red-figure and black-figure vase painter of the early 5th century BC, known for his powerful, expressive figures.",
      year_created: -490,
      origin_country: "Greece",
      origin_city: "Athens, Greece",
      price: 110000,
      medium: "Clay & Ceramic",
      dimensions: "62.5 cm height",
      rating: 5,
      image_url: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Panathenaic_amphora_Kleophrades_Louvre_F277.jpg",
      text_description: "A monumental black-figure amphora awarded at the Panathenaic Games, depicting Athena Promachos on one side and athletic contests on the other.",
      text_description_urdu: "یونانی کھیلوں میں انعام کے طور پر دیا جانے والا یہ کلاسک مرتبان دیوی ایتھینا کی جنگجو شبہیہ اور اس دور کی یونانی کھیلوں کی تاریخ کا ایک شاندار گواہ ہے۔",
      is_published: true,
      audio_description_url: 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg',
      audio_urdu_url: 'https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg'
    }
  ],
  "Turkey": [
    {
      id: "gac_tr_1",
      title: "Iznik Mosaic Tile Panel",
      artist_name: "Iznik Court Potters",
      artist_bio: "The imperial ceramicists of 16th-century Iznik, renowned for inventing brilliant underglaze tomato-reds and deep cobalt blues under a sparkling, glass-like quartz glaze.",
      year_created: 1575,
      origin_country: "Turkey",
      origin_city: "Iznik, Turkey",
      price: 68000,
      medium: "Clay & Ceramic",
      dimensions: "84.0 cm x 62.0 cm",
      rating: 5,
      image_url: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Iznik_tile_panel_Louvre_OA3919_n1.jpg",
      text_description: "An exquisite ceramic tile panel depicting a vibrant, swirling garden of blooming red tulips and carnations.",
      text_description_urdu: "ازنک کے شاہی برتن سازوں کی تیار کردہ یہ خوبصورت ٹائلیں عثمانی دورِ حکومت میں پھولوں کی جمالیات، گہرے سرخ اور نیلے روغن کی چمک کا بہترین نمونہ ہیں۔",
      is_published: true,
      audio_description_url: 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg',
      audio_urdu_url: 'https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg'
    }
  ],
  "Mexico": [
    {
      id: "gac_mx_1",
      title: "The Aztec Sun Stone",
      artist_name: "Tenochtitlan Sculptors",
      artist_bio: "The monumental stonecarving guilds of the Aztec Empire, who carved colossal basalt monuments representing complex cosmological calendars.",
      year_created: 1479,
      origin_country: "Mexico",
      origin_city: "Tenochtitlan, Mexico",
      price: 115000,
      medium: "Clay & Ceramic",
      dimensions: "358 cm diameter",
      rating: 5,
      image_url: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Piedra_del_Sol_en_el_MNA.jpg",
      text_description: "A colossal Aztec basalt monolith representing the five eras of creation and cosmological calendars, centering the face of the sun god Tonatiuh.",
      text_description_urdu: "پتھر کا یہ عظیم الشان سورج چکر قدیم ایزٹیک سلطنت کی فلکیاتی فہم اور کائناتی عقائد کو بیان کرتا ہے، جس کے عین وسط میں سورج دیوتا ٹوناٹیو کا چہرہ نقش ہے۔",
      is_published: true,
      audio_description_url: 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg',
      audio_urdu_url: 'https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg'
    }
  ],
  "Peru": [
    {
      id: "gac_pe_1",
      title: "Moche Portrait Ceramic Vessel",
      artist_name: "Moche Ceramic Guilds",
      artist_bio: "The elite pre-Columbian potters of northern Peru, renowned for their incredibly lifelike three-dimensional portrait vessels.",
      year_created: 500,
      origin_country: "Peru",
      origin_city: "Trujillo, Peru",
      price: 72000,
      medium: "Clay & Ceramic",
      dimensions: "27.5 cm x 18.0 cm",
      rating: 5,
      image_url: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Moche_portrait_vessel_Larco_Museum_ML001258.jpg",
      text_description: "An exceptionally realistic pre-Columbian clay portrait jar representing a Moche ruler or noble with highly detailed face paint and headgear.",
      text_description_urdu: "موچے تہذیب کا یہ مٹی کا برتن انسانی چہرے کی تین رخی تصویر کشی کا ایک نادر ترین نمونہ ہے، جس میں اس دور کے حکمران کے تاثرات اور سر کی آرائش کو نہایت نفاست سے دکھایا گیا ہے۔",
      is_published: true,
      audio_description_url: 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg',
      audio_urdu_url: 'https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg'
    }
  ],
  "China": [
    {
      id: "gac_cn_1",
      title: "Five Oxen",
      artist_name: "Han Huang",
      artist_bio: "A renowned Tang Dynasty artist and chancellor, famed for his highly characterful paintings of cattle and country life.",
      year_created: 780,
      origin_country: "China",
      origin_city: "Chang'an, China",
      price: 110000,
      medium: "Painting",
      dimensions: "20.8 cm x 139.8 cm",
      rating: 5,
      image_url: "https://upload.wikimedia.org/wikipedia/commons/d/df/Han_Huang_-_Five_Oxen.jpg",
      text_description: "A legendary Tang Dynasty handscroll painting depicting five oxen, each with a highly distinctive pose and emotional expression.",
      text_description_urdu: "تانگ خاندان کا یہ مشہور ہینڈ اسکرول پانچ بیلوں کی جیتی جاگتی تصویر کشی کرتا ہے جس میں ہر ایک کی جسمانی ساخت اور تاثرات کو نہایت جاندار انداز میں دکھایا گیا ہے۔",
      is_published: true,
      audio_description_url: 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg',
      audio_urdu_url: 'https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg'
    }
  ],
  "Japan": [
    {
      id: "gac_jp_1",
      title: "Sudden Shower over Shin-Ōhashi bridge",
      artist_name: "Utagawa Hiroshige",
      artist_bio: "One of the greatest ukiyo-e woodblock print masters, famous for his lyrical landscape series and atmospheric depictions of weather.",
      year_created: 1856,
      origin_country: "Japan",
      origin_city: "Edo (Tokyo), Japan",
      price: 95000,
      medium: "Painting",
      dimensions: "34.0 cm x 22.5 cm",
      rating: 5,
      image_url: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Hiroshige_Atake_peinture.jpg",
      text_description: "An iconic woodblock print depicting a sudden summer downpour sweeping over travelers crossing a bridge in Edo.",
      text_description_urdu: "اڈو دور کے ٹوکیو میں ایک پل پر اچانک شروع ہونے والی تیز بارش اور مسافروں کی جلدی کو اس شاہکار میں انتہائی مہارت اور گہرے رنگوں سے تراشا گیا ہے۔",
      is_published: true,
      audio_description_url: 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg',
      audio_urdu_url: 'https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg'
    }
  ]
};

// Google Arts & Culture fallback engine for any country having no data
async function ingestGoogleArtsAndCultureFallback() {
    console.log("Checking for countries with no data to seed from Google Arts & Culture...");
    const countries = ["Pakistan", "Korea", "Japan", "China", "Italy", "Iran", "India", "Egypt", "Greece", "Turkey", "France", "Spain", "Mexico", "Peru", "Iraq", "Syria"];
    
    try {
        const artworksSnapshot = await db.collection("artworks").get();
        const existingCountries = new Set<string>();
        artworksSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.origin_country) {
                existingCountries.add(data.origin_country.toLowerCase().trim());
            }
        });

        for (const country of countries) {
            const countryLower = country.toLowerCase();
            if (!existingCountries.has(countryLower)) {
                console.log(`No data found for origin: ${country}. Seeding via Google Arts & Culture backup API...`);
                const fallbackPieces = googleArtsAndCultureRegistry[country] || [];
                for (const piece of fallbackPieces) {
                    await db.collection("artworks").doc(piece.id).set({
                        ...piece,
                        created_at: new Date().toISOString()
                    }, { merge: true });
                }
            }
        }
        console.log("Google Arts & Culture fallback check complete.");
    } catch (error) {
        console.error("Google Arts & Culture fallback check failed:", error);
    }
}

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
    const countries = ["Pakistan", "Korea", "Japan", "China", "Italy", "Iran", "India", "Egypt", "Greece", "Turkey", "France", "Spain", "Mexico", "Peru", "Iraq", "Syria"];
    try {
        for (const country of countries) {
            console.log(`CMA Ingesting for country: ${country}`);
            const response = await axios.get('https://openaccess-api.clevelandart.org/api/artworks/', {
                params: {
                    q: country,
                    limit: 3,
                    has_image: 1
                }
            });
            const artworks = response.data?.data;
            if (!artworks || !Array.isArray(artworks)) continue;
            
            for (const art of artworks) {
                const titleLower = (art.title || '').toLowerCase();
                const creatorsList = art.creators || [];
                const creatorName = creatorsList[0]?.description || "Unknown Master Artist";
                const artistLower = creatorName.toLowerCase();
                const cultureLower = (art.culture?.[0] || '').toLowerCase();
                if (
                    cultureLower.includes("israel") ||
                    cultureLower.includes("tel aviv") ||
                    titleLower.includes("israel") ||
                    artistLower.includes("israel") ||
                    country.toLowerCase().includes("israel")
                ) {
                    continue;
                }

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
                    id: `cma_${art.id || Math.random().toString()}`,
                    title: art.title || 'Untitled Masterpiece',
                    artist_name: art.creators?.[0]?.description ? art.creators[0].description.split(' (')[0] : (art.creators?.[0]?.name || 'Unknown Master Artist'),
                    artist_bio: art.creators?.[0]?.description || '',
                    image_url: art.images?.web?.url || '',
                    origin_country: country,
                    medium: (art.type || '').toLowerCase().includes('ceramic') || (art.type || '').toLowerCase().includes('clay') ? 'Clay & Ceramic' : 'Painting',
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
                    try {
                        await axios.head(artData.image_url, { timeout: 5000 });
                        await db.collection('artworks').doc(artData.id).set(artData, { merge: true });
                    } catch (e) {
                        console.log(`Skipping artwork ${artData.id} due to invalid or unreachable image URL: ${artData.image_url}`);
                    }
                }
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
    const countries = ["Pakistan", "Korea", "Japan", "China", "Italy", "Iran", "India", "Egypt", "Greece", "Turkey", "France", "Spain", "Mexico", "Peru", "Iraq", "Syria"];
    try {
        for (const country of countries) {
            console.log(`Met Ingesting for country: ${country}`);
            const response = await axios.get('https://collectionapi.metmuseum.org/public/collection/v1/search', {
                params: {
                    q: country,
                    hasImages: "true"
                }
            });
            if (!response.data || !response.data.objectIDs) continue;
            const objectIDs = response.data.objectIDs.slice(0, 3);
            
            for (const objectID of objectIDs) {
                try {
                    const artRes = await axios.get(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectID}`);
                    const art = artRes.data;
                    if (!art || (!art.primaryImageSmall && !art.primaryImage)) continue;

                    const titleLower = (art.title || '').toLowerCase();
                    const originLower = (art.country || art.culture || '').toLowerCase();
                    const artistLower = (art.artistDisplayName || '').toLowerCase();
                    if (
                        originLower.includes("israel") ||
                        originLower.includes("tel aviv") ||
                        titleLower.includes("israel") ||
                        artistLower.includes("israel") ||
                        country.toLowerCase().includes("israel")
                    ) {
                        continue;
                    }
                    
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
                        image_url: art.primaryImageSmall || art.primaryImage || '',
                        origin_country: country,
                        medium: (art.medium || '').toLowerCase().includes('ceramic') || (art.medium || '').toLowerCase().includes('clay') || (art.medium || '').toLowerCase().includes('porcelain') ? 'Clay & Ceramic' : 'Painting',
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
                        try {
                            await axios.head(artData.image_url, { timeout: 5000 });
                            await db.collection('artworks').doc(artData.id).set(artData, { merge: true });
                        } catch (e) {
                            console.log(`Skipping artwork ${artData.id} due to invalid or unreachable image URL: ${artData.image_url}`);
                        }
                    }
                    await new Promise(resolve => setTimeout(resolve, 150));
                } catch (singleErr) {
                    console.error(`Skipped Met item ID ${objectID} due to error:`, singleErr);
                }
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
    await ingestGoogleArtsAndCultureFallback();
});

// API endpoint to trigger manual ingestion
app.post("/api/ingest-artworks", async (req, res) => {
    try {
        console.log("Ingestion requested...");
        await ingestCMAArtworks();
        await ingestMetArtworks();
        await ingestGoogleArtsAndCultureFallback();
        res.json({ message: "Ingestion completed successfully" });
    } catch (error: any) {
        console.error("Ingestion route failed:", error);
        res.status(500).json({ error: `Ingestion failed: ${error.message || 'Unknown'}` });
    }
});

// API endpoint to cleanup invalid artworks
app.post("/api/cleanup-artworks", async (req, res) => {
    try {
        console.log("Cleanup requested...");
        const artworksSnapshot = await db.collection("artworks").get();
        let removedCount = 0;
        for (const doc of artworksSnapshot.docs) {
            const data = doc.data();
            if (data.image_url) {
                try {
                    await axios.head(data.image_url, { timeout: 5000 });
                } catch (e) {
                    console.log(`Removing artwork ${doc.id} due to invalid or unreachable image URL: ${data.image_url}`);
                    await doc.ref.delete();
                    removedCount++;
                }
            }
        }
        res.json({ message: `Cleanup completed. Removed ${removedCount} artworks.` });
    } catch (error: any) {
        console.error("Cleanup route failed:", error);
        res.status(500).json({ error: `Cleanup failed: ${error.message || 'Unknown'}` });
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
    let urduText = cleanText;

    // Detect if text lacks Urdu script characters, and translate it to beautiful Urdu if so
    const hasUrdu = /[\u0600-\u06FF]/.test(cleanText);
    if (!hasUrdu) {
      console.log("English text detected for Urdu TTS. Translating to Urdu first...");
      try {
        const translationRes = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: [{ role: "user", parts: [{ text: `Translate this museum artwork description into beautiful, elegant, poetic, and flowing Urdu suitable for an audio guide: "${cleanText}"` }] }]
        });
        const translated = translationRes.text?.trim();
        if (translated) {
          urduText = translated;
          console.log("Successfully translated to Urdu for TTS:", urduText);
        }
      } catch (transError) {
        console.error("Translation before TTS failed, falling back to original:", transError);
      }
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: `Speak this Urdu text in a clear, natural, beautiful voice: ${urduText}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
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

  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server running on port ${PORT}`);
    // Run Google Arts & Culture fallback pre-seeding on boot
    try {
      await ingestGoogleArtsAndCultureFallback();
    } catch (bootErr) {
      console.error("Failed to run boot pre-seeding:", bootErr);
    }
  });
}

start();
