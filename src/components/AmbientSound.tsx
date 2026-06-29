import { useEffect, useRef } from 'react';
import { useTheme } from '../lib/ThemeContext';
import { useMuted } from '../lib/useMuted';

const FADE_TIME = 1.4; // seconds, crossfade duration when the theme changes
const TARGET_VOLUME = 0.06;

function createNoiseBuffer(ctx: AudioContext, seconds: number) {
  const bufferSize = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

// Renders nothing — mount this once anywhere in the tree (Desktop.tsx is a
// good spot) and it quietly manages the ambient loop for the whole session.
export default function AmbientSound() {
  const { theme } = useTheme();
  const muted = useMuted();

  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const moonGainRef = useRef<GainNode | null>(null);
  const rainGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    const AudioCtxClass =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtxClass) return;

    const ctx = new AudioCtxClass();
    ctxRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.value = muted ? 0 : TARGET_VOLUME;
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    const moonGain = ctx.createGain();
    moonGain.gain.value = theme === 'moon' ? 1 : 0;
    moonGain.connect(masterGain);
    moonGainRef.current = moonGain;

    const rainGain = ctx.createGain();
    rainGain.gain.value = theme === 'rain' ? 1 : 0;
    rainGain.connect(masterGain);
    rainGainRef.current = rainGain;

    // ── Moon ambience: a soft filtered breeze ──
    const breezeSource = ctx.createBufferSource();
    breezeSource.buffer = createNoiseBuffer(ctx, 4);
    breezeSource.loop = true;
    const breezeFilter = ctx.createBiquadFilter();
    breezeFilter.type = 'lowpass';
    breezeFilter.frequency.value = 180;
    const breezeGain = ctx.createGain();
    breezeGain.gain.value = 0.08;
    breezeSource.connect(breezeFilter).connect(breezeGain).connect(moonGain);
    breezeSource.start();

    // ── Moon ambience: occasional cricket chirps ──
    let cricketTimeout: ReturnType<typeof setTimeout>;
    function scheduleCricket() {
      const delay = 6000 + Math.random() * 12000;
      cricketTimeout = setTimeout(() => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 2800 + Math.random() * 600;
        const chirpGain = ctx.createGain();
        chirpGain.gain.setValueAtTime(0, ctx.currentTime);
        chirpGain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 0.02);
        chirpGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.09);
        osc.connect(chirpGain).connect(moonGain);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
        scheduleCricket();
      }, delay);
    }
    scheduleCricket();

    // ── Rain ambience: band-limited noise hiss ──
    const rainSource = ctx.createBufferSource();
    rainSource.buffer = createNoiseBuffer(ctx, 4);
    rainSource.loop = true;
    const rainHighpass = ctx.createBiquadFilter();
    rainHighpass.type = 'highpass';
    rainHighpass.frequency.value = 250;
    const rainLowpass = ctx.createBiquadFilter();
    rainLowpass.type = 'lowpass';
    rainLowpass.frequency.value = 2200;
    const rainInnerGain = ctx.createGain();
    rainInnerGain.gain.value = 0.12;
    rainSource.connect(rainHighpass).connect(rainLowpass).connect(rainInnerGain).connect(rainGain);
    rainSource.start();

    // Browsers block audio until a user gesture happens — resume on the first one
    const resume = () => {
      if (ctx.state === 'suspended') ctx.resume();
    };
    window.addEventListener('click', resume);
    window.addEventListener('keydown', resume);

    return () => {
      clearTimeout(cricketTimeout);
      window.removeEventListener('click', resume);
      window.removeEventListener('keydown', resume);
      breezeSource.stop();
      rainSource.stop();
      ctx.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Crossfade between moon/rain ambience whenever the theme changes
  useEffect(() => {
    const ctx = ctxRef.current;
    const moonGain = moonGainRef.current;
    const rainGain = rainGainRef.current;
    if (!ctx || !moonGain || !rainGain) return;
    const now = ctx.currentTime;
    moonGain.gain.cancelScheduledValues(now);
    rainGain.gain.cancelScheduledValues(now);
    moonGain.gain.setValueAtTime(moonGain.gain.value, now);
    rainGain.gain.setValueAtTime(rainGain.gain.value, now);
    moonGain.gain.linearRampToValueAtTime(theme === 'moon' ? 1 : 0, now + FADE_TIME);
    rainGain.gain.linearRampToValueAtTime(theme === 'rain' ? 1 : 0, now + FADE_TIME);
  }, [theme]);

  // Respect the existing mute toggle
  useEffect(() => {
    const ctx = ctxRef.current;
    const masterGain = masterGainRef.current;
    if (!ctx || !masterGain) return;
    const now = ctx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(muted ? 0 : TARGET_VOLUME, now + 0.4);
  }, [muted]);

  return null;
}