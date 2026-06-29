import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface MinimizedWindowsValue {
  isMinimized: (id: string) => boolean;
  minimize: (id: string) => void;
  restore: (id: string) => void;
}

const MinimizedWindowsContext = createContext<MinimizedWindowsValue | null>(null);

// Wrap your app tree with this in App.tsx, the same way you've already wrapped
// it with ThemeProvider and WallpaperSettingsProvider.
export function MinimizedWindowsProvider({ children }: { children: ReactNode }) {
  const [minimizedIds, setMinimizedIds] = useState<Set<string>>(new Set());

  const isMinimized = useCallback((id: string) => minimizedIds.has(id), [minimizedIds]);

  const minimize = useCallback((id: string) => {
    setMinimizedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const restore = useCallback((id: string) => {
    setMinimizedIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  return (
    <MinimizedWindowsContext.Provider value={{ isMinimized, minimize, restore }}>
      {children}
    </MinimizedWindowsContext.Provider>
  );
}

export function useMinimizedWindows() {
  const ctx = useContext(MinimizedWindowsContext);
  if (!ctx) {
    throw new Error('useMinimizedWindows must be used within a MinimizedWindowsProvider');
  }
  return ctx;
}