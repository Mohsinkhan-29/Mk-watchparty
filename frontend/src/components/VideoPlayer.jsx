import { useEffect, useRef } from 'react';
import { API_BASE } from '../hooks/useSocket';

const DRIFT_TOLERANCE = 1.2; // seconds — ignore small sync corrections

export default function VideoPlayer({ socket, roomId, file, accessToken, initialPlayback }) {
  const videoRef = useRef(null);
  const suppressEmit = useRef(false);

  // Apply remote playback events without re-broadcasting them.
  useEffect(() => {
    const applySync = (state) => {
      const video = videoRef.current;
      if (!video) return;
      suppressEmit.current = true;

      if (Math.abs(video.currentTime - state.currentTime) > DRIFT_TOLERANCE) {
        video.currentTime = state.currentTime;
      }
      if (state.isPlaying && video.paused) video.play().catch(() => {});
      if (!state.isPlaying && !video.paused) video.pause();

      setTimeout(() => (suppressEmit.current = false), 250);
    };

    if (initialPlayback) applySync(initialPlayback);
    socket.on('playback-sync', applySync);
    return () => socket.off('playback-sync', applySync);
  }, [socket, initialPlayback]);

  const emit = (action, currentTime) => {
    if (suppressEmit.current) return;
    socket.emit('playback-update', { roomId, action, currentTime });
  };

  if (!file) {
    return (
      <div className="aspect-video w-full bg-panel border border-panel2 flex items-center justify-center text-muted font-display tracking-wide">
        No video selected yet
      </div>
    );
  }

  const src = `${API_BASE}/api/stream?fileId=${encodeURIComponent(
    file.fileId
  )}&access_token=${encodeURIComponent(accessToken)}`;

  return (
    <div>
      <div className="sprocket-edge rounded-t-sm" />
      <video
        ref={videoRef}
        key={file.fileId}
        src={src}
        controls
        className="w-full aspect-video bg-black"
        onPlay={(e) => emit('play', e.currentTarget.currentTime)}
        onPause={(e) => emit('pause', e.currentTarget.currentTime)}
        onSeeked={(e) => emit('seek', e.currentTarget.currentTime)}
      />
      <div className="sprocket-edge rounded-b-sm" />
      <p className="text-sm text-muted mt-2 truncate">{file.fileName}</p>
    </div>
  );
}
