import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import AmbientBackground from "./components/AmbientBackground";
import SplashEntrance from "./components/SplashEntrance";
import HeaderNavbar from "./components/HeaderNavbar";
import ArtworkCard from "./components/ArtworkCard";
import AudioPlayerController from "./components/AudioPlayerController";
import ShareModal from "./components/ShareModal";
import ArtworkShowcaseBig from "./components/ArtworkShowcaseBig";
import { Artwork, PlaybackLanguage } from "./types";
import { db, collection, setDoc, doc, onSnapshot, deleteDoc, getDocs, handleFirestoreError, OperationType } from "./firebase";

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [newArrivalId, setNewArrivalId] = useState<string | null>(null);

  // Spotlight Selected Artwork State (Showcase single view big)
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  // Filter and curation states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedium, setSelectedMedium] = useState<"All" | "Painting" | "Clay & Ceramic">("All");
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"horizontal" | "masonry">("horizontal");

  // Audioguide Player states
  const [activeAudioArtwork, setActiveAudioArtwork] = useState<Artwork | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<PlaybackLanguage>("en");
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Social sharing modal states
  const [sharingArtwork, setSharingArtwork] = useState<Artwork | null>(null);

  const [isResetting, setIsResetting] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);

  // Extract a hero piece for the entrance landing (populated once live data arrives)
  const [heroPiece, setHeroPiece] = useState<Artwork | null>(null);

  useEffect(() => {
    if (artworks.length > 0) {
      setHeroPiece(artworks[Math.floor(Math.random() * artworks.length)]);
    }
  }, [artworks]);

  // Call the server-side Gemini API with Google Search Grounding to enrich descriptions in English & Urdu
  const handleEnrichArtwork = async (artworkToEnrich: Artwork) => {
    try {
      const response = await fetch("/api/enrich-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: artworkToEnrich.title,
          artist: artworkToEnrich.artist_name,
          origin: artworkToEnrich.origin_country
        })
      });
      if (!response.ok) {
        throw new Error("Failed to call enrichment API");
      }
      const data = await response.json();
      if (!data.text_description || !data.text_description_urdu) {
        throw new Error("API returned incomplete description data");
      }
      
      const updatedArtwork = {
        ...artworkToEnrich,
        text_description: data.text_description,
        text_description_urdu: data.text_description_urdu
      };
      
      // Save directly to Firestore for global persistence
      await setDoc(doc(db, "artworks", artworkToEnrich.id), updatedArtwork, { merge: true });
      
      // Update local UI state
      setArtworks(prev => prev.map(a => a.id === artworkToEnrich.id ? updatedArtwork : a));
      setSelectedArtwork(updatedArtwork);
    } catch (err: any) {
      console.error("Enrichment failed:", err);
      alert("Enrichment failed: " + (err.message || String(err)));
    }
  };

  // NOTE: A previous "migration" effect used to live here. It deleted every
  // document in the shared `artworks` collection for ANY visitor whose browser
  // didn't have a local flag set (e.g. a new device, a different browser, or
  // cleared storage), then reseeded the gallery exclusively from the Met/Cleveland
  // museum APIs. Those APIs never return "Pakistan" (or many other origin
  // countries) as a culture/country tag, so the curated DEFAULT_ARTWORKS pieces
  // (Ustad Allah Bux, Sadequain, Chughtai, Jamil Naqsh, etc.) were being wiped
  // out for every visitor and never restored. It has been removed — seeding now
  // happens exclusively in the onSnapshot handler below, and only when the
  // collection is genuinely empty, so it can never nuke live data again.

  // Load artworks from Firestore and sync with public APIs if empty
  useEffect(() => {
    const q = collection(db, "artworks");
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        console.log("Firestore empty, seeding with Met Museum and Cleveland Museum of Art masterpieces...");
        try {
          // Helper to fetch details for a Met object ID and map to our Artwork type
          const fetchMetDetails = async (id: number): Promise<Artwork | null> => {
            try {
              const res = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
              if (!res.ok) return null;
              const item = await res.json();
              if (!item || (!item.primaryImageSmall && !item.primaryImage)) return null;

              const titleLower = (item.title || "").toLowerCase();
              const originLower = (item.country || item.culture || "").toLowerCase();
              const artistLower = (item.artistDisplayName || "").toLowerCase();

              // Strict client-side exclusion filter
              if (
                originLower.includes("israel") ||
                originLower.includes("tel aviv") ||
                titleLower.includes("israel") ||
                artistLower.includes("israel")
              ) {
                return null;
              }

              const mediumLower = (item.medium || "").toLowerCase();
              const classificationLower = (item.classification || "").toLowerCase();
              const isClay = mediumLower.includes("clay") ||
                             mediumLower.includes("ceramic") ||
                             mediumLower.includes("stoneware") ||
                             mediumLower.includes("porcelain") ||
                             mediumLower.includes("terracotta") ||
                             mediumLower.includes("pottery") ||
                             mediumLower.includes("earthenware") ||
                             classificationLower.includes("clay") ||
                             classificationLower.includes("ceramic") ||
                             classificationLower.includes("porcelain");

              const finalMedium: "Painting" | "Clay & Ceramic" = isClay ? "Clay & Ceramic" : "Painting";
              const title = item.title || "Untitled Masterpiece";
              const artist = item.artistDisplayName || "Unknown Master Artist";
              const origin = item.country || item.culture || "Global Collection";
              const urduText = `${title} ایک شاہکار تخلیق ہے جسے ماہر فنکار ${artist} نے کمال مہارت سے تراشا ہے۔ یہ فن پارہ ${origin} کے تاریخی ورثے اور اس دور کی جمالیاتی سوچ کا ایک زندہ ثبوت ہے۔ اس کی ہر لکیر اور رنگ ایک گہری کہانی سناتا ہے جو دیکھنے والے کو اپنے سحر میں جکڑ لیتی ہے۔`;
              const price = Math.floor(Math.random() * 8 + 2) * 10000 + 15000;

              return {
                id: `met_${item.objectID}`,
                title: title,
                artist_name: artist,
                artist_bio: item.artistDisplayBio || item.creditLine || "A significant contribution to the world of fine arts.",
                year_created: item.objectEndDate || item.objectBeginDate || 1880,
                origin_country: origin,
                origin_city: item.city || item.repository || "Global Arts Collection",
                price: price,
                medium: finalMedium,
                dimensions: item.dimensions || "Dimensions variable",
                rating: Math.floor(Math.random() * 2) + 4,
                image_url: item.primaryImageSmall || item.primaryImage,
                audio_description_url: "https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg",
                audio_urdu_url: "https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg",
                text_description: `This exquisite piece, titled '${title}', reflects the profound vision of ${artist}. It stands as a silent witness to the cultural legacy of ${origin}, inviting us to contemplate the balance of form and emotion captured in ${finalMedium.toLowerCase()}.`,
                text_description_urdu: urduText,
                is_published: true,
                created_at: new Date().toISOString()
              };
            } catch (err) {
              console.log(`Met Museum ID ${id} fetch skipped (network limit/CORS).`);
              return null;
            }
          };

          // Helper to fetch details from Cleveland Museum of Art (CMA) and verify images
          const fetchClevelandDetails = async (qString: string, limitCount: number): Promise<Artwork[]> => {
            try {
              const res = await fetch(`https://openaccess-api.clevelandart.org/api/artworks/?has_image=1&q=${qString}&limit=20`);
              if (!res.ok) return [];
              const payload = await res.json();
              if (!payload || !Array.isArray(payload.data)) return [];

              const results: Artwork[] = [];
              for (const item of payload.data) {
                if (results.length >= limitCount) break;

                // Verify image
                const imageUrl = item.images?.web?.url || item.images?.print?.url;
                if (!imageUrl || typeof imageUrl !== "string" || imageUrl.trim() === "") {
                  continue;
                }
                if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
                  continue;
                }
                if (imageUrl.includes("placeholder") || imageUrl.includes("null") || imageUrl.includes("undefined")) {
                  continue;
                }

                const titleLower = (item.title || "").toLowerCase();
                const creatorsList = item.creators || [];
                const creatorName = creatorsList[0]?.description || "Unknown Master Artist";
                const artistLower = creatorName.toLowerCase();
                const origin = item.culture && item.culture.length > 0 ? item.culture[0] : "Global Collection";
                const originLower = origin.toLowerCase();

                if (
                  originLower.includes("israel") ||
                  originLower.includes("tel aviv") ||
                  titleLower.includes("israel") ||
                  artistLower.includes("israel")
                ) {
                  continue;
                }

                const mediumLower = (item.medium || "").toLowerCase();
                const typeLower = (item.type || "").toLowerCase();
                const isClay = mediumLower.includes("clay") ||
                               mediumLower.includes("ceramic") ||
                               mediumLower.includes("stoneware") ||
                               mediumLower.includes("porcelain") ||
                               mediumLower.includes("terracotta") ||
                               mediumLower.includes("pottery") ||
                               mediumLower.includes("earthenware") ||
                               typeLower.includes("clay") ||
                               typeLower.includes("ceramic") ||
                               typeLower.includes("porcelain");

                const finalMedium: "Painting" | "Clay & Ceramic" = isClay ? "Clay & Ceramic" : "Painting";
                const title = item.title || "Untitled Masterpiece";
                const artist = creatorName;
                const urduText = `${title} فن کاری کا ایک بے مثال نمونہ ہے جسے ${artist} نے نہایت باریک بینی سے تخلیق کیا ہے۔ یہ تخلیق ${origin} کے تہذیبی حسن اور فنکارانہ گہرائی کو بیان کرتی ہے، جو زمان و مکاں کی قید سے آزاد ہو کر ایک ابدی پیغام دیتی ہے۔`;
                const price = Math.floor(Math.random() * 8 + 2) * 10000 + 15000;

                results.push({
                  id: `cma_${item.id || item.accession_number || Math.random().toString()}`,
                  title: title,
                  artist_name: artist,
                  artist_bio: creatorsList[0]?.biography || item.creditline || "A masterpiece held in high regard for its historical and artistic value.",
                  year_created: item.creation_date_earliest || item.creation_date_latest || 1880,
                  origin_country: origin,
                  origin_city: "Global Arts Exhibition",
                  price: price,
                  medium: finalMedium,
                  dimensions: item.dimensions || "Dimensions variable",
                  rating: Math.floor(Math.random() * 2) + 4,
                  image_url: imageUrl,
                  audio_description_url: "https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg",
                  audio_urdu_url: "https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg",
                  text_description: `A masterfully crafted ${finalMedium.toLowerCase()} work titled '${title}'. Through this piece, the artist ${artist} captures the essence of ${origin} culture, offering a window into a world of timeless beauty and contemplative depth.`,
                  text_description_urdu: urduText,
                  is_published: true,
                  created_at: new Date().toISOString()
                });
              }
              return results;
            } catch (err) {
              console.log("Cleveland Museum API fetch skipped.");
              return [];
            }
          };

          // Fetch painting and ceramic object ID lists from Met Museum Collection API with highlight=true
          // Search across a broad set of world art traditions so the gallery's
          // country/culture coverage comes organically from the museums' own
          // collections rather than any hand-picked list.
          const metSearchTerms = [
            "painting", "ceramics", "Mughal", "Persian miniature", "Ottoman",
            "Chinese porcelain", "Japanese woodblock", "Korean celadon",
            "African sculpture", "Latin American", "Islamic calligraphy",
          ];

          const metResults = await Promise.all(
            metSearchTerms.map((term) =>
              fetch(`https://collectionapi.metmuseum.org/public/collection/v1/search?q=${encodeURIComponent(term)}&hasImages=true`)
                .then((res) => res.json())
                .catch(() => ({ objectIDs: [] }))
            )
          );

          // Interleave a couple of object IDs from each search term for variety
          const metIdPool: number[] = [];
          for (const result of metResults) {
            const ids = (result?.objectIDs || []).slice(0, 4);
            metIdPool.push(...ids);
          }

          const apiArtworks: Artwork[] = [];

          // Sequential Met fetches (cap total successful pieces to stay fast)
          let metCount = 0;
          for (const id of metIdPool) {
            if (metCount >= 12) break;
            const art = await fetchMetDetails(id);
            if (art) {
              apiArtworks.push(art);
              metCount++;
              await new Promise(resolve => setTimeout(resolve, 150));
            }
          }

          // Fetch remaining artworks from Cleveland Museum of Art across the
          // same broad set of traditions
          const cmaSearchTerms = ["painting", "ceramics", "porcelain", "textile", "miniature"];
          for (const term of cmaSearchTerms) {
            const results = await fetchClevelandDetails(term, 2);
            apiArtworks.push(...results);
          }

          for (const art of apiArtworks) {
            try {
              await setDoc(doc(db, "artworks", art.id), art);
            } catch (setErr) {
              handleFirestoreError(setErr, OperationType.WRITE, `artworks/${art.id}`);
            }
          }
        } catch (err) {
          console.error("Seeding failed: ", err);
        }
      } else {
        const loaded: Artwork[] = [];
        snapshot.forEach((doc) => {
          const itemData = doc.data() as Artwork;
          const titleLower = (itemData.title || "").toLowerCase();
          const originLower = (itemData.origin_country || "").toLowerCase();
          const artistLower = (itemData.artist_name || "").toLowerCase();
          
          // Apply strict client-side exclusion filter
          if (
            !originLower.includes("israel") &&
            !originLower.includes("tel aviv") &&
            !titleLower.includes("israel") &&
            !artistLower.includes("israel")
          ) {
            loaded.push({ id: doc.id, ...itemData });
          }
        });
        loaded.sort((a, b) => {
          const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
          return bTime - aTime;
        });
        setArtworks(loaded);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "artworks");
    });

    return () => unsubscribe();
  }, []);

  // Synchronize selected artwork on list update or on first load
  useEffect(() => {
    if (!selectedArtwork && artworks.length > 0) {
      setSelectedArtwork(artworks[0]);
    }
  }, [artworks, selectedArtwork]);

  // Auto-detect sharing link param if user opened a shared art link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedArtId = params.get("artwork");
    if (sharedArtId) {
      const found = artworks.find(a => a.id === sharedArtId);
      if (found) {
        setHasEntered(true);
        setSelectedArtwork(found);
        // Automatically scroll to or open share modal for immediate immersion
        setTimeout(() => {
          setSharingArtwork(found);
        }, 1000);
      }
    }
  }, [artworks]);

  // Handle Audioguide playback toggle
  const handlePlayToggle = (artwork: Artwork, language: PlaybackLanguage) => {
    if (activeAudioArtwork?.id === artwork.id && activeLanguage === language) {
      // Toggle play/pause for same track
      setIsAudioPlaying(!isAudioPlaying);
    } else {
      // Switch active artwork/track or translation
      setActiveAudioArtwork(artwork);
      setActiveLanguage(language);
      setIsAudioPlaying(true);
    }
  };

  // Handle language switch from controller player
  const handleLanguageChangeFromPlayer = (lang: PlaybackLanguage) => {
    setActiveLanguage(lang);
    setIsAudioPlaying(true);
  };

  // Handle Spotlight / Examine Selection
  const handleSelectArtwork = (art: Artwork) => {
    setSelectedArtwork(art);
    const element = document.getElementById("spotlight-showcase");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Reset wall back to Met & CMA highlights
  const handleResetGallery = async () => {
    setIsResetting(true);
    try {
      const q = collection(db, "artworks");
      let snapshot;
      try {
        snapshot = await getDocs(q);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, "artworks");
        return;
      }
      
      const batchPromises = snapshot.docs.map((docSnap) => {
        const path = `artworks/${docSnap.id}`;
        return deleteDoc(doc(db, "artworks", docSnap.id)).catch((err) => {
          handleFirestoreError(err, OperationType.DELETE, path);
        });
      });
      await Promise.all(batchPromises);
      
      localStorage.removeItem("cma_and_met_api_seeding_v4");
      window.location.reload();
    } catch (err) {
      console.error("Failed to reset database: ", err);
    } finally {
      setIsResetting(false);
    }
  };

  // Manual trigger to ingest remaining unique artworks from Cleveland Museum of Art and Met Museum API
  const handleIngestCMAArtworks = async () => {
    setIsIngesting(true);
    try {
      console.log("Triggering manual ingestion via server...");
      const res = await fetch("/api/ingest-artworks", { method: "POST" });
      if (!res.ok) throw new Error("Ingestion API request failed");
      
      alert("Successfully triggered gallery expansion!");
      // We don't need to manually update artworks as it will be updated by onSnapshot listener in useEffect
    } catch (err: any) {
      console.error("Gallery expansion failed:", err);
      alert("Gallery expansion failed: " + (err.message || String(err)));
    } finally {
      setIsIngesting(false);
    }
  };

  // Filter artworks on keywords
  const filteredArtworks = artworks.filter((art) => {
    // 1. Fuzzy query filter
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = query === "" || 
      art.title.toLowerCase().includes(query) ||
      art.artist_name.toLowerCase().includes(query) ||
      art.origin_country.toLowerCase().includes(query) ||
      art.medium.toLowerCase().includes(query);

    // 2. Medium filter
    const matchesMedium = selectedMedium === "All" || art.medium === selectedMedium;

    // 3. Star Rating filter
    const matchesRating = selectedRating === 0 || art.rating >= selectedRating;

    return matchesSearch && matchesMedium && matchesRating;
  });

  return (
    <div className="relative min-h-screen bg-[#161212] overflow-x-hidden text-[#fffdf9] font-sans pb-32 selection:bg-[#d4af37]/30 selection:text-[#fffdf9]">
      
      {/* Immersive Atmospheric Gallery Wall Background Layer */}
      <AmbientBackground />

      {/* Main Transitions */}
      <AnimatePresence mode="wait">
        {!hasEntered ? (
          /* Landing Entrance Splash View */
          <motion.div
            key="splash"
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10"
          >
            {heroPiece ? (
              <SplashEntrance
                heroArtwork={heroPiece}
                onEnter={() => {
                  setHasEntered(true);
                  setSelectedArtwork(heroPiece);
                }}
              />
            ) : (
              <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 select-none">
                <span className="font-serif text-3xl tracking-[0.2em] uppercase text-[#fffdf9]/80 italic">
                  V'ARTLIER
                </span>
                <span className="font-mono text-[10px] tracking-widest uppercase text-[#d4af37]/60 animate-pulse">
                  Curating the exhibition halls&hellip;
                </span>
              </div>
            )}
          </motion.div>
        ) : (
          /* Main Interactive Gallery Viewport */
          <motion.div
            key="gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative z-10 flex flex-col min-h-screen"
          >
            {/* Header and Curation Center */}
            <HeaderNavbar 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedMedium={selectedMedium}
              setSelectedMedium={setSelectedMedium}
              selectedRating={selectedRating}
              setSelectedRating={setSelectedRating}
              viewMode={viewMode}
              setViewMode={setViewMode}
              onResetGallery={handleResetGallery}
              isResetting={isResetting}
              onIngestCMA={handleIngestCMAArtworks}
              isIngesting={isIngesting}
            />

            {/* Quick Navigation: Return to Splash Entrance */}
            <div className="max-w-7xl mx-auto w-full px-6 pt-6 select-none">
              <button
                onClick={() => setHasEntered(false)}
                className="group flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-100/40 hover:text-[#fffdf9] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform text-[#d4af37]" />
                <span>Return to Entrance Portal</span>
              </button>
            </div>

            {/* Gallery Exhibition Walls container */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col gap-12">
              
              {/* Grand Selected Masterpiece Showcase (Single View Big) */}
              {selectedArtwork && (
                <div id="spotlight-showcase" className="w-full">
                  <ArtworkShowcaseBig
                    artwork={selectedArtwork}
                    isAudioActive={activeAudioArtwork?.id === selectedArtwork.id}
                    activeLanguage={activeLanguage}
                    onPlayToggle={handlePlayToggle}
                    onShare={setSharingArtwork}
                    onEnrichArtwork={handleEnrichArtwork}
                  />
                </div>
              )}

              {/* Dynamic Empty State when filters yield zero items */}
              {filteredArtworks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center border border-[#2e2626]/40 bg-[#120e0e]/20 rounded-sm p-8 select-none">
                  <AlertCircle className="w-10 h-10 text-amber-100/30 mb-4 animate-pulse" />
                  <h3 className="font-serif text-2xl text-amber-100/80 italic">
                    Exhibition Hall Empty
                  </h3>
                  <p className="font-sans text-xs text-amber-100/40 mt-1 max-w-md">
                    No artworks matching your criteria are currently hung in this gallery wing. Refine your query, reset filters, or summon a new installation.
                  </p>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedMedium("All");
                        setSelectedRating(0);
                      }}
                      className="px-4 py-2 bg-[#1e1919] hover:bg-[#2a2323] border border-[#2e2626] rounded-sm text-[10px] font-mono uppercase tracking-wider text-amber-100/60 hover:text-[#fffdf9] transition-all cursor-pointer"
                    >
                      Clear Curation Filters
                    </button>
                    <button
                      onClick={handleIngestCMAArtworks}
                      disabled={isIngesting}
                      className="px-4 py-2 bg-[#d4af37]/10 hover:bg-[#d4af37]/15 border border-[#d4af37]/30 rounded-sm text-[10px] font-mono uppercase tracking-wider text-[#d4af37] hover:text-[#fffdf9] transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{isIngesting ? "Expanding..." : "Expand Gallery"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Toggle layout states cleanly */
                viewMode === "horizontal" ? (
                  /* THE GREAT HALL (Atmospheric Side-by-Side horizontal scroll layout) */
                  <div className="flex flex-col select-none">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="font-serif text-3xl tracking-wide text-[#fffdf9] italic">
                          The Great Hall
                        </h2>
                        <p className="font-sans text-xs text-amber-100/40 mt-0.5">
                          Scroll horizontally to tour this curated wing. Hover over any canvas or vessel to activate visual depth of field.
                        </p>
                      </div>
                      <div className="font-mono text-[9px] text-[#d4af37] tracking-widest border border-[#d4af37]/20 px-2 py-0.5 rounded-xs bg-[#d4af37]/5">
                        {filteredArtworks.length} Pieces Hung
                      </div>
                    </div>
                    
                    {/* Horizontal scroll container */}
                    <div className="flex gap-8 overflow-x-auto py-6 px-4 -mx-4 gallery-scroll snap-x">
                      {filteredArtworks.map((art) => (
                        <div key={art.id} className="w-[300px] md:w-[420px] shrink-0 snap-start">
                          <ArtworkCard
                            artwork={art}
                            isAudioActive={activeAudioArtwork?.id === art.id}
                            activeLanguage={activeLanguage}
                            onPlayToggle={handlePlayToggle}
                            onShare={setSharingArtwork}
                            isNewArrival={newArrivalId === art.id}
                            onSelect={handleSelectArtwork}
                            isSelected={selectedArtwork?.id === art.id}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* EXHIBITION WINGS (Elite staggered asymmetric masonry multi-column layout) */
                  <div className="flex flex-col select-none">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="font-serif text-3xl tracking-wide text-[#fffdf9] italic">
                          Exhibition Wings
                        </h2>
                        <p className="font-sans text-xs text-amber-100/40 mt-0.5">
                          Staggered bento positioning mimics physical gallery rooms. Sculptural clay pieces will tilt as your gaze shifts over them.
                        </p>
                      </div>
                      <div className="font-mono text-[9px] text-[#d4af37] tracking-widest border border-[#d4af37]/20 px-2 py-0.5 rounded-xs bg-[#d4af37]/5">
                        {filteredArtworks.length} Pieces Hung
                      </div>
                    </div>

                    {/* CSS columns-based masonry */}
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                      {filteredArtworks.map((art) => (
                        <div key={art.id} className="break-inside-avoid">
                          <ArtworkCard
                            artwork={art}
                            isAudioActive={activeAudioArtwork?.id === art.id}
                            activeLanguage={activeLanguage}
                            onPlayToggle={handlePlayToggle}
                            onShare={setSharingArtwork}
                            isNewArrival={newArrivalId === art.id}
                            onSelect={handleSelectArtwork}
                            isSelected={selectedArtwork?.id === art.id}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}

            </main>

            {/* Persistent global mini player controller */}
            {activeAudioArtwork && (
              <AudioPlayerController
                artwork={activeAudioArtwork}
                language={activeLanguage}
                isPlaying={isAudioPlaying}
                onTogglePlay={() => setIsAudioPlaying(!isAudioPlaying)}
                onLanguageChange={handleLanguageChangeFromPlayer}
                onClose={() => {
                  window.speechSynthesis.cancel();
                  setActiveAudioArtwork(null);
                  setIsAudioPlaying(false);
                }}
              />
            )}

            {/* Social Share Modal Popup overlay */}
            {sharingArtwork && (
              <ShareModal
                artwork={sharingArtwork}
                onClose={() => setSharingArtwork(null)}
              />
            )}

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
