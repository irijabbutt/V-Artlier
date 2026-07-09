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
var googleArtsAndCultureRegistry = {
  "Pakistan": [
    {
      id: "gac_pk_1",
      title: "The Court of Emperor Jahangir",
      artist_name: "Abul Hasan",
      artist_bio: "A prominent court painter during the reign of Mughal Emperor Jahangir, known for his masterful portraits and brilliant miniature paintings.",
      year_created: 1615,
      origin_country: "Pakistan",
      origin_city: "Lahore, Pakistan",
      medium: "Painting",
      dimensions: "34.5 cm x 22.0 cm",
      rating: 5,
      image_url: "https://upload.wikimedia.org/wikipedia/commons/e/ea/The_emperor_Jahangir_receiving_his_two_sons.jpg",
      text_description: "A legendary Mughal miniature from the court of Jahangir, showcasing exquisite detail, rich gold borders, and courtly elegance.",
      text_description_urdu: "\u0634\u06C1\u0646\u0634\u0627\u06C1 \u062C\u06C1\u0627\u0646\u06AF\u06CC\u0631 \u06A9\u06D2 \u062F\u0631\u0628\u0627\u0631 \u06A9\u06CC \u06CC\u06C1 \u0645\u063A\u0644\u06CC\u06C1 \u0645\u06CC\u0646\u06CC \u0627\u06CC\u0686\u0631 \u0645\u0635\u0648\u0631\u06CC \u06A9\u0645\u0627\u0644 \u0628\u0627\u0631\u06CC\u06A9 \u0628\u06CC\u0646\u06CC\u060C \u0633\u0646\u06C1\u0631\u06CC \u062D\u0627\u0634\u06CC\u0648\u06BA \u0627\u0648\u0631 \u0634\u0627\u06C1\u06CC \u0648\u0642\u0627\u0631 \u06A9\u0627 \u0628\u06D2 \u0645\u062B\u0627\u0644 \u0639\u06A9\u0633 \u067E\u06CC\u0634 \u06A9\u0631\u062A\u06CC \u06C1\u06D2\u06D4",
      is_published: true,
      audio_description_url: "https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg",
      audio_urdu_url: "https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg"
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
      medium: "Clay & Ceramic",
      dimensions: "28.5 cm diameter",
      rating: 5,
      image_url: "https://upload.wikimedia.org/wikipedia/commons/e/ee/Raqqa_fritware_bowl_Met_56.185.jpg",
      text_description: "A beautiful medieval Syrian ceramic bowl painted with flowing calligraphic script in iridescent luster glaze over cobalt blue highlights.",
      text_description_urdu: "\u0631\u064E\u0642\u0651\u06C1 \u06A9\u0627 \u06CC\u06C1 \u0635\u0648\u0641\u06CC\u0627\u0646\u06C1 \u0628\u0631\u062A\u0646 \u0639\u0631\u0628\u06CC \u062E\u0637\u0627\u0637\u06CC \u06A9\u06D2 \u062D\u0631\u0648\u0641 \u0627\u0648\u0631 \u0686\u0645\u06A9\u062F\u0627\u0631 \u0633\u0646\u06C1\u0631\u06D2 \u0631\u0648\u063A\u0646 \u06A9\u06D2 \u0645\u0644\u0627\u067E \u0633\u06D2 \u062A\u06CC\u0627\u0631 \u06A9\u06CC\u0627 \u06AF\u06CC\u0627 \u06C1\u06D2 \u062C\u0648 \u0639\u0628\u0627\u0633\u06CC \u062F\u0648\u0631\u0650 \u062E\u0644\u0627\u0641\u062A \u06A9\u06D2 \u0635\u0648\u0641\u06CC\u0627\u0646\u06C1 \u062D\u0633\u0646 \u06A9\u0648 \u0628\u06CC\u0627\u0646 \u06A9\u0631\u062A\u0627 \u06C1\u06D2\u06D4",
      is_published: true,
      audio_description_url: "https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg",
      audio_urdu_url: "https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg"
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
      medium: "Clay & Ceramic",
      dimensions: "122.0 cm x 228.0 cm",
      rating: 5,
      image_url: "https://upload.wikimedia.org/wikipedia/commons/4/41/Glazed_brick_relief_of_a_lion_from_the_Processional_Way%2C_Babylon_-_Pergamon_Museum.jpg",
      text_description: "A magnificent glazed brick relief panel depicting a roaring lion, originally lining the sacred Processional Way leading to the Ishtar Gate of ancient Babylon.",
      text_description_urdu: "\u0642\u062F\u06CC\u0645 \u0628\u0627\u0628\u0644 \u06A9\u06D2 \u0634\u0627\u06C1\u06CC \u0631\u0627\u0633\u062A\u0648\u06BA \u06A9\u06CC \u0634\u0627\u0646 \u0628\u0691\u06BE\u0627\u0646\u06D2 \u0648\u0627\u0644\u06D2 \u0627\u0633 \u0686\u0645\u06A9\u062F\u0627\u0631 \u0627\u06CC\u0646\u0679\u0648\u06BA \u06A9\u06D2 \u0631\u06CC\u0644\u06CC\u0641 \u0645\u06CC\u06BA \u0628\u0627\u0628\u0644 \u06A9\u06D2 \u063A\u0631\u0627\u062A\u06D2 \u06C1\u0648\u0626\u06D2 \u0634\u06CC\u0631 \u06A9\u0648 \u06A9\u0645\u0627\u0644 \u062F\u0644\u06CC\u0631\u06CC \u0627\u0648\u0631 \u0631\u0646\u06AF\u06CC\u0646 \u0686\u0645\u06A9\u062F\u0627\u0631 \u067E\u0627\u0644\u0634 \u06A9\u06D2 \u0633\u0627\u062A\u06BE \u062F\u06A9\u06BE\u0627\u06CC\u0627 \u06AF\u06CC\u0627 \u06C1\u06D2\u06D4",
      is_published: true,
      audio_description_url: "https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg",
      audio_urdu_url: "https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg"
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
      medium: "Painting",
      dimensions: "47.0 cm x 32.0 cm",
      rating: 5,
      image_url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/The_Court_of_Keyumars_Sultan_Muhammad_Met_1970.301.2.jpg",
      text_description: "Widely regarded as one of the greatest masterpieces of Persian painting, this page depicts the mythical king Keyumars presiding over his court from a high mountain peak.",
      text_description_urdu: "\u0641\u0627\u0631\u0633\u06CC \u0645\u0635\u0648\u0631\u06CC \u06A9\u0627 \u06CC\u06C1 \u0639\u0638\u06CC\u0645 \u062A\u0631\u06CC\u0646 \u0634\u0627\u06C1\u06A9\u0627\u0631 \u0627\u0641\u0633\u0627\u0646\u0648\u06CC \u0628\u0627\u062F\u0634\u0627\u06C1 \u06A9\u06CC\u0648\u0645\u0631\u062B \u06A9\u06D2 \u062F\u0631\u0628\u0627\u0631 \u06A9\u0648 \u0638\u0627\u06C1\u0631 \u06A9\u0631\u062A\u0627 \u06C1\u06D2\u060C \u062C\u0633\u06D2 \u0633\u0644\u0637\u0627\u0646 \u0645\u062D\u0645\u062F \u0646\u06D2 \u06A9\u0645\u0627\u0644\u0650 \u062C\u0627\u062F\u0648\u06AF\u0631\u06CC \u0627\u0648\u0631 \u0635\u0648\u0641\u06CC\u0627\u0646\u06C1 \u0631\u0646\u06AF\u0648\u06BA \u06A9\u06D2 \u0633\u0627\u062A\u06BE \u06A9\u06CC\u0646\u0648\u0633 \u067E\u0631 \u0627\u062A\u0627\u0631\u0627 \u06C1\u06D2\u06D4",
      is_published: true,
      audio_description_url: "https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg",
      audio_urdu_url: "https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg"
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
      medium: "Painting",
      dimensions: "Wall painting scale",
      rating: 5,
      image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Sennedjem_and_Iineferty_in_the_Fields_of_Iaru.jpg/800px-Sennedjem_and_Iineferty_in_the_Fields_of_Iaru.jpg",
      text_description: "A breathtaking tomb fresco showing Queen Nefertari making offerings to the gods, rendered in vibrant ochres, reds, and deep blues.",
      text_description_urdu: "\u0645\u0644\u06A9\u06C1 \u0646\u06CC\u0641\u0631\u062A\u0627\u0631\u06CC \u06A9\u06D2 \u0645\u0642\u0628\u0631\u06D2 \u06A9\u0627 \u06CC\u06C1 \u062E\u0648\u0628\u0635\u0648\u0631\u062A \u0641\u0631\u06CC\u0633\u06A9\u0648 \u0642\u062F\u06CC\u0645 \u0645\u0635\u0631\u06CC \u0622\u0631\u0679 \u06A9\u06CC \u06A9\u0645\u0627\u0644 \u0646\u0641\u0627\u0633\u062A\u060C \u0631\u0648\u0627\u06CC\u062A\u06CC \u06AF\u06C1\u0631\u06D2 \u0631\u0646\u06AF\u0648\u06BA \u0627\u0648\u0631 \u0627\u0628\u062F\u06CC \u062D\u06CC\u0627\u062A \u06A9\u06CC \u062A\u0631\u062C\u0645\u0627\u0646\u06CC \u06A9\u0631\u062A\u0627 \u06C1\u06D2\u06D4",
      is_published: true,
      audio_description_url: "https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg",
      audio_urdu_url: "https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg"
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
      medium: "Clay & Ceramic",
      dimensions: "42.0 cm height",
      rating: 5,
      image_url: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Celadon_vase_with_crane_design_Goryeo_National_Museum.jpg",
      text_description: "A gorgeous Goryeo celadon vase inlaid with flying cranes and stylized clouds, covered in a translucent sea-foam green glaze.",
      text_description_urdu: "\u06A9\u0648\u0631\u06CC\u0627\u0626\u06CC \u06AF\u0648\u0631\u06CC\u0648 \u062E\u0627\u0646\u062F\u0627\u0646 \u06A9\u0627 \u06CC\u06C1 \u062E\u0648\u0628\u0635\u0648\u0631\u062A \u0635\u0631\u0627\u062D\u06CC \u0646\u0645\u0627 \u0628\u0631\u062A\u0646 \u0627\u0691\u062A\u06D2 \u0633\u0627\u0631\u0633\u0648\u06BA \u0627\u0648\u0631 \u0628\u0627\u062F\u0644\u0648\u06BA \u06A9\u06D2 \u0646\u0641\u06CC\u0633 \u0646\u0642\u0634 \u0648 \u0646\u06AF\u0627\u0631 \u0633\u06D2 \u0633\u062C\u0627 \u06C1\u06D2\u060C \u062C\u0633 \u067E\u0631 \u06C1\u06CC\u0631\u06D2 \u062C\u06CC\u0633\u06CC \u0634\u0641\u0627\u0641 \u0645\u0679\u06CC\u0627\u0644\u06CC \u0633\u0628\u0632 \u067E\u0627\u0644\u0634 \u06A9\u06CC \u06AF\u0626\u06CC \u06C1\u06D2\u06D4",
      is_published: true,
      audio_description_url: "https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg",
      audio_urdu_url: "https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg"
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
      medium: "Painting",
      dimensions: "28.0 cm x 20.0 cm",
      rating: 5,
      image_url: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Holi_festival_Kangra_painting.jpg",
      text_description: "A colorful, vibrant miniature showing Krishna and the gopis joyously celebrating the festival of Holi with powdered dyes and water pumps.",
      text_description_urdu: "\u06A9\u0627\u0646\u06AF\u0691\u06C1 \u0648\u0627\u062F\u06CC \u06A9\u06CC \u06CC\u06C1 \u062E\u0648\u0628\u0635\u0648\u0631\u062A \u0645\u06CC\u0646\u06CC \u0627\u06CC\u0686\u0631 \u067E\u06CC\u0646\u0679\u0646\u06AF \u06C1\u0646\u062F\u0648\u0633\u062A\u0627\u0646\u06CC \u062A\u06C1\u0648\u0627\u0631 \u06C1\u0648\u0644\u06CC \u06A9\u06D2 \u0631\u0646\u06AF\u0648\u06BA\u060C \u0645\u062D\u0628\u062A \u06A9\u06CC \u0686\u0627\u0634\u0646\u06CC \u0627\u0648\u0631 \u0648\u0627\u0644\u06C1\u0627\u0646\u06C1 \u062E\u0648\u0634\u06CC \u06A9\u06D2 \u0645\u0646\u0638\u0631 \u06A9\u0648 \u062F\u0644\u06A9\u0634 \u062E\u0637\u0648\u0637 \u0645\u06CC\u06BA \u0633\u0645\u0648\u062A\u06CC \u06C1\u06D2\u06D4",
      is_published: true,
      audio_description_url: "https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg",
      audio_urdu_url: "https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg"
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
      medium: "Clay & Ceramic",
      dimensions: "62.5 cm height",
      rating: 5,
      image_url: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Panathenaic_amphora_Kleophrades_Louvre_F277.jpg",
      text_description: "A monumental black-figure amphora awarded at the Panathenaic Games, depicting Athena Promachos on one side and athletic contests on the other.",
      text_description_urdu: "\u06CC\u0648\u0646\u0627\u0646\u06CC \u06A9\u06BE\u06CC\u0644\u0648\u06BA \u0645\u06CC\u06BA \u0627\u0646\u0639\u0627\u0645 \u06A9\u06D2 \u0637\u0648\u0631 \u067E\u0631 \u062F\u06CC\u0627 \u062C\u0627\u0646\u06D2 \u0648\u0627\u0644\u0627 \u06CC\u06C1 \u06A9\u0644\u0627\u0633\u06A9 \u0645\u0631\u062A\u0628\u0627\u0646 \u062F\u06CC\u0648\u06CC \u0627\u06CC\u062A\u06BE\u06CC\u0646\u0627 \u06A9\u06CC \u062C\u0646\u06AF\u062C\u0648 \u0634\u0628\u06C1\u06CC\u06C1 \u0627\u0648\u0631 \u0627\u0633 \u062F\u0648\u0631 \u06A9\u06CC \u06CC\u0648\u0646\u0627\u0646\u06CC \u06A9\u06BE\u06CC\u0644\u0648\u06BA \u06A9\u06CC \u062A\u0627\u0631\u06CC\u062E \u06A9\u0627 \u0627\u06CC\u06A9 \u0634\u0627\u0646\u062F\u0627\u0631 \u06AF\u0648\u0627\u06C1 \u06C1\u06D2\u06D4",
      is_published: true,
      audio_description_url: "https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg",
      audio_urdu_url: "https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg"
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
      medium: "Clay & Ceramic",
      dimensions: "84.0 cm x 62.0 cm",
      rating: 5,
      image_url: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Iznik_tile_panel_Louvre_OA3919_n1.jpg",
      text_description: "An exquisite ceramic tile panel depicting a vibrant, swirling garden of blooming red tulips and carnations.",
      text_description_urdu: "\u0627\u0632\u0646\u06A9 \u06A9\u06D2 \u0634\u0627\u06C1\u06CC \u0628\u0631\u062A\u0646 \u0633\u0627\u0632\u0648\u06BA \u06A9\u06CC \u062A\u06CC\u0627\u0631 \u06A9\u0631\u062F\u06C1 \u06CC\u06C1 \u062E\u0648\u0628\u0635\u0648\u0631\u062A \u0679\u0627\u0626\u0644\u06CC\u06BA \u0639\u062B\u0645\u0627\u0646\u06CC \u062F\u0648\u0631\u0650 \u062D\u06A9\u0648\u0645\u062A \u0645\u06CC\u06BA \u067E\u06BE\u0648\u0644\u0648\u06BA \u06A9\u06CC \u062C\u0645\u0627\u0644\u06CC\u0627\u062A\u060C \u06AF\u06C1\u0631\u06D2 \u0633\u0631\u062E \u0627\u0648\u0631 \u0646\u06CC\u0644\u06D2 \u0631\u0648\u063A\u0646 \u06A9\u06CC \u0686\u0645\u06A9 \u06A9\u0627 \u0628\u06C1\u062A\u0631\u06CC\u0646 \u0646\u0645\u0648\u0646\u06C1 \u06C1\u06CC\u06BA\u06D4",
      is_published: true,
      audio_description_url: "https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg",
      audio_urdu_url: "https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg"
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
      medium: "Clay & Ceramic",
      dimensions: "358 cm diameter",
      rating: 5,
      image_url: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Piedra_del_Sol_en_el_MNA.jpg",
      text_description: "A colossal Aztec basalt monolith representing the five eras of creation and cosmological calendars, centering the face of the sun god Tonatiuh.",
      text_description_urdu: "\u067E\u062A\u06BE\u0631 \u06A9\u0627 \u06CC\u06C1 \u0639\u0638\u06CC\u0645 \u0627\u0644\u0634\u0627\u0646 \u0633\u0648\u0631\u062C \u0686\u06A9\u0631 \u0642\u062F\u06CC\u0645 \u0627\u06CC\u0632\u0679\u06CC\u06A9 \u0633\u0644\u0637\u0646\u062A \u06A9\u06CC \u0641\u0644\u06A9\u06CC\u0627\u062A\u06CC \u0641\u06C1\u0645 \u0627\u0648\u0631 \u06A9\u0627\u0626\u0646\u0627\u062A\u06CC \u0639\u0642\u0627\u0626\u062F \u06A9\u0648 \u0628\u06CC\u0627\u0646 \u06A9\u0631\u062A\u0627 \u06C1\u06D2\u060C \u062C\u0633 \u06A9\u06D2 \u0639\u06CC\u0646 \u0648\u0633\u0637 \u0645\u06CC\u06BA \u0633\u0648\u0631\u062C \u062F\u06CC\u0648\u062A\u0627 \u0679\u0648\u0646\u0627\u0679\u06CC\u0648 \u06A9\u0627 \u0686\u06C1\u0631\u06C1 \u0646\u0642\u0634 \u06C1\u06D2\u06D4",
      is_published: true,
      audio_description_url: "https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg",
      audio_urdu_url: "https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg"
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
      medium: "Clay & Ceramic",
      dimensions: "27.5 cm x 18.0 cm",
      rating: 5,
      image_url: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Moche_portrait_vessel_Larco_Museum_ML001258.jpg",
      text_description: "An exceptionally realistic pre-Columbian clay portrait jar representing a Moche ruler or noble with highly detailed face paint and headgear.",
      text_description_urdu: "\u0645\u0648\u0686\u06D2 \u062A\u06C1\u0630\u06CC\u0628 \u06A9\u0627 \u06CC\u06C1 \u0645\u0679\u06CC \u06A9\u0627 \u0628\u0631\u062A\u0646 \u0627\u0646\u0633\u0627\u0646\u06CC \u0686\u06C1\u0631\u06D2 \u06A9\u06CC \u062A\u06CC\u0646 \u0631\u062E\u06CC \u062A\u0635\u0648\u06CC\u0631 \u06A9\u0634\u06CC \u06A9\u0627 \u0627\u06CC\u06A9 \u0646\u0627\u062F\u0631 \u062A\u0631\u06CC\u0646 \u0646\u0645\u0648\u0646\u06C1 \u06C1\u06D2\u060C \u062C\u0633 \u0645\u06CC\u06BA \u0627\u0633 \u062F\u0648\u0631 \u06A9\u06D2 \u062D\u06A9\u0645\u0631\u0627\u0646 \u06A9\u06D2 \u062A\u0627\u062B\u0631\u0627\u062A \u0627\u0648\u0631 \u0633\u0631 \u06A9\u06CC \u0622\u0631\u0627\u0626\u0634 \u06A9\u0648 \u0646\u06C1\u0627\u06CC\u062A \u0646\u0641\u0627\u0633\u062A \u0633\u06D2 \u062F\u06A9\u06BE\u0627\u06CC\u0627 \u06AF\u06CC\u0627 \u06C1\u06D2\u06D4",
      is_published: true,
      audio_description_url: "https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg",
      audio_urdu_url: "https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg"
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
      medium: "Painting",
      dimensions: "20.8 cm x 139.8 cm",
      rating: 5,
      image_url: "https://upload.wikimedia.org/wikipedia/commons/d/df/Han_Huang_-_Five_Oxen.jpg",
      text_description: "A legendary Tang Dynasty handscroll painting depicting five oxen, each with a highly distinctive pose and emotional expression.",
      text_description_urdu: "\u062A\u0627\u0646\u06AF \u062E\u0627\u0646\u062F\u0627\u0646 \u06A9\u0627 \u06CC\u06C1 \u0645\u0634\u06C1\u0648\u0631 \u06C1\u06CC\u0646\u0688 \u0627\u0633\u06A9\u0631\u0648\u0644 \u067E\u0627\u0646\u0686 \u0628\u06CC\u0644\u0648\u06BA \u06A9\u06CC \u062C\u06CC\u062A\u06CC \u062C\u0627\u06AF\u062A\u06CC \u062A\u0635\u0648\u06CC\u0631 \u06A9\u0634\u06CC \u06A9\u0631\u062A\u0627 \u06C1\u06D2 \u062C\u0633 \u0645\u06CC\u06BA \u06C1\u0631 \u0627\u06CC\u06A9 \u06A9\u06CC \u062C\u0633\u0645\u0627\u0646\u06CC \u0633\u0627\u062E\u062A \u0627\u0648\u0631 \u062A\u0627\u062B\u0631\u0627\u062A \u06A9\u0648 \u0646\u06C1\u0627\u06CC\u062A \u062C\u0627\u0646\u062F\u0627\u0631 \u0627\u0646\u062F\u0627\u0632 \u0645\u06CC\u06BA \u062F\u06A9\u06BE\u0627\u06CC\u0627 \u06AF\u06CC\u0627 \u06C1\u06D2\u06D4",
      is_published: true,
      audio_description_url: "https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg",
      audio_urdu_url: "https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg"
    }
  ],
  "Japan": [
    {
      id: "gac_jp_1",
      title: "Sudden Shower over Shin-\u014Chashi bridge",
      artist_name: "Utagawa Hiroshige",
      artist_bio: "One of the greatest ukiyo-e woodblock print masters, famous for his lyrical landscape series and atmospheric depictions of weather.",
      year_created: 1856,
      origin_country: "Japan",
      origin_city: "Edo (Tokyo), Japan",
      medium: "Painting",
      dimensions: "34.0 cm x 22.5 cm",
      rating: 5,
      image_url: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Hiroshige_Atake_peinture.jpg",
      text_description: "An iconic woodblock print depicting a sudden summer downpour sweeping over travelers crossing a bridge in Edo.",
      text_description_urdu: "\u0627\u0688\u0648 \u062F\u0648\u0631 \u06A9\u06D2 \u0679\u0648\u06A9\u06CC\u0648 \u0645\u06CC\u06BA \u0627\u06CC\u06A9 \u067E\u0644 \u067E\u0631 \u0627\u0686\u0627\u0646\u06A9 \u0634\u0631\u0648\u0639 \u06C1\u0648\u0646\u06D2 \u0648\u0627\u0644\u06CC \u062A\u06CC\u0632 \u0628\u0627\u0631\u0634 \u0627\u0648\u0631 \u0645\u0633\u0627\u0641\u0631\u0648\u06BA \u06A9\u06CC \u062C\u0644\u062F\u06CC \u06A9\u0648 \u0627\u0633 \u0634\u0627\u06C1\u06A9\u0627\u0631 \u0645\u06CC\u06BA \u0627\u0646\u062A\u06C1\u0627\u0626\u06CC \u0645\u06C1\u0627\u0631\u062A \u0627\u0648\u0631 \u06AF\u06C1\u0631\u06D2 \u0631\u0646\u06AF\u0648\u06BA \u0633\u06D2 \u062A\u0631\u0627\u0634\u0627 \u06AF\u06CC\u0627 \u06C1\u06D2\u06D4",
      is_published: true,
      audio_description_url: "https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg",
      audio_urdu_url: "https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg"
    }
  ]
};
function classifyMuseumMedium(medium, type) {
  const source = `${medium || ""} ${type || ""}`.toLowerCase();
  if (source.includes("ceramic") || source.includes("clay") || source.includes("porcelain") || source.includes("pottery") || source.includes("glass")) {
    return "Clay & Ceramic";
  }
  return "Painting";
}
function toMuseumArtworkRecord(payload, country, fallbackTitle) {
  const title = payload?.title || fallbackTitle || "Untitled Masterpiece";
  const creator = payload?.artistDisplayName || payload?.creators?.[0]?.description || payload?.artist_name || "Unknown Master Artist";
  const imageUrl = payload?.primaryImageSmall || payload?.primaryImage || payload?.image_url || "";
  const yearCreated = payload?.objectBeginDate || payload?.year_created || 2024;
  return {
    id: payload?.id || payload?.objectID || `museum_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title,
    artist_name: creator,
    artist_bio: payload?.artistDisplayBio || payload?.artistBio || payload?.artist_bio || "",
    year_created: yearCreated,
    origin_country: country,
    origin_city: payload?.city || payload?.origin_city || country,
    medium: classifyMuseumMedium(payload?.medium, payload?.type),
    dimensions: payload?.dimensions || payload?.dimensions?.toString() || "Dimensions variable",
    rating: 5,
    image_url: imageUrl,
    text_description: payload?.text_description || `A masterfully crafted artwork titled "${title}" from the ${country} collection, described through its subject, materials, and cultural setting.`,
    text_description_urdu: payload?.text_description_urdu || `${title} ${country} \u06A9\u06D2 \u0645\u062C\u0645\u0648\u0639\u06C1 \u06A9\u0627 \u0627\u06CC\u06A9 \u0634\u0627\u0646\u062F\u0627\u0631 \u0634\u0627\u06C1\u06A9\u0627\u0631 \u06C1\u06D2\u06D4`,
    is_published: true,
    audio_description_url: "https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg",
    audio_urdu_url: "https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg",
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function searchMuseumArtworks(query) {
  const normalizedQuery = (query || "global").trim() || "global";
  const results = [];
  const seenIds = /* @__PURE__ */ new Set();
  const addArtwork = (artwork) => {
    const artworkId = artwork?.id || artwork?.objectID || artwork?.title;
    if (!artworkId || seenIds.has(artworkId)) return;
    seenIds.add(artworkId);
    results.push(artwork);
  };
  try {
    const metSearch = await import_axios.default.get("https://collectionapi.metmuseum.org/public/collection/v1/search", {
      params: { q: normalizedQuery, hasImages: true },
      timeout: 1e4
    });
    const objectIds = Array.isArray(metSearch.data?.objectIDs) ? metSearch.data.objectIDs.slice(0, 6) : [];
    for (const objectId of objectIds) {
      try {
        const objectRes = await import_axios.default.get(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`, { timeout: 1e4 });
        const primary = objectRes.data;
        addArtwork(toMuseumArtworkRecord({
          ...primary,
          id: `met_${primary.objectID}`,
          title: primary.title || "Untitled Masterpiece",
          artistDisplayName: primary.artistDisplayName || "Unknown Master Artist",
          primaryImageSmall: primary.primaryImageSmall || primary.primaryImage || "",
          objectBeginDate: primary.objectBeginDate || 2024,
          medium: primary.medium || "",
          dimensions: primary.dimensions || "Dimensions variable",
          text_description: `A museum-quality artwork titled "${primary.title || "Untitled Masterpiece"}" from the Metropolitan Museum of Art collection, described through its subject, materials, and cultural setting.`,
          text_description_urdu: `${primary.title || "Untitled Masterpiece"} \u0645\u06CC\u0679\u0631\u0648\u067E\u0648\u0644\u06CC\u0679\u0646 \u0645\u06CC\u0648\u0632\u06CC\u0645 \u0622\u0641 \u0622\u0631\u0679 \u06A9\u06D2 \u0645\u062C\u0645\u0648\u0639\u06C1 \u06A9\u0627 \u0627\u06CC\u06A9 \u0634\u0627\u0646\u062F\u0627\u0631 \u0634\u0627\u06C1\u06A9\u0627\u0631 \u06C1\u06D2\u06D4`
        }, "United States"));
      } catch (err) {
        console.warn("Met object fetch failed", err);
      }
    }
  } catch (err) {
    console.warn("Met search failed", err);
  }
  try {
    const cmaSearch = await import_axios.default.get("https://openaccess-api.clevelandart.org/api/artworks/", {
      params: { q: normalizedQuery, limit: 6, has_image: 1 },
      timeout: 1e4
    });
    const cmaItems = Array.isArray(cmaSearch.data?.data) ? cmaSearch.data.data : [];
    for (const item of cmaItems) {
      addArtwork(toMuseumArtworkRecord({
        ...item,
        id: `cma_${item.id}`,
        title: item.title || "Untitled Masterpiece",
        artistDisplayName: item.creators?.[0]?.description || "Unknown Master Artist",
        medium: item.type || item.medium || "",
        dimensions: item.dimensions || "Dimensions variable",
        text_description: `A masterfully crafted artwork titled "${item.title || "Untitled Masterpiece"}" from the Cleveland Museum of Art collection, described through its subject, materials, and cultural setting.`,
        text_description_urdu: `${item.title || "Untitled Masterpiece"} \u06A9\u0644\u06CC\u0648\u0644\u06CC\u0646\u0688 \u0645\u06CC\u0648\u0632\u06CC\u0645 \u0622\u0641 \u0622\u0631\u0679 \u06A9\u06D2 \u0645\u062C\u0645\u0648\u0639\u06C1 \u06A9\u0627 \u0627\u06CC\u06A9 \u0634\u0627\u0646\u062F\u0627\u0631 \u0634\u0627\u06C1\u06A9\u0627\u0631 \u06C1\u06D2\u06D4`
      }, "United States"));
    }
  } catch (err) {
    console.warn("CMA search failed", err);
  }
  const registryMatches = Object.values(googleArtsAndCultureRegistry).flat().filter((piece) => {
    const haystack = `${piece.title || ""} ${piece.artist_name || ""} ${piece.origin_country || ""}`.toLowerCase();
    return haystack.includes(normalizedQuery.toLowerCase());
  }).slice(0, 4);
  for (const piece of registryMatches) {
    addArtwork(toMuseumArtworkRecord({
      ...piece,
      id: piece.id,
      title: piece.title,
      artistDisplayName: piece.artist_name,
      medium: piece.medium,
      dimensions: piece.dimensions,
      text_description: piece.text_description,
      text_description_urdu: piece.text_description_urdu,
      image_url: piece.image_url,
      origin_city: piece.origin_city,
      year_created: piece.year_created,
      rating: piece.rating
    }, piece.origin_country || "Global"));
  }
  return results.slice(0, 12);
}
async function ingestGoogleArtsAndCultureFallback() {
  console.log("Checking for countries with no data to seed from Google Arts & Culture...");
  const countries = ["Pakistan", "Korea", "Japan", "China", "Italy", "Iran", "India", "Egypt", "Greece", "Turkey", "France", "Spain", "Mexico", "Peru", "Iraq", "Syria"];
  try {
    const artworksSnapshot = await db.collection("artworks").get();
    const existingCountries = /* @__PURE__ */ new Set();
    artworksSnapshot.forEach((doc) => {
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
            created_at: (/* @__PURE__ */ new Date()).toISOString()
          }, { merge: true });
        }
      }
    }
    console.log("Google Arts & Culture fallback check complete.");
  } catch (error) {
    console.error("Google Arts & Culture fallback check failed:", error);
  }
}
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
  const countries = ["Pakistan", "Korea", "Japan", "China", "Italy", "Iran", "India", "Egypt", "Greece", "Turkey", "France", "Spain", "Mexico", "Peru", "Iraq", "Syria"];
  try {
    for (const country of countries) {
      console.log(`CMA Ingesting for country: ${country}`);
      const response = await import_axios.default.get("https://openaccess-api.clevelandart.org/api/artworks/", {
        params: {
          q: country,
          limit: 3,
          has_image: 1
        }
      });
      const artworks = response.data?.data;
      if (!artworks || !Array.isArray(artworks)) continue;
      for (const art of artworks) {
        const titleLower = (art.title || "").toLowerCase();
        const creatorsList = art.creators || [];
        const creatorName = creatorsList[0]?.description || "Unknown Master Artist";
        const artistLower = creatorName.toLowerCase();
        const cultureLower = (art.culture?.[0] || "").toLowerCase();
        if (cultureLower.includes("israel") || cultureLower.includes("tel aviv") || titleLower.includes("israel") || artistLower.includes("israel") || country.toLowerCase().includes("israel")) {
          continue;
        }
        let enDesc = `A masterfully crafted artwork titled '${art.title}'. Part of the Cleveland Museum of Art collection.`;
        let urDesc = `${art.title} \u06A9\u0644\u06CC\u0648\u0644\u06CC\u0646\u0688 \u0645\u06CC\u0648\u0632\u06CC\u0645 \u0622\u0641 \u0622\u0631\u0679 \u06A9\u06D2 \u0645\u062C\u0645\u0648\u0639\u06C1 \u06A9\u0627 \u0627\u06CC\u06A9 \u0634\u0627\u0646\u062F\u0627\u0631 \u0634\u0627\u06C1\u06A9\u0627\u0631 \u06C1\u06D2\u06D4`;
        const prompt = `Generate a 2-paragraph professional museum description in English and a poetic translation in Urdu for this artwork.
                Focus on the artwork itself: subject, composition, medium, style, visible details, provenance, and cultural meaning. Do not write an artist biography.
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
          id: `cma_${art.id || Math.random().toString()}`,
          title: art.title || "Untitled Masterpiece",
          artist_name: art.creators?.[0]?.description ? art.creators[0].description.split(" (")[0] : art.creators?.[0]?.name || "Unknown Master Artist",
          artist_bio: art.creators?.[0]?.description || "",
          image_url: art.images?.web?.url || "",
          origin_country: country,
          medium: (art.type || "").toLowerCase().includes("ceramic") || (art.type || "").toLowerCase().includes("clay") ? "Clay & Ceramic" : "Painting",
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
          try {
            await import_axios.default.head(artData.image_url, { timeout: 5e3 });
            await db.collection("artworks").doc(artData.id).set(artData, { merge: true });
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
async function ingestMetArtworks() {
  console.log("Ingesting artworks from Met Museum API...");
  const countries = ["Pakistan", "Korea", "Japan", "China", "Italy", "Iran", "India", "Egypt", "Greece", "Turkey", "France", "Spain", "Mexico", "Peru", "Iraq", "Syria"];
  try {
    for (const country of countries) {
      console.log(`Met Ingesting for country: ${country}`);
      const response = await import_axios.default.get("https://collectionapi.metmuseum.org/public/collection/v1/search", {
        params: {
          q: country,
          hasImages: "true"
        }
      });
      if (!response.data || !response.data.objectIDs) continue;
      const objectIDs = response.data.objectIDs.slice(0, 3);
      for (const objectID of objectIDs) {
        try {
          const artRes = await import_axios.default.get(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectID}`);
          const art = artRes.data;
          if (!art || !art.primaryImageSmall && !art.primaryImage) continue;
          const titleLower = (art.title || "").toLowerCase();
          const originLower = (art.country || art.culture || "").toLowerCase();
          const artistLower = (art.artistDisplayName || "").toLowerCase();
          if (originLower.includes("israel") || originLower.includes("tel aviv") || titleLower.includes("israel") || artistLower.includes("israel") || country.toLowerCase().includes("israel")) {
            continue;
          }
          const prompt = `Generate a 2-paragraph professional museum description in English and a poetic translation in Urdu for this artwork.
                    Focus on the artwork itself: subject, composition, medium, style, visible details, provenance, and cultural meaning. Do not write an artist biography.
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
            artist_bio: art.artistDisplayBio || "",
            image_url: art.primaryImageSmall || art.primaryImage || "",
            origin_country: country,
            medium: (art.medium || "").toLowerCase().includes("ceramic") || (art.medium || "").toLowerCase().includes("clay") || (art.medium || "").toLowerCase().includes("porcelain") ? "Clay & Ceramic" : "Painting",
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
            try {
              await import_axios.default.head(artData.image_url, { timeout: 5e3 });
              await db.collection("artworks").doc(artData.id).set(artData, { merge: true });
            } catch (e) {
              console.log(`Skipping artwork ${artData.id} due to invalid or unreachable image URL: ${artData.image_url}`);
            }
          }
          await new Promise((resolve) => setTimeout(resolve, 150));
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
import_node_cron.default.schedule("0 * * * *", async () => {
  console.log("Running automatic artwork ingestion...");
  await ingestCMAArtworks();
  await ingestMetArtworks();
  await ingestGoogleArtsAndCultureFallback();
});
app.get("/api/search-artworks", async (req, res) => {
  try {
    const query = typeof req.query.q === "string" ? req.query.q : "global";
    const artworks = await searchMuseumArtworks(query);
    res.json(artworks);
  } catch (error) {
    console.error("Search artworks route failed:", error);
    res.status(500).json({ error: error.message || "Artwork search failed" });
  }
});
app.post("/api/ingest-artworks", async (req, res) => {
  try {
    console.log("Ingestion requested...");
    await ingestCMAArtworks();
    await ingestMetArtworks();
    await ingestGoogleArtsAndCultureFallback();
    res.json({ message: "Ingestion completed successfully" });
  } catch (error) {
    console.error("Ingestion route failed:", error);
    res.status(500).json({ error: `Ingestion failed: ${error.message || "Unknown"}` });
  }
});
app.post("/api/cleanup-artworks", async (req, res) => {
  try {
    console.log("Cleanup requested...");
    const artworksSnapshot = await db.collection("artworks").get();
    let removedCount = 0;
    for (const doc of artworksSnapshot.docs) {
      const data = doc.data();
      if (data.image_url) {
        try {
          await import_axios.default.head(data.image_url, { timeout: 5e3 });
        } catch (e) {
          console.log(`Removing artwork ${doc.id} due to invalid or unreachable image URL: ${data.image_url}`);
          await doc.ref.delete();
          removedCount++;
        }
      }
    }
    res.json({ message: `Cleanup completed. Removed ${removedCount} artworks.` });
  } catch (error) {
    console.error("Cleanup route failed:", error);
    res.status(500).json({ error: `Cleanup failed: ${error.message || "Unknown"}` });
  }
});
app.post("/api/enrich-description", async (req, res) => {
  try {
    const { title, artist, origin } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    const prompt = `Research the historical artwork titled "${title}" by artist "${artist || "Unknown"}" from "${origin || "Unknown"}". 
Using Google Search to verify accurate details, write a highly descriptive, professional 3-sentence museum curator note in English about the artwork's subject, composition, medium, style, provenance, and significance.
Do not write an artist biography in this guide text. Mention the artist only when needed for attribution or art-historical context, not as the focus.
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
app.post("/api/guide-tts", async (req, res) => {
  try {
    const { text, language = "en" } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }
    const cleanText = String(text).replace(/['"“”«»]/g, " ").trim();
    const isUrdu = language === "ur" || /[\u0600-\u06FF]/.test(cleanText);
    const prompt = isUrdu ? `Transform this into a short, elegant, poetic Urdu audio-guide narration for an art exhibition. Keep it flowing, expressive, and warm \u2014 a subtle young woman's voice reading slowly, like soft poetry. Text: ${cleanText}` : `Transform this into a short, elegant, poetic English audio-guide narration for an art exhibition. Keep it flowing, expressive, and warm \u2014 a subtle young woman's voice reading slowly, like soft poetry. Text: ${cleanText}`;
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [import_genai.Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Aoede" }
          }
        }
      }
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio data returned from Gemini TTS");
    }
    res.json({ audioBase64: base64Audio });
  } catch (error) {
    console.error("Error in guide-tts:", error);
    if (error.message?.includes("429") || error.status === 429) {
      return res.status(429).json({ error: "Voice synthesis quota exceeded. Please wait a moment and try again." });
    }
    res.status(500).json({ error: error.message || "Failed to generate narration audio" });
  }
});
app.post("/api/urdu-tts", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }
    const cleanText = String(text).replace(/['"“”«»]/g, " ").trim();
    const prompt = `Transform this into a short, elegant, poetic Urdu audio-guide narration for an art exhibition. Keep it flowing, expressive, and warm \u2014 a subtle young woman's voice reading slowly, like soft poetry. Text: ${cleanText}`;
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [import_genai.Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Aoede" }
          }
        }
      }
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio data returned from Gemini TTS");
    }
    res.json({ audioBase64: base64Audio });
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
  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server running on port ${PORT}`);
    try {
      await ingestGoogleArtsAndCultureFallback();
    } catch (bootErr) {
      console.error("Failed to run boot pre-seeding:", bootErr);
    }
  });
}
start();
//# sourceMappingURL=server.cjs.map
