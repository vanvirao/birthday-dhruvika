import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from './lib/ThemeContext.tsx';
import { WallpaperSettingsProvider } from './lib/WallpaperSettingsContext.tsx';
import { MinimizedWindowsProvider } from './lib/MinimizedWindowsContext';
import { CelestialProvider } from './lib/CelestialContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
  <ThemeProvider>
  <WallpaperSettingsProvider>
    <CelestialProvider>
      <MinimizedWindowsProvider>
        <App />
      </MinimizedWindowsProvider>
    </CelestialProvider>
  </WallpaperSettingsProvider>
</ThemeProvider>
</StrictMode>
);