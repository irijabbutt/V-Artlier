import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Star, Volume2, Share2, Award, Calendar, Globe, Layers, MessageSquare, Play, Pause } from "lucide-react";
import { Artwork, PlaybackLanguage } from "../types";
import { toSafeString } from "../utils";

interface ArtworkCardProps {
  artwork: Artwork;
  isAudioActive: boolean;
  activeLanguage: PlaybackLanguage;
  onPlayToggle: (artwork: Artwork, lang: PlaybackLanguage) => void;
  onShare: (artwork: Artwork) => void;
  isNewArrival: boolean; // triggers "Just Installed" shimmer tag
  onSelect?: (artwork: Artwork) => void;
  isSelected?: boolean;
}

export default function ArtworkCard({
  artwork,
  isAudioActive,
  activeLanguage,
  onPlayToggle,
  onShare,
  isNewArrival,
  onSelect,
  isSelected
}: ArtworkCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [imgSrc, setImgSrc] = useState(artwork.image_url);

  // Sync state if artwork.image_url changes
  useEffect(() => {
    setImgSrc(artwork.image_url);
  }, [artwork.image_url]);

  // 3D Tilt Effect for Clay & Ceramic pieces
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (artwork.medium !== "Clay & Ceramic" || !cardRef.current) return;

    const el = cardRef.current;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within element
    const y = e.clientY - rect.top;  // y position within element

    // Calculate rotation angles based on mouse offset from center (max 10 degrees)
    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -8;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 8;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`,
      transition: "transform 0.1s ease-out"
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)",
      transition: "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)"
    });
    setShowLangDropdown(false);
  };

  return (
    <motion.div
      ref={cardRef}
      layout
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
      initial={isNewArrival ? { opacity: 0, y: 50, scale: 0.95 } : { opacity: 1 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("button") || target.closest(".dropdown-menu") || target.tagName === "BUTTON") {
          return;
        }
        if (onSelect) {
          onSelect(artwork);
        }
      }}
      className={`relative group bg-[#1e1919] border cursor-pointer ${
        isSelected 
          ? "border-[#d4af37] ring-1 ring-[#d4af37]/30 shadow-[0_0_20px_rgba(212,175,55,0.15)]"
          : isAudioActive 
            ? "border-[#d4af37]/70" 
            : "border-[#2e2626]/60"
      } rounded-sm p-4 w-full flex flex-col justify-between shadow-xl transition-all duration-700 hover:shadow-2xl hover:border-amber-100/30`}
    >
      
      {/* Spotlight highlight over active/hovered piece */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#fffdf9]/[0.015] to-transparent pointer-events-none rounded-sm" />

      {/* Interactive Micro Waveform next to art piece when audio guide is playing */}
      {isAudioActive && (
        <div className="absolute top-4 right-4 flex items-end gap-0.5 h-4 px-2 py-0.5 bg-black/40 backdrop-blur-sm border border-[#d4af37]/30 rounded-xs z-10">
          <span className="font-mono text-[7px] uppercase tracking-wider text-[#d4af37] mr-1">
            Listening ({activeLanguage.toUpperCase()})
          </span>
          <div className="w-[1.5px] bg-[#d4af37] rounded-full h-1 animate-[bounce_0.8s_infinite_0.1s]" />
          <div className="w-[1.5px] bg-[#d4af37] rounded-full h-2 animate-[bounce_0.8s_infinite_0.3s]" />
          <div className="w-[1.5px] bg-[#d4af37] rounded-full h-1.5 animate-[bounce_0.8s_infinite_0.5s]" />
          <div className="w-[1.5px] bg-[#d4af37] rounded-full h-3 animate-[bounce_0.8s_infinite_0.2s]" />
        </div>
      )}

      {/* Just Installed / New Arrival Shimmer tag */}
      {isNewArrival && (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-amber-500 text-black px-2 py-0.5 text-[8px] font-mono font-bold tracking-widest uppercase rounded-xs shadow-[0_0_10px_rgba(245,158,11,0.5)]">
          <Award className="w-2.5 h-2.5" />
          <span>Just Installed</span>
        </div>
      )}

      {/* Frame Container for Art piece */}
      <div className="relative overflow-hidden bg-[#120e0e] border border-black rounded-xs">
        
        {/* Frame Shadow Styling for paintings (Deep museum drop shadow) */}
        <div className={`transition-all duration-1000 ${
          artwork.medium === "Painting" 
            ? "shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] p-3 border-4 border-[#120d0d] bg-stone-900/10" 
            : "p-0"
        }`}>
          <img
            src={imgSrc}
            alt={toSafeString(artwork.title)}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => {
              // Gracefully fallback to a gorgeous, themed museum-style geometric SVG
              setImgSrc("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23120e0e'/><rect x='8' y='8' width='84' height='84' fill='none' stroke='%23d4af37' stroke-width='1' stroke-opacity='0.4'/><rect x='14' y='14' width='72' height='72' fill='none' stroke='%23d4af37' stroke-width='0.5' stroke-opacity='0.2'/><path d='M25 35 L50 15 L75 35 L50 85 Z' fill='none' stroke='%23d4af37' stroke-width='1.5' stroke-opacity='0.8'/><circle cx='50' cy='35' r='8' fill='none' stroke='%23fffdf9' stroke-width='0.8'/><text x='50' y='92' fill='%23d4af37' font-family='serif' font-size='4' text-anchor='middle' letter-spacing='0.5'>V&apos;ARTLIER</text></svg>");
            }}
            className={`w-full aspect-[4/3] md:aspect-[3/2] object-cover object-center transition-all duration-1000 ease-out group-hover:scale-105 ${
              artwork.medium === "Painting" 
                ? "shadow-2xl border border-black/40" 
                : "grayscale-[10%] group-hover:grayscale-0"
            }`}
          />
        </div>

        {/* Action Overlays visible on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-3">
          
          {/* Activate Audioguide Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex items-center gap-1 px-3 py-2 bg-[#fffdf9] text-black hover:bg-[#d4af37] hover:text-black transition-colors rounded-sm text-[10px] font-mono uppercase tracking-wider cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Audioguide</span>
            </button>
            
            {showLangDropdown && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-24 bg-[#1e1919] border border-[#d4af37]/40 rounded-sm shadow-2xl overflow-hidden z-20">
                <button
                  onClick={() => {
                    onPlayToggle(artwork, "en");
                    setShowLangDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-amber-500/10 text-xs font-mono text-amber-50 hover:text-[#d4af37] transition-colors"
                >
                  English
                </button>
                <div className="h-[0.5px] bg-[#2e2626]" />
                <button
                  onClick={() => {
                    onPlayToggle(artwork, "ur");
                    setShowLangDropdown(false);
                  }}
                  className="w-full text-right px-3 py-1.5 hover:bg-amber-500/10 text-xs font-serif text-amber-50 hover:text-[#d4af37] transition-colors"
                >
                  اردو (Urdu)
                </button>
              </div>
            )}
          </div>

          {/* Share Trigger */}
          <button
            onClick={() => onShare(artwork)}
            className="flex items-center gap-1 px-3 py-2 bg-black/40 text-[#fffdf9] hover:bg-black/80 border border-[#2e2626] transition-colors rounded-sm text-[10px] font-mono uppercase tracking-wider cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Museum Placard Details (Beneath Frame) */}
      <div className="mt-4 flex flex-col justify-between flex-1">
        <div>
          {/* Metadata rail */}
          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider text-[#d4af37]">
            <span className="flex items-center gap-0.5">
              <Globe className="w-2.5 h-2.5 text-amber-100/30" />
              {toSafeString(artwork.origin_country)}
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-0.5">
              <Layers className="w-2.5 h-2.5 text-amber-100/30" />
              {toSafeString(artwork.medium)}
            </span>
          </div>

          {/* Title and artist */}
          <h3 className="font-serif text-xl text-[#fffdf9] tracking-wide mt-1.5 line-clamp-1 group-hover:text-[#d4af37] transition-colors">
            {toSafeString(artwork.title)}
          </h3>
          <p className="font-sans text-xs text-amber-100/60 font-medium">
            {toSafeString(artwork.artist_name)}
          </p>

          {/* Dimensions / Year */}
          <p className="font-sans text-[10px] text-amber-100/40 mt-1 flex items-center gap-1.5">
            <Calendar className="w-3 h-3 opacity-55" />
            <span>{toSafeString(artwork.year_created)}</span>
            <span>&bull;</span>
            <span>{toSafeString(artwork.dimensions)}</span>
          </p>

          {/* Dual language escrito preview (shows bilingual commitment) */}
          <p className="font-sans text-[10.5px] leading-relaxed text-amber-50/50 mt-2.5 line-clamp-2 italic">
            &ldquo;{toSafeString(artwork.text_description)}&rdquo;
          </p>
          <p className="font-serif text-xs leading-relaxed text-amber-50/55 mt-2 text-right urdu-text opacity-80">
            {toSafeString(artwork.text_description_urdu)}
          </p>
        </div>

        {/* Footer info: rating stars and localized quick-play triggers */}
        <div className="mt-4 pt-3 border-t border-[#2e2626]/40 flex items-center justify-between">
          
          {/* Visual minimal stars */}
          <div className="flex gap-0.5" title={`${artwork.rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3 h-3 ${
                  star <= artwork.rating
                    ? "fill-[#d4af37] text-[#d4af37]"
                    : "text-amber-100/10"
                }`}
              />
            ))}
          </div>

          {/* Quick-listen toggles */}
          <div className="flex items-center gap-1 bg-black/20 p-0.5 border border-[#2e2626]/30 rounded-sm">
            <button
              onClick={() => onPlayToggle(artwork, "en")}
              className={`px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider rounded-xs transition-all flex items-center gap-0.5 cursor-pointer ${
                isAudioActive && activeLanguage === "en"
                  ? "bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30"
                  : "bg-[#120e0e] border border-[#2e2626]/30 text-amber-100/40 hover:bg-[#1e1919] hover:text-[#fffdf9]"
              }`}
              title="Activate English Audioguide"
            >
              EN
            </button>
            <button
              onClick={() => onPlayToggle(artwork, "ur")}
              className={`px-2 py-0.5 font-serif text-[10px] tracking-wider rounded-xs transition-all flex items-center gap-0.5 cursor-pointer ${
                isAudioActive && activeLanguage === "ur"
                  ? "bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30"
                  : "bg-[#120e0e] border border-[#2e2626]/30 text-amber-100/40 hover:bg-[#1e1919] hover:text-[#fffdf9]"
              }`}
              title="سماعت کریں اردو آڈیو گائیڈ"
            >
              اردو
            </button>
          </div>

        </div>

      </div>

    </motion.div>
  );
}
