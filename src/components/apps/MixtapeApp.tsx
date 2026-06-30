import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {  Disc3,  Play,  Pause,  SkipBack,  SkipForward,  Music2,Shuffle,} from 'lucide-react';
import { Repeat } from 'lucide-react';
import astronomy from '../../assets/music/Conan Gray - Astronomy.mp3';
import eighteen from '../../assets/music/One Direction - 18 (Audio).mp3';
import invisibleString from '../../assets/music/Taylor Swift  invisible string.mp3';
import theParty from '../../assets/music/The Weeknd - The Party & The After Party.mp3';
import darkhaast from '../../assets/music/DARKHAAST.mp3';
import fineLine from '../../assets/music/Fine Line.mp3';
import defenceless from '../../assets/music/Defenceless.mp3';
import bird2 from '../../assets/music/bird2.mp3';
import angelsFly from '../../assets/music/Angels.mp3';
import pp from '../../assets/music/pp.mp3';
interface Track {
  id: number;
  title: string;
  artist: string;
  duration: string; // shown in the sidebar before the real duration loads
  audioUrl?: string; // a direct, playable file e.g. '/audio/track1.mp3' — enables full playback + waveform
  externalUrl?: string; // Spotify/YouTube link fallback if there's no audio file for this track
}

const tracks: Track[] = [
  { id: 1, title: '18', artist: 'One Direction', duration: '4:09', audioUrl: eighteen },
  { id: 2, title: 'Invisible String', artist: 'Taylor Swift', duration: '4:14', audioUrl: invisibleString },
  { id: 3, title: 'Astronomy', artist: 'Conan Gray', duration: '4:04', audioUrl: astronomy },
  { id: 4, title: 'The Party & The After Party', artist: 'The Weeknd', duration: '7:44', audioUrl: theParty },
  { id: 5, title: 'Darkhaast', artist: 'Arijit Singh & Sunidhi Chauhan', duration: '6:15', audioUrl: darkhaast },
  { id: 7, title: 'Defenceless', artist: 'Louis Tomlinson', duration: '3:59', audioUrl: defenceless },
  { id: 6, title: 'Fine Line', artist: 'Harry Styles', duration: '6:20', audioUrl: fineLine },  
  { id: 8, title: 'The Birds (Part 2)', artist: 'The Weeknd', duration: '5:56', audioUrl: bird2 },
  { id: 9, title: 'Angels Fly', artist: 'Louis Tomlinson', duration: '3:38', audioUrl: angelsFly },
  { id: 10, title: 'Proper Patola', artist: 'Badshah, Diljit & Aastha', duration: '3:01', audioUrl: pp },
];

function formatTime(sec: number) {
  if (!isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Decodes the real audio file and reduces it to a small set of peak values —
// this is an actual waveform of the actual file, not a decorative animation.
async function getWaveformPeaks(url: string, barCount = 76): Promise<number[]> {
  const AudioCtxClass =
    window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtxClass();
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  const channel = audioBuffer.getChannelData(0);
  const blockSize = Math.max(1, Math.floor(channel.length / barCount));
  const peaks: number[] = [];
  for (let i = 0; i < barCount; i++) {
    let max = 0;
    const start = i * blockSize;
    for (let j = 0; j < blockSize; j++) {
      const v = Math.abs(channel[start + j] ?? 0);
      if (v > max) max = v;
    }
    peaks.push(max);
  }
  ctx.close();
  const peakMax = Math.max(...peaks, 0.0001);
  const normalized = peaks.map((p) => p / peakMax);

return normalized.map((_, i) => {
  const a = normalized[Math.max(0, i - 1)];
  const b = normalized[i];
  const c = normalized[Math.min(normalized.length - 1, i + 1)];

  return (a + b + c) / 3;
});
}

function Waveform({
  peaks,
  progress,
  onSeek,
  accent = 'var(--sky-accent)',
}: {
  peaks: number[];
  progress: number;
  onSeek: (fraction: number) => void;
  accent?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      onClick={(e) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        onSeek((e.clientX - rect.left) / rect.width);
      }}
      className="flex items-end gap-[1px] h-12 w-full cursor-pointer"
    >
      {peaks.map((p, i) => {
        const played = i / peaks.length < progress;

        return (
          <motion.div
            key={i}
            animate={{
              scaleY: played && progress > 0
                ? [1, 1.15, 1]
                : 1
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.015
            }}
            style={{
              flex: 1,
              height: `${18 + p * 42}%`,
              borderRadius: 999,
              background: played
                ? accent
                : '#D6D6DA',
              opacity: played ? 1 : 0.75,
            }}
          />
        );
      })}
    </div>
  );
  
}

export default function MixtapeApp() {
  const [selectedTrack, setSelectedTrack] = useState<Track>(tracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [peaks, setPeaks] = useState<number[] | null>(null);
  const [peaksLoading, setPeaksLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasAudio = Boolean(selectedTrack.audioUrl);

  // Decode the waveform whenever the selected track changes
  useEffect(() => {
    setPeaks(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (!selectedTrack.audioUrl) return;
    setPeaksLoading(true);
    getWaveformPeaks(selectedTrack.audioUrl)
      .then(setPeaks)
      .catch((err) => console.error('Waveform decode failed:', err))
      .finally(() => setPeaksLoading(false));
  }, [selectedTrack.audioUrl]);
  useEffect(() => {
  if (
    shouldAutoPlay &&
    audioRef.current &&
    selectedTrack.audioUrl
  ) {
    audioRef.current.play().catch(() => {});
  }
}, [selectedTrack, shouldAutoPlay]);

  const playNext = useCallback(() => {
  if (shuffle) {
    const random = Math.floor(Math.random() * tracks.length);
    setShouldAutoPlay(true);
    setSelectedTrack(tracks[random]);
    return;
  }

  const idx = tracks.findIndex((t) => t.id === selectedTrack.id);
  setSelectedTrack(tracks[(idx + 1) % tracks.length]);
}, [selectedTrack, shuffle]);

  const playPrev = useCallback(() => {
    const idx = tracks.findIndex((t) => t.id === selectedTrack.id);
    setSelectedTrack(tracks[(idx - 1 + tracks.length) % tracks.length]);
    setShouldAutoPlay(true);
  }, [selectedTrack]);

  const handlePlayPause = useCallback(() => {
  const audio = audioRef.current;
  if (!audio) return;

  if (isPlaying) {
    audio.pause();
  } else {
    setShouldAutoPlay(true);
    audio.play();
  }
}, [isPlaying]);

  const handleSeek = useCallback(
    (fraction: number) => {
      const audio = audioRef.current;
      if (!audio || !duration) return;
      audio.currentTime = fraction * duration;
    },
    [duration]
  );

  const progress = duration ? currentTime / duration : 0;

  return (
    <div className="h-full flex flex-col bg-[#F5F5F7] rounded-b-xl overflow-hidden">
      {hasAudio && (
        <audio
          ref={audioRef}
          src={selectedTrack.audioUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => {
  if (repeat && audioRef.current) {
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  } else {
    playNext();
  }
}}
        />
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-black/5">
        <Disc3 className="w-4 h-4 text-[var(--sky-accent)]" />
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
                  selectedTrack.id === track.id ? 'bg-[rgba(193,145,63,0.12)]/10' : 'hover:bg-black/5'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    selectedTrack.id === track.id ? 'bg-[var(--sky-accent)]' : 'bg-[#E5E5EA]'
                  }`}
                >
                  {selectedTrack.id === track.id && isPlaying ? (
                    <Pause className="w-3 h-3 text-white fill-white" />
                  ) : selectedTrack.id === track.id ? (
                    <Play className="w-3 h-3 text-white fill-white" />
                  ) : (
                    <Music2 className="w-3 h-3 text-[#6E6E73]" />
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
              <div className="text-center mb-5">
                <button
  onClick={handlePlayPause}
  disabled={!hasAudio}
  aria-label={isPlaying ? 'Pause' : 'Play'}
  className="relative mx-auto mb-3 cursor-pointer group"
>
  <motion.div
    animate={{
      rotate: isPlaying ? 360 : 0,
      scale: isPlaying ? [1, 1.03, 1] : 1,
    }}
    transition={{
      rotate: {
        duration: 10,
        repeat: Infinity,
        ease: "linear",
      },
      scale: {
        duration: 2,
        repeat: Infinity,
      },
    }}
    className="relative w-24 h-24"
  >
    <div
  className="absolute inset-0 rounded-full"
  style={{
    background:
      "radial-gradient(circle at 30% 30%, #F7E8B8 0%, #D7B15C 70%, #B68A34 100%)",
    boxShadow: "0 0 30px rgba(193,145,63,.45)",
  }}
/>
<div
  className="absolute rounded-full"
  style={{
    width: 16,
    height: 16,
    top: 18,
    left: 50,
    background: "rgba(0,0,0,.08)",
  }}
/>

<div
  className="absolute rounded-full"
  style={{
    width: 10,
    height: 10,
    top: 52,
    left: 28,
    background: "rgba(0,0,0,.06)",
  }}
/>

<div
  className="absolute rounded-full"
  style={{
    width: 8,
    height: 8,
    top: 60,
    left: 58,
    background: "rgba(0,0,0,.05)",
  }}
/>
<div className="absolute inset-0 flex items-center justify-center">
  {isPlaying ? (
    <Pause className="w-7 h-7 text-[#11284F]" />
  ) : (
    <Play className="w-7 h-7 ml-1 text-[#11284F]" fill="currentColor" />
  )}
</div>
  </motion.div>
</button>
                <h3 className="text-base font-semibold text-[#1D1D1F]">{selectedTrack.title}</h3>
                <p className="text-sm text-[#6E6E73] mt-0.5">{selectedTrack.artist}</p>
              </div>

              {hasAudio ? (
                <div className="w-full max-w-md">
                  {peaksLoading || !peaks ? (
                    <div className="h-10 flex items-center justify-center text-xs text-[#6E6E73]">
                      Loading waveform…
                    </div>
                  ) : (
                    <Waveform peaks={peaks} progress={progress} onSeek={handleSeek} accent="var(--sky-accent)" />
                    
                  )}
                  <div className="flex items-center justify-between mt-1 text-[11px] text-[#6E6E73] font-mono">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-4">
                    <button
  onClick={() => setShuffle(!shuffle)}
  className={`cursor-pointer transition-colors ${
    shuffle
      ? 'text-[var(--sky-accent)]'
      : 'text-[#6E6E73]'
  }`}
>
  <Shuffle className="w-4 h-4" />
</button>
                    <button
                      onClick={playPrev}
                      aria-label="Previous track"
                      className="text-[#6E6E73] hover:text-[#1D1D1F] transition-colors cursor-pointer"
                    >
                      <SkipBack className="w-5 h-5" fill="currentColor" />
                    </button>
                    <button
                      onClick={handlePlayPause}
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                      className="w-10 h-10 rounded-full bg-[#1D1D1F] text-white flex items-center justify-center cursor-pointer hover:brightness-110 transition-all"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4" fill="currentColor" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                      )}
                    </button>
                    <button
                      onClick={playNext}
                      aria-label="Next track"
                      className="text-[#6E6E73] hover:text-[#1D1D1F] transition-colors cursor-pointer"
                    >
                      <SkipForward className="w-5 h-5" fill="currentColor" />
                    </button>
                    <button
  onClick={() => setRepeat(!repeat)}
  className={repeat ? 'text-[var(--sky-accent)]' : 'text-[#6E6E73]'}
>
  <Repeat className="w-5 h-5" />
</button>

                  </div>
                </div>
              ) : (
                <div className="w-full max-w-md bg-white rounded-xl border border-black/5 shadow-sm p-6 text-center">
                  <p className="text-sm text-[#6E6E73]">No audio file linked for this track yet.</p>
                  {selectedTrack.externalUrl && (
                    <a
                      href={selectedTrack.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-3 text-xs font-medium text-[var(--sky-accent)] hover:underline"
                    >
                      Open in Spotify/YouTube instead →
                    </a>
                  )}
                  <p className="text-[11px] text-[#6E6E73]/70 mt-3">
                    Add a real audio file URL to this track's <code>audioUrl</code> to unlock the full player and waveform.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
