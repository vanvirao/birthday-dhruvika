import { apps } from './Dock';
import DesktopIcon from './DesktopIcon';
import SkyCanvas from './SkyCanvas';
import type { DockApp } from './Dock';
import AmbientSound from './AmbientSound';
import Fireflies from './Fireflies';

const DESKTOP_APP_IDS = ['memories', 'notes', 'jokes', 'mixtape', 'terminal', 'messages', 'wishlist'];
const desktopApps = apps.filter((a) => DESKTOP_APP_IDS.includes(a.id));

interface DesktopProps {
  onOpenApp: (app: DockApp) => void;
}

export default function Desktop({ onOpenApp }: DesktopProps) {
  return (
    <div className="fixed inset-0" style={{ zIndex: 0 }}>
      {/* Animated sky background */}
      <SkyCanvas />
<Fireflies />
<AmbientSound />

      {/* Desktop icons — top-right grid */}
      <div
        className="absolute top-16 right-4 flex flex-col gap-2 items-end"
        style={{ zIndex: 10 }}
        aria-label="Desktop icons"
      >
        {desktopApps.map((app, i) => (
          <DesktopIcon key={app.id} app={app} index={i} onOpen={onOpenApp} />
        ))}
      </div>
    </div>
  );
}
