import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Disc3, Play, Music, ExternalLink } from 'lucide-react';

interface Track {
  id: number;
  title: string;
  artist: string;
  type: 'spotify' | 'youtube';
  embedUrl: string;
  duration: string;
}

const tracks: Track[] = [
  {
    id: 1,
    title: '[Track Title 1]',
    artist: '[Artist Name]',
    type: 'spotify',
    embedUrl: 'https://open.spotify.com/embed/track/4uLU6hMCjMI75M1A2LhP1j',
    duration: '3:42',
  },
  {
    id: 2,
    title: '[Track Title 2]',
    artist: '[Artist Name]',
    type: 'youtube',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '3:32',
  },
  {
    id: 3,
    title: '[Track Title 3]',
    artist: '[Artist Name]',
    type: 'spotify',
    embedUrl: 'https://open.spotify.com/embed/track/11dFghVXANMlKmJXsNCbNl',
    duration: '3:53',
  },
  {
    id: 4,
    title: '[Track Title 4]',
    artist: '[Artist Name]',
    type: 'youtube',
    embedUrl: 'https://www.youtube.com/embed/9bZkp7q19f0',
    duration: '4:12',
  },
];

export default function MixtapeApp() {
  const [selectedTrack, setSelectedTrack] = useState<Track>(tracks[0]);

  return (
    <div className="h-full flex flex-col bg-[#F5F5F7] rounded-b-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-black/5">
        <Disc3 className="w-4 h-4 text-[#FF5F57]" />
        <span className="text-xs font-semibold text-[#1D1D1F]">Mixtape</span>
        <span className="text-xs text-[#6E6E73] ml-2">{tracks.length} tracks</span>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
        {/* Track List Sidebar */}
        <div className="w-full sm:w-52 border-b sm:border-b-0 sm:border-r border-black/5 flex flex-col shrink-0">
          <div className="flex-1 overflow-y-auto py-1">
            {tracks.map((track) => (
              <button
                key={track.id}
                onClick={() => setSelectedTrack(track)}
                className={`w-full text-left px-3 py-2.5 transition-colors cursor-pointer flex items-center gap-2 ${
                  selectedTrack.id === track.id
                    ? 'bg-[#FF5F57]/10'
                    : 'hover:bg-black/5'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  selectedTrack.id === track.id ? 'bg-[#FF5F57]' : 'bg-[#E5E5EA]'
                }`}>
                  {selectedTrack.id === track.id ? (
                    <Play className="w-3 h-3 text-white fill-white" />
                  ) : (
                    <Music className="w-3 h-3 text-[#6E6E73]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-[13px] font-medium truncate ${selectedTrack.id === track.id ? 'text-[#1D1D1F]' : 'text-[#1D1D1F]/80'}`}>
                    {track.title}
                  </p>
                  <p className="text-[11px] text-[#6E6E73] truncate">{track.artist}</p>
                </div>
                <span className="text-[10px] text-[#6E6E73]/60 shrink-0">{track.duration}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Player Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTrack.id}
              className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {/* Track Info */}
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-[#FF5F57] flex items-center justify-center text-white mx-auto mb-3">
                  <Disc3 className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-[#1D1D1F]">{selectedTrack.title}</h3>
                <p className="text-sm text-[#6E6E73] mt-0.5">{selectedTrack.artist}</p>
                <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 bg-[#E5E5EA] rounded-full">
                  <span className="text-[10px] font-medium text-[#6E6E73] uppercase">
                    {selectedTrack.type}
                  </span>
                </div>
              </div>

              {/* Embed Area */}
              <div className="w-full max-w-md bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden">
                <div className="aspect-video w-full flex items-center justify-center bg-[#F5F5F7]">
                  <div className="text-center p-6">
                    <ExternalLink className="w-8 h-8 text-[#6E6E73] mx-auto mb-2" />
                    <p className="text-sm text-[#6E6E73]">
                      {selectedTrack.type === 'spotify' ? 'Spotify' : 'YouTube'} embed
                    </p>
                    <p className="text-xs text-[#6E6E73]/60 mt-1">
                      Replace with your real {selectedTrack.type === 'spotify' ? 'track/playlist' : 'video'} URL
                    </p>
                    <p className="text-[10px] text-[#6E6E73]/40 mt-2 font-mono break-all max-w-[200px] mx-auto">
                      {selectedTrack.embedUrl}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
