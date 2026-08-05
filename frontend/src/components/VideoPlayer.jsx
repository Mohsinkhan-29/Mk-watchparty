import { useEffect, useRef } from 'react';
import { API_BASE } from '../hooks/useSocket';

const DRIFT_TOLERANCE = 1.2; // seconds — ignore small sync corrections
const VOICE_VOLUME_REDUCTION = 0.3; // Reduce video volume to 30% when voice is active

export default function VideoPlayer({ socket, roomId, file, accessToken, initialPlayback }) {
  const videoRef = useRef(null);
  const suppressEmit = useRef(false);
  const originalVolume = useRef(1);

  // Apply remote playback events without re-broadcasting them.
  useEffect(() => {
    const applySync = (state) => {
      const video = videoRef.current;
      if (!video) return;
      suppressEmit.current = true;

      if (Math.abs(video.currentTime - state.currentTime) > DRIFT_TOLERANCE) {
        video.currentTime = state.currentTime;
      }
      if (state.isPlaying && video.paused) video.play().catch(() => { });
      if (!state.isPlaying && !video.paused) video.pause();

      setTimeout(() => (suppressEmit.current = false), 250);
    };

    if (initialPlayback) applySync(initialPlayback);
    socket.on('playback-sync', applySync);
    return () => socket.off('playback-sync', applySync);
  }, [socket, initialPlayback]);

  // Handle voice activity to reduce video volume
  useEffect(() => {
    const handleVoiceActive = (event) => {
      const video = videoRef.current;
      if (!video) return;

      if (event.detail.active) {
        // Store original volume and reduce it
        originalVolume.current = video.volume;
        video.volume = originalVolume.current * VOICE_VOLUME_REDUCTION;
      } else {
        // Restore original volume
        video.volume = originalVolume.current;
      }
    };

    window.addEventListener('voice-active', handleVoiceActive);
    return () => window.removeEventListener('voice-active', handleVoiceActive);
  }, []);

  const emit = (action, currentTime) => {
    if (suppressEmit.current) return;
    socket.emit('playback-update', { roomId, action, currentTime });
  };

  if (!file) {
    return (
      <div className="aspect-video w-full bg-[#110726]/70 backdrop-blur-2xl border border-purple-500/20 rounded-2xl shadow-2xl shadow-purple-950/50 flex flex-col items-center justify-center gap-3 p-6 font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="w-12 h-12 rounded-2xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-fuchsia-300 shadow-inner">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm font-semibold tracking-wide text-purple-200/60">
          No video selected yet
        </p>
      </div>
    );
  }

  const src = `${API_BASE}/api/stream?fileId=${encodeURIComponent(
    file.fileId
  )}&access_token=${encodeURIComponent(accessToken)}`;

  return (
    <div className="font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Video Outer Glass Container */}
      <div className="relative group rounded-2xl overflow-hidden bg-[#090317] border border-purple-500/20 shadow-2xl shadow-purple-950/60">
        <video
          ref={videoRef}
          key={file.fileId}
          src={src}
          controls
          className="w-full aspect-video bg-black object-contain outline-none"
          onPlay={(e) => emit('play', e.currentTarget.currentTime)}
          onPause={(e) => emit('pause', e.currentTarget.currentTime)}
          onSeeked={(e) => emit('seek', e.currentTarget.currentTime)}
        />
      </div>

      {/* Video Details Card */}
      <div className="mt-3.5 px-4 py-3 rounded-xl bg-[#110726]/60 backdrop-blur-xl border border-purple-500/15 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-fuchsia-400 shrink-0" />
        <p className="text-xs font-semibold text-purple-200 truncate tracking-wide">
          {file.fileName}
        </p>
      </div>
    </div>
  );
}