import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';
import { sound } from '../lib/sound';
import { usePrefersReducedMotion } from '../lib/usePrefersReducedMotion';

interface LoginScreenProps {
  onUnlock: () => void;
}

export default function LoginScreen({ onUnlock }: LoginScreenProps) {
  const [visible, setVisible] = useState(true);
  const reduced = usePrefersReducedMotion();

  const handleUnlock = useCallback(() => {
    sound.play('login');
    setVisible(false);
    setTimeout(onUnlock, reduced ? 100 : 600);
  }, [onUnlock, reduced]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Enter') handleUnlock(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleUnlock]);
const hour = new Date().getHours();

let greeting = 'Good Night';

if (hour >= 5 && hour < 12) {
  greeting = 'Good Morning';
} else if (hour >= 12 && hour < 17) {
  greeting = 'Good Afternoon';
} else if (hour >= 17 && hour < 21) {
  greeting = 'Good Evening';
}
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9000] flex flex-col items-center justify-center"
          style={{ background: `linear-gradient(180deg, var(--sky-deep) 0%, rgba(17,40,79,0.96) 100%)` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.1 : 0.5, ease: 'easeOut' }}
        >
          {/* Stars backdrop */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
            {Array.from({ length: 60 }, (_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 1 + Math.random() * 2,
                  height: 1 + Math.random() * 2,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 80}%`,
                  background: 'var(--sky-moon-color)',
                  opacity: 0.2 + Math.random() * 0.5,
                  animation: reduced ? 'none' : `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 3}s`,
                }}
              />
            ))}
          </div>

          <motion.div
            className="flex flex-col items-center gap-7 relative z-10"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : 0.2, duration: reduced ? 0.15 : 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Decorative Moon */}
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full blur-3xl"
                style={{
                  background: 'radial-gradient(circle, rgba(193,145,63,0.4) 0%, rgba(245,230,192,0.2) 50%, transparent 70%)',
                  width: '200px',
                  height: '200px',
                  left: '-30px',
                  top: '-30px',
                }}
              />
              <div className="relative" style={{ width: '140px', height: '140px' }}>
                {/* Decorative crescent moon with face details */}
                <svg
                  viewBox="0 0 100 100"
                  style={{
                    width: '100%',
                    height: '100%',
                    filter: 'drop-shadow(0 0 20px rgba(193,145,63,0.5))',
                  }}
                >
                  {/* Outer glow */}
                  <defs>
                    <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(245,230,192,0.9)" />
                      <stop offset="100%" stopColor="rgba(193,145,63,0.6)" />
                    </radialGradient>
                    <filter id="softGlow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Main crescent moon */}
                  <defs>
  <mask id="crescentMask">
    <rect width="100" height="100" fill="white" />
    <circle cx="58" cy="50" r="35" fill="black" />
  </mask>
</defs>

<circle
  cx="40"
  cy="50"
  r="35"
  fill="url(#moonGlow)"
  mask="url(#crescentMask)"
/>

                  {/* Subtle crater details */}
                  <circle cx="55" cy="30" r="4" fill="rgba(193,145,63,0.15)" />
                  <circle cx="70" cy="45" r="3" fill="rgba(193,145,63,0.12)" />
                  <circle cx="62" cy="65" r="2.5" fill="rgba(193,145,63,0.1)" />
                  <circle cx="45" cy="50" r="2" fill="rgba(193,145,63,0.08)" />
                </svg>
              </div>
            </div>

            {/* Name */}
            <div className="text-center">
              <p
                className="font-light tracking-wide"
                style={{
                  color: 'var(--sky-text)',
                  fontFamily: "'Marcellus', serif",
                  fontSize: '2.75rem',
                  letterSpacing: '0.04em',
                }}
              >
                {greeting}
              </p>

              <p
                className="text-4xl mt-2 font-semibold"
                style={{
                  color: 'var(--sky-accent)',
                  fontFamily: "'Marcellus', serif",
                  letterSpacing: '0.02em',
                }}
              >
                dhruvika
              </p>
              <p
                className="mt-3 font-light max-w-xs mx-auto leading-relaxed"
                style={{
                  color: 'var(--sky-text-secondary)',
                  fontFamily: "'Marcellus', serif",
                  fontSize: '1.25rem',
                  lineHeight: '1.6',
                }}
              >
                "I guess some queens don't need a crown" – Miss You
              </p>
            </div>

            {/* Unlock button */}
            <motion.button
              onClick={handleUnlock}
              className="mt-2 px-10 py-3 rounded-full text-sm font-medium flex items-center gap-2 cursor-pointer transition-opacity"
              style={{
                background: 'linear-gradient(135deg, var(--sky-accent) 0%, #d4a653 100%)',
                color: 'var(--sky-deep)',
                boxShadow: '0 4px 30px rgba(193,145,63,0.35)',
              }}
              whileHover={reduced ? undefined : { scale: 1.03, opacity: 0.95 }}
              whileTap={reduced ? undefined : { scale: 0.98 }}
            >
              <Lock className="w-4 h-4" strokeWidth={2} />
              Unlock
            </motion.button>

            <p
              className="text-xs mt-1"
              style={{
                color: 'var(--sky-text-secondary)',
                opacity: 0.6,
                fontFamily: "'Marcellus', serif",
                fontSize: '1.25rem'
              }}
            >
              Press Enter to unlock
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
