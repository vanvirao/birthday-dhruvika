import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Theme = 'moon' | 'rain';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'moon',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('moon');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'moon') {
      root.style.setProperty('--sky-deep', '#000C25');
      root.style.setProperty('--sky-mid', '#11284F');
      root.style.setProperty('--sky-accent', '#C1913F');
      root.style.setProperty('--sky-light', '#EFE5D2');
      root.style.setProperty('--sky-cream', '#F3E8C8');
      root.style.setProperty('--sky-shadow', '#0D0D0D');
      root.style.setProperty('--sky-surface', 'rgba(17, 40, 79, 0.65)');
      root.style.setProperty('--sky-surface-hover', 'rgba(17, 40, 79, 0.8)');
      root.style.setProperty('--sky-border', 'rgba(239, 229, 210, 0.12)');
      root.style.setProperty('--sky-text', '#EFE5D2');
      root.style.setProperty('--sky-text-secondary', 'rgba(239, 229, 210, 0.55)');
      root.style.setProperty('--sky-moon-color', '#F5E6C0');
      root.style.setProperty('--sky-star-opacity', '1');
    } else {
      root.style.setProperty('--sky-deep', '#081B36');
      root.style.setProperty('--sky-mid', '#1E3A5F');
      root.style.setProperty('--sky-accent', '#A98B45');
      root.style.setProperty('--sky-light', '#DDD8CD');
      root.style.setProperty('--sky-cream', '#BFC9D9');
      root.style.setProperty('--sky-shadow', '#050F1C');
      root.style.setProperty('--sky-surface', 'rgba(30, 58, 95, 0.65)');
      root.style.setProperty('--sky-surface-hover', 'rgba(30, 58, 95, 0.8)');
      root.style.setProperty('--sky-border', 'rgba(221, 216, 205, 0.12)');
      root.style.setProperty('--sky-text', '#DDD8CD');
      root.style.setProperty('--sky-text-secondary', 'rgba(221, 216, 205, 0.55)');
      root.style.setProperty('--sky-moon-color', '#D8DFE8');
      root.style.setProperty('--sky-star-opacity', '0.6');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
