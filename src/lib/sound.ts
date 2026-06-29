// Synthesized sound utility using the Web Audio API.
// No external assets; all tones are generated on the fly.

type SoundName = 'boot' | 'login' | 'click' | 'egg';

let ctx: AudioContext | null = null;
let muted = false;

// Lazily create the AudioContext (must be after a user gesture).
function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }
  return ctx;
}

interface ToneSpec {
  freq: number;
  start: number; // seconds offset
  duration: number;
  type: OscillatorType;
  gain: number;
}

function playTones(specs: ToneSpec[]) {
  const audio = getContext();
  if (!audio || muted) return;

  const now = audio.currentTime;
  for (const spec of specs) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    const startAt = now + spec.start;
    const endAt = startAt + spec.duration;

    osc.type = spec.type;
    osc.frequency.value = spec.freq;
    // Soft attack/release to avoid clicks.
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(spec.gain, startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(startAt);
    osc.stop(endAt);
  }
}

const sounds: Record<SoundName, () => void> = {
  // Rising two-note sparkle for boot.
  boot: () =>
    playTones([
      { freq: 523.25, start: 0, duration: 0.35, type: 'sine', gain: 0.18 },
      { freq: 659.25, start: 0.12, duration: 0.45, type: 'sine', gain: 0.16 },
      { freq: 783.99, start: 0.26, duration: 0.55, type: 'sine', gain: 0.14 },
    ]),
  // Soft, romantic piano-like arpeggio for login/unlock.
  login: () =>
    playTones([
      // Low warm bass note (like a piano's left hand)
      { freq: 261.63, start: 0, duration: 2.0, type: 'sine', gain: 0.08 },
      { freq: 261.63, start: 0, duration: 1.5, type: 'triangle', gain: 0.04 },
      // Gentle chord progression (right hand)
      { freq: 329.63, start: 0.2, duration: 1.6, type: 'sine', gain: 0.1 },
      { freq: 392.00, start: 0.4, duration: 1.4, type: 'sine', gain: 0.09 },
      { freq: 523.25, start: 0.6, duration: 1.2, type: 'sine', gain: 0.08 },
      // Whisper of higher notes
      { freq: 659.25, start: 0.9, duration: 1.0, type: 'sine', gain: 0.05 },
      { freq: 783.99, start: 1.2, duration: 0.8, type: 'sine', gain: 0.03 },
    ]),
  // Subtle short click for dock / buttons.
  click: () =>
    playTones([
      { freq: 880, start: 0, duration: 0.06, type: 'square', gain: 0.05 },
      { freq: 1320, start: 0.02, duration: 0.05, type: 'sine', gain: 0.05 },
    ]),
  // Celebratory arpeggio for the easter egg.
  egg: () =>
    playTones([
      { freq: 523.25, start: 0, duration: 0.25, type: 'sine', gain: 0.18 },
      { freq: 659.25, start: 0.12, duration: 0.25, type: 'sine', gain: 0.18 },
      { freq: 783.99, start: 0.24, duration: 0.25, type: 'sine', gain: 0.18 },
      { freq: 1046.5, start: 0.36, duration: 0.5, type: 'sine', gain: 0.18 },
      { freq: 1318.51, start: 0.48, duration: 0.6, type: 'triangle', gain: 0.12 },
    ]),
};

const listeners = new Set<(m: boolean) => void>();

export const sound = {
  play(name: SoundName) {
    // Play (silently if muted — getContext still warmed up on gesture).
    sounds[name]();
  },
  setMuted(value: boolean) {
    muted = value;
    listeners.forEach((l) => l(muted));
  },
  isMuted() {
    return muted;
  },
  subscribe(listener: (muted: boolean) => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
