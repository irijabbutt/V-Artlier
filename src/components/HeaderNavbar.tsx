import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Grid, LayoutList, Star, Sparkles, RefreshCw, Shuffle } from "lucide-react";
<<<<<<< HEAD
import brandLogo from "../../assets/v'artlier logo.svg";
=======
>>>>>>> f76842695605803209b384a03fbde256f51798c6

interface HeaderNavbarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedMedium: "All" | "Painting" | "Clay & Ceramic";
  setSelectedMedium: (val: "All" | "Painting" | "Clay & Ceramic") => void;
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  selectedRating: number;
  setSelectedRating: (rating: number) => void;
  viewMode: "horizontal" | "masonry";
  setViewMode: (mode: "horizontal" | "masonry") => void;
  onResetGallery: () => void;
  isResetting: boolean;
  onIngestCMA?: () => void;
  isIngesting?: boolean;
  onShuffleGallery: () => void;
}

export default function HeaderNavbar({
  searchQuery,
  setSearchQuery,
  selectedMedium,
  setSelectedMedium,
  selectedCountry,
  setSelectedCountry,
  selectedRating,
  setSelectedRating,
  viewMode,
  setViewMode,
  onResetGallery,
  isResetting,
  onIngestCMA,
  isIngesting = false,
  onShuffleGallery
}: HeaderNavbarProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleSearchCommit = () => {
    setSearchQuery(localQuery);
  };
  return (
    <header className="sticky top-0 z-40 w-full bg-[#161212]/90 backdrop-blur-md border-b border-[#2e2626]/40 px-4 sm:px-6 py-4 select-none">
      <div className="max-w-7xl mx-auto flex flex-col gap-5">
        
        {/* Row 1: Brand Wordmark (Left) & Layout Actions (Right) */}
        <div className="flex flex-row items-center justify-between w-full gap-4 pb-1">
          {/* Logo and Wordmark */}
          <div className="flex items-center gap-3">
<<<<<<< HEAD
            <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0">
              <img src={brandLogo} alt="V'Artlier logo" className="w-full h-full object-contain" />
=======
            {/* Inline SVG Monogram Mini-Portal */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0">
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
                <path d="M11 25 L35 70 L52.5 30 L70 70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M17 25 L38.5 65 L52.5 36 L66.5 65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M44 51 L61 51" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M46 54 L59 54" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
>>>>>>> f76842695605803209b384a03fbde256f51798c6
            </div>
            <div>
              <span className="font-serif text-lg sm:text-2xl tracking-[0.12em] uppercase text-[#fffdf9] font-medium block leading-none">
                V'ARTLIER
              </span>
              <span className="block font-mono text-[7px] sm:text-[8px] tracking-[0.25em] uppercase text-[#d4af37]/75 mt-1 sm:mt-1.5">
                GLOBAL VIRTUAL GALLERY
              </span>
            </div>
          </div>

          {/* Exhibition Layout Selector & Ingestion Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 h-9 sm:h-10 shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center h-full bg-[#120e0e] border border-[#2e2626] p-0.5 sm:p-1 rounded-sm" title="Toggle Layout Mode">
              <button
                onClick={() => {
                  setViewMode("horizontal");
                  onShuffleGallery();
                }}
                className={`h-full px-2 sm:px-2.5 rounded-xs transition-all flex items-center justify-center cursor-pointer ${
                  viewMode === "horizontal"
                    ? "bg-[#d4af37]/10 text-[#d4af37]"
                    : "text-amber-100/40 hover:text-[#fffdf9]"
                }`}
                title="The Great Hall (Horizontal Showcase)"
              >
                <LayoutList className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              </button>
              <button
                onClick={() => {
                  setViewMode("masonry");
                  onShuffleGallery();
                }}
                className={`h-full px-2 sm:px-2.5 rounded-xs transition-all flex items-center justify-center cursor-pointer ${
                  viewMode === "masonry"
                    ? "bg-[#d4af37]/10 text-[#d4af37]"
                    : "text-amber-100/40 hover:text-[#fffdf9]"
                }`}
                title="Exhibition Wings (Asymmetric Masonry)"
              >
                <Grid className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              </button>

              {/* Explicit Shuffle Exhibition Button */}
              <button
                onClick={onShuffleGallery}
                className="h-full px-2 sm:px-2.5 rounded-xs text-amber-100/40 hover:text-[#fffdf9] hover:bg-amber-100/5 transition-all flex items-center justify-center cursor-pointer"
                title="Shuffle Exhibition Pieces (Show Random Artworks)"
              >
                <Shuffle className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              </button>
            </div>

            {/* Ingest New Artworks button */}
            {onIngestCMA && (
              <button
                onClick={onIngestCMA}
                disabled={isIngesting}
                className="h-full px-2.5 sm:px-4 border border-[#d4af37]/30 hover:border-[#d4af37]/50 bg-[#d4af37]/5 hover:bg-[#d4af37]/10 active:scale-95 text-[#d4af37] rounded-sm transition-all flex items-center justify-center gap-1 sm:gap-1.5 shrink-0 cursor-pointer"
                title="Expand the gallery collection with unique global masterworks"
              >
                <Sparkles className={`w-3 sm:w-3.5 h-3 sm:h-3.5 ${isIngesting ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline font-mono text-[9px] uppercase tracking-wider">Expand Gallery</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Search Input & Advanced Filtering Row */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full">
          
          {/* Search box & button */}
          <div className="flex items-center gap-2 w-full lg:max-w-md xl:max-w-lg h-10 shrink-0">
            <div className="relative flex-1 h-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-3.5 w-3.5 text-amber-100/40" />
              </span>
              <input
                type="text"
                placeholder="Search title, artist, country..."
                value={localQuery}
                onChange={(e) => {
                  setLocalQuery(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchCommit();
                  }
                }}
                className="w-full h-full bg-[#1e1919] text-[#fffdf9] placeholder-amber-100/30 font-sans text-xs pl-9 pr-8 border border-[#2e2626] rounded-sm focus:outline-none focus:border-[#d4af37]/60 transition-colors flex items-center"
              />
              {localQuery && (
                <button 
                  onClick={() => {
                    setLocalQuery("");
                    setSearchQuery("");
                  }}
                  className="absolute inset-y-0 right-2.5 flex items-center text-xs text-amber-100/40 hover:text-[#fffdf9] cursor-pointer"
                >
                  &times;
                </button>
              )}
            </div>
            <button
              onClick={handleSearchCommit}
              className="h-full px-4 bg-[#d4af37]/10 hover:bg-[#d4af37]/15 border border-[#d4af37]/30 hover:border-[#d4af37]/50 rounded-sm text-[10px] font-mono uppercase tracking-wider text-[#d4af37] transition-all cursor-pointer whitespace-nowrap active:scale-95 flex items-center justify-center shrink-0"
            >
              Search
            </button>
          </div>

          {/* Unified Filter Columns for Tablet & Mobile (3 equal-width columns on sm, rows on xs) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:flex-row lg:items-center gap-3 w-full lg:w-auto lg:flex-1 lg:justify-end">
            
            {/* Medium Filter Tabs */}
            <div className="flex items-center h-10 bg-[#120e0e] p-1 border border-[#2e2626] rounded-sm w-full lg:w-auto shrink-0">
              {(["All", "Painting", "Clay & Ceramic"] as const).map((medium) => (
                <button
                  key={medium}
                  onClick={() => setSelectedMedium(medium)}
                  className={`h-full flex-1 lg:flex-initial px-3 font-mono text-[9px] uppercase tracking-wider rounded-xs transition-all flex items-center justify-center cursor-pointer ${
                    selectedMedium === medium
                      ? "bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30"
                      : "text-amber-100/50 hover:text-[#fffdf9] border border-transparent"
                  }`}
                >
                  {medium}
                </button>
              ))}
            </div>

            {/* Origin Country Selector */}
            <div className="flex items-center justify-between sm:justify-start gap-2 h-10 bg-[#1e1919] border border-[#2e2626] px-3 rounded-sm w-full lg:w-44 shrink-0">
              <span className="font-mono text-[9px] uppercase tracking-wider text-amber-100/40 mr-1 shrink-0">
                Origin:
              </span>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="bg-transparent text-[#fffdf9] font-mono text-[9px] uppercase tracking-wider outline-none border-none cursor-pointer focus:ring-0 h-full flex-1 text-right sm:text-left"
                style={{ colorScheme: "dark" }}
              >
                {["All", "Pakistan", "Korea", "Japan", "China", "Italy", "Iran", "India", "Egypt", "Greece", "Turkey", "France", "Spain", "Mexico", "Peru", "Iraq", "Syria"].map((country) => (
                  <option key={country} value={country} className="bg-[#1e1919] text-[#fffdf9]">
                    {country === "All" ? "All Origins" : country}
                  </option>
                ))}
              </select>
            </div>

            {/* Luxury Rating Filter */}
            <div className="flex items-center justify-between sm:justify-start gap-3 h-10 bg-[#1e1919] border border-[#2e2626] px-3 rounded-sm w-full lg:w-auto shrink-0">
              <span className="font-mono text-[9px] uppercase tracking-wider text-amber-100/40 mr-1 shrink-0">
                Rating:
              </span>
              <div className="flex gap-1 items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setSelectedRating(selectedRating === star ? 0 : star)}
                    className="transition-transform active:scale-125 focus:outline-none flex items-center justify-center cursor-pointer"
                    title={`Filter ${star} stars & up`}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        star <= selectedRating
                          ? "fill-[#d4af37] text-[#d4af37]"
                          : "text-amber-100/20 hover:text-amber-100/50"
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </header>
  );
}
