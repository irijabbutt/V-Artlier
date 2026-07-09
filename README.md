# V'Artlier

V'Artlier is a DYLP hackathon vibe-coding project built as a virtual gallery experience for discovering global artworks through an immersive, exhibition-style interface. Visitors can browse curated pieces, filter the collection, view spotlight details, and listen to bilingual audio guides powered by Gemini.

## Team

- Rijab Butt
- Abdul Moiz
- Muhammad Wadood Azhar

## Features

- Immersive landing experience with a curated exhibition feel
- Search and filtering by title, artist, country, medium, and rating
- Spotlight artwork view with sharing support
- Bilingual audio-guide playback and Urdu text-to-speech support
- Firestore-backed persistence with seeded default artworks
- Server-side enrichment for artwork descriptions

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Motion for animation
- Express server
- Firebase / Firestore
- Google Gemini APIs

## Tools Used

- Google AI Studio for building and prototyping the experience
- GitHub Copilot for coding assistance
- Claude for debugging and deployment support

## Prerequisites

- Node.js 18+
- npm

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a local environment file:
   ```bash
   .env.local
   ```

   Add the required environment variables:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   FB_PROJECTID=your_firebase_project_id
   FB_FIRESTOREDATABASEID=(default)

   VITE_FB_APIKEY=your_firebase_api_key
   VITE_FB_AUTHDOMAIN=your_firebase_auth_domain
   VITE_FB_PROJECTID=your_firebase_project_id
   VITE_FB_STORAGEBUCKET=your_firebase_storage_bucket
   VITE_FB_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FB_APPID=your_firebase_app_id
   ```

3. Run the app locally:
   ```bash
   npm run dev
   ```

4. Open the local URL shown by Vite in your browser.

## Available Scripts

- `npm run dev` — start the development server
- `npm run build` — build the production bundle
- `npm run start` — run the built production server
- `npm run lint` — type-check the project

## Notes

- If Firestore is empty, the app will seed a curated set of artworks automatically.
- The app expects valid Firebase build-time configuration for frontend deployment, especially for static hosting environments.

