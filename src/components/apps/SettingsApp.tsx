import { useWallpaperSettings } from '../../lib/WallpaperSettingsContext';

const PRESETS: { label: string; hour: number }[] = [
  { label: 'Dawn', hour: 5.5 },
  { label: 'Sunrise', hour: 7 },
  { label: 'Morning', hour: 9.5 },
  { label: 'Midday', hour: 13 },
  { label: 'Golden Hour', hour: 17.5 },
  { label: 'Dusk', hour: 19 },
  { label: 'Night', hour: 22 },
  { label: 'Late Night', hour: 1.5 },
];

export default function SettingsApp() {
  const { mode, overrideHour, previewTime, lockCurrentTime, resumeLiveSchedule } = useWallpaperSettings();

  const isLocked = mode === 'locked';

  return (
    <div className="p-5 flex flex-col gap-5 h-full overflow-y-auto" style={{ color: 'var(--sky-text)' }}>
      <div>
        <h2 className="text-lg font-semibold mb-1">Wallpaper</h2>
        <p className="text-sm opacity-70">
          Preview what the sky looks like at different times of day. Pick one to see it live behind this window.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {PRESETS.map((p) => {
          const active = mode !== 'live' && Math.abs(overrideHour - p.hour) < 0.01;
          return (
            <button
              key={p.label}
              onClick={() => previewTime(p.hour)}
              className="rounded-xl px-3 py-2 text-sm font-medium transition-colors"
              style={{
                background: active ? 'var(--sky-accent)' : 'rgba(255,255,255,0.08)',
                color: active ? '#0D0D0D' : 'var(--sky-text)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div
        className="flex items-center justify-between rounded-xl px-4 py-3"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <div className="pr-3">
          <p className="text-sm font-medium">Keep this permanently</p>
          <p className="text-xs opacity-60">
            {isLocked
              ? "Locked in — the sky won't change with the real time anymore."
              : mode === 'preview'
                ? 'Just previewing — this will revert once you leave or reset.'
                : "Off — the sky follows the real time of day."}
          </p>
        </div>
        <button
          role="switch"
          aria-checked={isLocked}
          onClick={() => (isLocked ? resumeLiveSchedule() : lockCurrentTime())}
          disabled={mode === 'live'}
          className="w-11 h-6 rounded-full relative transition-colors flex-shrink-0 disabled:opacity-30"
          style={{ background: isLocked ? 'var(--sky-accent)' : 'rgba(255,255,255,0.2)' }}
        >
          <span
            className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
            style={{ transform: isLocked ? 'translateX(20px)' : 'translateX(0)' }}
          />
        </button>
      </div>

      {mode !== 'live' && (
        <button
          onClick={resumeLiveSchedule}
          className="text-sm underline opacity-70 hover:opacity-100 self-start"
        >
          Reset to live time
        </button>
      )}
    </div>
  );
}