import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Grid, LayoutList, Star, Sparkles, RefreshCw } from "lucide-react";

interface HeaderNavbarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedMedium: "All" | "Painting" | "Clay & Ceramic";
  setSelectedMedium: (val: "All" | "Painting" | "Clay & Ceramic") => void;
  selectedRating: number;
  setSelectedRating: (rating: number) => void;
  viewMode: "horizontal" | "masonry";
  setViewMode: (mode: "horizontal" | "masonry") => void;
  onResetGallery: () => void;
  isResetting: boolean;
  onIngestCMA?: () => void;
  isIngesting?: boolean;
}

export default function HeaderNavbar({
  searchQuery,
  setSearchQuery,
  selectedMedium,
  setSelectedMedium,
  selectedRating,
  setSelectedRating,
  viewMode,
  setViewMode,
  onResetGallery,
  isResetting,
  onIngestCMA,
  isIngesting = false
}: HeaderNavbarProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleSearchCommit = () => {
    setSearchQuery(localQuery);
  };
  return (
    <header className="sticky top-0 z-40 w-full bg-[#161212]/75 backdrop-blur-md border-b border-[#2e2626]/40 px-6 py-4 select-none">
      <div className="max-w-7xl mx-auto flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        
        {/* Logo and Wordmark */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Inline SVG Monogram Mini-Portal */}
            <div className="w-12 h-12">
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
            <div>
              <span className="font-serif text-2xl tracking-[0.12em] uppercase text-[#fffdf9] font-medium block leading-none">
                V'ARTLIER
              </span>
              <span className="block font-mono text-[8px] tracking-[0.25em] uppercase text-[#d4af37]/75 mt-1.5">
                GLOBAL VIRTUAL GALLERY
              </span>
            </div>
          </div>
        </div>

        {/* Discovery Search & Advanced Filters */}
        <div className="flex flex-col md:flex-row gap-3 flex-1 max-w-4xl lg:justify-end items-stretch md:items-center">
          
          {/* Global Fuzzy Search with Enter & Search Button */}
          <div className="flex items-center gap-2 flex-1 max-w-2xl">
            <div className="relative flex-1">
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
                className="w-full bg-[#1e1919] text-[#fffdf9] placeholder-amber-100/30 font-sans text-xs pl-9 pr-8 py-2 border border-[#2e2626] rounded-sm focus:outline-none focus:border-[#d4af37]/60 transition-colors"
              />
              {localQuery && (
                <button 
                  onClick={() => {
                    setLocalQuery("");
                    setSearchQuery("");
                  }}
                  className="absolute inset-y-0 right-2.5 flex items-center text-xs text-amber-100/40 hover:text-[#fffdf9]"
                >
                  &times;
                </button>
              )}
            </div>
            <button
              onClick={handleSearchCommit}
              className="px-3.5 py-2 bg-[#d4af37]/10 hover:bg-[#d4af37]/15 border border-[#d4af37]/30 hover:border-[#d4af37]/50 rounded-sm text-[10px] font-mono uppercase tracking-wider text-[#d4af37] transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              Search
            </button>
          </div>

          {/* Medium Filter Tabs */}
          <div className="flex bg-[#120e0e] p-1 border border-[#2e2626] rounded-sm max-w-sm">
            {(["All", "Painting", "Clay & Ceramic"] as const).map((medium) => (
              <button
                key={medium}
                onClick={() => setSelectedMedium(medium)}
                className={`px-3 py-1 font-mono text-[9px] uppercase tracking-wider rounded-xs transition-all ${
                  selectedMedium === medium
                    ? "bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30"
                    : "text-amber-100/50 hover:text-[#fffdf9] border border-transparent"
                }`}
              >
                {medium === "Clay & Ceramic" ? "Clay & Ceramic" : medium}
              </button>
            ))}
          </div>

          {/* Luxury Rating Filter */}
          <div className="flex items-center gap-2 bg-[#1e1919] border border-[#2e2626] px-3 py-1.5 rounded-sm">
            <span className="font-mono text-[9px] uppercase tracking-wider text-amber-100/40 mr-1">
              Rating:
            </span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setSelectedRating(selectedRating === star ? 0 : star)}
                  className="transition-transform active:scale-125 focus:outline-none"
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

            {/* Exhibition Layout Selector & Ingestion Controls */}
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex bg-[#120e0e] border border-[#2e2626] p-0.5 rounded-sm" title="Toggle Layout Mode">
                <button
                  onClick={() => setViewMode("horizontal")}
                  className={`p-1.5 rounded-xs transition-all ${
                    viewMode === "horizontal"
                      ? "bg-[#d4af37]/10 text-[#d4af37]"
                      : "text-amber-100/40 hover:text-[#fffdf9]"
                  }`}
                  title="The Great Hall (Horizontal Showcase)"
                >
                  <LayoutList className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("masonry")}
                  className={`p-1.5 rounded-xs transition-all ${
                    viewMode === "masonry"
                      ? "bg-[#d4af37]/10 text-[#d4af37]"
                      : "text-amber-100/40 hover:text-[#fffdf9]"
                  }`}
                  title="Exhibition Wings (Asymmetric Masonry)"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Reset Defaults button */}
              <button
                onClick={onResetGallery}
                disabled={isResetting}
                className="p-1.5 border border-[#2e2626] hover:bg-[#1e1919] active:scale-95 text-amber-100/40 hover:text-[#fffdf9] rounded-sm transition-all"
                title="Reset Exhibition Walls to Default"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
              </button>

              {/* Ingest New Artworks button */}
              {onIngestCMA && (
                <button
                  onClick={onIngestCMA}
                  disabled={isIngesting}
                  className="p-1.5 border border-[#d4af37]/30 hover:border-[#d4af37]/50 bg-[#d4af37]/5 hover:bg-[#d4af37]/10 active:scale-95 text-[#d4af37] rounded-sm transition-all flex items-center gap-1.5"
                  title="Expand the gallery collection with unique global masterworks"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isIngesting ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline font-mono text-[9px] uppercase tracking-wider">Expand Gallery</span>
                </button>
              )}
            </div>

        </div>

      </div>
    </header>
  );
}
