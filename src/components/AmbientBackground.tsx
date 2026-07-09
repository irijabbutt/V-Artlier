import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number; // 3D local coordinate
  y: number;
  z: number;
  size: number;
  color: string;
  isSparkle: boolean;
  twinklePhase: number;
  twinkleSpeed: number;
  baseBrightness: number;
}

export default function AmbientBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const particles = useRef<Particle[]>([]);

  // Track window/container sizing
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });

  // Initialize particles once
  const initParticles = (count: number) => {
    const list: Particle[] = [];
    const colors = [
      "rgba(255, 255, 255, ",     // Bright Star White
      "rgba(212, 175, 55, ",      // Antique Gold Sparkle
      "rgba(147, 51, 234, ",      // Nebula Purple
      "rgba(34, 211, 238, ",      // Cosmic Cyan
      "rgba(244, 63, 94, ",       // Rose Petal Pink
      "rgba(192, 132, 252, ",     // Lavender
    ];

    for (let i = 0; i < count; i++) {
      // Create random distribution in a 3D box
      // x: -600 to 600, y: -600 to 600, z: 1 to 1000
      list.push({
        x: (Math.random() - 0.5) * 1200,
        y: (Math.random() - 0.5) * 1200,
        z: Math.random() * 990 + 10,
        size: Math.random() * 1.5 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        isSparkle: Math.random() > 0.85, // 15% are sharp 4-point glittering stars
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.015 + Math.random() * 0.03,
        baseBrightness: 0.4 + Math.random() * 0.6,
      });
    }
    particles.current = list;
  };

  useEffect(() => {
    initParticles(250);

    // Track mouse coordinates for smooth interactive parallax panning
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse to -1 to 1 range
      mousePos.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mousePos.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Set up resize observer on parent container for perfect viewport sync
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const updateSize = (w: number, h: number) => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      setDimensions({ width: w, height: h });
    };

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        updateSize(width || window.innerWidth, height || window.innerHeight);
      }
    });

    observer.observe(containerRef.current);
    // Initial sync
    updateSize(containerRef.current.clientWidth, containerRef.current.clientHeight);

    return () => observer.disconnect();
  }, []);

  // Main high-performance 3D projection animation loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fov = 350; // Field of view / projection factor

    const render = () => {
      // Clear with very slight transparency to leave a beautiful orbital motion trail
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;

      // Interpolate mouse movement for premium liquid-smooth transitions
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.05;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.05;

      const pXOffset = mousePos.current.x * -45; // Max horizontal shift
      const pYOffset = mousePos.current.y * -45; // Max vertical shift

      // Draw all 3D projected particles
      const len = particles.current.length;
      for (let i = 0; i < len; i++) {
        const p = particles.current[i];

        // 1. Update particle depth (moving towards screen)
        p.z -= 0.35; // Gentle space flight drift speed

        // Gentle orbital rotation around center
        const cosAngle = Math.cos(0.0005);
        const sinAngle = Math.sin(0.0005);
        const rx = p.x * cosAngle - p.y * sinAngle;
        const ry = p.x * sinAngle + p.y * cosAngle;
        p.x = rx;
        p.y = ry;

        // Reset particle if it flies past the eye
        if (p.z <= 10) {
          p.z = 1000;
          p.x = (Math.random() - 0.5) * 1200;
          p.y = (Math.random() - 0.5) * 1200;
        }

        // 2. Perform 3D to 2D perspective projection
        // Scale coordinate with depth Z
        const scale = fov / p.z;
        const screenX = centerX + (p.x + pXOffset) * scale;
        const screenY = centerY + (p.y + pYOffset) * scale;

        // Skip rendering if particle is off-screen to optimize CPU cycles
        if (
          screenX < -50 ||
          screenX > dimensions.width + 50 ||
          screenY < -50 ||
          screenY > dimensions.height + 50
        ) {
          continue;
        }

        // 3. Compute shimmering sparkle twinkle phase
        p.twinklePhase += p.twinkleSpeed;
        const sparkleFactor = (Math.sin(p.twinklePhase) + 1) / 2; // 0.0 to 1.0
        const currentAlpha = p.baseBrightness * (0.3 + sparkleFactor * 0.7);

        // Adjust alpha based on depth Z (fade out far away, fade out when extremely close)
        let depthFade = 1.0;
        if (p.z > 800) {
          depthFade = (1000 - p.z) / 200;
        } else if (p.z < 100) {
          depthFade = (p.z - 10) / 90;
        }
        const finalAlpha = Math.max(0, currentAlpha * depthFade);

        // Size scaled by distance
        const finalSize = Math.max(0.2, p.size * scale * 0.8);

        ctx.fillStyle = `${p.color}${finalAlpha.toFixed(3)})`;

        // 4. Render particle
        if (p.isSparkle && finalSize > 1.2) {
          // Render gorgeous 4-pointed shimmering diamond sparkle
          ctx.beginPath();
          ctx.moveTo(screenX, screenY - finalSize * 2.8);
          ctx.quadraticCurveTo(screenX, screenY, screenX + finalSize * 2.8, screenY);
          ctx.quadraticCurveTo(screenX, screenY, screenX, screenY + finalSize * 2.8);
          ctx.quadraticCurveTo(screenX, screenY, screenX - finalSize * 2.8, screenY);
          ctx.quadraticCurveTo(screenX, screenY, screenX, screenY - finalSize * 2.8);
          ctx.closePath();
          ctx.fill();

          // Highlight core of the sparkle
          ctx.fillStyle = `rgba(255, 255, 255, ${(finalAlpha * 0.9).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(screenX, screenY, finalSize * 0.6, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Render high-precision tiny glitter star
          ctx.beginPath();
          ctx.arc(screenX, screenY, finalSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [dimensions]);

  return (
    <div 
      ref={containerRef}
      id="ambient-container" 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    >
      {/* Base Midnight Truffle color background */}
      <div className="absolute inset-0 bg-[#161212]" />

      {/* Dynamic Ambient Mesh Glow 1 */}
      <div 
        className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-[#d4af37]/5 to-transparent blur-[120px] animate-ambient-glow-1 pointer-events-none"
      />

      {/* Dynamic Ambient Mesh Glow 2 */}
      <div 
        className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-[#3a221d]/15 to-transparent blur-[140px] pointer-events-none"
      />

      {/* Smooth Interactive spotlight overlay */}
      <div 
        className="absolute inset-0 transition-transform duration-1000 ease-out pointer-events-none opacity-40"
        style={{
          transform: `translate(${mousePos.current.x * -10}px, ${mousePos.current.y * -10}px)`,
          background: `
            radial-gradient(circle at 45% 45%, rgba(212, 175, 55, 0.08) 0%, transparent 60%),
            radial-gradient(circle at 55% 55%, rgba(255, 253, 249, 0.05) 0%, transparent 70%)
          `
        }}
      />

      {/* High-Performance 3D Glitter Canvas Starfield */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block mix-blend-screen opacity-90"
      />

      {/* Subtle vignettes for museum gallery lighting focus */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#161212]/60 via-transparent to-[#161212]/50" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#161212]/50 via-transparent to-[#161212]/50" />
    </div>
  );
}

