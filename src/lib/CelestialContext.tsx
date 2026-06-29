import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';

// ── Condition flags ───────────────────────────────────────────────────────
export interface CelestialConditions {
  appsOpened: Set<string>;       // which app IDs have been opened
  terminalAlignUsed: boolean;    // typed `align` in terminal
  birthdaySoon: boolean;         // countdown ≤ 7 days
}

interface CelestialContextValue {
  conditions: CelestialConditions;
  auroraActive: boolean;
  auroraProgress: number;        // 0–1, drives intensity in SkyCanvas
  recordAppOpened: (id: string) => void;
  recordTerminalAlign: () => void;
  triggerAurora: () => void;
}

const CelestialContext = createContext<CelestialContextValue | null>(null);

export function useCelestial() {
  const ctx = useContext(CelestialContext);
  if (!ctx) throw new Error('useCelestial must be used within CelestialProvider');
  return ctx;
}

// Birthday soon check (July 1)
function isBirthdaySoon(): boolean {
  const now = new Date();
  const y = now.getFullYear();
  let target = new Date(y, 6, 1); // July 1
  if (now >= target) target = new Date(y + 1, 6, 1);
  const days = Math.ceil((target.getTime() - now.getTime()) / 86400000);
  return days <= 7;
}

// How many unique apps need to be opened to satisfy the condition
const REQUIRED_APP_COUNT = 4;

const AURORA_DURATION_MS = 25000;

export function CelestialProvider({ children }: { children: ReactNode }) {
  const [conditions, setConditions] = useState<CelestialConditions>(() => ({
    appsOpened: new Set(),
    terminalAlignUsed: false,
    birthdaySoon: isBirthdaySoon(),
  }));
  const [auroraActive, setAuroraActive] = useState(false);
  const [auroraProgress, setAuroraProgress] = useState(0);
  const auroraTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const auroraRafRef = useRef<number>(0);
  const auroraStartRef = useRef<number>(0);

  const runAuroraAnimation = useCallback(() => {
    const elapsed = Date.now() - auroraStartRef.current;
    const raw = elapsed / AURORA_DURATION_MS;

    // Fade in over first 15%, hold, fade out over last 20%
    let prog: number;
    if (raw < 0.15) prog = raw / 0.15;
    else if (raw < 0.80) prog = 1;
    else prog = 1 - (raw - 0.80) / 0.20;

    setAuroraProgress(Math.max(0, Math.min(1, prog)));

    if (raw < 1) {
      auroraRafRef.current = requestAnimationFrame(runAuroraAnimation);
    } else {
      setAuroraActive(false);
      setAuroraProgress(0);
    }
  }, []);

  const triggerAurora = useCallback(() => {
    if (auroraActive) return;
    if (auroraTimerRef.current) clearTimeout(auroraTimerRef.current);
    cancelAnimationFrame(auroraRafRef.current);
    auroraStartRef.current = Date.now();
    setAuroraActive(true);
    setAuroraProgress(0);
    auroraRafRef.current = requestAnimationFrame(runAuroraAnimation);
  }, [auroraActive, runAuroraAnimation]);

  // Auto-check conditions whenever they change
  const checkAndMaybeTrigger = useCallback((cond: CelestialConditions) => {
    const appsSatisfied = cond.appsOpened.size >= REQUIRED_APP_COUNT;
    const termSatisfied = cond.terminalAlignUsed;
    const bSatisfied    = cond.birthdaySoon;
    if (appsSatisfied || termSatisfied || bSatisfied) {
      // Small random delay so it doesn't feel instant
      const delay = 2000 + Math.random() * 4000;
      auroraTimerRef.current = setTimeout(() => triggerAurora(), delay);
    }
  }, [triggerAurora]);

  const recordAppOpened = useCallback((id: string) => {
    setConditions((prev) => {
      if (prev.appsOpened.has(id)) return prev;
      const next = { ...prev, appsOpened: new Set([...prev.appsOpened, id]) };
      checkAndMaybeTrigger(next);
      return next;
    });
  }, [checkAndMaybeTrigger]);

  const recordTerminalAlign = useCallback(() => {
    setConditions((prev) => {
      if (prev.terminalAlignUsed) return prev;
      const next = { ...prev, terminalAlignUsed: true };
      checkAndMaybeTrigger(next);
      return next;
    });
  }, [checkAndMaybeTrigger]);

  // Check birthday condition on mount
  useEffect(() => {
    if (isBirthdaySoon()) {
      checkAndMaybeTrigger({ ...conditions, birthdaySoon: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => {
    if (auroraTimerRef.current) clearTimeout(auroraTimerRef.current);
    cancelAnimationFrame(auroraRafRef.current);
  }, []);

  return (
    <CelestialContext.Provider value={{
      conditions, auroraActive, auroraProgress,
      recordAppOpened, recordTerminalAlign, triggerAurora,
    }}>
      {children}
    </CelestialContext.Provider>
  );
}
