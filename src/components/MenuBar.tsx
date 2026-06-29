import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cake, Wifi, Battery, Volume2, VolumeX, Moon, Heart } from 'lucide-react';
import { useMuted, getSetMuted } from '../lib/useMuted';
import { usePrefersReducedMotion } from '../lib/usePrefersReducedMotion';
import { useTheme } from '../lib/ThemeContext';
import LunarCountdown from './LunarCountdown';

interface MenuBarProps {
  onRestart: () => void;
  onOpenSettings: () => void;
}

// ── Dropdown ──────────────────────────────────────────────────────────────
interface DropdownItem {
  label: string;
  action: () => void;
  dividerAfter?: boolean;
}

function Dropdown({
  items,
  onClose,
  anchorRef,
  reduced,
}: {
  items: DropdownItem[];
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  reduced: boolean;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) onClose();
    };
    const keyHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [onClose, anchorRef]);

  return (
    <motion.div
      ref={menuRef}
      className="absolute top-full left-0 mt-1 min-w-[200px] rounded-xl overflow-hidden z-[9000] py-1"
      style={{
        background: 'var(--sky-surface)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid var(--sky-border)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
      }}
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -6 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -6 }}
      transition={{ duration: reduced ? 0.05 : 0.14, ease: 'easeOut' }}
    >
      {items.map((item, i) => (
        <div key={i}>
          <button
            className="w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors"
            style={{ color: 'var(--sky-text)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--sky-accent)', e.currentTarget.style.color = 'var(--sky-deep)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '', e.currentTarget.style.color = 'var(--sky-text)')}
            onClick={() => { item.action(); onClose(); }}
          >
            {item.label}
          </button>
          {item.dividerAfter && (
            <div className="mx-3 my-1" style={{ height: 1, background: 'var(--sky-border)' }} />
          )}
        </div>
      ))}
    </motion.div>
  );
}

// ── About Modal ───────────────────────────────────────────────────────────
function AboutModal({ onClose, reduced }: { onClose: () => void; reduced: boolean }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[9200] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0.05 : 0.2 }}
    >
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        className="relative w-[min(360px,88vw)] rounded-2xl overflow-hidden"
        style={{
          background: 'var(--sky-surface)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          border: '1px solid var(--sky-border)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px var(--sky-accent), 0 0 18px 4px color-mix(in srgb, var(--sky-accent) 35%, transparent)',
        }}
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.88, y: 16 }}
        animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.88, y: 16 }}
        transition={{ duration: reduced ? 0.05 : 0.25, ease: [0.22, 1, 0.36, 1] }}
        role="dialog"
        aria-modal="true"
        aria-label="About BirthdayOS"
      >
        {/* Title bar */}
        <div
          className="h-9 flex items-center px-3 gap-2"
          style={{ background: 'rgba(0,0,0,0.15)', borderBottom: '1px solid var(--sky-border)' }}
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-3 h-3 rounded-full bg-[#FF5F57] hover:brightness-90 transition-all flex items-center justify-center group cursor-pointer"
          >
            <span className="text-[7px] text-black/50 opacity-0 group-hover:opacity-100 font-bold leading-none">×</span>
          </button>
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#28C840]" />
          <div className="flex-1 text-center pr-16">
            <span className="text-[13px] font-medium" style={{ color: 'var(--sky-text-secondary)' }}>About BirthdayOS</span>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-7 text-center flex flex-col items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--sky-accent)', boxShadow: '0 6px 24px color-mix(in srgb, var(--sky-accent) 50%, transparent)' }}
          >
            <Moon className="w-9 h-9" style={{ color: 'var(--sky-deep)' }} strokeWidth={1.4} />
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--sky-text)' }}>BirthdayOS</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--sky-text-secondary)' }}>Version 1.0 — A one-of-a-kind OS</p>
          </div>

          <p className="text-[13px] leading-relaxed" style={{ color: 'var(--sky-text-secondary)' }}>
            This little universe was built just for you — every star, every moon glow, every
            hidden corner has your name written in it.
          </p>

          <div
            className="w-full rounded-xl px-4 py-3 flex items-center justify-center gap-2 text-[13px] font-medium"
            style={{ background: 'rgba(0,0,0,0.2)', color: 'var(--sky-accent)' }}
          >
            <Heart className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} fill="currentColor" />
            Made with love for Dhruvika
          </div>

          <button
            onClick={onClose}
            className="mt-1 px-6 py-2 rounded-full text-sm font-medium cursor-pointer transition-opacity hover:opacity-80"
            style={{ background: 'var(--sky-accent)', color: 'var(--sky-deep)' }}
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Diorama Toggle ────────────────────────────────────────────────────────
const STARS_POS = [
  { cx: 14, cy: 6 }, { cx: 25, cy: 4 }, { cx: 36, cy: 8 },
  { cx: 46, cy: 5 }, { cx: 31, cy: 12 }, { cx: 20, cy: 10 },
];
// Mountain silhouette that fits the 68×28 pill
const MT_PATH = 'M0 28 L0 21 L7 14 L14 20 L20 11 L28 19 L34 15 L40 20 L46 16 L52 21 L57 17 L63 22 L68 18 L68 28 Z';

function DioramaToggle({
  theme,
  onToggle,
  reduced,
}: {
  theme: 'moon' | 'rain';
  onToggle: () => void;
  reduced: boolean;
}) {
  const isMoon = theme === 'moon';
  const dur = reduced ? 0 : 0.4;
  const spring = reduced
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 360, damping: 28 };

  return (
    <button
      onClick={onToggle}
      aria-label={isMoon ? 'Switch to Rain theme' : 'Switch to Moon theme'}
      title={isMoon ? 'Switch to Rain theme' : 'Switch to Moon theme'}
      className="relative cursor-pointer flex-shrink-0"
      style={{ width: 68, height: 28, borderRadius: 14 }}
    >
      {/* ── Track ── */}
      <svg
        width="68" height="28"
        viewBox="0 0 68 28"
        style={{ position: 'absolute', inset: 0, display: 'block' }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="dt-sky-moon" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#000C25" />
            <stop offset="100%" stopColor="#11284F" />
          </linearGradient>
          <linearGradient id="dt-sky-rain" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#081B36" />
            <stop offset="100%" stopColor="#2A4A70" />
          </linearGradient>
          <clipPath id="dt-clip">
            <rect width="68" height="28" rx="14" />
          </clipPath>
        </defs>

        <g clipPath="url(#dt-clip)">
          {/* Sky — moon layer */}
          <motion.rect
            width="68" height="28"
            fill="url(#dt-sky-moon)"
            animate={{ opacity: isMoon ? 1 : 0 }}
            transition={{ duration: dur }}
          />
          {/* Sky — rain layer */}
          <motion.rect
            width="68" height="28"
            fill="url(#dt-sky-rain)"
            animate={{ opacity: isMoon ? 0 : 1 }}
            transition={{ duration: dur }}
          />

          {/* Stars */}
          {STARS_POS.map((s, i) => (
            <motion.circle
              key={i}
              cx={s.cx} cy={s.cy} r={0.85}
              fill="#FFFBF0"
              animate={{ opacity: isMoon ? (i % 2 === 0 ? 0.85 : 0.5) : 0 }}
              transition={{ duration: dur, delay: reduced ? 0 : i * 0.03 }}
            />
          ))}

          {/* Mountain silhouette */}
          <motion.path
            d={MT_PATH}
            animate={{ fill: isMoon ? '#0D1E42' : '#1A3256' }}
            transition={{ duration: dur }}
          />

          {/* Crescent moon (upper-right) */}
          <motion.g
            animate={{ opacity: isMoon ? 1 : 0 }}
            transition={{ duration: dur }}
          >
            <circle cx="57" cy="7" r="4.2" fill="#EFE5D2" opacity="0.9" />
            {/* Mask the crescent by overdrawing with track colour */}
            <motion.circle
              cx="59.2" cy="5.8" r="3.4"
              animate={{ fill: isMoon ? '#020E2A' : '#0A1E3A' }}
              transition={{ duration: dur }}
            />
          </motion.g>

          {/* Rain cloud (upper-right) */}
          <motion.g
            animate={{ opacity: isMoon ? 0 : 1 }}
            transition={{ duration: dur }}
          >
            <circle cx="54" cy="8.5" r="3.0" fill="#7AA0C8" />
            <circle cx="58" cy="6.5" r="3.6" fill="#7AA0C8" />
            <circle cx="62" cy="8.0" r="2.6" fill="#7AA0C8" />
            <rect x="54.5" y="11.5" width="1"   height="2.8" rx="0.5" fill="#9BBFDE" opacity="0.8" />
            <rect x="57.5" y="12.2" width="1"   height="2.8" rx="0.5" fill="#9BBFDE" opacity="0.8" />
            <rect x="60.5" y="11.5" width="1"   height="2.8" rx="0.5" fill="#9BBFDE" opacity="0.8" />
          </motion.g>
        </g>

        {/* Pill border */}
        <rect
          width="68" height="28" rx="14"
          fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1"
        />
      </svg>

      {/* ── Knob ── */}
      <motion.div
        aria-hidden="true"
        animate={{ x: isMoon ? 3 : 43 }}
        transition={spring}
        style={{
          position: 'absolute',
          top: 3,
          left: 0,
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: isMoon
            ? 'radial-gradient(circle at 38% 35%, #FFFAEE, #C1913F)'
            : 'radial-gradient(circle at 38% 35%, #E8EDF5, #A98B45)',
          boxShadow: isMoon
            ? '0 0 0 1.5px rgba(255,255,255,0.3), 0 0 10px 4px rgba(193,145,63,0.75), 0 1px 4px rgba(0,0,0,0.55)'
            : '0 0 0 1.5px rgba(255,255,255,0.2), 0 0 10px 4px rgba(169,139,69,0.55), 0 1px 4px rgba(0,0,0,0.55)',
          pointerEvents: 'none',
          transition: reduced ? 'none' : 'background 0.4s ease, box-shadow 0.4s ease',
        }}
      />
    </button>
  );
}

// ── MenuBar ───────────────────────────────────────────────────────────────
type OpenMenu = 'file' | 'view' | null;

export default function MenuBar({ onRestart, onOpenSettings }: MenuBarProps) {
  const [time, setTime] = useState(new Date());
  const muted = useMuted();
  const setMuted = getSetMuted();
  const reduced = usePrefersReducedMotion();
  const { theme, setTheme } = useTheme();
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [showAbout, setShowAbout] = useState(false);

  const fileRef = useRef<HTMLButtonElement>(null);
  const viewRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const formattedDate = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const toggleMenu = (menu: OpenMenu) => setOpenMenu((prev) => (prev === menu ? null : menu));
  const closeMenu = useCallback(() => setOpenMenu(null), []);

  const fileItems: DropdownItem[] = [
    {
      label: 'About BirthdayOS',
      action: () => setShowAbout(true),
      dividerAfter: true,
    },
    {
      label: 'Restart BirthdayOS',
      action: onRestart,
    },
  ];

  const viewItems: DropdownItem[] = [
    {
      label: `Toggle Theme (${theme === 'moon' ? 'Moon → Rain' : 'Rain → Moon'})`,
      action: () => setTheme(theme === 'moon' ? 'rain' : 'moon'),
      dividerAfter: true,
    },
    {
      label: 'Open Settings',
      action: onOpenSettings,
    },
  ];

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 h-9 z-[8000] flex items-center justify-between px-4"
        style={{
          background: 'var(--sky-surface)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          borderBottom: '1px solid var(--sky-border)',
          color: 'var(--sky-text)',
        }}
        initial={reduced ? { opacity: 0 } : { y: -40, opacity: 0 }}
        animate={reduced ? { opacity: 1 } : { y: 0, opacity: 1 }}
        transition={{ duration: reduced ? 0.1 : 0.5, ease: 'easeOut', delay: 0.1 }}
      >
        {/* Left: logo + menus */}
        <div className="flex items-center gap-1">
          <Cake className="w-4 h-4 mr-2" style={{ color: 'var(--sky-accent)' }} strokeWidth={2} />
          <span className="text-[13px] font-semibold tracking-tight mr-2" style={{ color: 'var(--sky-text)' }}>
            BirthdayOS
          </span>

          {/* File menu */}
          <div className="relative hidden sm:block">
            <button
              ref={fileRef}
              onClick={() => toggleMenu('file')}
              className="px-2 py-0.5 rounded text-[13px] font-normal cursor-pointer transition-colors"
              style={{
                color: openMenu === 'file' ? 'var(--sky-deep)' : 'var(--sky-text-secondary)',
                background: openMenu === 'file' ? 'var(--sky-accent)' : 'transparent',
              }}
            >
              File
            </button>
            <AnimatePresence>
              {openMenu === 'file' && (
                <Dropdown items={fileItems} onClose={closeMenu} anchorRef={fileRef} reduced={reduced} />
              )}
            </AnimatePresence>
          </div>

          {/* View menu */}
          <div className="relative hidden sm:block">
            <button
              ref={viewRef}
              onClick={() => toggleMenu('view')}
              className="px-2 py-0.5 rounded text-[13px] font-normal cursor-pointer transition-colors"
              style={{
                color: openMenu === 'view' ? 'var(--sky-deep)' : 'var(--sky-text-secondary)',
                background: openMenu === 'view' ? 'var(--sky-accent)' : 'transparent',
              }}
            >
              View
            </button>
            <AnimatePresence>
              {openMenu === 'view' && (
                <Dropdown items={viewItems} onClose={closeMenu} anchorRef={viewRef} reduced={reduced} />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-1">
          <DioramaToggle
            theme={theme}
            onToggle={() => setTheme(theme === 'moon' ? 'rain' : 'moon')}
            reduced={reduced}
          />

          <LunarCountdown />

          <button
            onClick={() => setMuted(!muted)}
            aria-pressed={muted}
            aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
            className="w-7 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer"
            style={{ color: 'var(--sky-text-secondary)' }}
          >
            {muted ? <VolumeX className="w-3.5 h-3.5" strokeWidth={2} /> : <Volume2 className="w-3.5 h-3.5" strokeWidth={2} />}
          </button>

          <Wifi    className="w-3.5 h-3.5 mx-1" style={{ color: 'var(--sky-text-secondary)' }} strokeWidth={2} />
          <Battery className="w-3.5 h-3.5 mx-1" style={{ color: 'var(--sky-text-secondary)' }} strokeWidth={2} />

          <span className="text-[13px] font-medium hidden sm:block ml-1" style={{ color: 'var(--sky-text-secondary)' }}>
            {formattedDate}
          </span>
          <span className="text-[13px] font-medium ml-2 min-w-[60px] text-right" style={{ color: 'var(--sky-text)' }}>
            {formattedTime}
          </span>
        </div>
      </motion.div>

      {/* About modal — rendered outside the bar so it floats above everything */}
      <AnimatePresence>
        {showAbout && <AboutModal onClose={() => setShowAbout(false)} reduced={reduced} />}
      </AnimatePresence>
    </>
  );
}
