// A small shared icon used anywhere we want a 5-step "filling up" moon-phase
// indicator instead of a plain progress bar (boot sequence, mixtape "progress").
export type PhaseKey = 'new' | 'crescent' | 'half' | 'gibbous' | 'full';

export const PHASE_ORDER: { key: PhaseKey; label: string }[] = [
  { key: 'new', label: 'New Moon' },
  { key: 'crescent', label: 'Crescent' },
  { key: 'half', label: 'Half Moon' },
  { key: 'gibbous', label: 'Gibbous' },
  { key: 'full', label: 'Full Moon' },
];

interface MoonPhaseIconProps {
  phase: PhaseKey;
  active: boolean;
  id: string; // must be unique per rendered icon (used for the SVG clipPath id)
  litColor?: string;
  size?: number;
}

export function MoonPhaseIcon({ phase, active, id, litColor = '#FF5F57', size = 16 }: MoonPhaseIconProps) {
  const lit = active ? litColor : 'rgba(255,255,255,0.18)';
  const dim = 'rgba(0,0,0,0.55)';
  return (
    <svg width={size} height={size} viewBox="0 0 18 18">
      <defs>
        <clipPath id={`pc-${id}`}>
          <circle cx="9" cy="9" r="7" />
        </clipPath>
      </defs>
      <g clipPath={`url(#pc-${id})`}>
        <circle cx="9" cy="9" r="7" style={{ fill: 'rgba(120,120,120,0.18)' }} />
        {phase === 'crescent' && (
          <>
            <circle cx="9" cy="9" r="7" style={{ fill: lit }} />
            <circle cx="4.5" cy="9" r="7" style={{ fill: dim }} />
          </>
        )}
        {phase === 'half' && <rect x="9" y="1" width="8" height="16" style={{ fill: lit }} />}
        {phase === 'gibbous' && (
          <>
            <circle cx="9" cy="9" r="7" style={{ fill: lit }} />
            <circle cx="4" cy="9" r="6" style={{ fill: dim }} />
          </>
        )}
        {phase === 'full' && <circle cx="9" cy="9" r="7" style={{ fill: lit }} />}
      </g>
      <circle
        cx="9" cy="9" r="7" fill="none"
        style={{ stroke: active ? lit : 'rgba(120,120,120,0.3)' }}
        strokeWidth="0.75"
      />
    </svg>
  );
}