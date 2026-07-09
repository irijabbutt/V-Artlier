import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, X, Globe, Volume2, Sparkles, Languages } from "lucide-react";
import { Artwork, PlaybackLanguage } from "../types";
import { toSafeString } from "../utils";

interface AudioPlayerControllerProps {
  artwork: Artwork | null;
  language: PlaybackLanguage;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onLanguageChange: (lang: PlaybackLanguage) => void;
  onClose: () => void;
}

export default function AudioPlayerController({
  artwork,
  language,
  isPlaying,
  onTogglePlay,
  onLanguageChange,
  onClose
}: AudioPlayerControllerProps) {
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(60); // simulated duration in seconds based on description length
  const [currentTimeStr, setCurrentTimeStr] = useState("0:00");
  const [durationTimeStr, setDurationTimeStr] = useState("1:00");
  const [imgSrc, setImgSrc] = useState(artwork?.image_url || "");

  const playbackIdRef = useRef<number>(0);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const googleTTSAudioRef = useRef<HTMLAudioElement | null>(null);
  const geminiAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<number | null>(null);

  // Reliably resolve the browser's voice list. Most browsers (esp. Chrome) return
  // an EMPTY array on the very first call to getVoices() because the list loads
  // asynchronously; the real list only arrives via the 'voiceschanged' event. Any
  // code that calls getVoices() once and gives up (as this component previously
  // did) will silently fail to find an Urdu/ur-PK voice and speak nothing.
  const getVoicesAsync = (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        resolve([]);
        return;
      }
      const existing = window.speechSynthesis.getVoices();
      if (existing.length > 0) {
        resolve(existing);
        return;
      }
      let settled = false;
      const handler = () => {
        if (settled) return;
        settled = true;
        window.speechSynthesis.removeEventListener("voiceschanged", handler);
        resolve(window.speechSynthesis.getVoices());
      };
      window.speechSynthesis.addEventListener("voiceschanged", handler);
      // Safety timeout in case the event never fires on this browser
      setTimeout(() => {
        if (settled) return;
        settled = true;
        window.speechSynthesis.removeEventListener("voiceschanged", handler);
        resolve(window.speechSynthesis.getVoices());
      }, 1000);
    });
  };

  const stopAllAudio = () => {
    playbackIdRef.current++; // Increment to invalidate previous async fetches
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (bgAudioRef.current) {
      bgAudioRef.current.pause();
    }
    if (googleTTSAudioRef.current) {
      googleTTSAudioRef.current.pause();
    }
    if (geminiAudioSourceRef.current) {
      try {
        geminiAudioSourceRef.current.stop();
      } catch (e) {}
      geminiAudioSourceRef.current = null;
    }
  };

  useEffect(() => {
    if (artwork) {
      setImgSrc(artwork.image_url);
    }
  }, [artwork]);

  if (!artwork) return null;

  // Initialize simulated audio timeline
  useEffect(() => {
    // Calculate approximate narration duration: word count / 2.3 words per second + 5s buffer
    const desc = toSafeString(artwork.text_description);
    const descUrdu = toSafeString(artwork.text_description_urdu);
    const text = language === "en" ? desc : (descUrdu || "");
    const wordCount = text.split(/\s+/).length;
    const estDuration = Math.max(Math.ceil(wordCount / 2.3), 20);
    setDuration(estDuration);
    setProgress(0);

    const min = Math.floor(estDuration / 60);
    const sec = estDuration % 60;
    setDurationTimeStr(`${min}:${sec < 10 ? "0" : ""}${sec}`);
  }, [artwork, language]);

  // Handle Speech Synthesis & Background Ambient Sound coordination
  useEffect(() => {
    stopAllAudio();
    
    // Choose ambient loop (birds/crickets)
    const ambientUrl = language === "en" ? artwork.audio_description_url : artwork.audio_urdu_url;
    const audio = new Audio(ambientUrl);
    audio.loop = true;
    audio.volume = 0.25; // Soft background music
    bgAudioRef.current = audio;

    // Trigger playback state synchronization
    if (isPlaying) {
      triggerPlayback();
    }

    return () => stopAllAudio();
  }, [artwork, language]);

  // Handle Play/Pause toggles
  useEffect(() => {
    if (isPlaying) {
      triggerPlayback();
    } else {
      pausePlayback();
    }
  }, [isPlaying]);

  // Synchronize timeline progress ticks
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          const next = prev + (100 / duration);
          return Math.min(next, 100);
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, duration]);

  // Update current time string whenever progress ticks
  useEffect(() => {
    const elapsedSeconds = Math.round((progress / 100) * duration);
    const min = Math.floor(elapsedSeconds / 60);
    const sec = elapsedSeconds % 60;
    setCurrentTimeStr(`${min}:${sec < 10 ? "0" : ""}${sec}`);
  }, [progress, duration]);

  const triggerPlayback = () => {
    try {
      if (typeof window === "undefined") return;
      
      const currentId = ++playbackIdRef.current;
      
      // Stop previous
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (geminiAudioSourceRef.current) {
        try { geminiAudioSourceRef.current.stop(); } catch(e) {}
        geminiAudioSourceRef.current = null;
      }

      const desc = toSafeString(artwork.text_description);
      const descUrdu = toSafeString(artwork.text_description_urdu);
      const fullText = language === "en" ? desc : (descUrdu || "");
      let textToSpeak = fullText;
      
      // If we are resumed mid-track, speak from approximate offset
      if (progress > 5 && progress < 95) {
        const words = fullText.split(/\s+/);
        const startIndex = Math.floor((progress / 100) * words.length);
        if (startIndex < words.length && startIndex > 0) {
          textToSpeak = words.slice(startIndex).join(" ");
        }
      }

      if (!textToSpeak.trim()) {
        textToSpeak = fullText;
      }

      // Play ambient noise loop
      if (bgAudioRef.current) {
        bgAudioRef.current.play().catch((err) => console.log("Ambient Audio trigger delayed:", err));
      }

      // Playback Route
      if (language === "ur") {
        const cleanText = textToSpeak.replace(/["'“”«»]/g, " ");
        
        const controller = new AbortController();
        abortControllerRef.current = controller;
        fetch("/api/urdu-tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: cleanText }),
          signal: controller.signal
        })
          .then(res => {
            if (currentId !== playbackIdRef.current) {
              controller.abort();
              return null;
            }
            if (!res.ok) throw new Error("TTS server error");
            return res.json();
          })
          .then((data) => {
            if (!data || currentId !== playbackIdRef.current) return;
            
            // Final check: stop any existing speech before starting Gemini audio
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            
            const { audioBase64 } = data;
            if (!audioBase64) throw new Error("No audio base64 from server");
            
            // Convert base64 to binary and then Float32 PCM
            const binaryString = atob(audioBase64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }
            
            const int16Buffer = new Int16Array(bytes.buffer);
            const float32Buffer = new Float32Array(int16Buffer.length);
            for (let i = 0; i < int16Buffer.length; i++) { float32Buffer[i] = int16Buffer[i] / 32768.0; }

            const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
            const audioCtx = new AudioCtxClass({ sampleRate: 24000 });
            audioContextRef.current = audioCtx;

            const audioBuffer = audioCtx.createBuffer(1, float32Buffer.length, 24000);
            audioBuffer.getChannelData(0).set(float32Buffer);

            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtx.destination);
            
            source.onended = () => {
              if (currentId === playbackIdRef.current && progress >= 90) {
                onTogglePlay();
                setProgress(100);
              }
            };

            geminiAudioSourceRef.current = source;
            source.start(0);
          })
          .catch((err) => {
            if (err.name === 'AbortError') return;
            if (currentId !== playbackIdRef.current) return;
            console.warn("Using local fallback:", err);
            
            if (window.speechSynthesis) {
              // Clear queue one last time before fallback
              window.speechSynthesis.cancel();

              getVoicesAsync().then((voices) => {
                if (currentId !== playbackIdRef.current) return;

                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                utterance.lang = "ur-PK";
                utterance.rate = 0.85;
                const urduHindiVoices = voices.filter(v => 
                  v.lang.toLowerCase().startsWith("ur") || 
                  v.lang.toLowerCase().startsWith("hi")
                );
                const isUrduFemale = (v: SpeechSynthesisVoice) => {
                  const nameLower = v.name.toLowerCase();
                  return nameLower.includes("female") ||
                         nameLower.includes("google") ||
                         nameLower.includes("kalpana") ||
                         nameLower.includes("siri") ||
                         nameLower.includes("swara") ||
                         nameLower.includes("hemant");
                };
                const match = urduHindiVoices.find(isUrduFemale) || urduHindiVoices[0];
                if (match) { utterance.voice = match; utterance.lang = match.lang; }
                utterance.onend = () => {
                  if (currentId === playbackIdRef.current && progress >= 90) {
                    onTogglePlay();
                    setProgress(100);
                  }
                };
                speechUtteranceRef.current = utterance;
                window.speechSynthesis.speak(utterance);
              });
            }
          });
      } else {
        // English playback via local WebSpeech
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();

          getVoicesAsync().then((voices) => {
            if (currentId !== playbackIdRef.current) return;

            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.lang = "en-US";
            utterance.rate = 0.95;
            const englishVoices = voices.filter(v => v.lang.toLowerCase().includes("en"));
            const isFemale = (v: SpeechSynthesisVoice) => {
              const nameLower = v.name.toLowerCase();
              return nameLower.includes("female") ||
                     nameLower.includes("zira") ||
                     nameLower.includes("samantha") ||
                     nameLower.includes("karen") ||
                     nameLower.includes("hazel") ||
                     nameLower.includes("victoria") ||
                     nameLower.includes("susan") ||
                     nameLower.includes("google us english") ||
                     nameLower.includes("siri");
            };
            const match = englishVoices.find(isFemale) ||
                          englishVoices.find(v => v.lang.toLowerCase().includes("en-us")) ||
                          englishVoices[0];
            if (match) { utterance.voice = match; utterance.lang = match.lang; }
            utterance.onend = () => {
              if (currentId === playbackIdRef.current && progress >= 90) {
                onTogglePlay();
                setProgress(100);
              }
            };
            speechUtteranceRef.current = utterance;
            window.speechSynthesis.speak(utterance);
          });
        }
      }
    } catch (err) {
      console.error("Audio playback error:", err);
    }
  };

  const pausePlayback = () => {
    playbackIdRef.current++;
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (googleTTSAudioRef.current) googleTTSAudioRef.current.pause();
    if (bgAudioRef.current) bgAudioRef.current.pause();
    if (geminiAudioSourceRef.current) {
      try { geminiAudioSourceRef.current.stop(); } catch (e) {}
      geminiAudioSourceRef.current = null;
    }
  };

  // Drag/click progress bar to scrub narration location
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percentage = (x / width) * 100;
    setProgress(percentage);
    
    // Stop all audio when seeking to prevent dual voices
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (geminiAudioSourceRef.current) {
      try {
        geminiAudioSourceRef.current.stop();
      } catch (e) {}
      geminiAudioSourceRef.current = null;
    }

    // Note: Playback will resume via the triggerPlayback call if isPlaying is true
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 bg-[#1e1919]/95 backdrop-blur-lg border-t border-[#d4af37]/40 shadow-[0_-15px_30px_rgba(0,0,0,0.9)] select-none">
      
      {/* Real-time Bilingual Caption Ticker Tray */}
      <div className="max-w-4xl mx-auto mb-3 px-4 py-2 bg-black/50 border border-[#d4af37]/15 rounded-sm flex items-start gap-2.5 shadow-inner">
        <Sparkles className="w-3.5 h-3.5 text-[#d4af37] animate-pulse shrink-0 mt-0.5" />
        <div className={`w-full text-xs leading-relaxed ${language === 'ur' ? 'text-right text-amber-200 urdu-text text-xs' : 'text-amber-50/90'}`}>
          <span className="font-mono text-[9px] uppercase tracking-wider text-[#d4af37] mr-1.5 inline-block border border-[#d4af37]/20 px-1 py-0.2 rounded-xs">
            {language === 'ur' ? 'اردو ترجمہ' : 'EXHIBIT NARRATION'}
          </span>
          {language === 'ur' 
            ? toSafeString(artwork.text_description_urdu)
            : toSafeString(artwork.text_description)
          }
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4 justify-between">
        
        {/* Left Side: Active Artwork Information */}
        <div className="flex items-center gap-3.5 w-full md:w-1/3">
          <div className="w-12 h-12 rounded-xs border border-black overflow-hidden relative shadow-md">
            <img 
              src={imgSrc} 
              alt={artwork.title} 
              onError={() => {
                setImgSrc("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23120e0e'/><rect x='8' y='8' width='84' height='84' fill='none' stroke='%23d4af37' stroke-width='1' stroke-opacity='0.4'/><path d='M25 35 L50 15 L75 35 L50 85 Z' fill='none' stroke='%23d4af37' stroke-width='1.5' stroke-opacity='0.8'/></svg>");
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-[#d4af37]/10" />
          </div>
          <div className="overflow-hidden flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[8px] text-[#d4af37] tracking-widest uppercase">
                Bilingual Audioguide
              </span>
              <span className="h-1 w-1 bg-green-400 rounded-full animate-pulse" />
            </div>
            <h4 className="font-serif text-sm text-[#fffdf9] tracking-wide truncate mt-0.5">
              {artwork.title}
            </h4>
            <p className="font-sans text-[10px] text-amber-100/50 truncate">
              {artwork.artist_name} &bull; {artwork.year_created}
            </p>
          </div>
        </div>

        {/* Center: Audio Player Controls */}
        <div className="flex flex-col items-center gap-2 w-full md:w-1/2">
          
          <div className="flex items-center gap-4">
            
            {/* Language Switcher Button */}
            <button
              onClick={() => onLanguageChange(language === "en" ? "ur" : "en")}
              className="p-1.5 border border-[#2e2626] bg-[#120e0e] hover:border-[#d4af37]/50 text-amber-100/60 hover:text-[#fffdf9] rounded-sm transition-all flex items-center gap-1 cursor-pointer"
              title="Switch Audioguide Translation"
            >
              <Languages className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="text-[9px] font-mono uppercase tracking-wider px-0.5">
                {language === "en" ? "EN ⇄ اردو" : "اردو ⇄ EN"}
              </span>
            </button>

            {/* Main Play/Pause Button */}
            <button
              onClick={onTogglePlay}
              className="w-10 h-10 rounded-full bg-[#fffdf9] hover:bg-[#d4af37] text-black hover:text-black shadow-lg flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current stroke-none" />
              ) : (
                <Play className="w-4 h-4 fill-current stroke-none translate-x-[1.5px]" />
              )}
            </button>

            {/* Active Language indicator badge */}
            <span className={`px-2 py-0.5 rounded-sm text-[8px] font-mono tracking-widest uppercase border ${
              language === "en" 
                ? "bg-blue-500/10 border-blue-500/20 text-blue-300" 
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
            }`}>
              {language === "en" ? "English" : "Narrando Urdu"}
            </span>
          </div>

          {/* Timeline slider and times */}
          <div className="flex items-center gap-2.5 w-full">
            <span className="font-mono text-[9px] text-amber-100/40 w-8 text-right">
              {currentTimeStr}
            </span>
            
            {/* Customizable scrubbable progress bar */}
            <div 
              onClick={handleProgressBarClick}
              className="flex-1 h-1.5 bg-[#120e0e] border border-[#2e2626]/60 rounded-full cursor-pointer relative overflow-hidden group/bar"
            >
              <div 
                className="absolute top-0 bottom-0 left-0 bg-[#d4af37] group-hover/bar:bg-amber-300 transition-all rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            <span className="font-mono text-[9px] text-amber-100/40 w-8 text-left">
              {durationTimeStr}
            </span>
          </div>

        </div>

        {/* Right Side: Active Waveform animation and Close */}
        <div className="hidden md:flex items-center justify-end gap-6 w-full md:w-1/4">
          
          {/* Waveform indicator */}
          <div className="flex items-end gap-[1.5px] h-6 px-1 pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => {
              // Stagger heights and animation speeds to simulate dynamic speech wavelength
              const animationDelay = `${i * 0.1}s`;
              const baseHeight = 4 + (i % 3) * 6;
              const activeAnim = isPlaying ? `bounce_0.6s_infinite_${animationDelay}` : "none";
              return (
                <div 
                  key={i}
                  className="w-[2px] bg-[#d4af37]/60 rounded-full transition-all"
                  style={{
                    height: isPlaying ? "100%" : `${baseHeight}px`,
                    maxHeight: "22px",
                    animation: activeAnim
                  }}
                />
              );
            })}
          </div>

          {/* Close audio player */}
          <button
            onClick={onClose}
            className="p-1.5 bg-black/20 hover:bg-black/60 border border-[#2e2626] hover:border-[#d4af37]/30 text-amber-100/40 hover:text-[#fffdf9] rounded-sm transition-all cursor-pointer"
            title="Turn Off Audioguide"
          >
            <X className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>
    </div>
  );
}
