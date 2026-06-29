import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star } from 'lucide-react';
import { sound } from '../lib/sound';
import { usePrefersReducedMotion } from '../lib/usePrefersReducedMotion';
import rose from '../assets/flowers/rose.png';
import lily from '../assets/flowers/lily.png';
import tulip from '../assets/flowers/tulip.png';
import daisy from '../assets/flowers/daisy.png';
import blossom from '../assets/flowers/blossom.png';
const FLOWERS = [
  rose,
  lily,
  tulip,
  daisy,
  blossom,
];

interface Piece {
  id: number;
  x: number;
  delay: number;
  duration: number;
  rotation: number;
  size: number;
  flower: string;
}

const PALETTE = ['#C1913F', '#EFE5D2', '#11284F', '#8A6535', '#F3E8C8', '#1A3A6A'];

interface CelebrationOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function CelebrationOverlay({ open, onClose }: CelebrationOverlayProps) {
  const reduced = usePrefersReducedMotion();

  const pieces = useMemo<Piece[]>(() => {
  if (reduced) return [];

  return Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.8,
    duration: 4 + Math.random() * 3,
    rotation: Math.random() * 360,
    size: 24 + Math.random() * 24,
    flower: FLOWERS[Math.floor(Math.random() * FLOWERS.length)],
  }));
}, [reduced]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9500] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.05 : 0.4 }}
          role="dialog"
          aria-modal="true"
          aria-label="Birthday surprise"
        >
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at center, rgba(17,40,79,0.85) 0%, rgba(0,12,37,0.92) 100%)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          />

          {!reduced && pieces.map((p) => (
            <motion.div
              key={p.id}
              className="absolute"
              style={{ left: `${p.x}%`, top: '-10vh', width: p.size, height: p.isBalloon ? p.size * 1.3 : p.size }}
              initial={{ y: '-10vh', opacity: 0, rotate: p.rotation }}
              animate={{
  y: '110vh',
  x: [0, -15, 10, -10, 0],
  opacity: [0, 1, 1, 1, 0],
  rotate: p.rotation + 360,
}}
              transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn', repeat: Infinity, repeatDelay: 1 }}
            >
              <img
  src={p.flower}
  alt=""
  draggable={false}
  className="w-full h-full object-contain pointer-events-none"
/>
            </motion.div>
          ))}

          {/* Message card */}
          <motion.div
            className="relative z-10 max-w-md mx-4 text-center"
            initial={reduced ? { opacity: 0 } : { scale: 0.6, opacity: 0, y: 30 }}
            animate={reduced ? { opacity: 1 } : { scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0.15 : 0.6, ease: [0.22, 1, 0.36, 1], delay: reduced ? 0 : 0.2 }}
          >
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
              style={{ background: 'var(--sky-accent)', boxShadow: '0 8px 32px rgba(193,145,63,0.5)' }}
            >
              <Star className="w-8 h-8" style={{ color: 'var(--sky-deep)' }} strokeWidth={1.8} fill="currentColor" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight drop-shadow-lg" style={{ color: 'var(--sky-text)' }}>
              Happy Birthday!
            </h2>
            <p className="text-base sm:text-lg mt-4 leading-relaxed font-light drop-shadow" style={{ color: 'var(--sky-text-secondary)' }}>
              You found the secret — the moon was always watching over you, Dhruvika.
            </p>
            <button
              onClick={onClose}
              className="mt-8 inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold cursor-pointer transition-opacity hover:opacity-80"
              style={{ background: 'var(--sky-accent)', color: 'var(--sky-deep)' }}
            >
              <X className="w-4 h-4" />
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function EasterEggTrigger({ onTrigger }: { onTrigger: () => void }) {
  const [hovered, setHovered] = useState(false);
  const reduced = usePrefersReducedMotion();

  return (
    <motion.button
      className="fixed bottom-20 left-3 z-[100]"
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
      transition={{ delay: 1.2, duration: reduced ? 0.1 : 0.5 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => { sound.play('egg'); onTrigger(); }}
      aria-label="A hidden surprise"
      title=""
    >
      <motion.div
        animate={
          reduced
            ? {}
            : hovered
              ? { rotate: 72, scale: 1.5, opacity: 1 }
              : { scale: [1, 1.18, 1], opacity: [0.75, 1, 0.75] }
        }
        transition={
          hovered
            ? { type: 'spring', stiffness: 300, damping: 15 }
            : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <Star
          className="w-3 h-3"
          style={{
            color: hovered ? 'var(--sky-accent)' : 'rgba(239,229,210,0.32)',
            filter: hovered
              ? 'drop-shadow(0 0 4px var(--sky-accent))'
              : 'drop-shadow(0 0 2px rgba(239,229,210,0.25))',
          }}
          strokeWidth={1.5}
        />
      </motion.div>
    </motion.button>
  );
}

export default function EasterEgg() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <EasterEggTrigger onTrigger={() => setOpen(true)} />
      <CelebrationOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
}