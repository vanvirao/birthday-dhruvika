import { useEffect, useState } from 'react';

// Reads the OS "reduce motion" setting and updates if it changes.
// Also respects the runtime `reduceMotion` override stored on window.
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
    // Safari fallback
    mq.addListener(handler);
    return () => mq.removeListener(handler);
  }, []);

  return reduced;
}
