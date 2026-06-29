import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrefersReducedMotion } from '../lib/usePrefersReducedMotion';
import { useTheme } from '../lib/ThemeContext';

// Reads the existing sky canvas and draws a slow drifting zoom/pan on top of it
function DriftCanvas({ visible }: { visible: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const { theme } = useTheme();

  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Find the sky canvas in the DOM to sample from
    const skyCanvas = document.querySelector<HTMLCanvasElement>('canvas[aria-hidden="true"]');

    const start = performance.now();

    function frame(now: number) {
      animRef.current = requestAnimationFrame(frame);
      if (!canvas || !ctx) return;
      const W = canvas.width;
      const H = canvas.height;
      const elapsed = (now - start) * 0.001; // seconds

      // Slow drift: very gentle pan + scale
      const scale = 1.06 + 0.04 * Math.sin(elapsed * 0.07);
      const panX = W * 0.02 * Math.sin(elapsed * 0.05);
      const panY = H * 0.012 * Math.sin(elapsed * 0.038 + 0.8);

      ctx.clearRect(0, 0, W, H);

      if (skyCanvas && skyCanvas.width > 0) {
        ctx.save();
        ctx.translate(W / 2 + panX, H / 2 + panY);
        ctx.scale(scale, scale);
        ctx.drawImage(skyCanvas, -W / 2, -H / 2, W, H);
        ctx.restore();
      }
    }

    animRef.current = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [visible]);

  void theme; // re-run if theme changes

  if (!visible) return null;
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  );
}

export default function Screensaver({ active }: { active: boolean }) {
  const reduced = usePrefersReducedMotion();
  const { theme } = useTheme();
  const [showMessage, setShowMessage] = useState(false);

  // Fade in the message a few seconds after the screensaver appears
  useEffect(() => {
    if (!active) {
      setShowMessage(false);
      return;
    }
    const t = setTimeout(() => setShowMessage(true), reduced ? 800 : 4000);
    return () => clearTimeout(t);
  }, [active, reduced]);

  const accentColor = theme === 'moon' ? '#C1913F' : '#7AA0C8';

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-[7000] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.1 : 1.2, ease: 'easeInOut' }}
        >
          {/* Dim overlay for the desktop below */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(1px)', WebkitBackdropFilter: 'blur(1px)' }}
          />

          {/* Drifting sky snapshot */}
          <DriftCanvas visible={active} />

          {/* Subtle second vignette to frame the scene */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 100%)',
            }}
          />

          {/* Personal message */}
          <AnimatePresence>
            {showMessage && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 pointer-events-none select-none"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: reduced ? 0.1 : 1.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Soft glow behind text */}
                <div
                  className="absolute w-[480px] max-w-full h-64 rounded-full blur-3xl opacity-20"
                  style={{ background: accentColor }}
                />

                <motion.p
                  className="relative text-[11px] tracking-[0.22em] uppercase mb-4 font-light"
                  style={{ color: accentColor, opacity: 0.8 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  transition={{ delay: reduced ? 0 : 0.4, duration: reduced ? 0 : 1.2 }}
                >
                  a birthday message
                </motion.p>

                <motion.h1
                  className="relative text-4xl sm:text-5xl font-light leading-snug tracking-tight"
                  style={{ color: 'rgba(255,250,240,0.92)', textShadow: `0 0 40px ${accentColor}55, 0 2px 16px rgba(0,0,0,0.6)` }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: reduced ? 0 : 0.7, duration: reduced ? 0 : 1.4 }}
                >
                  Happy Birthday,<br />
                  <span style={{ color: accentColor, fontStyle: 'italic' }}>Dhruvika</span>
                </motion.h1>

                <motion.p
                  className="relative mt-6 text-base sm:text-lg font-light max-w-sm leading-relaxed"
                  style={{ color: 'rgba(255,250,240,0.55)', textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: reduced ? 0 : 1.2, duration: reduced ? 0 : 1.6 }}
                >
                  Every star up there has been counting down to today, just for you.
                </motion.p>

                <motion.p
                  className="relative mt-10 text-xs tracking-widest uppercase"
                  style={{ color: 'rgba(255,250,240,0.22)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: reduced ? 0 : 2.0, duration: reduced ? 0 : 1.2 }}
                >
                  Move the mouse to continue
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
