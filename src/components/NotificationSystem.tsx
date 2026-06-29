import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Images, StickyNote, Gamepad2, Disc3, Terminal } from 'lucide-react';
import { usePrefersReducedMotion } from '../lib/usePrefersReducedMotion';
import { useTheme } from '../lib/ThemeContext';

// ── Notification pool ─────────────────────────────────────────────────────
interface NotificationDef {
  appId: string;
  title: string;
  body: string;
  icon: React.ReactNode;
  color: string;
}

const POOL: NotificationDef[] = [
  {
    appId: 'memories',
    title: 'Memories',
    body: 'New memory added to your collection.',
    icon: <Images className="w-4 h-4" />,
    color: '#C1913F',
  },
  {
    appId: 'memories',
    title: 'Memories',
    body: 'A photo from this day last year is waiting for you.',
    icon: <Images className="w-4 h-4" />,
    color: '#C1913F',
  },
  {
    appId: 'mixtape',
    title: 'Mixtape',
    body: "Dhruvika's playlist has been updated.",
    icon: <Disc3 className="w-4 h-4" />,
    color: '#1A3A6A',
  },
  {
    appId: 'mixtape',
    title: 'Mixtape',
    body: 'A new track was added just for you.',
    icon: <Disc3 className="w-4 h-4" />,
    color: '#1A3A6A',
  },
  {
    appId: 'notes',
    title: 'Notes',
    body: '1 new note is waiting in Notes.',
    icon: <StickyNote className="w-4 h-4" />,
    color: '#11284F',
  },
  {
    appId: 'notes',
    title: 'Notes',
    body: 'Someone left you a little message.',
    icon: <StickyNote className="w-4 h-4" />,
    color: '#11284F',
  },
  {
    appId: 'jokes',
    title: 'Inside Jokes',
    body: 'A classic moment just resurfaced.',
    icon: <Gamepad2 className="w-4 h-4" />,
    color: '#8A6535',
  },
  {
    appId: 'terminal',
    title: 'Terminal',
    body: 'New fortune loaded. Type fortune to read it.',
    icon: <Terminal className="w-4 h-4" />,
    color: '#2A4A3A',
  },
];

// Min / max delay between notifications (ms)
const MIN_DELAY = 90 * 1000;
const MAX_DELAY = 180 * 1000;
const DISPLAY_DURATION = 5000;

function randomDelay() {
  return MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
}

// ── Active notification shape ─────────────────────────────────────────────
interface ActiveNotif extends NotificationDef {
  uid: number;
}

let uidCounter = 0;

// ── Banner component ──────────────────────────────────────────────────────
function Banner({
  notif,
  onDismiss,
  onOpen,
  reduced,
  accentColor,
}: {
  notif: ActiveNotif;
  onDismiss: (uid: number) => void;
  onOpen: (appId: string) => void;
  reduced: boolean;
  accentColor: string;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startTimer = useCallback(() => {
    timerRef.current = setTimeout(() => onDismiss(notif.uid), DISPLAY_DURATION);
  }, [notif.uid, onDismiss]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    startTimer();
    return () => clearTimer();
  }, [startTimer, clearTimer]);

  return (
    <motion.div
      layout
      key={notif.uid}
      initial={reduced ? { opacity: 0 } : { opacity: 0, x: 48, scale: 0.96 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, x: 48, scale: 0.94 }}
      transition={{ duration: reduced ? 0.08 : 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="w-[min(320px,calc(100vw-24px))] cursor-pointer select-none"
      onMouseEnter={clearTimer}
      onMouseLeave={startTimer}
      onClick={() => { onOpen(notif.appId); onDismiss(notif.uid); }}
      role="alertdialog"
      aria-label={`${notif.title}: ${notif.body}`}
    >
      <div
        className="rounded-2xl overflow-hidden flex items-start gap-3 px-3.5 py-3"
        style={{
          background: 'var(--sky-surface)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          border: `1px solid rgba(255,255,255,0.12)`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px ${notif.color}33`,
        }}
      >
        {/* App icon */}
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white shrink-0 mt-0.5"
          style={{
            background: `linear-gradient(145deg, ${notif.color}dd, ${notif.color}88)`,
            boxShadow: `0 2px 8px ${notif.color}55`,
          }}
        >
          {notif.icon}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-[12px] font-semibold truncate"
              style={{ color: 'var(--sky-text)' }}
            >
              {notif.title}
            </span>
            <span
              className="text-[10px] shrink-0"
              style={{ color: 'var(--sky-text-secondary)', opacity: 0.5 }}
            >
              now
            </span>
          </div>
          <p
            className="text-[12px] leading-snug mt-0.5"
            style={{ color: 'var(--sky-text-secondary)' }}
          >
            {notif.body}
          </p>
        </div>

        {/* Accent stripe */}
        <div
          className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
          style={{ background: accentColor, opacity: 0.7 }}
        />
      </div>
    </motion.div>
  );
}

// ── NotificationSystem ────────────────────────────────────────────────────
interface NotificationSystemProps {
  active: boolean;
  onOpenApp: (appId: string) => void;
}

export default function NotificationSystem({ active, onOpenApp }: NotificationSystemProps) {
  const reduced   = usePrefersReducedMotion();
  const { theme } = useTheme();
  const [queue, setQueue] = useState<ActiveNotif[]>([]);
  const poolIdxRef = useRef(Math.floor(Math.random() * POOL.length));
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  const accentColor = theme === 'moon' ? '#C1913F' : '#7AA0C8';

  const dismiss = useCallback((uid: number) => {
    setQueue((prev) => prev.filter((n) => n.uid !== uid));
  }, []);

  const scheduleNext = useCallback(() => {
    timerRef.current = setTimeout(() => {
      const def = POOL[poolIdxRef.current % POOL.length];
      poolIdxRef.current++;
      const notif: ActiveNotif = { ...def, uid: ++uidCounter };
      setQueue((prev) => [...prev.slice(-2), notif]); // keep at most 3 visible
      scheduleNext();
    }, randomDelay());
  }, []);

  useEffect(() => {
    if (!active) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    // Fire first notification after a short warmup
    timerRef.current = setTimeout(() => {
      scheduleNext();
    }, 1000); // first one after 30s

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, scheduleNext]);

  return (
    <div
      className="fixed z-[8500] flex flex-col gap-2 items-end"
      style={{ top: 48, right: 12, pointerEvents: queue.length ? 'auto' : 'none' }}
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence mode="sync">
        {queue.map((notif) => (
          <Banner
            key={notif.uid}
            notif={notif}
            onDismiss={dismiss}
            onOpen={onOpenApp}
            reduced={reduced}
            accentColor={accentColor}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
