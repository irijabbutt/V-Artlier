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
import { db, collection, setDoc, doc, onSnapshot, deleteDoc, getDocs, handleFirestoreError, OperationType, firebaseConfigValid } from "./firebase";

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [newArrivalId, setNewArrivalId] = useState<string | null>(null);

  // Spotlight Selected Artwork State (Showcase single view big)
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  // Filter and curation states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedium, setSelectedMedium] = useState<"All" | "Painting" | "Clay & Ceramic">("All");
  const [selectedCountry, setSelectedCountry] = useState<string>("All");
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
      if (!selectedArtwork) {
        setSelectedArtwork(artworks[0]);
      }
      if (!heroPiece) {
        setHeroPiece(artworks[Math.floor(Math.random() * artworks.length)]);
      }
    }
  }, [artworks, selectedArtwork, heroPiece]);

  // Call the server-side Gemini API with Google Search Grounding to enrich descriptions in English & Urdu
  const handleEnrichArtwork = async (artworkToEnrich: Artwork) => {
    if (!firebaseConfigValid || !db) {
      alert("Artwork enrichment requires Firebase configuration, so this demo is showing the built-in curated gallery.");
      return;
    }

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
    let isActive = true;

    if (!firebaseConfigValid || !db) {
      const loadFallbackArtworks = async () => {
        try {
          const query = searchQuery.trim() || "global";
          const response = await fetch(`/api/search-artworks?q=${encodeURIComponent(query)}`);
          if (!response.ok) throw new Error("Remote museum search unavailable");
          const remoteArtworks = await response.json();
          if (isActive && Array.isArray(remoteArtworks) && remoteArtworks.length > 0) {
            setArtworks(remoteArtworks as Artwork[]);
            return;
          }
        } catch (error) {
          console.warn("Remote museum search unavailable, using built-in gallery", error);
        }

        if (isActive) {
          setArtworks([]);
        }
      };

      loadFallbackArtworks();
      return () => {
        isActive = false;
      };
    }

    const q = collection(db, "artworks");
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (!isActive) return;

      if (snapshot.empty) {
        console.log("Firestore empty; no default artworks will be seeded.");
        setArtworks([]);
      } else {
        const loaded: Artwork[] = [];
        snapshot.forEach((docSnap) => {
          const itemData = docSnap.data() as Artwork;
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
            loaded.push({ ...(itemData as Omit<Artwork, 'id'>), id: docSnap.id });
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
      if (!isActive) return;
      handleFirestoreError(error, OperationType.GET, "artworks");
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [firebaseConfigValid, searchQuery]);

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

  // Shuffle the artworks list to re-curate the exhibition randomly
  const handleShuffleGallery = () => {
    setArtworks(prev => {
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
  };

  // Reset wall back to Met & CMA highlights
  const handleResetGallery = async () => {
    if (!firebaseConfigValid || !db) {
      alert("The reset action requires Firebase configuration. The built-in gallery remains available in offline mode.");
      return;
    }

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
    if (!firebaseConfigValid) {
      alert("Gallery expansion requires Firebase configuration. The built-in collection is currently being shown.");
      return;
    }

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

    // 3. Country / Origin filter with smart synonyms for Persian and Mughal
    const matchesCountry = selectedCountry === "All" ||
      art.origin_country.toLowerCase().includes(selectedCountry.toLowerCase()) ||
      (selectedCountry.toLowerCase() === "iran" && art.origin_country.toLowerCase().includes("persian")) ||
      (selectedCountry.toLowerCase() === "pakistan" && art.origin_country.toLowerCase().includes("mughal"));

    // 4. Star Rating filter
    const matchesRating = selectedRating === 0 || art.rating >= selectedRating;

    return matchesSearch && matchesMedium && matchesCountry && matchesRating;
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
            <SplashEntrance
              heroArtwork={heroPiece}
              artworks={artworks}
              onEnter={() => {
                setHasEntered(true);
                if (heroPiece) {
                  setSelectedArtwork(heroPiece);
                } else if (artworks.length > 0) {
                  setSelectedArtwork(artworks[0]);
                }
              }}
            />
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
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
              selectedRating={selectedRating}
              setSelectedRating={setSelectedRating}
              viewMode={viewMode}
              setViewMode={setViewMode}
              onResetGallery={handleResetGallery}
              isResetting={isResetting}
              onIngestCMA={handleIngestCMAArtworks}
              isIngesting={isIngesting}
              onShuffleGallery={handleShuffleGallery}
            />

            {/* Quick Navigation: Return to Splash Entrance */}
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-6 select-none">
              <button
                onClick={() => setHasEntered(false)}
                className="group flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-100/40 hover:text-[#fffdf9] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform text-[#d4af37]" />
                <span>Return to Entrance Portal</span>
              </button>
            </div>

            {/* Gallery Exhibition Walls container */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-12">
              
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
                        setSelectedCountry("All");
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
                    <div className="flex gap-6 sm:gap-8 overflow-x-auto py-6 px-1 gallery-scroll snap-x">
                      {filteredArtworks.map((art) => (
                        <div key={art.id} className="w-[285px] sm:w-[350px] md:w-[400px] shrink-0 snap-start">
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
                    <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 sm:gap-8 space-y-6 sm:space-y-8">
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
