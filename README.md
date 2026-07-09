# 🏛️ V'Artlier — Global Virtual Art Gallery

**V'Artlier** is an immersive, premium virtual art gallery application engineered to replicate the quiet, sophisticated atmosphere of walking through an elite modern museum. By moving away from traditional, rigid web grids, the platform introduces fluid spatial depth, micro-interactions, and visual breathing room to present curated global artwork as a true sensory experience.

---

## 🚀 Key Features

* **Dual-Language Audioguide System:** Built using the Web Audio API, allowing visitors to seamlessly switch mid-stream between global English descriptions and a beautifully narrated **native Urdu voiceover track** without losing current playback progress tracking state.
* **Automated Data Pipeline:** A serverless background integration powered by Gen 2 Firebase Cloud Functions that automatically fetches open-access raw data from global museum APIs every 24 hours.
* **Real-Time Visual Ingestion:** Leverages live Firestore snapshot subscriptions (`onSnapshot()`) to automatically catch database insertions, instantly sliding new curated items onto the UI layout with a custom Framer Motion "New Arrival" entry animation.
* **Adaptive Medium Styling:** Natively handles diverse mediums, rendering classical canvas paintings with deep physical drop shadows and utilizing mouse-coordinate tracking to give sculptural ceramic or clay pieces a subtle interactive 3D tilt effect.

---

## 🛠️ Tech Stack & Architecture

* **Frontend:** Next.js 14+ (App Router) / React, TypeScript, Tailwind CSS, Framer Motion, Web Audio API
* **Backend & Database:** Firebase (Cloud Firestore + Cloud Storage + Gen 2 Cloud Functions)
* **Data Sources:** Art Institute of Chicago Open Access API / The Metropolitan Museum of Art API

---

## 💾 Project Setup & Directory Mapping

### 1. Database & Cloud Configuration
Review [firebase.md](firebase.md) for full setup instructions, including:
- Document Schemas for the `artworks` Firestore collection.
- Requirements for establishing composite sorting indexes (`rating` Descending, `created_at` Descending).
- Storage bucket organizational folders (`artworks/images/` and `artworks/audio/`).

### 2. Frontend Environment Setup
Create a `.env.local` file in the root directory and append your web app credentials:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Execution
To spin up your local development space:
```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

---

## 🧪 Engineering Success Metrics
- Filters react instantly across global datasets without full-page reloads.
- Audio language tracks toggle seamlessly mid-stream without losing current playback timestamp states.
- Background animations execute at sub-pixel speeds without dropping layout performance or harming accessibility.

## Development Collaboration
- Rijab Butt 
- Abdul Moiz
- Muhammad Wadood Azhar