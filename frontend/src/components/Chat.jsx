import { useEffect, useRef, useState } from 'react';

export default function Chat({ socket, roomId, name, initialMessages = [] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);

  const listRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => setMessages(initialMessages), [initialMessages]);

  // Handle incoming chat and room notifications
  useEffect(() => {
    if (!socket) return;

    // Direct chat message
    const onMessage = (msg) => setMessages((prev) => [...prev, msg]);

    // Host transfer notification
    const onHostUpdated = ({ hostId }) => {
      setMessages((prev) => [
        ...prev,
        {
          system: true,
          text: `👑 Host privileges transferred to user (${hostId.slice(0, 5)}...)`,
          at: Date.now(),
        },
      ]);
    };

    // Video media update notification
    const onFileChanged = (file) => {
      if (!file) return;
      const fileLabel = file.fileName || file.name || 'a new file';
      setMessages((prev) => [
        ...prev,
        {
          system: true,
          text: `🎬 Selected video changed to "${fileLabel}"`,
          at: Date.now(),
        },
      ]);
    };

    // Error messages from backend (e.g. non-host trying to play/select)
    const onError = (msg) => {
      setMessages((prev) => [
        ...prev,
        {
          system: true,
          text: `⚠️ ${msg}`,
          at: Date.now(),
        },
      ]);
    };

    socket.on('chat-message', onMessage);
    socket.on('host-updated', onHostUpdated);
    socket.on('file-changed', onFileChanged);
    socket.on('error-message', onError);

    return () => {
      socket.off('chat-message', onMessage);
      socket.off('host-updated', onHostUpdated);
      socket.off('file-changed', onFileChanged);
      socket.off('error-message', onError);
    };
  }, [socket]);

  // Handle incoming voice audio chunks
  useEffect(() => {
    if (!socket) return;

    const onVoiceStart = (data) => {
      setActiveSpeaker(data?.userName || 'Someone');
      window.dispatchEvent(new CustomEvent('voice-active', { detail: { active: true } }));
    };

    const onVoiceData = (data) => {
      const audioBuffer = data.audioData || data.audioChunk;
      if (audioBuffer) {
        const blob = new Blob([audioBuffer], { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);

        audio.play().catch((err) => console.error('Audio play error:', err));
        audio.onended = () => URL.revokeObjectURL(url);
      }
    };

    const onVoiceEnd = () => {
      setActiveSpeaker(null);
      window.dispatchEvent(new CustomEvent('voice-active', { detail: { active: false } }));
    };

    socket.on('voice-start', onVoiceStart);
    socket.on('voice-data', onVoiceData);
    socket.on('voice-chunk', onVoiceData);
    socket.on('voice-end', onVoiceEnd);

    return () => {
      socket.off('voice-start', onVoiceStart);
      socket.off('voice-data', onVoiceData);
      socket.off('voice-chunk', onVoiceData);
      socket.off('voice-end', onVoiceEnd);
    };
  }, [socket]);

  // Auto-scroll on new message
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const startRecording = async () => {
    try {
      if (!streamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
        });
        streamRef.current = stream;
      }

      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType: 'audio/webm' });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const fullBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          socket.emit('voice-data', {
            roomId,
            audioData: reader.result,
            userName: name,
          });
          socket.emit('voice-end', { roomId });
          window.dispatchEvent(new CustomEvent('voice-active', { detail: { active: false } }));
        };
        reader.readAsArrayBuffer(fullBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setMicPermissionDenied(false);

      socket.emit('voice-start', { roomId, userName: name });
      window.dispatchEvent(new CustomEvent('voice-active', { detail: { active: true } }));

      mediaRecorder.start();
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setMicPermissionDenied(true);
      } else {
        console.error('Error starting recording:', err);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const send = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    socket.emit('chat-message', { roomId, text, name });
    setDraft('');
  };

  return (
    <div className="flex flex-col h-full bg-[#110726]/70 backdrop-blur-2xl border border-purple-500/20 rounded-2xl overflow-hidden shadow-2xl shadow-purple-950/50 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-purple-500/20 bg-purple-950/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
          <p className="font-bold text-xs tracking-widest text-fuchsia-300 uppercase">
            ROOM CHAT
          </p>
        </div>
        {activeSpeaker && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium animate-pulse">
            <span>🎤</span>
            <span>{activeSpeaker} is speaking...</span>
          </div>
        )}
      </div>

      {/* Messages & System Notifications List */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scrollbar-thin scrollbar-thumb-purple-900 scrollbar-track-transparent"
      >
        {messages.map((m, i) =>
          m.system ? (
            <div
              key={i}
              className="my-1.5 px-3 py-1.5 rounded-lg bg-purple-950/40 border border-purple-500/15 text-[11px] text-fuchsia-200/80 text-center font-medium shadow-sm"
            >
              {m.text}
            </div>
          ) : (
            <div
              key={i}
              className="text-xs leading-relaxed bg-purple-950/30 border border-purple-500/10 rounded-xl p-2.5"
            >
              <span className="text-fuchsia-300 font-bold mr-1.5">{m.name}:</span>
              <span className="text-purple-100/90">{m.text}</span>
            </div>
          )
        )}
      </div>

      {/* Text Chat Form */}
      <form onSubmit={send} className="p-3 border-t border-purple-500/20 bg-purple-950/20 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Say something…"
          className="flex-1 bg-[#090317] border border-purple-500/30 rounded-xl px-3.5 py-2 text-xs text-purple-100 placeholder-purple-400/40 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-purple-600 via-purple-500 to-fuchsia-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
        >
          Send
        </button>
      </form>

      {/* Walkie-Talkie Button */}
      <div className="p-3 border-t border-purple-500/20 bg-purple-950/40">
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={stopRecording}
          onTouchStart={(e) => {
            e.preventDefault();
            startRecording();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            stopRecording();
          }}
          className={`w-full py-3 rounded-xl font-semibold text-xs tracking-wider transition-all duration-200 select-none shadow-md ${
            isRecording
              ? 'bg-rose-600 text-white animate-pulse shadow-rose-900/50'
              : 'bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-emerald-950/50 hover:scale-[1.01] active:scale-[0.99]'
          } ${micPermissionDenied ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={micPermissionDenied}
        >
          {isRecording ? '🎤 TRANSMITTING...' : '🎤 HOLD TO TALK'}
        </button>
        {micPermissionDenied && (
          <p className="text-[11px] text-rose-400/90 mt-2 text-center font-medium">
            Microphone access denied. Please enable it in browser settings.
          </p>
        )}
      </div>
    </div>
  );
}