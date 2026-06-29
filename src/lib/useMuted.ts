import { useSyncExternalStore } from 'react';
import { sound } from './sound';

const TRUE: { muted: true } = { muted: true };
const FALSE: { muted: false } = { muted: false };

// Use primitives in the store and wrap into stable cached objects
// so useSyncExternalStore sees stable references between renders.
function subscribe(cb: () => void) {
  return sound.subscribe(() => cb());
}

function getSnapshot(): { muted: boolean } {
  return sound.isMuted() ? TRUE : FALSE;
}

function getServerSnapshot(): { muted: boolean } {
  return FALSE;
}

export function useMuted(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot).muted;
}

export function getSetMuted() {
  return (value: boolean) => sound.setMuted(value);
}
