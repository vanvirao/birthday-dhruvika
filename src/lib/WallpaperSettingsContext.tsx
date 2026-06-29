import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type WallpaperMode = 'live' | 'preview' | 'locked';

interface WallpaperSettingsValue {
  mode: WallpaperMode;
  /** Hour of day, 0–24, fractional (e.g. 18.5 = 6:30pm). Only used when mode !== 'live'. */
  overrideHour: number;
  /** Preview a specific time without committing to it — sky updates immediately, reverts on resumeLiveSchedule(). */
  previewTime: (hour: number) => void;
  /** Lock the sky to whatever time is currently being previewed, ignoring the real clock from now on. */
  lockCurrentTime: () => void;
  /** Go back to following the real time of day. */
  resumeLiveSchedule: () => void;
}

const WallpaperSettingsContext = createContext<WallpaperSettingsValue | null>(null);

// Place this provider near the top of your component tree in App.tsx,
// e.g. wrapping the same children that <ThemeProvider> wraps.
export function WallpaperSettingsProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<WallpaperMode>('live');
  const [overrideHour, setOverrideHour] = useState<number>(12);

  const previewTime = useCallback((hour: number) => {
    setOverrideHour(hour);
    setMode('preview');
  }, []);

  const lockCurrentTime = useCallback(() => {
    setMode('locked');
  }, []);

  const resumeLiveSchedule = useCallback(() => {
    setMode('live');
  }, []);

  return (
    <WallpaperSettingsContext.Provider
      value={{ mode, overrideHour, previewTime, lockCurrentTime, resumeLiveSchedule }}
    >
      {children}
    </WallpaperSettingsContext.Provider>
  );
}

export function useWallpaperSettings() {
  const ctx = useContext(WallpaperSettingsContext);
  if (!ctx) {
    throw new Error('useWallpaperSettings must be used within a WallpaperSettingsProvider');
  }
  return ctx;
}