import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Images,
  StickyNote,
  Gamepad2,
  Disc3,
  Settings,
  Mail,
  Heart,
  Star,
  Gift,
  MessageCircle,
  Terminal,
} from 'lucide-react';
import { sound } from '../lib/sound';
import { usePrefersReducedMotion } from '../lib/usePrefersReducedMotion';
import { useMinimizedWindows } from '../lib/MinimizedWindowsContext';

export interface DockApp {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

interface DockProps {
  onOpenApp: (app: DockApp) => void;
  openAppIds?: string[];
}

export const apps: DockApp[] = [
  { id: 'memories', name: 'Memories',     icon: <Images          className="w-full h-full" />, color: '#C1913F' },
  { id: 'notes',    name: 'Notes',        icon: <StickyNote      className="w-full h-full" />, color: '#11284F' },
  { id: 'jokes',    name: 'Inside Jokes', icon: <Gamepad2        className="w-full h-full" />, color: '#8A6535' },
  { id: 'mixtape',  name: 'Mixtape',      icon: <Disc3           className="w-full h-full" />, color: '#1A3A6A' },
  { id: 'terminal', name: 'Terminal',     icon: <Terminal        className="w-full h-full" />, color: '#1A3A2A' },
  { id: 'messages', name: 'Messages',     icon: <MessageCircle   className="w-full h-full" />, color: '#234A7A' },
  { id: 'mail',     name: 'Mail',         icon: <Mail            className="w-full h-full" />, color: '#0D1840' },
  { id: 'wishlist', name: 'Wishlist',     icon: <Gift            className="w-full h-full" />, color: '#7A4A1A' },
  { id: 'favorites',name: 'Favorites',    icon: <Heart           className="w-full h-full" />, color: '#9A3A2A' },
  { id: 'settings', name: 'Settings',     icon: <Settings        className="w-full h-full" />, color: '#2A3A5A' },
];

const MOBILE_IDS = ['memories', 'notes', 'jokes', 'mixtape', 'messages', 'mail', 'settings','wishlist'];

function DockIcon({
  app,
  onOpen,
  reduced,
  isOpen,
}: {
  app: DockApp;
  onOpen: (app: DockApp) => void;
  reduced: boolean;
  isOpen: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [bouncing, setBouncing] = useState(false);
  const { isMinimized, restore } = useMinimizedWindows();
  const minimized = isMinimized(app.id);

  const handleClick = () => {
    sound.play('click');
    if (!reduced) {
      setBouncing(true);
      setTimeout(() => setBouncing(false), 400);
    }
    if (minimized) {
      restore(app.id);
    } else {
      onOpen(app);
    }
  };

  return (
    <motion.button
      className="relative flex flex-col items-center cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      aria-label={minimized ? `Restore ${app.name}` : `Open ${app.name}`}
      animate={
        reduced
          ? { y: 0, scale: 1 }
          : {
              y: bouncing ? [0, -16, 0] : hovered ? -8 : 0,
              scale: hovered ? 1.28 : 1,
            }
      }
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 20,
        duration: bouncing ? 0.4 : 0.2,
      }}
    >
      <div
        className="w-11 h-11 sm:w-12 sm:h-12 rounded-[14px] flex items-center justify-center text-white shadow-lg"
        style={{
          background: `linear-gradient(145deg, ${app.color}ee, ${app.color}88)`,
          boxShadow: `0 4px 12px ${app.color}55`,
          border: '1px solid rgba(255,255,255,0.12)',
          opacity: minimized ? 0.7 : 1,
        }}
      >
        {app.icon}
      </div>

      {/* Open dot — dimmer when the window is minimized */}
      {isOpen && (
        <span
          className="absolute -bottom-1.5 w-1 h-1 rounded-full"
          style={{ background: minimized ? 'var(--sky-text-secondary)' : 'var(--sky-accent)' }}
          aria-hidden
        />
      )}

      {/* Tooltip */}
      <motion.span
        className="absolute -top-8 text-xs font-medium px-2 py-1 rounded-md whitespace-nowrap pointer-events-none"
        style={{
          background: 'var(--sky-surface)',
          color: 'var(--sky-text)',
          border: '1px solid var(--sky-border)',
        }}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 4 }}
        transition={{ duration: 0.15 }}
      >
        {app.name}
      </motion.span>
    </motion.button>
  );
}

export default function Dock({ onOpenApp, openAppIds = [] }: DockProps) {
  const reduced = usePrefersReducedMotion();
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches;
  const visible = isMobile ? apps.filter((a) => MOBILE_IDS.includes(a.id)) : apps;
  const openSet = new Set(openAppIds);

  return (
    <motion.div
      className="fixed bottom-3 left-1/2 z-[8000] max-w-[96vw]"
      initial={reduced ? { opacity: 0 } : { y: 100, opacity: 0, x: '-50%' }}
      animate={reduced ? { opacity: 1, x: '-50%' } : { y: 0, opacity: 1, x: '-50%' }}
      transition={{
        duration: reduced ? 0.1 : 0.6,
        ease: 'easeOut',
        delay: 0.3,
        type: 'spring',
        stiffness: 120,
        damping: 18,
      }}
    >
      <div
        className="flex items-center gap-1.5 sm:gap-2.5 px-3 py-2.5 sm:px-4 sm:py-3 rounded-3xl overflow-x-auto no-scrollbar"
        style={{
          background: 'var(--sky-surface)',
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          border: '1px solid var(--sky-border)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        {visible.map((app) => (
          <DockIcon
            key={app.id}
            app={app}
            onOpen={onOpenApp}
            reduced={reduced}
            isOpen={openSet.has(app.id)}
          />
        ))}
      </div>
    </motion.div>
  );
}