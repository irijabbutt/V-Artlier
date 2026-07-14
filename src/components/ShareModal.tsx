import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Copy, Check, Share2, Download, Send, Smartphone } from "lucide-react";
import { Artwork } from "../types";
import { toSafeString } from "../utils";

interface ShareModalProps {
  artwork: Artwork | null;
  onClose: () => void;
}

export default function ShareModal({ artwork, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [generatingSticker, setGeneratingSticker] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  if (!artwork) return null;

  const SHARE_BASE_URL = "https://irijabbutt.github.io/V-Artlier";
  const shareUrl = `${SHARE_BASE_URL}/?artwork=${artwork.id}`;
  const shareText = `Explore this breathtaking masterwork "${artwork.title}" by ${artwork.artist_name} (${artwork.year_created}) at V'Artlier Global Virtual Gallery.`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  // WhatsApp Message Share
  const handleWhatsAppMessage = () => {
    const desc = toSafeString(artwork.text_description);
    const text = encodeURIComponent(`*${toSafeString(artwork.title)}* by ${toSafeString(artwork.artist_name)}\n\n"${desc.substring(0, 150)}..."\n\nExperience the audioguide at V'Artlier:\n${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  // WhatsApp Status Share
  const handleWhatsAppStatus = () => {
    const text = encodeURIComponent(`✨ Curating at V'Artlier: "${toSafeString(artwork.title)}" by ${toSafeString(artwork.artist_name)}. Listen to the bilingual audioguide here: ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const getCanvasSafeImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("/") || url.startsWith("data:") || url.startsWith(window.location.origin)) {
      return url;
    }
    return `https://images.weserv.nl/?url=${encodeURIComponent(url.replace(/^https?:\/\//i, ""))}`;
  };

  const loadStoryImage = (url: string): Promise<HTMLImageElement | null> => {
    const candidates = [getCanvasSafeImageUrl(url)].filter(Boolean);

    return new Promise((resolve) => {
      const tryLoad = (index: number) => {
        if (index >= candidates.length) {
          resolve(null);
          return;
        }

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => tryLoad(index + 1);
        img.src = candidates[index];
      };

      tryLoad(0);
    });
  };

  const drawWrappedText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    maxLines: number
  ) => {
    const words = text.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let line = "";
    let consumedAllWords = true;

    for (let index = 0; index < words.length; index++) {
      const word = words[index];
      const testLine = line ? `${line} ${word}` : word;
      if (ctx.measureText(testLine).width > maxWidth && line) {
        lines.push(line);
        line = word;
        if (lines.length === maxLines) {
          consumedAllWords = false;
          break;
        }
      } else {
        line = testLine;
      }
    }

    if (line && lines.length < maxLines) {
      lines.push(line);
    }

    if (!consumedAllWords && lines.length > 0) {
      let finalLine = lines[lines.length - 1];
      while (finalLine.length > 0 && ctx.measureText(`${finalLine}...`).width > maxWidth) {
        finalLine = finalLine.slice(0, -1).trim();
      }
      lines[lines.length - 1] = `${finalLine}...`;
    }

    lines.forEach((lineText, index) => {
      ctx.fillText(lineText, x, y + index * lineHeight);
    });

    return lines.length;
  };

  const downloadCanvas = (canvas: HTMLCanvasElement, filename: string) => {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.download = filename;
      downloadLink.href = url;
      downloadLink.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  // Generate and Download custom Story Sticker Card using Canvas
  const handleDownloadStorySticker = async () => {
    if (!canvasRef.current) return;
    setGeneratingSticker(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setGeneratingSticker(false);
      return;
    }

    // Setup High-DPI canvas layout (standard 9:16 Instagram/FB Story size: 1080 x 1920)
    canvas.width = 1080;
    canvas.height = 1920;

    try {
      const img = await loadStoryImage(artwork.image_url);

      // 1. Solid Truffle Background
      ctx.fillStyle = "#161212";
      ctx.fillRect(0, 0, 1080, 1920);

      // 2. Linear perspective mesh guides in background (soft line styling)
      ctx.strokeStyle = "rgba(255, 253, 249, 0.05)";
      ctx.lineWidth = 2;
      ctx.strokeRect(100, 100, 880, 1720);
      ctx.strokeRect(200, 200, 680, 1520);
      
      ctx.beginPath();
      ctx.moveTo(100, 100); ctx.lineTo(200, 200);
      ctx.moveTo(980, 100); ctx.lineTo(880, 200);
      ctx.moveTo(100, 1820); ctx.lineTo(200, 1720);
      ctx.moveTo(980, 1820); ctx.lineTo(880, 1720);
      ctx.stroke();

      // 3. Draw Gold border frame for ticket card
      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth = 4;
      ctx.strokeRect(120, 240, 840, 1440);

      // 4. Header: V'Artlier Brand Name
      ctx.fillStyle = "#fffdf9";
      ctx.textAlign = "center";
      ctx.font = "italic normal 600 68px 'Cormorant Garamond', Georgia, serif";
      ctx.fillText("V'ARTLIER", 540, 360);

      ctx.fillStyle = "#d4af37";
      ctx.font = "bold 20px 'JetBrains Mono', monospace";
      ctx.fillText("EXHIBITION PASS", 540, 410);

      // Draw subtle horizontal dividing lines
      ctx.strokeStyle = "rgba(255, 253, 249, 0.15)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(250, 460);
      ctx.lineTo(830, 460);
      ctx.stroke();

      // 5. Draw the central spotlit artwork frame
      // Draw shadow background for art
      ctx.fillStyle = "#120e0e";
      ctx.fillRect(200, 520, 680, 680);

      if (img) {
        // Calculate aspect ratio fit
        const scale = Math.min(640 / img.width, 640 / img.height);
        const x = 540 - (img.width * scale) / 2;
        const y = 860 - (img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      } else {
        ctx.strokeStyle = "rgba(212, 175, 55, 0.45)";
        ctx.lineWidth = 3;
        ctx.strokeRect(250, 600, 580, 500);
        ctx.fillStyle = "rgba(255, 253, 249, 0.82)";
        ctx.font = "italic normal 600 54px Georgia, serif";
        drawWrappedText(ctx, toSafeString(artwork.title), 540, 790, 500, 62, 4);
        ctx.fillStyle = "rgba(212, 175, 55, 0.85)";
        ctx.font = "bold 22px monospace";
        ctx.fillText("ARTWORK IMAGE UNAVAILABLE", 540, 1030);
      }
      
      // Outer border of artwork frame
      ctx.strokeStyle = "rgba(255, 253, 249, 0.3)";
      ctx.strokeRect(200, 520, 680, 680);

      // 6. Placard details
      ctx.fillStyle = "#fffdf9";
      ctx.font = "italic normal 600 44px 'Cormorant Garamond', Georgia, serif";
      const titleLines = drawWrappedText(ctx, `"${toSafeString(artwork.title)}"`, 540, 1260, 760, 54, 2);
      const artistY = 1260 + titleLines * 54 + 34;

      ctx.fillStyle = "rgba(255, 253, 249, 0.75)";
      ctx.font = "normal 32px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(`${toSafeString(artwork.artist_name)} (b. ${toSafeString(artwork.year_created)})`, 540, artistY);

      ctx.fillStyle = "#d4af37";
      ctx.font = "normal 24px 'JetBrains Mono', monospace";
      ctx.fillText(`${toSafeString(artwork.medium)} | ${toSafeString(artwork.origin_country)}`, 540, artistY + 60);

      // 7. Mini Ticket Tear-off & QR code simulation
      ctx.strokeStyle = "rgba(255, 253, 249, 0.2)";
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(150, 1470);
      ctx.lineTo(930, 1470);
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      ctx.fillStyle = "rgba(255, 253, 249, 0.4)";
      ctx.font = "normal 20px 'JetBrains Mono', monospace";
      ctx.fillText("VIRTUAL GALLERY EXHIBITION PASS", 540, 1535);

      // Render simulated barcode / code lines at bottom
      ctx.fillStyle = "rgba(255, 253, 249, 0.35)";
      const barcodeWidths = [12, 4, 18, 6, 24, 4, 10, 16, 4, 8, 22, 6, 12, 18, 4, 28, 8, 14, 4, 10];
      let barX = 280;
      for (const w of barcodeWidths) {
        ctx.fillRect(barX, 1580, w * 1.5, 45);
        barX += (w + 4) * 1.5;
      }

      // Add a clean border seal
      ctx.fillStyle = "#d4af37";
      ctx.font = "bold 26px 'Cormorant Garamond', serif";
      ctx.fillText("THE GREAT HALL", 540, 1675);

      // 8. Output as file download
      downloadCanvas(canvas, `vartlier_story_sticker_${artwork.id}.png`);
      setGeneratingSticker(false);
    } catch (err) {
      console.error("Failed to generate story sticker", err);
      setGeneratingSticker(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        {/* Click outside to close */}
        <div className="absolute inset-0 cursor-default" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 15 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
          className="relative bg-[#1e1919] border border-[#d4af37]/30 rounded-sm shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto md:max-h-[95vh] lg:max-h-none md:overflow-hidden z-10 flex flex-col md:flex-row scrollbar-thin scrollbar-thumb-amber-500/20 scrollbar-track-transparent"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-amber-100/40 hover:text-[#fffdf9] bg-black/30 hover:bg-black/60 rounded-full transition-colors z-20 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Left Side: Ticket Sticker Mockup Pre-visualization */}
          <div className="p-6 bg-[#120e0e] md:w-1/2 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-[#2e2626]/60 select-none">
            <span className="font-mono text-[9px] uppercase tracking-wider text-amber-100/40 mb-3 block">
              Story Sticker Preview
            </span>
            
            {/* Visual representation card */}
            <div className="w-[180px] h-[320px] bg-[#161212] border border-[#d4af37]/40 rounded-sm relative shadow-2xl p-3 flex flex-col justify-between overflow-hidden">
              {/* Corridor perspective lines simulation in mini scale */}
              <div className="absolute inset-0 pointer-events-none opacity-20 border border-white/5 m-2 flex items-center justify-center">
                <div className="w-12 h-12 border border-white/5 rounded-full" />
              </div>

              <div className="text-center">
                <h4 className="font-serif text-[11px] uppercase tracking-[0.15em] text-[#fffdf9]">
                  V&rsquo;Artlier
                </h4>
                <p className="font-mono text-[5px] uppercase tracking-widest text-[#d4af37]">
                  Exhibition Pass
                </p>
                <div className="h-[0.5px] bg-white/10 my-1 w-2/3 mx-auto" />
              </div>

              {/* Artwork image mock */}
              <div className="h-28 w-full relative border border-white/10 bg-black/40 overflow-hidden flex items-center justify-center">
                <img 
                  src={artwork.image_url} 
                  alt={artwork.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161212] via-transparent to-transparent opacity-40" />
              </div>

              {/* Title & Artist mock */}
              <div className="text-center z-10">
                <h5 className="font-serif text-[10px] text-[#fffdf9] truncate italic px-1">
                  &ldquo;{toSafeString(artwork.title)}&rdquo;
                </h5>
                <p className="font-sans text-[7px] text-amber-100/50 truncate">
                  {toSafeString(artwork.artist_name)}
                </p>
                <div className="h-[1px] border-t border-white/10 border-dashed my-1.5" />
                <span className="font-mono text-[5px] text-[#d4af37] tracking-[0.15em]">
                  THE GREAT HALL
                </span>
              </div>
            </div>

            <p className="font-sans text-[10px] text-amber-100/40 text-center mt-3 max-w-[200px]">
              Ready to download as a beautiful 9:16 vertical poster sticker.
            </p>
          </div>

          {/* Right Side: Quick Share Panels */}
          <div className="p-6 md:w-1/2 flex flex-col justify-between">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#d4af37]">
                Share Curation
              </span>
              <h3 className="font-serif text-xl text-[#fffdf9] mt-1">
                Recommend &ldquo;{toSafeString(artwork.title)}&rdquo;
              </h3>
              <p className="font-sans text-xs text-amber-100/60 mt-2 line-clamp-3">
                {toSafeString(artwork.text_description)}
              </p>

              <div className="h-[1px] bg-[#2e2626]/40 my-4" />

              {/* Share Channels */}
              <div className="space-y-2.5">
                
                {/* WhatsApp Status */}
                <button
                  onClick={handleWhatsAppStatus}
                  className="w-full flex items-center justify-between px-3 py-2 bg-[#25d366]/5 hover:bg-[#25d366]/10 border border-[#25d366]/30 text-[#25d366] text-xs font-mono uppercase tracking-wider rounded-sm transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Send className="w-3.5 h-3.5" />
                    WhatsApp Status
                  </span>
                  <span className="text-[9px] opacity-60">Status Feed</span>
                </button>

                {/* WhatsApp Chat Message */}
                <button
                  onClick={handleWhatsAppMessage}
                  className="w-full flex items-center justify-between px-3 py-2 bg-[#128c7e]/5 hover:bg-[#128c7e]/10 border border-[#128c7e]/30 text-[#128c7e] text-xs font-mono uppercase tracking-wider rounded-sm transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Send className="w-3.5 h-3.5" />
                    WhatsApp Message
                  </span>
                  <span className="text-[9px] opacity-60">Send Direct</span>
                </button>

                {/* Instagram Story Download */}
                <button
                  onClick={handleDownloadStorySticker}
                  disabled={generatingSticker}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gradient-to-r from-purple-500/5 to-pink-500/5 hover:from-purple-500/10 hover:to-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-mono uppercase tracking-wider rounded-sm transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5" />
                    {generatingSticker ? "Styling..." : "Download Insta Story"}
                  </span>
                  <Smartphone className="w-3.5 h-3.5 opacity-60" />
                </button>

                {/* Facebook Story Download */}
                <button
                  onClick={handleDownloadStorySticker}
                  disabled={generatingSticker}
                  className="w-full flex items-center justify-between px-3 py-2 bg-[#1877f2]/5 hover:bg-[#1877f2]/10 border border-[#1877f2]/30 text-[#1877f2] text-xs font-mono uppercase tracking-wider rounded-sm transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5" />
                    {generatingSticker ? "Styling..." : "Download FB Story"}
                  </span>
                  <Smartphone className="w-3.5 h-3.5 opacity-60" />
                </button>

              </div>
            </div>

            {/* Invitation Link Copier */}
            <div className="mt-6">
              <span className="font-mono text-[9px] uppercase tracking-widest text-amber-100/40 block mb-2">
                Exhibition Invitation Link
              </span>
              <div className="flex bg-[#120e0e] border border-[#2e2626] rounded-sm p-1 items-center">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="bg-transparent border-none outline-none font-mono text-[9px] text-amber-100/60 px-2 flex-1 truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="p-1.5 bg-[#1e1919] border border-[#2e2626] hover:border-[#d4af37]/60 text-amber-100/60 hover:text-[#fffdf9] rounded-sm transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span className="text-[8px] font-mono uppercase tracking-wider px-0.5">
                    {copied ? "Copied" : "Copy"}
                  </span>
                </button>
              </div>
            </div>

          </div>
        </motion.div>

        {/* Hidden Canvas used strictly for rendering Story tickets */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </AnimatePresence>
  );
}
