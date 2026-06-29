import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimationFrame } from 'framer-motion';
import { usePrefersReducedMotion } from '../lib/usePrefersReducedMotion';
import { useTheme } from '../lib/ThemeContext';

// ── Birthday configuration ────────────────────────────────────────────────
const BIRTHDAY_MONTH = 7; // July (1-indexed)
const BIRTHDAY_DAY   = 1;

function nextBirthday(): Date {
  const now  = new Date();
  const year = now.getFullYear();
  const candidate = new Date(year, BIRTHDAY_MONTH - 1, BIRTHDAY_DAY, 0, 0, 0, 0);
  // If today is the birthday itself, count to next year
  if (now >= candidate) {
    candidate.setFullYear(year + 1);
  }
  return candidate;
}

function calcCountdown(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  const totalSecs = Math.floor(diff / 1000);
  return {
    days:    Math.floor(totalSecs / 86400),
    hours:   Math.floor((totalSecs % 86400) / 3600),
    minutes: Math.floor((totalSecs % 3600)  / 60),
    seconds: totalSecs % 60,
    totalDays: Math.ceil(diff / 86400000),
  };
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

// ── Celestial events (observatory readout) ────────────────────────────────
interface CelestialEvent {
  label: string;
  daysAway: number;
}

function getCelestialEvents(): CelestialEvent[] {
  const now = new Date();
  const y   = now.getFullYear();

  // Fixed reference dates for the current / next year — placeholder astronomy
  const events: Array<{ name: string; month: number; day: number }> = [
    { name: 'Perseid Meteor Shower',   month:  8, day: 12 },
    { name: 'Leonid Meteor Shower',    month: 11, day: 17 },
    { name: 'Geminid Meteor Shower',   month: 12, day: 13 },
    { name: 'Summer Solstice',         month:  6, day: 21 },
    { name: 'Winter Solstice',         month: 12, day: 21 },
    { name: 'Total Lunar Eclipse',     month:  3, day: 14 },
    { name: 'Partial Solar Eclipse',   month:  9, day:  7 },
    { name: 'Next Full Moon',          month: now.getMonth() + 1, day: ((now.getDate() + 15 - 1) % 28) + 1 },
  ];

  return events
    .map((e) => {
      let d = new Date(y, e.month - 1, e.day, 0, 0, 0, 0);
      if (d <= now) d = new Date(y + 1, e.month - 1, e.day, 0, 0, 0, 0);
      const daysAway = Math.ceil((d.getTime() - now.getTime()) / 86400000);
      return { label: e.name, daysAway };
    })
    .filter((e) => e.daysAway > 0)
    .sort((a, b) => a.daysAway - b.daysAway);
}

// ── Countdown digit cell ──────────────────────────────────────────────────
function DigitCell({
  value,
  label,
  glow,
  accentColor,
}: {
  value: string;
  label: string;
  glow: boolean;
  accentColor: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 min-w-[52px]">
      <motion.div
        className="tabular-nums font-light tracking-tight leading-none"
        style={{
          fontSize: 32,
          color: glow ? accentColor : 'var(--sky-text)',
          textShadow: glow ? `0 0 18px ${accentColor}aa, 0 0 6px ${accentColor}66` : 'none',
          transition: 'color 0.6s ease, text-shadow 0.6s ease',
        }}
        key={value}
        initial={{ opacity: 0.4, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {value}
      </motion.div>
      <span
        className="text-[9px] uppercase tracking-[0.14em] font-medium"
        style={{ color: 'var(--sky-text-secondary)', opacity: 0.7 }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Breathing border for <7 day mode ─────────────────────────────────────
function BreathingBorder({ active, accentColor }: { active: boolean; accentColor: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useAnimationFrame((t) => {
    if (!ref.current || !active) return;
    const pulse = 0.5 + 0.5 * Math.sin(t * 0.0012);
    ref.current.style.boxShadow = `0 0 0 1px ${accentColor}55, 0 0 ${Math.round(8 + 14 * pulse)}px ${Math.round(2 + 4 * pulse)}px ${accentColor}${Math.round(30 + 24 * pulse).toString(16).padStart(2, '0')}`;
  });
  return (
    <div
      ref={ref}
      className="absolute inset-0 rounded-2xl pointer-events-none"
      style={{
        transition: active ? 'none' : 'box-shadow 0.6s ease',
        boxShadow: active ? undefined : `0 0 0 1px ${accentColor}33`,
      }}
    />
  );
}

// ── Main LunarCountdown component ─────────────────────────────────────────
export default function LunarCountdown() {
  const reduced     = usePrefersReducedMotion();
  const { theme }   = useTheme();
  const [open, setOpen]   = useState(false);
  const [cd, setCd]       = useState(() => calcCountdown(nextBirthday()));
  const [celestialIdx, setCelestialIdx] = useState(0);

  const btnRef   = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef(nextBirthday());

  const accentColor = theme === 'moon' ? '#C1913F' : '#7AA0C8';
  const isSoon      = cd.totalDays <= 7;
  const celestials  = getCelestialEvents();
  const celestial   = celestials[celestialIdx % celestials.length];

  // Live countdown
  useEffect(() => {
    targetRef.current = nextBirthday();
    const id = setInterval(() => {
      const next = calcCountdown(targetRef.current);
      // If countdown hits 0, recalculate target (year rolled over)
      if (next.days === 0 && next.hours === 0 && next.minutes === 0 && next.seconds === 0) {
        targetRef.current = nextBirthday();
      }
      setCd(calcCountdown(targetRef.current));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Rotate celestial event every 8 seconds when panel is open
  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => setCelestialIdx((i) => i + 1), 8000);
    return () => clearInterval(id);
  }, [open]);

  // Click outside / Escape to close
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onMouse = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current  && !btnRef.current.contains(e.target as Node)
      ) close();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('mousedown', onMouse);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouse);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  // Icon glow animation ref
  const iconRef = useRef<HTMLSpanElement>(null);
  useAnimationFrame((t) => {
    if (!iconRef.current || !isSoon) return;
    const pulse = 0.5 + 0.5 * Math.sin(t * 0.0014);
    iconRef.current.style.filter = `drop-shadow(0 0 ${2 + 4 * pulse}px ${accentColor})`;
  });

  const panelVariants = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 0.94, y: -8, transformOrigin: 'top right' },
        animate: { opacity: 1, scale: 1,    y: 0 },
        exit:    { opacity: 0, scale: 0.94, y: -8 },
      };

  return (
    <>
      {/* ── Menu bar icon button ── */}
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        aria-label="Lunar Countdown"
        aria-expanded={open}
        className="relative w-7 h-7 flex items-center justify-center rounded-md cursor-pointer transition-colors"
        style={{
          color: open ? accentColor : 'var(--sky-text-secondary)',
          background: open ? 'rgba(255,255,255,0.08)' : 'transparent',
        }}
      >
        <span ref={iconRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Hand-drawn crescent moon SVG — matches the diorama aesthetic */}
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <path
              d="M12.5 9.5A5.5 5.5 0 0 1 5.5 2.5a5.5 5.5 0 1 0 7 7z"
              fill="currentColor"
              opacity="0.9"
            />
          </svg>
        </span>
        {/* "Soon" indicator dot */}
        {isSoon && (
          <span
            className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
            style={{ background: accentColor, boxShadow: `0 0 4px 1px ${accentColor}99` }}
          />
        )}
      </button>

      {/* ── Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-label="Lunar Countdown"
            className="fixed z-[9100]"
            style={{
              top: 44,
              right: 12,
              width: 'min(310px, calc(100vw - 24px))',
            }}
            {...panelVariants}
            transition={{ duration: reduced ? 0.08 : 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: 'var(--sky-surface)',
                backdropFilter: 'blur(28px) saturate(180%)',
                WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                border: `1px solid ${accentColor}44`,
                boxShadow: `0 20px 56px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)`,
              }}
            >
              <BreathingBorder active={isSoon && !reduced} accentColor={accentColor} />

              {/* Header */}
              <div
                className="px-5 pt-4 pb-3 flex items-center justify-between"
                style={{ borderBottom: `1px solid rgba(255,255,255,0.07)` }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">🌙</span>
                  <span
                    className="text-[13px] font-semibold tracking-tight"
                    style={{ color: 'var(--sky-text)' }}
                  >
                    Lunar Countdown
                  </span>
                </div>
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{
                    background: `${accentColor}22`,
                    color: accentColor,
                    border: `1px solid ${accentColor}44`,
                  }}
                >
                  July 1st
                </span>
              </div>

              {/* Countdown */}
              <div className="px-5 pt-5 pb-4">
                <p
                  className="text-[10px] uppercase tracking-[0.18em] mb-4 font-medium"
                  style={{ color: 'var(--sky-text-secondary)', opacity: 0.6 }}
                >
                  Birthday in
                </p>

                <div className="flex items-start justify-between">
                  <DigitCell value={pad(cd.days)}    label="Days"    glow={isSoon} accentColor={accentColor} />
                  <Separator accentColor={accentColor} />
                  <DigitCell value={pad(cd.hours)}   label="Hours"   glow={isSoon} accentColor={accentColor} />
                  <Separator accentColor={accentColor} />
                  <DigitCell value={pad(cd.minutes)} label="Minutes" glow={isSoon} accentColor={accentColor} />
                  <Separator accentColor={accentColor} />
                  <DigitCell value={pad(cd.seconds)} label="Seconds" glow={isSoon} accentColor={accentColor} />
                </div>
              </div>

              {/* Divider */}
              <div className="mx-5" style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />

              {/* Observatory readout */}
              <div className="px-5 py-3.5">
                <p
                  className="text-[10px] uppercase tracking-[0.14em] mb-2 font-medium"
                  style={{ color: 'var(--sky-text-secondary)', opacity: 0.5 }}
                >
                  Observatory
                </p>
                <AnimatePresence mode="wait">
                  {celestial && (
                    <motion.div
                      key={celestialIdx}
                      className="flex items-center justify-between gap-2"
                      initial={reduced ? { opacity: 0 } : { opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={reduced ? { opacity: 0 } : { opacity: 0, x: -6 }}
                      transition={{ duration: reduced ? 0.05 : 0.3 }}
                    >
                      <span
                        className="text-[12px] font-medium"
                        style={{ color: 'var(--sky-text)' }}
                      >
                        {celestial.label}
                      </span>
                      <span
                        className="text-[11px] font-medium shrink-0 px-2 py-0.5 rounded-full"
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          color: 'var(--sky-text-secondary)',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        {celestial.daysAway}d away
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Dot indicators for which event is showing */}
                {celestials.length > 1 && (
                  <div className="flex gap-1 mt-2.5">
                    {celestials.slice(0, Math.min(6, celestials.length)).map((_, i) => (
                      <div
                        key={i}
                        className="rounded-full transition-all duration-300"
                        style={{
                          width: i === celestialIdx % celestials.length ? 12 : 4,
                          height: 4,
                          background: i === celestialIdx % celestials.length
                            ? accentColor
                            : 'rgba(255,255,255,0.18)',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div
                className="px-5 py-2.5 flex items-center justify-center gap-1.5"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.12)' }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M8.5 6.5A3.5 3.5 0 0 1 3.5 1.5a3.5 3.5 0 1 0 5 5z" fill={accentColor} opacity="0.6" />
                </svg>
                <span
                  className="text-[10px] tracking-wide"
                  style={{ color: 'var(--sky-text-secondary)', opacity: 0.45 }}
                >
                  BirthdayOS · Lunar Observatory
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Separator({ accentColor }: { accentColor: string }) {
  return (
    <span
      className="text-2xl font-extralight mt-0.5 select-none"
      style={{ color: accentColor, opacity: 0.4 }}
      aria-hidden="true"
    >
      :
    </span>
  );
}
