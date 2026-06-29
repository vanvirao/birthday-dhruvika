import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import { Moon } from 'lucide-react';
import { sound } from '../lib/sound';
import { usePrefersReducedMotion } from '../lib/usePrefersReducedMotion';

interface BootSequenceProps {
  onComplete: () => void;
}

// A single moon that smoothly waxes from New to Full as boot progress climbs,
// drawn with the classic two-overlapping-circles "lune" trick: a fully lit
// disc gets progressively uncovered as a same-radius dark circle slides across it.
function ProgressMoon({ illumination, size = 72 }: { illumination: number; size?: number }) {
  const r = size / 2 - 2;
  const cx = size / 2;
  const cy = size / 2;
  const offset = 2 * r * illumination;
  const maskCx = cx - offset;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <defs>
        <clipPath id="boot-moon-clip">
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <g clipPath="url(#boot-moon-clip)">
        <circle cx={cx} cy={cy} r={r} style={{ fill: 'rgba(255,255,255,0.07)' }} />
        <circle cx={cx} cy={cy} r={r} style={{ fill: 'var(--sky-accent)' }} />
        <circle cx={maskCx} cy={cy} r={r} style={{ fill: 'var(--sky-deep)' }} />
      </g>
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        style={{ stroke: 'rgba(255,255,255,0.22)' }}
        strokeWidth="1"
      />
    </svg>
  );
}

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          sound.play('boot');
          setTimeout(() => {
            setVisible(false);
            setTimeout(onComplete, reduced ? 50 : 500);
          }, reduced ? 50 : 300);
          return 100;
        }
        return prev + 2;
      });
    }, reduced ? 12 : 40);
    return () => clearInterval(interval);
  }, [onComplete, reduced]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: 'var(--sky-deep)' }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.05 : 0.6, ease: 'easeOut' }}
        >
          {/* Single moon that waxes from new to full as progress fills */}
          <div className="relative mb-2">
            <div
              className="absolute inset-0 rounded-full blur-3xl"
              style={{ background: 'var(--sky-accent)', opacity: 0.3, transform: 'scale(2.4)' }}
            />
            <div
              className="relative"
              aria-label={`Loading, ${progress}%`}
              style={{ filter: 'drop-shadow(0 0 16px color-mix(in srgb, var(--sky-accent) 55%, transparent))' }}
            >
              <ProgressMoon illumination={progress / 100} size={88} />
            </div>
          </div>

          <motion.p
            className="text-xs mt-6 font-light tracking-[0.2em] uppercase"
            style={{ color: 'var(--sky-text-secondary)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduced ? 0 : 0.4 }}
          >
            Loading
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}