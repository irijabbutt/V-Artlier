# 🏛️ V'Artlier — DYLP Hackathon Project

**V'Artlier** is a hackathon-ready immersive virtual art gallery built for the DYLP event. It blends modern gallery design with bilingual audio storytelling and sharable artwork discovery, bringing curated global museum pieces to a sophisticated web audience.

---

## 🌟 Project Summary

V'Artlier presents a museum-grade online exhibition with:
- English and Urdu audioguides that can be toggled mid-playback.
- Visual storytelling with curated artwork cards, spotlight showcases, and immersive gallery layouts.
- Shareable artwork links using a dedicated URL query param.
- GitHub Pages deployment support at `https://irijabbutt.github.io/V-Artlier`.

---

## 🚀 Key Features

* **Bilingual Audioguide Experience**
  - Seamless English/Urdu audio toggle.
  - Language switching works across both card-level previews and the main player.
* **Shareable Artwork Links**
  - Each artwork can be shared as a direct link with `?artwork=<id>`.
  - The modal now generates a stable share URL for the GitHub Pages site.
* **Immersive Gallery UX**
  - Fluid layout modes: horizontal explorer and masonry exhibition.
  - Medium-aware styling for paintings and clay/ceramic sculptures.
  - Animated entrance splash, live highlight states, and polished hover interactions.
* **Data Resilience**
  - Seeded from public museum APIs for rich artwork metadata.
  - Real-time Firestore sync keeps the gallery up to date when backend ingestion runs.

---

## 🧩 Tech Stack

* **Frontend:** React, TypeScript, Vite, Tailwind CSS, Motion
* **Server:** Express, Firebase Admin, Node.js
* **APIs:** Firestore, Met Museum API, Cleveland Museum of Art API, Gemini AI enrichment
* **Deployment Target:** GitHub Pages (`gh-pages`) for static site delivery

---

## 💻 Local Setup

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

### Build for production

```bash
npm run build
```

---

## 📦 GitHub Pages Deployment

This repository is configured for GitHub Pages deployment with the base path `/V-Artlier/`.
The site is published (or will publish) at:

**https://irijabbutt.github.io/V-Artlier**

The GitHub Actions workflow builds the app and deploys the `dist/` output to the `gh-pages` branch.

---

## 📝 Notes for Hackathon Judges

This DYLP entry showcases a strong UX-first gallery concept with:
- bilingual educational audio,
- live shareability,
- curated museum-sourced artwork,
- and a polished premium presentation layer.

The README reflects the current app flow, build setup, and deployment path for easy evaluation.

---

## 👥 Team

* Rijab Butt
* Abdul Moiz
* Muhammad Wadood Azhar
