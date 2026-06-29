import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCelestial } from '../lib/CelestialContext';
import { usePrefersReducedMotion } from '../lib/usePrefersReducedMotion';
import { useTheme } from '../lib/ThemeContext';

const MESSAGES = [
  'Rare celestial activity detected.',
  'Observatory records updated.',
  'Celestial alignment confirmed.',
];

export default function AuroraMessage() {
  const { auroraActive, auroraProgress } = useCelestial();
  const reduced = usePrefersReducedMotion();
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [message] = useState(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);

  const accentColor = theme === 'moon' ? '#A8D8B0' : '#80C8D8';

  // Show message when aurora is well established (~70% through), hide as it fades
  useEffect(() => {
    if (auroraProgress >= 0.65 && auroraActive) setVisible(true);
    if (!auroraActive || auroraProgress < 0.15) setVisible(false);
  }, [auroraActive, auroraProgress]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed z-[6500] bottom-24 left-1/2 -translate-x-1/2 pointer-events-none select-none"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: reduced ? 0.1 : 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full text-[11px] tracking-[0.16em] uppercase font-light whitespace-nowrap"
            style={{
              background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: `1px solid ${accentColor}44`,
              color: `${accentColor}cc`,
              boxShadow: `0 0 20px 4px ${accentColor}22`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: accentColor, boxShadow: `0 0 6px 2px ${accentColor}88` }}
            />
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
