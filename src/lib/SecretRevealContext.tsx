import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type SecretRevealState = 'closed' | 'open' | 'minimized';

interface SecretRevealContextValue {
  state: SecretRevealState;
  open: () => void;
  close: () => void;
  minimize: () => void;
  restore: () => void;
}

const SecretRevealContext = createContext<SecretRevealContextValue | null>(null);

export function SecretRevealProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SecretRevealState>('closed');

  const open = useCallback(() => setState('open'), []);
  const close = useCallback(() => setState('closed'), []);
  const minimize = useCallback(() => setState('minimized'), []);
  const restore = useCallback(() => setState('open'), []);

  return (
    <SecretRevealContext.Provider value={{ state, open, close, minimize, restore }}>
      {children}
    </SecretRevealContext.Provider>
  );
}

export function useSecretReveal() {
  const ctx = useContext(SecretRevealContext);
  if (!ctx) throw new Error('useSecretReveal must be used within SecretRevealProvider');
  return ctx;
}
