import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, Volume2, Share2, Globe, Layers, Calendar, Landmark, Info, History, Sparkles } from "lucide-react";
import { Artwork, PlaybackLanguage } from "../types";
import { toSafeString } from "../utils";

interface ArtworkShowcaseBigProps {
  artwork: Artwork | null;
  isAudioActive: boolean;
  activeLanguage: PlaybackLanguage;
  onPlayToggle: (artwork: Artwork, lang: PlaybackLanguage) => void;
  onShare: (artwork: Artwork) => void;
  onEnrichArtwork: (artwork: Artwork) => Promise<void>;
}

export default function ArtworkShowcaseBig({
  artwork,
  isAudioActive,
  activeLanguage,
  onPlayToggle,
  onShare,
  onEnrichArtwork
}: ArtworkShowcaseBigProps) {
  const [activeTab, setActiveTab] = useState<"en" | "ur">("en");
  const [imgSrc, setImgSrc] = useState(artwork?.image_url || "");

  useEffect(() => {
    if (artwork) {
      setImgSrc(artwork.image_url);
    }
  }, [artwork]);

  if (!artwork) {
    return (
      <div className="w-full h-96 border border-dashed border-[#2e2626] rounded-sm flex items-center justify-center bg-[#1e1919]/20 select-none">
        <p className="font-sans text-xs text-amber-100/40">Select an artwork below to open the grand showcase.</p>
      </div>
    );
  }

  const price = artwork.price || 45000;
  const originCity = artwork.origin_city || artwork.origin_country || "Lahore, Pakistan";

  return (
    <section className="w-full bg-[#120e0e]/80 border border-[#d4af37]/30 rounded-sm overflow-hidden shadow-2xl relative select-none">
      
      {/* Absolute Ambient glow in corner */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#d4af37]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-8 items-center lg:items-stretch">
        
        {/* Left: Giant Spotlit Artwork Frame */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-[#181313] p-4 md:p-6 border border-[#2e2626]/50 rounded-xs relative group">
          
          {/* Virtual spotlight beam overlay */}
          <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-[#fffdf9]/[0.025] to-transparent pointer-events-none" />
          
          {/* Framed border styling based on medium */}
          <div className={`relative transition-transform duration-1000 ${
            artwork.medium === "Painting" 
              ? "border-8 border-[#1e1717] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] bg-stone-950 p-4"
              : "p-2 border-2 border-dashed border-amber-100/10"
          }`}>
            <img 
              src={imgSrc} 
              alt={toSafeString(artwork.title)}
              referrerPolicy="no-referrer"
              onError={() => {
                setImgSrc("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23120e0e'/><rect x='8' y='8' width='84' height='84' fill='none' stroke='%23d4af37' stroke-width='1' stroke-opacity='0.4'/><rect x='14' y='14' width='72' height='72' fill='none' stroke='%23d4af37' stroke-width='0.5' stroke-opacity='0.2'/><path d='M25 35 L50 15 L75 35 L50 85 Z' fill='none' stroke='%23d4af37' stroke-width='1.5' stroke-opacity='0.8'/><circle cx='50' cy='35' r='8' fill='none' stroke='%23fffdf9' stroke-width='0.8'/><text x='50' y='92' fill='%23d4af37' font-family='serif' font-size='4' text-anchor='middle' letter-spacing='0.5'>V&apos;ARTLIER</text></svg>");
              }}
              className="max-h-[350px] md:max-h-[450px] w-auto object-contain border border-black shadow-lg"
            />
            {/* Spotlight reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#fffdf9]/[0.01] to-transparent pointer-events-none" />
          </div>

          <div className="mt-4 flex items-center gap-2 text-[9px] font-mono text-[#d4af37] tracking-[0.2em] uppercase">
            <Landmark className="w-3 h-3" />
            <span>Masterwork Collection Spotlight</span>
          </div>
        </div>

        {/* Right: Rich Exhibition Placard Info & Audioguide */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between py-2">
          <div>
            {/* Header info */}
            <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-[#d4af37]">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-amber-100/30" />
                {toSafeString(artwork.origin_country)}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-amber-100/30" />
                {toSafeString(artwork.medium)}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-100/30" />
                {toSafeString(artwork.year_created)}
              </span>
            </div>

            {/* Giant Title */}
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#fffdf9] tracking-wide mt-3 italic leading-tight">
              &ldquo;{toSafeString(artwork.title)}&rdquo;
            </h1>
            
            {/* Artist Wordmark */}
            <div className="mt-2.5">
              <h2 className="font-sans text-lg text-amber-50 font-semibold">{toSafeString(artwork.artist_name)}</h2>
              {artwork.artist_bio && (
                <p className="font-sans text-xs text-amber-100/50 mt-1 max-w-xl leading-relaxed">
                  {toSafeString(artwork.artist_bio)}
                </p>
              )}
            </div>

            <div className="h-[1px] bg-[#2e2626]/60 my-5" />

            {/* Dual Language Curatorial Note Tab controls */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex bg-[#120e0e] border border-[#2e2626] p-1 rounded-sm w-full md:w-auto">
                <button
                  onClick={() => setActiveTab("en")}
                  className={`flex-1 px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider rounded-xs transition-all cursor-pointer ${
                    activeTab === "en"
                      ? "bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30"
                      : "text-amber-100/50 hover:text-[#fffdf9]"
                  }`}
                >
                  English Guide
                </button>
                <button
                  onClick={() => setActiveTab("ur")}
                  className={`flex-1 px-4 py-1.5 font-serif text-sm tracking-wider rounded-xs transition-all cursor-pointer ${
                    activeTab === "ur"
                      ? "bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30"
                      : "text-amber-100/50 hover:text-[#fffdf9]"
                  }`}
                >
                  اردو گائیڈ
                </button>
              </div>
            </div>

            {/* Masterpiece Interpretation Guide */}
            <div className="mb-6 p-5 bg-[#181313] border-l-2 border-[#d4af37] rounded-r-sm">
              <div className="flex items-center gap-2 mb-3 text-[#d4af37]">
                <Sparkles className="w-4 h-4" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-semibold">What this masterpiece says...</span>
              </div>
              <div className="min-h-[100px]">
          <AnimatePresence mode="wait">
            {activeTab === "en" ? (
              <motion.div
                key="en-note"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="font-sans text-sm text-amber-50/85 leading-relaxed italic"
              >
                {toSafeString(artwork.text_description)}
              </motion.div>
            ) : (
              <motion.div
                key="ur-note"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="font-serif text-lg text-right text-amber-50/85 leading-loose urdu-text italic"
              >
                {toSafeString(artwork.text_description_urdu)}
              </motion.div>
            )}
          </AnimatePresence>
              </div>
            </div>

            {/* Provenance Record & Historical Valuation */}
            <div className="mt-4 mb-6 p-4 bg-black/40 border border-[#d4af37]/20 rounded-sm">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#2e2626]">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#d4af37] flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-[#d4af37]" />
                  Exhibition Provenance & Historical Record
                </span>
                <span className="font-mono text-[9px] text-amber-200/80 uppercase tracking-wider flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d4af37] animate-pulse" />
                  Prinstine Conservation
                </span>
              </div>

              {/* Price & Provenance Row */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="block font-mono text-[8px] uppercase tracking-wider text-amber-100/40">Historical Appraisal</span>
                  <span className="font-serif text-lg text-[#d4af37] font-medium block mt-0.5">
                    ${price.toLocaleString()} <span className="text-[10px] font-sans text-amber-100/40">USD</span>
                  </span>
                  <span className="block text-[8px] font-mono text-amber-100/30 mt-0.5">Estimated catalog value</span>
                </div>
                <div>
                  <span className="block font-mono text-[8px] uppercase tracking-wider text-amber-100/40">Provenance Origin</span>
                  <span className="font-mono text-xs text-amber-50 truncate block mt-0.5">
                    📍 {originCity}
                  </span>
                  <span className="block text-[8px] font-mono text-amber-100/30 mt-0.5">Permanent site location</span>
                </div>
              </div>

              {/* Museum Preservation context card */}
              <div className="p-3 bg-black/30 border border-[#2e2626]/40 rounded-xs">
                <div className="text-[11px] font-sans text-amber-100/70 leading-relaxed">
                  🏛️ <span className="font-semibold text-amber-50">Curator Note:</span> This masterpiece is categorized as a vital cultural heritage monument of <strong>{toSafeString(artwork.origin_country)}</strong>. Under strict preservation protocols, the estimated valuation of <strong>${price.toLocaleString()} USD</strong> serves purely for academic provenance, insurance records, and permanent archival appraisal, and is strictly not available for commercial acquisition.
                </div>
              </div>
            </div>

          </div>

          {/* Interactive Control Panel Footer */}
          <div className="pt-4 border-t border-[#2e2626]/40 flex flex-wrap items-center justify-between gap-4">
            
            {/* Curator Rating and Sizing */}
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= artwork.rating
                        ? "fill-[#d4af37] text-[#d4af37]"
                        : "text-amber-100/10"
                    }`}
                  />
                ))}
              </div>
              <span className="font-mono text-[9px] uppercase tracking-wider text-amber-100/40">
                Dimensions: {toSafeString(artwork.dimensions)}
              </span>
            </div>

            {/* Audioguide Trigger & Share Block */}
            <div className="flex items-center gap-3">
              
              {/* Audioguide Play for English */}
              <button
                onClick={() => onPlayToggle(artwork, "en")}
                className={`px-4 py-2 border font-mono text-[10px] uppercase tracking-wider rounded-sm transition-all cursor-pointer flex items-center gap-2 ${
                  isAudioActive && activeLanguage === "en"
                    ? "bg-[#d4af37]/20 border-[#d4af37] text-[#fffdf9]"
                    : "bg-[#120e0e] border border-[#2e2626]/30 text-amber-100/70 hover:bg-[#1f1818] hover:text-[#fffdf9]"
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>{isAudioActive && activeLanguage === "en" ? "Listening EN" : "English Audioguide"}</span>
              </button>

              {/* Audioguide Play for Urdu */}
              <button
                onClick={() => onPlayToggle(artwork, "ur")}
                className={`px-4 py-2 border font-serif text-sm tracking-wider rounded-sm transition-all cursor-pointer flex items-center gap-2 ${
                  isAudioActive && activeLanguage === "ur"
                    ? "bg-[#d4af37]/20 border-[#d4af37] text-[#fffdf9]"
                    : "bg-[#120e0e] border border-[#2e2626]/30 text-amber-100/70 hover:bg-[#1f1818] hover:text-[#fffdf9]"
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>{isAudioActive && activeLanguage === "ur" ? "اردو سماعت کریں" : "اردو آڈیو گائیڈ"}</span>
              </button>

              {/* Share button */}
              <button
                onClick={() => onShare(artwork)}
                className="p-2 bg-black/40 hover:bg-black/70 border border-[#2e2626] hover:border-[#d4af37]/40 text-[#fffdf9] rounded-sm transition-all cursor-pointer"
                title="Share Exhibition masterwork link or story sticker"
              >
                <Share2 className="w-4 h-4 text-[#d4af37]" />
              </button>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
