import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowDown } from "lucide-react";
import { Artwork } from "../types";
import { toSafeString } from "../utils";

interface SplashEntranceProps {
  heroArtwork: Artwork | null;
  artworks: Artwork[];
  onEnter: () => void;
}

export default function SplashEntrance({ heroArtwork, artworks, onEnter }: SplashEntranceProps) {
  const [splashPool, setSplashPool] = useState<Artwork[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Select 5 random unique artworks from the live artworks list as our splash pool
  useEffect(() => {
    if (artworks.length > 0) {
      // Shuffled and picked 5
      const shuffled = [...artworks].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 5);
      
      // Ensure heroArtwork is part of it or index 0 if available
      if (heroArtwork && !selected.some(art => art.id === heroArtwork.id)) {
        selected[0] = heroArtwork;
      }
      setSplashPool(selected);
    }
  }, [artworks, heroArtwork]);

  // Handle automatic cycling of the splash artworks
  useEffect(() => {
    if (splashPool.length > 1 && !isHovered) {
      autoPlayRef.current = setInterval(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % splashPool.length);
      }, 5000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [splashPool.length, isHovered]);

  const activeArtwork = splashPool.length > 0 ? splashPool[activeIndex] : (artworks.length > 0 ? artworks[0] : heroArtwork);

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center px-6 py-12 z-10 select-none">
      
      {/* Invisible spacer to balance the vertical layout */}
      <div className="h-4" />

      {/* Landing Brand Centerpiece */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center max-w-4xl"
      >
        {/* Geometric Monogram Portal SVG */}
        <div className="w-24 h-24 mb-6 relative md:w-28 md:h-28">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#fffdf9]">
            {/* Concentric Squares */}
            <rect x="35" y="25" width="45" height="45" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.8" />
            <rect x="41" y="31" width="33" height="33" stroke="currentColor" strokeWidth="1" strokeOpacity="0.6" />
            <rect x="47" y="37" width="21" height="21" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.4" />
            <rect x="53" y="43" width="9" height="9" stroke="currentColor" strokeWidth="0.6" strokeOpacity="0.3" />

            {/* Perspective Diagonal Guide Lines */}
            <line x1="35" y1="25" x2="57.5" y2="47.5" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.4" />
            <line x1="80" y1="25" x2="57.5" y2="47.5" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.4" />
            <line x1="35" y1="70" x2="57.5" y2="47.5" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.4" />
            <line x1="80" y1="70" x2="57.5" y2="47.5" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.4" />

            {/* Intertwined V & A Monogram */}
            {/* Outer V-A Stroke */}
            <path d="M11 25 L35 70 L52.5 30 L70 70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Inner V-A Stroke */}
            <path d="M17 25 L38.5 65 L52.5 36 L66.5 65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Outer Crossbar of A */}
            <path d="M44 51 L61 51" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            {/* Inner Crossbar of A */}
            <path d="M46 54 L59 54" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Wordmark */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-[0.16em] uppercase text-[#fffdf9] font-light">
          V'ARTLIER
        </h1>
        <p className="font-mono text-[8px] md:text-xs tracking-[0.35em] uppercase text-[#d4af37]/75 mt-3">
          GLOBAL VIRTUAL GALLERY
        </p>
      </motion.div>

      {/* Hero Exhibition Spotlit Frame & Random Pool Indicators */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg md:max-w-xl flex flex-col items-center mt-6 mb-8"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative group p-4 bg-[#1e1919] border border-[#2e2626] rounded-sm shadow-2xl transition-all duration-700 hover:shadow-amber-500/5 w-full">
          {/* Spotlight Effect (Top reflection) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-gradient-to-r from-transparent via-[#fffdf9]/40 to-transparent shadow-[0_0_15px_2px_#fffdf9]" />
          
          <div className="relative w-full h-64 md:h-80 overflow-hidden bg-black border border-black">
            <AnimatePresence mode="wait">
              {activeArtwork ? (
                <motion.img 
                  key={activeArtwork.id}
                  src={activeArtwork.image_url} 
                  alt={toSafeString(activeArtwork.title)} 
                  referrerPolicy="no-referrer"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
                  className="absolute inset-0 w-full h-full object-cover object-center grayscale-[15%] group-hover:grayscale-0 transition-all duration-1000 ease-out"
                />
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        {/* Active Artwork Title / Year Metatags */}
        <div className="text-center mt-4 h-20 flex flex-col justify-start items-center">
          <AnimatePresence mode="wait">
            {activeArtwork ? (
              <motion.div
                key={activeArtwork.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center"
              >
                <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#d4af37]">
                  Exhibition Masterwork
                </span>
                <h2 className="font-serif text-lg md:text-xl text-[#fffdf9] mt-1 italic line-clamp-1 max-w-sm md:max-w-md px-2">
                  &ldquo;{toSafeString(activeArtwork.title)}&rdquo;
                </h2>
                <p className="font-sans text-xs text-amber-50/50 mt-1 line-clamp-1 max-w-xs md:max-w-md">
                  {toSafeString(activeArtwork.artist_name)} &bull; {toSafeString(activeArtwork.year_created)} ({toSafeString(activeArtwork.origin_country)})
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Dynamic Carousel / Random Pieces Thumbnails */}
        {/* Gallery thumbnails removed as requested */}
      </motion.div>

      {/* Scroll Down / Enter Indicator */}
      <motion.button
        onClick={onEnter}
        whileHover={{ y: 3 }}
        whileTap={{ scale: 0.97 }}
        className="flex flex-col items-center cursor-pointer group pb-4 text-[#fffdf9]/70 hover:text-[#fffdf9] transition-colors"
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] mb-2 group-hover:text-[#d4af37] transition-colors">
          Walk into Gallery
        </span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ArrowDown className="w-4 h-4 text-[#d4af37]" />
        </motion.div>
      </motion.button>

    </div>
  );
}
