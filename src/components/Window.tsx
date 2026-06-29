import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DockApp } from './Dock';
import { MemoriesApp, NotesApp, InsideJokesApp, MixtapeApp, TerminalApp, WishlistApp } from './apps';
import SettingsApp from './apps/SettingsApp';
import { usePrefersReducedMotion } from '../lib/usePrefersReducedMotion';
import { useMinimizedWindows } from '../lib/MinimizedWindowsContext';

interface WindowProps {
  app: DockApp;
  onClose: () => void;
  onFocus: () => void;
  isActive: boolean;
  zIndex: number;
}

const MOBILE_QUERY = '(max-width: 640px)';
const DEFAULT_WIDTH = 500;
const DEFAULT_HEIGHT = 450;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia(MOBILE_QUERY).matches
      : false
  );
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia(MOBILE_QUERY);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

interface Rect { x: number; y: number; width: number; height: number }

export default function Window({ app, onClose, onFocus, isActive, zIndex }: WindowProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const reduced = usePrefersReducedMotion();
  const { isMinimized: checkMinimized, minimize, restore } = useMinimizedWindows();
  const minimized = checkMinimized(app.id);
  void restore; // restoring is triggered from Dock.tsx via the same shared context

  const [rect, setRect] = useState<Rect>({ x: 100, y: 80, width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
  const [maximized, setMaximized] = useState(false);
  const prevRect = useRef<Rect>(rect);

  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const rectStart = useRef(rect);

  useEffect(() => {
    if (isMobile || maximized) return;
    const snap = () => {
      setRect((r) => ({
        ...r,
        x: Math.max(20, Math.min(100, window.innerWidth - r.width - 20)),
        y: Math.max(44, Math.min(80, window.innerHeight - r.height - 80)),
      }));
    };
    snap();
    window.addEventListener('resize', snap);
    return () => window.removeEventListener('resize', snap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  const handleTitleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isMobile || maximized) return;
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      rectStart.current = { ...rect };
      onFocus();
    },
    [rect, onFocus, isMobile, maximized]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      setRect((r) => ({
        ...r,
        x: Math.max(0, Math.min(window.innerWidth - r.width, rectStart.current.x + e.clientX - dragStart.current.x)),
        y: Math.max(36, Math.min(window.innerHeight - 100, rectStart.current.y + e.clientY - dragStart.current.y)),
      }));
    },
    [isDragging]
  );

  useEffect(() => {
    if (!isDragging) return;
    const up = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', up);
    };
  }, [isDragging, handleMouseMove]);

  const handleMinimize = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      minimize(app.id);
    },
    [minimize, app.id]
  );

  const handleMaximize = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (maximized) {
        setRect(prevRect.current);
        setMaximized(false);
      } else {
        prevRect.current = rect;
        setRect({
          x: 16,
          y: 44,
          width: window.innerWidth - 32,
          height: window.innerHeight - 44 - 96,
        });
        setMaximized(true);
      }
      onFocus();
    },
    [maximized, rect, onFocus]
  );

  const style: React.CSSProperties = isMobile
    ? { left: 0, top: 0, right: 0, bottom: 0, zIndex, borderRadius: 0 }
    : { left: rect.x, top: rect.y, width: rect.width, height: rect.height, zIndex };

  return (
    <AnimatePresence>
      {!minimized && (
        <motion.div
          ref={windowRef}
          className={
            isMobile
              ? 'fixed inset-0 overflow-hidden flex flex-col'
              : 'fixed overflow-hidden rounded-xl flex flex-col'
          }
          style={{
            ...style,
            background: 'var(--sky-surface)',
            backdropFilter: 'blur(28px) saturate(180%)',
            WebkitBackdropFilter: 'blur(28px) saturate(180%)',
            border: '1px solid var(--sky-border)',
            boxShadow: isActive
              ? '0 32px 64px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px var(--sky-accent), 0 0 18px 4px color-mix(in srgb, var(--sky-accent) 45%, transparent)'
              : '0 12px 32px rgba(0,0,0,0.4)',
            cursor: isDragging ? 'grabbing' : 'default',
            transition: isDragging ? 'none' : 'left 0.28s ease, top 0.28s ease, width 0.28s ease, height 0.28s ease',
          }}
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 20 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.15, y: 280 }}
          transition={{ duration: reduced ? 0.1 : 0.28, ease: 'easeOut' }}
          onMouseDown={onFocus}
        >
          {/* Title bar */}
          <div
  className="relative h-9 flex items-center px-3 shrink-0 select-none"
  style={{
    background: 'rgba(0,0,0,0.15)',
    borderBottom: '1px solid var(--sky-border)',
    cursor: isMobile || maximized ? 'default' : isDragging ? 'grabbing' : 'grab',
  }}
  onMouseDown={handleTitleMouseDown}
  onDoubleClick={handleMaximize}
>
  {/* Traffic lights */}
  <div className="relative z-10 flex items-center gap-1.5">
    ...
    {/* your three buttons */}
    ...
  </div>

  {/* Centered title */}
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <span
      className="text-[13px] font-medium"
      style={{ color: 'var(--sky-text-secondary)' }}
    >
      {app.name}
    </span>
  </div>
</div>

          {/* Content */}
          <div className="flex-1 overflow-hidden" style={{ color: 'var(--sky-text)' }}>
            {app.id === 'memories' && <MemoriesApp />}
            {app.id === 'notes' && <NotesApp />}
            {app.id === 'jokes' && <InsideJokesApp />}
            {app.id === 'mixtape'  && <MixtapeApp />}
            {app.id === 'terminal' && <TerminalApp />}
            {app.id === 'settings' && <SettingsApp />}
            {app.id === 'wishlist' && <WishlistApp />}
            {!['memories', 'notes', 'jokes', 'mixtape', 'terminal', 'settings'].includes(app.id) && (
              <div className="p-6 h-full flex flex-col items-center justify-center text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-4"
                  style={{ backgroundColor: app.color }}
                >
                  {app.icon}
                </div>
                <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--sky-text)' }}>
                  {app.name}
                </h2>
                <p className="text-sm" style={{ color: 'var(--sky-text-secondary)' }}>
                  Coming soon...
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
