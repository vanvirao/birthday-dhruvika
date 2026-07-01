import { useState, useCallback } from 'react';
import BootSequence from './components/BootSequence';
import LoginScreen from './components/LoginScreen';
import MenuBar from './components/MenuBar';
import Dock from './components/Dock';
import Desktop from './components/Desktop';
import Window from './components/Window';
import EasterEgg from './components/EasterEgg';
import Screensaver from './components/Screensaver';
import NotificationSystem from './components/NotificationSystem';
import AuroraMessage from './components/AuroraMessage';
import { useIdle } from './lib/useIdle';
import { CelestialProvider, useCelestial } from './lib/CelestialContext';
import type { DockApp } from './components/Dock';
import { apps } from './components/Dock';
import SecretReveal from './components/SecretReveal';
import { SecretRevealProvider } from './lib/SecretRevealContext';

type AppState = 'boot' | 'login' | 'desktop';

interface OpenWindow {
  id: string;
  app: DockApp;
  zIndex: number;
}


// Inner component so it can consume CelestialContext
function AppInner() {
  const [state, setState] = useState<AppState>('boot');
  const [desktopReady, setDesktopReady] = useState(false);
  const isIdle = useIdle(60_000);
  const [openWindows, setOpenWindows] = useState<OpenWindow[]>([]);
  const [nextZIndex, setNextZIndex] = useState(100);

  const { recordAppOpened } = useCelestial();

  const handleBootComplete = useCallback(() => {
    setState('login');
  }, []);

  const handleUnlock = useCallback(() => {
    setState('desktop');
    setTimeout(() => setDesktopReady(true), 100);
  }, []);

  const handleRestart = useCallback(() => {
    setDesktopReady(false);
    setOpenWindows([]);
    setNextZIndex(100);
    setState('boot');
  }, []);

  const openWindow = useCallback((app: DockApp) => {
    recordAppOpened(app.id);
    setOpenWindows((prev) => {
      const existing = prev.find((w) => w.app.id === app.id);
      if (existing) {
        return prev.map((w) =>
          w.app.id === app.id ? { ...w, zIndex: nextZIndex } : w
        );
      }
      return [...prev, { id: app.id, app, zIndex: nextZIndex }];
    });
    setNextZIndex((prev) => prev + 1);
  }, [nextZIndex, recordAppOpened]);

  const closeWindow = useCallback((id: string) => {
    setOpenWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const focusWindow = useCallback((id: string) => {
    setOpenWindows((prev) =>
      prev.map((w) => w.id === id ? { ...w, zIndex: nextZIndex } : w)
    );
    setNextZIndex((prev) => prev + 1);
  }, [nextZIndex]);

  const openAppById = useCallback((appId: string) => {
    const app = apps.find((a) => a.id === appId);
    if (app) openWindow(app);
  }, [openWindow]);

  const openSettings = useCallback(() => {
    const settings = apps.find((a) => a.id === 'settings');
    if (settings) openWindow(settings);
  }, [openWindow]);

  return (
    <div className="fixed inset-0 overflow-hidden">
      {state === 'boot' && <BootSequence onComplete={handleBootComplete} />}
      {state === 'login' && <LoginScreen onUnlock={handleUnlock} />}

      <div
        className="fixed inset-0 transition-opacity duration-700"
        style={{ opacity: state === 'desktop' ? 1 : 0 }}
      >
        <Desktop onOpenApp={openWindow} />
        {openWindows.map((window) => (
          <Window
            key={window.id}
            app={window.app}
            onClose={() => closeWindow(window.id)}
            onFocus={() => focusWindow(window.id)}
            isActive={window.zIndex === nextZIndex - 1}
            zIndex={window.zIndex}
          />
        ))}
        {desktopReady && (
          <MenuBar onRestart={handleRestart} onOpenSettings={openSettings} />
        )}
        {desktopReady && (
          <Dock onOpenApp={openWindow} openAppIds={openWindows.map((w) => w.app.id)} />
        )}
        {desktopReady && <EasterEgg />}
        <NotificationSystem active={desktopReady} onOpenApp={openAppById} />
        <AuroraMessage />
        <Screensaver active={desktopReady && isIdle} />
      </div>
    </div>
  );
}

function App() {
  return (
    <CelestialProvider>
      <AppInner />
    </CelestialProvider>
  );
}

export default App;
