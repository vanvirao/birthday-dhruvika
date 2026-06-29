import { useEffect, useRef, useState, useCallback } from 'react';

function isMediaPlaying(): boolean {
  const els = document.querySelectorAll<HTMLMediaElement>('audio, video');
  for (const el of els) {
    if (!el.paused && !el.ended && el.readyState > 2) return true;
  }
  return false;
}

export function useIdle(timeoutMs: number): boolean {
  const [idle, setIdle] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (idle) setIdle(false);
    timerRef.current = setTimeout(() => {
      if (!isMediaPlaying()) setIdle(true);
    }, timeoutMs);
  }, [idle, timeoutMs]);

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'wheel', 'scroll'];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    timerRef.current = setTimeout(() => {
      if (!isMediaPlaying()) setIdle(true);
    }, timeoutMs);
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [reset, timeoutMs]);

  return idle;
}
