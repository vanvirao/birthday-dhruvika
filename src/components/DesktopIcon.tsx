import { useState } from 'react';
import { motion } from 'framer-motion';
import type { DockApp } from './Dock';
import { usePrefersReducedMotion } from '../lib/usePrefersReducedMotion';

interface DesktopIconProps {
  app: DockApp;
  index: number;
  onOpen: (app: DockApp) => void;
}

export default function DesktopIcon({ app, index, onOpen }: DesktopIconProps) {
  const [selected, setSelected] = useState(false);
  const reduced = usePrefersReducedMotion();

  const activate = () => onOpen(app);

  return (
    <motion.div
      className="flex flex-col items-center gap-1.5 cursor-pointer w-20 sm:w-24"
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
      transition={{ delay: reduced ? 0 : 0.5 + index * 0.08, duration: reduced ? 0.1 : 0.4, ease: 'easeOut' }}
      onClick={() => setSelected(true)}
      onDoubleClick={activate}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } }}
      onBlur={() => setSelected(false)}
      onFocus={() => setSelected(true)}
      tabIndex={0}
      role="button"
      aria-label={`Open ${app.name}`}
    >
      <div
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white"
        style={{
          background: `linear-gradient(145deg, ${app.color}ee, ${app.color}88)`,
          boxShadow: selected
            ? `0 0 0 2px var(--sky-accent), 0 4px 16px ${app.color}55`
            : `0 4px 16px ${app.color}44`,
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        {app.icon}
      </div>
      <span
        className="text-[11px] sm:text-xs font-medium text-center px-1.5 py-0.5 rounded leading-tight max-w-full truncate"
        style={{
          color: 'var(--sky-text)',
          textShadow: '0 1px 4px rgba(0,0,0,0.6)',
          background: selected ? 'var(--sky-accent)' : 'transparent',
        }}
      >
        {app.name}
      </span>
    </motion.div>
  );
}
