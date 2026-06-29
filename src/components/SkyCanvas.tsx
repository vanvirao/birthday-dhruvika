import { useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../lib/ThemeContext';
import { usePrefersReducedMotion } from '../lib/usePrefersReducedMotion';
import { useWallpaperSettings } from '../lib/WallpaperSettingsContext';
import { useCelestial } from '../lib/CelestialContext';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function lerpColor(a: [number, number, number], b: [number, number, number], t: number) {
  return `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`;
}
function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

// ---------------------------------------------------------------------------
// Sky color keyframes — 24-hour cycle (moon theme)
// A true-midnight keyframe at 1:30am keeps "Night" (10pm) and "Late Night"
// (1:30am) visually distinct instead of both landing on the same flat color.
// ---------------------------------------------------------------------------
const MOON_SKY = [
  { h: 0,   top: '#000C25', bot: '#0D1B3E' },
  { h: 1.5, top: '#02061A', bot: '#070F28' },
  { h: 4,   top: '#000C25', bot: '#0D1B3E' },
  { h: 5,   top: '#1A0F3C', bot: '#3D1C4F' },
  { h: 6,   top: '#3D1C4F', bot: '#7D3560' },
  { h: 7,   top: '#7D3560', bot: '#C1654A' },
  { h: 8,   top: '#C1654A', bot: '#E88C5A' },
  { h: 10,  top: '#3A6B9A', bot: '#6A8FC4' },
  { h: 14,  top: '#2A5A8A', bot: '#5A80B0' },
  { h: 18,  top: '#2A3E72', bot: '#7A5A40' },
  { h: 19,  top: '#1A2A5A', bot: '#4A3028' },
  { h: 20,  top: '#0D1840', bot: '#1E1035' },
  { h: 22,  top: '#000C25', bot: '#0D1B3E' },
  { h: 24,  top: '#000C25', bot: '#0D1B3E' },
];
const RAIN_SKY = [
  { h: 0,   top: '#081B36', bot: '#0D2040' },
  { h: 1.5, top: '#040D22', bot: '#081730' },
  { h: 4,   top: '#081B36', bot: '#0D2040' },
  { h: 6,   top: '#0D2040', bot: '#1C3255' },
  { h: 8,   top: '#1C3255', bot: '#3A5570' },
  { h: 10,  top: '#2A4A65', bot: '#5C7CA6' },
  { h: 14,  top: '#2A4060', bot: '#5870A0' },
  { h: 18,  top: '#1E3258', bot: '#3A4C78' },
  { h: 20,  top: '#0E2040', bot: '#1A2A55' },
  { h: 22,  top: '#081B36', bot: '#0D2040' },
  { h: 24,  top: '#081B36', bot: '#0D2040' },
];

function skyColorAtHour(keyframes: typeof MOON_SKY, hour: number, fraction: number, top: boolean) {
  const h = hour + fraction;
  let prev = keyframes[0];
  let next = keyframes[keyframes.length - 1];
  for (let i = 0; i < keyframes.length - 1; i++) {
    if (h >= keyframes[i].h && h <= keyframes[i + 1].h) {
      prev = keyframes[i];
      next = keyframes[i + 1];
      break;
    }
  }
  const t = smoothstep((h - prev.h) / Math.max(next.h - prev.h, 0.01));
  const a = hexToRgb(top ? prev.top : prev.bot);
  const b = hexToRgb(top ? next.top : next.bot);
  return lerpColor(a, b, t);
}

// ---------------------------------------------------------------------------
// Star seed (stable across redraws)
// ---------------------------------------------------------------------------
interface Star { x: number; y: number; r: number; phase: number; speed: number }
function generateStars(count: number): Star[] {
  const out: Star[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      x: Math.random(),
      y: Math.random() * 0.65,
      r: 0.4 + Math.random() * 1.4,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.8,
    });
  }
  return out;
}
const STARS = generateStars(160);

// Cloud shape (lazy sinusoidal bumps, stable across redraws)
interface Cloud {
  x: number; y: number; w: number; h: number;
  speed: number; alpha: number; layer: number; offset: number;
}
function generateClouds(): Cloud[] {
  return [
    { x: 0.0,  y: 0.12, w: 0.38, h: 0.06, speed: 0.000018, alpha: 0.09, layer: 0, offset: 0 },
    { x: 0.55, y: 0.18, w: 0.28, h: 0.04, speed: 0.000025, alpha: 0.07, layer: 1, offset: 0.3 },
    { x: 0.25, y: 0.08, w: 0.42, h: 0.05, speed: 0.000012, alpha: 0.06, layer: 2, offset: 0.6 },
    { x: 0.80, y: 0.22, w: 0.25, h: 0.035, speed: 0.000022, alpha: 0.08, layer: 1, offset: 0.1 },
  ];
}
const CLOUD_SEEDS = generateClouds();

// Particles (floating motes)
interface Particle {
  x: number; y: number; r: number; vx: number; vy: number; alpha: number; phase: number;
}
function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 0.8 + Math.random() * 1.6,
    vx: (Math.random() - 0.5) * 0.00005,
    vy: -(0.00006 + Math.random() * 0.00008),
    alpha: 0.2 + Math.random() * 0.4,
    phase: Math.random() * Math.PI * 2,
  }));
}
const PARTICLES = generateParticles(40);

// Rain drops
interface RainDrop { x: number; y: number; length: number; speed: number; alpha: number }
function generateRain(count: number): RainDrop[] {
  return Array.from({ length: count }, () => ({
    x: Math.random(),
    y: Math.random(),
    length: 12 + Math.random() * 20,
    speed: 0.006 + Math.random() * 0.008,
    alpha: 0.06 + Math.random() * 0.1,
  }));
}
const RAIN_DROPS = generateRain(120);

// Shooting star state
interface ShootingStar {
  active: boolean;
  x: number; y: number;
  angle: number; speed: number;
  length: number; alpha: number;
  progress: number;
  duration: number;
}
function makeShootingStar(w: number): ShootingStar {
  return {
    active: true,
    x: 0.1 + Math.random() * 0.7,
    y: 0.02 + Math.random() * 0.3,
    angle: Math.PI / 6 + Math.random() * (Math.PI / 8),
    speed: 0.003 + Math.random() * 0.003,
    length: 0.12 + Math.random() * 0.1,
    alpha: 0,
    progress: 0,
    duration: 0.7 + Math.random() * 0.5,
  };
  void w;
}

// ---------------------------------------------------------------------------
// Constellations — simplified relative-position renderings of real asterisms
// (Big Dipper / Ursa Major, Orion, Cassiopeia, Cygnus, Leo). These preserve
// each constellation's actual relative star pattern but are schematic, not a
// precise sky projection, scaled and placed to read clearly at small sizes.
// ---------------------------------------------------------------------------
interface ConstellationPoint { x: number; y: number }
interface ConstellationDef { name: string; points: ConstellationPoint[]; lines: [number, number][] }

const CONSTELLATIONS: ConstellationDef[] = [
  {
    name: 'Ursa Major',
    points: [
      { x: 0.15, y: 0.25 }, { x: 0.10, y: 0.45 }, { x: 0.35, y: 0.55 },
      { x: 0.40, y: 0.35 }, { x: 0.60, y: 0.30 }, { x: 0.80, y: 0.20 }, { x: 1.00, y: 0.05 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6]],
  },
  {
    name: 'Orion',
    points: [
      { x: 0.15, y: 0.15 }, { x: 0.75, y: 0.10 }, { x: 0.30, y: 0.45 },
      { x: 0.50, y: 0.48 }, { x: 0.68, y: 0.50 }, { x: 0.20, y: 0.85 }, { x: 0.78, y: 0.88 },
    ],
    lines: [[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6]],
  },
  {
    name: 'Cassiopeia',
    points: [
      { x: 0.05, y: 0.40 }, { x: 0.28, y: 0.15 }, { x: 0.50, y: 0.45 },
      { x: 0.72, y: 0.18 }, { x: 0.95, y: 0.40 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  {
    name: 'Cygnus',
    points: [
      { x: 0.50, y: 0.05 }, { x: 0.50, y: 0.40 }, { x: 0.50, y: 0.95 },
      { x: 0.15, y: 0.50 }, { x: 0.85, y: 0.35 },
    ],
    lines: [[0, 1], [1, 2], [3, 1], [1, 4]],
  },
  {
    name: 'Leo',
    points: [
      { x: 0.35, y: 0.05 }, { x: 0.20, y: 0.20 }, { x: 0.10, y: 0.55 },
      { x: 0.55, y: 0.35 }, { x: 0.50, y: 0.55 }, { x: 0.90, y: 0.65 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [3, 5]],
  },
];

interface ActiveConstellation {
  data: ConstellationDef;
  x: number; y: number; w: number; h: number;
  startTime: number;
}

export default function SkyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const eiffelImgRef = useRef<HTMLImageElement | null>(null);
  const { theme } = useTheme();
  const reduced = usePrefersReducedMotion();
  const { auroraActive, auroraProgress } = useCelestial();
  const themeRef = useRef(theme);
  themeRef.current = theme;

  // Time of day comes from the live clock unless Settings is previewing/locking an override
  const { mode, overrideHour } = useWallpaperSettings();
  const wallpaperRef = useRef({ mode, overrideHour });
  wallpaperRef.current = { mode, overrideHour };

  // Parallax mouse position
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 });

  // Shooting star state
  const shootingStarRef = useRef<ShootingStar>({ active: false } as ShootingStar);
  const nextShootRef = useRef<number>(Date.now() + 15000 + Math.random() * 60000);

  // Constellation state
  const activeConstellationRef = useRef<ActiveConstellation | null>(null);
  const nextConstellationRef = useRef<number>(Date.now() + 20000 + Math.random() * 60000);

  // Mutable particle state (positions drift each frame)
  const particlesRef = useRef(PARTICLES.map((p) => ({ ...p })));
  const rainRef = useRef(RAIN_DROPS.map((d) => ({ ...d })));

  const handleMouseMove = useCallback((e: MouseEvent) => {
    targetMouseRef.current = {
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    };
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const eiffelImg = new Image();
    eiffelImg.src = '/images/eiffel.png';
    eiffelImgRef.current = eiffelImg;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let lastTime = 0;

    // Precompute a small grain texture once — cheap to tile every frame as a pattern
    const grainCanvas = document.createElement('canvas');
    grainCanvas.width = 128;
    grainCanvas.height = 128;
    const gctx = grainCanvas.getContext('2d');
    if (gctx) {
      const imageData = gctx.createImageData(128, 128);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const v = Math.random() * 255;
        imageData.data[i] = v;
        imageData.data[i + 1] = v;
        imageData.data[i + 2] = v;
        imageData.data[i + 3] = Math.random() * 16;
      }
      gctx.putImageData(imageData, 0, 0);
    }
    const grainPattern = ctx.createPattern(grainCanvas, 'repeat');

    // Vignette gradient only depends on canvas size, recompute on resize rather than every frame
    let vignetteGradient: CanvasGradient | null = null;

    function resize() {
      if (!canvas || !ctx) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      vignetteGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) * 0.35,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.75
      );
      vignetteGradient.addColorStop(0, 'rgba(0,0,0,0)');
      vignetteGradient.addColorStop(1, 'rgba(0,0,0,0.32)');
    }
    resize();
    window.addEventListener('resize', resize);

    function drawCloud(
      ctx: CanvasRenderingContext2D,
      cx: number, cy: number, w: number, h: number,
      alpha: number, color: string
    ) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      const steps = 40;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = cx - w / 2 + w * t;
        const bump = Math.sin(t * Math.PI) * h * 0.5 *
          (1 + 0.3 * Math.sin(t * Math.PI * 3) + 0.2 * Math.sin(t * Math.PI * 7));
        if (i === 0) ctx.moveTo(x, cy);
        else ctx.lineTo(x, cy - bump);
      }
      ctx.lineTo(cx + w / 2, cy);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function frame(now: number) {
      animId = requestAnimationFrame(frame);
      const dt = now - lastTime;
      lastTime = now;

      if (!canvas || !ctx) return;
      const W = canvas.width;
      const H = canvas.height;

      const isRain = themeRef.current === 'rain';
      const keyframes = isRain ? RAIN_SKY : MOON_SKY;

      // Time of day — live clock, or a previewed/locked override set from Settings
      const wf = wallpaperRef.current;
      let hour: number;
      let frac: number;
      if (wf.mode === 'live') {
        const now2 = new Date();
        hour = now2.getHours();
        frac = now2.getMinutes() / 60 + now2.getSeconds() / 3600;
      } else {
        hour = Math.floor(wf.overrideHour);
        frac = wf.overrideHour - hour;
      }

      // Smooth parallax
      mouseRef.current.x = lerp(mouseRef.current.x, targetMouseRef.current.x, 0.04);
      mouseRef.current.y = lerp(mouseRef.current.y, targetMouseRef.current.y, 0.04);

      // Sky gradient
      const topColor = skyColorAtHour(keyframes, hour, frac, true);
      const botColor = skyColorAtHour(keyframes, hour, frac, false);
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, topColor);
      grad.addColorStop(1, botColor);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Horizon atmosphere — a soft bloom that adds richness at dawn/dusk transitions
      const dawnT = Math.max(0, 1 - Math.abs(hour + frac - 6.5) / 2.5);
      const duskT = Math.max(0, 1 - Math.abs(hour + frac - 18.5) / 2.5);
      const horizonT = Math.min(1, dawnT + duskT);
      if (horizonT > 0.02) {
        const glowY = H * 0.78;
        const hGrad = ctx.createRadialGradient(W * 0.5, glowY, 0, W * 0.5, glowY, W * 0.65);
        const horizonColor = isRain
          ? `rgba(150,175,205,${0.2 * horizonT})`
          : `rgba(232,150,108,${0.3 * horizonT})`;
        hGrad.addColorStop(0, horizonColor);
        hGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = hGrad;
        ctx.fillRect(0, 0, W, H);
      }

      // Star visibility based on hour
      const nightT = hour >= 20 || hour < 5 ? 1 : hour >= 8 && hour < 18 ? 0 : hour < 8 ? (8 - hour) / 3 : (24 - hour) / 2;
      const starBase =
  nightT *
  (isRain ? 0.6 : 1.0) *
  (auroraActive ? 1.4 : 1);

      if (!reduced && starBase > 0.01) {
        for (const s of STARS) {
          const pulse = 0.5 + 0.5 * Math.sin(s.phase + now * 0.001 * s.speed);
          const alpha = starBase * s.r / 1.8 * pulse;
          ctx.beginPath();
          ctx.arc(s.x * W, s.y * H * 0.65, s.r, 0, Math.PI * 2);
          const warmTint = s.r > 1.5;
          ctx.fillStyle = warmTint
            ? (isRain ? `rgba(205,218,236,${alpha})` : `rgba(255,228,180,${alpha})`)
            : (isRain ? `rgba(191,201,217,${alpha})` : `rgba(255,250,240,${alpha})`);
          ctx.fill();
        }
      }

      // Constellations — only worth attempting when stars are clearly visible
      if (!reduced && starBase > 0.5) {
        if (!activeConstellationRef.current && Date.now() > nextConstellationRef.current) {
          const data = CONSTELLATIONS[Math.floor(Math.random() * CONSTELLATIONS.length)];
          const w = W * (0.16 + Math.random() * 0.08);
          const h = w * 0.62;
          activeConstellationRef.current = {
            data,
            x: W * (0.06 + Math.random() * 0.55),
            y: H * (0.04 + Math.random() * 0.28),
            w, h,
            startTime: Date.now(),
          };
        }
        const ac = activeConstellationRef.current;
        if (ac) {
          const elapsed = (Date.now() - ac.startTime) / 1000;
          let alpha = 0;
          if (elapsed < 2.5) alpha = elapsed / 2.5;
          else if (elapsed < 13) alpha = 1;
          else if (elapsed < 16) alpha = 1 - (elapsed - 13) / 3;
          else {
            activeConstellationRef.current = null;
            nextConstellationRef.current = Date.now() + 60000 + Math.random() * 150000;
          }
          if (alpha > 0.01) {
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = isRain ? 'rgba(190,210,235,0.5)' : 'rgba(255,235,190,0.55)';
            ctx.lineWidth = 1;
            for (const [i, j] of ac.data.lines) {
              const p1 = ac.data.points[i];
              const p2 = ac.data.points[j];
              ctx.beginPath();
              ctx.moveTo(ac.x + p1.x * ac.w, ac.y + p1.y * ac.h);
              ctx.lineTo(ac.x + p2.x * ac.w, ac.y + p2.y * ac.h);
              ctx.stroke();
            }
            for (const p of ac.data.points) {
              ctx.beginPath();
              ctx.arc(ac.x + p.x * ac.w, ac.y + p.y * ac.h, 1.6, 0, Math.PI * 2);
              ctx.fillStyle = isRain ? `rgba(220,232,245,${alpha})` : `rgba(255,245,220,${alpha})`;
              ctx.fill();
            }
            if (elapsed > 1.2) {
              ctx.font = '11px system-ui, -apple-system, sans-serif';
              ctx.fillStyle = isRain ? `rgba(220,232,245,${alpha * 0.65})` : `rgba(255,245,220,${alpha * 0.65})`;
              ctx.fillText(ac.data.name, ac.x, ac.y + ac.h + 14);
            }
            ctx.restore();
          }
        }
      } else if (activeConstellationRef.current) {
        // Sky brightened (e.g. theme/time changed) before the constellation finished — drop it cleanly
        activeConstellationRef.current = null;
      }
      // ── Aurora Borealis ───────────────────────────────
      if (!reduced && auroraActive && auroraProgress > 0.01) {
        ctx.save();

        ctx.globalCompositeOperation = 'screen';

        const auroraAlpha = auroraProgress * 0.75;

        const colors = isRain
          ? [
              'rgba(120,220,255,',
              'rgba(100,180,255,',
              'rgba(120,120,255,',
              'rgba(170,120,255,',
            ]
          : [
              'rgba(120,255,180,',
              'rgba(80,255,220,',
              'rgba(120,180,255,',
              'rgba(180,120,255,',
            ];

        for (let r = 0; r < 5; r++) {
          const baseY = H * (0.12 + r * 0.045);

          ctx.beginPath();

          for (let x = 0; x <= W; x += 8) {
            const y =
              baseY +
              Math.sin(x * 0.008 + now * 0.0004 + r) * 25 +
              Math.sin(x * 0.003 + now * 0.0002 + r * 2) * 15;

            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }

          ctx.strokeStyle =
            colors[r % colors.length] +
            `${auroraAlpha})`;

          ctx.lineWidth = 18;

          ctx.shadowBlur = 40;

          ctx.shadowColor =
            colors[r % colors.length] + '1)';

          ctx.stroke();
        }

        ctx.restore();
      }
      // Moon position with parallax
      const moonCX = W * (0.72 + (mouseRef.current.x - 0.5) * -0.025);
      const moonCY = H * (0.22 + (mouseRef.current.y - 0.5) * -0.02);
      const moonR =
  Math.min(W, H) *
  (auroraActive ? 0.076 : 0.072);
      const moonColor = isRain ? '#C8D5E8' : '#F5E6C0';
      const glowColor = isRain ? 'rgba(170,195,230,' : 'rgba(245,220,160,';

      // Outer glow rings
      for (let i = 3; i >= 1; i--) {
        const glowGrad = ctx.createRadialGradient(moonCX, moonCY, moonR, moonCX, moonCY, moonR * (1 + i * 0.5));
        glowGrad.addColorStop(0, glowColor + (0.12 / i) + ')');
        glowGrad.addColorStop(1, glowColor + '0)');
        ctx.beginPath();
        ctx.arc(moonCX, moonCY, moonR * (1 + i * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();
      }
      // Moon disc
      const moonGrad = ctx.createRadialGradient(
        moonCX - moonR * 0.2, moonCY - moonR * 0.2, moonR * 0.1,
        moonCX, moonCY, moonR
      );
      moonGrad.addColorStop(0, moonColor);
      moonGrad.addColorStop(0.7, isRain ? '#A8BDD4' : '#D4B87A');
      moonGrad.addColorStop(1, isRain ? '#7898B8' : '#9E7A3A');
      ctx.beginPath();
      ctx.arc(moonCX, moonCY, moonR, 0, Math.PI * 2);
      ctx.fillStyle = moonGrad;
      ctx.fill();
      // Subtle surface detail
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = isRain ? '#4A6080' : '#7A5A20';
      ctx.beginPath();
      ctx.arc(moonCX + moonR * 0.25, moonCY - moonR * 0.2, moonR * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(moonCX - moonR * 0.3, moonCY + moonR * 0.3, moonR * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Rim light
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = isRain ? 'rgba(220,235,250,0.6)' : 'rgba(255,238,195,0.6)';
      ctx.lineWidth = Math.max(1, moonR * 0.05);
      ctx.beginPath();
      ctx.arc(moonCX, moonCY, moonR * 0.96, -Math.PI * 0.85, -Math.PI * 0.15);
      ctx.stroke();
      ctx.restore();

      // Clouds
      if (!reduced) {
        const cloudColor = isRain ? 'rgba(180,200,225,' : 'rgba(255,245,230,';
        for (const c of CLOUD_SEEDS) {
          const progress = ((Date.now() * c.speed + c.offset) % 1.5) - 0.2;
          const cx = (c.x + progress) * W;
          const cy = c.y * H;
          drawCloud(ctx, cx, cy, c.w * W, c.h * H, c.alpha, cloudColor + '1)');
          if (cx > W * 1.3) {
            drawCloud(ctx, cx - W * 1.5, cy, c.w * W, c.h * H, c.alpha, cloudColor + '1)');
          }
        }
      }

      // Shooting star
      if (!reduced) {
        if (!shootingStarRef.current.active && Date.now() > nextShootRef.current) {
          shootingStarRef.current = makeShootingStar(W);
          nextShootRef.current = Date.now() + 90000 + Math.random() * 60000;
        }
        const ss = shootingStarRef.current;
        if (ss.active) {
          ss.progress += dt * 0.001 / ss.duration;
          if (ss.progress >= 1) {
            ss.active = false;
          } else {
            const ease = ss.progress < 0.3
              ? ss.progress / 0.3
              : ss.progress > 0.7
                ? 1 - (ss.progress - 0.7) / 0.3
                : 1;
            ss.alpha = ease * 0.9;
            const x = ss.x * W + Math.cos(ss.angle) * ss.progress * ss.length * W;
            const y = ss.y * H + Math.sin(ss.angle) * ss.progress * ss.length * W;
            const tailX = x - Math.cos(ss.angle) * ss.length * 0.22 * W;
            const tailY = y - Math.sin(ss.angle) * ss.length * 0.22 * W;
            const sGrad = ctx.createLinearGradient(tailX, tailY, x, y);
            sGrad.addColorStop(0, `rgba(255,255,255,0)`);
            sGrad.addColorStop(1, `rgba(255,255,255,${ss.alpha})`);
            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(x, y);
            ctx.strokeStyle = sGrad;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      }

      // Particles (floating motes)
      if (!reduced) {
        const parts = particlesRef.current;
        for (const p of parts) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.y < -0.02) p.y = 1.02;
          if (p.x < -0.02) p.x = 1.02;
          if (p.x > 1.02) p.x = -0.02;
          const pulse = 0.5 + 0.5 * Math.sin(p.phase + now * 0.0006);
          ctx.beginPath();
          ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
          ctx.fillStyle = isRain
            ? `rgba(191,201,217,${p.alpha * pulse * (auroraActive ? 1.2 : 0.5)})`
            : `rgba(255,240,200,${p.alpha * pulse * (auroraActive ? 1.4 : 0.6)})`;
          ctx.fill();
        }
      }
if (
  isRain &&
  (
    hour < 8 ||
    (hour >= 17 && hour <= 24)
  ) &&
  eiffelImgRef.current?.complete
) {
  const img = eiffelImgRef.current;

  const parallaxX =
    (mouseRef.current.x - 0.5) * -15;

  const towerHeight = H * 0.65;

const towerWidth =
  towerHeight *
  (img.width / img.height);

const x = W * 0.001 + parallaxX;
const y = H - towerHeight + 20;

  ctx.save();

  ctx.globalAlpha = 0.09;

  ctx.shadowColor = '#8FA7CC';
ctx.shadowBlur = 25;

  ctx.drawImage(
    img,
    x,
    y,
    towerWidth,
    towerHeight
  );
  

  ctx.restore();
}
      
      // Rain (rain theme only)
      if (!reduced && isRain) {
        const drops = rainRef.current;
        for (const d of drops) {
          d.y += d.speed * (dt / 16);
          if (d.y > 1.05) {
            d.y = -0.05;
            d.x = Math.random();
          }
          ctx.beginPath();
          ctx.moveTo(d.x * W, d.y * H);
          ctx.lineTo(d.x * W - 1, d.y * H + d.length);
          ctx.strokeStyle = `rgba(180,200,230,${d.alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // Subtle grain — a fine, premium texture over the whole scene
      if (grainPattern) {
        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = grainPattern;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      // Vignette — soft cinematic darkening toward the edges
      if (vignetteGradient) {
        ctx.fillStyle = vignetteGradient;
        ctx.fillRect(0, 0, W, H);
      }
    }

    animId = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}