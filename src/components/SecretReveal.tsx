import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSecretReveal } from '../lib/SecretRevealContext';
import { usePrefersReducedMotion } from '../lib/usePrefersReducedMotion';
import revealPhoto from '../assets/sardar.jpg';
import revealSong from '../assets/music/kangna_tera.mp3';

export default function SecretReveal() {
  const { state, close, minimize, restore } = useSecretReveal();
  const reduced = usePrefersReducedMotion();
  const audioRef = useRef<HTMLAudioElement>(null);

  // Music keeps playing across 'open' <-> 'minimized', and stops on 'closed'.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (state === 'closed') {
      audio.pause();
      audio.currentTime = 0;
      return;
    }

    if (audio.paused) {
      void audio.play().catch(() => {
        // Autoplay may be blocked until a user gesture; the triggering
        // terminal keystroke that opened this counts as one, so this
        // should generally succeed.
      });
    }
  }, [state]);

  // Esc closes fully, whether open or minimized.
  useEffect(() => {
    if (state === 'closed') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state, close]);

  return (
    <>
      {/* Persistent audio element so the track survives minimize/restore */}
      <audio ref={audioRef} src={revealSong} loop preload="auto" />

      <AnimatePresence>
        {state === 'open' && (
          <motion.div
            className="fixed inset-0 z-[9800] flex flex-col overflow-hidden"
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={
              reduced
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.15, x: -window.innerWidth / 2 + 40, y: window.innerHeight / 2 - 20 }
            }
            transition={{ duration: reduced ? 0.1 : 0.32, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-label="pinksauce509"
            style={{ background: '#0D1117' }}
          >
            {/* macOS-style title bar */}
            <div
              className="h-9 flex items-center px-3 gap-2 select-none shrink-0"
              style={{ background: '#161B22', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-1.5">
                <button
                  onClick={close}
                  aria-label="Close"
                  className="w-3 h-3 rounded-full bg-[#FF5F57] hover:brightness-90 transition-all flex items-center justify-center group cursor-pointer"
                >
                  <span className="text-[7px] text-black/50 opacity-0 group-hover:opacity-100 font-bold leading-none">×</span>
                </button>
                <button
                  onClick={minimize}
                  aria-label="Minimize"
                  className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:brightness-90 transition-all flex items-center justify-center group cursor-pointer"
                >
                  <span className="text-[7px] text-black/50 opacity-0 group-hover:opacity-100 font-bold leading-none">−</span>
                </button>
              </div>
              <div className="flex-1 text-center pr-16">
                <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  pinksauce509
                </span>
              </div>
            </div>

            {/* Photo, centered and filling the remaining space */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10" style={{ background: '#0D1117' }}>
              <img
                src={revealPhoto}
                alt="A memory"
                draggable={false}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl select-none"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimized pill, dock-style, click to restore */}
      <AnimatePresence>
        {state === 'minimized' && (
          <motion.button
            onClick={restore}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.8 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: reduced ? 0.1 : 0.25, ease: 'easeOut' }}
            className="fixed bottom-24 right-4 z-[9800] flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full cursor-pointer"
            style={{
              background: 'rgba(13,17,23,0.92)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
            aria-label="Restore pinksauce509"
          >
            <img
              src={revealPhoto}
              alt=""
              draggable={false}
              className="w-6 h-6 rounded-full object-cover select-none"
            />
            <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>
              pinksauce509
            </span>
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#FFBD2E', boxShadow: '0 0 6px #FFBD2E' }}
            />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
