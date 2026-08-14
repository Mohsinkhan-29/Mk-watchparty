import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { API_BASE } from '../hooks/useSocket';

const DRIFT_TOLERANCE = 0.75;
const VOICE_VOLUME_REDUCTION = 0.3;

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '--:--';

  const total = Math.ceil(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  return hours
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    : `${minutes}:${String(secs).padStart(2, '0')}`;
}

export default function VideoPlayer({
  socket,
  roomId,
  file,
  initialPlayback,
  isHost,
  onWatchTimeTick,
}) {
  const videoRef = useRef(null);
  const suppressEmit = useRef(false);
  const originalVolume = useRef(1);

  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  const fileId = file?.fileId || file?.id;

  const src = useMemo(() => {
    if (!fileId || !roomId) return '';
    return `${API_BASE}/api/stream?${new URLSearchParams({ roomId })}`;
  }, [roomId, fileId]);

  const emit = useCallback(
    (action, time) => {
      if (!isHost || suppressEmit.current || !socket) return;
      socket.emit('playback-update', { roomId, action, currentTime: time });
    },
    [isHost, socket, roomId]
  );

  useEffect(() => {
    if (!socket) return;

    const applySync = (state) => {
      const video = videoRef.current;
      if (!video || !state) return;

      // The server sends the timestamp that is correct at the moment it emits.
      suppressEmit.current = true;

      if (Math.abs(video.currentTime - state.currentTime) > DRIFT_TOLERANCE) {
        video.currentTime = state.currentTime;
      }

      if (state.isPlaying && video.paused) {
        video.play()
          .then(() => setNeedsUserInteraction(false))
          .catch(() => setNeedsUserInteraction(true));
      } else if (!state.isPlaying && !video.paused) {
        video.pause();
      }

      window.setTimeout(() => {
        suppressEmit.current = false;
      }, 300);
    };

    if (initialPlayback) applySync(initialPlayback);

    socket.on('playback-sync', applySync);
    return () => socket.off('playback-sync', applySync);
  }, [socket, initialPlayback]);

  useEffect(() => {
    if (!onWatchTimeTick) return;

    const interval = window.setInterval(() => {
      const video = videoRef.current;
      if (video && !video.paused && !video.ended) onWatchTimeTick(5);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [onWatchTimeTick]);

  useEffect(() => {
    const onVoiceActive = (event) => {
      const video = videoRef.current;
      if (!video) return;

      if (event.detail?.active) {
        originalVolume.current = video.volume;
        video.volume = originalVolume.current * VOICE_VOLUME_REDUCTION;
      } else {
        video.volume = originalVolume.current;
      }
    };

    window.addEventListener('voice-active', onVoiceActive);
    return () => window.removeEventListener('voice-active', onVoiceActive);
  }, []);

  const updateVolume = (nextVolume) => {
    const video = videoRef.current;
    if (!video) return;

    const value = Math.max(0, Math.min(1, Number(nextVolume)));
    video.volume = value;
    video.muted = value === 0;
    setVolume(value);
    setMuted(video.muted);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setMuted(video.muted);
  };

  if (!fileId) {
    return (
      <div className="aspect-video w-full max-w-5xl bg-[#110726]/70 border border-purple-500/20 rounded-2xl flex items-center justify-center p-6">
        <p className="text-sm font-semibold text-purple-200/60">
          {isHost ? 'Choose a file from Google Drive.' : 'Waiting for the host to select a video…'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl">
      <div className="relative rounded-2xl overflow-hidden bg-[#090317] border border-purple-500/20">
        {!isHost && (
          <div className="absolute top-3 right-3 z-20 px-2.5 py-1 bg-black/70 rounded-md text-[10px] text-fuchsia-300">
            SYNCED VIEWER
          </div>
        )}

        {needsUserInteraction && !isHost && (
          <button
            type="button"
            onClick={() => videoRef.current?.play()
              .then(() => setNeedsUserInteraction(false))
              .catch(console.error)}
            className="absolute inset-0 z-30 bg-black/80 flex items-center justify-center text-white"
          >
            Click to join playback
          </button>
        )}

        <video
          ref={videoRef}
          key={fileId}
          src={src}
          crossOrigin="anonymous"
          controls={isHost}
          className={`w-full aspect-video bg-black object-contain outline-none ${
            !isHost ? 'pointer-events-none' : ''
          }`}
          onLoadedMetadata={(event) => {
            setDuration(event.currentTarget.duration);
            setCurrentTime(event.currentTarget.currentTime);
          }}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onVolumeChange={(event) => {
            setVolume(event.currentTarget.volume);
            setMuted(event.currentTarget.muted);
          }}
          onPlay={(event) => emit('play', event.currentTarget.currentTime)}
          onPause={(event) => emit('pause', event.currentTarget.currentTime)}
          onSeeked={(event) => emit('seek', event.currentTarget.currentTime)}
        />
      </div>

      <div className="mt-3.5 px-4 py-3 rounded-xl bg-[#110726]/60 border border-purple-500/15 flex flex-wrap items-center gap-4">
        <p className="text-xs font-semibold text-purple-200 truncate mr-auto">
          {file.fileName || file.name || 'Selected Video'}
        </p>

        <span className="text-xs text-purple-200/80 tabular-nums">
          {formatTime(Math.max(0, duration - currentTime))} left
        </span>

        <button
          type="button"
          onClick={toggleMute}
          className="text-xs text-purple-100 hover:text-white"
          aria-label={muted ? 'Unmute video' : 'Mute video'}
        >
          {muted ? 'Unmute' : 'Mute'}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={muted ? 0 : volume}
          onChange={(event) => updateVolume(event.target.value)}
          className="w-24 accent-fuchsia-500"
          aria-label="Video volume"
        />
      </div>
    </div>
  );
}