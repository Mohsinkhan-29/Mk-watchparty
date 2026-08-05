import { useEffect, useRef, useState } from 'react';

export default function Chat({ socket, roomId, name, initialMessages = [] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  
  const listRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const audioElementRef = useRef(null);

  useEffect(() => setMessages(initialMessages), [initialMessages]);

  useEffect(() => {
    const onMessage = (msg) => setMessages((prev) => [...prev, msg]);
    socket.on('chat-message', onMessage);
    return () => socket.off('chat-message', onMessage);
  }, [socket]);

  // Handle incoming voice data
  useEffect(() => {
    const onVoiceStart = (data) => {
      setActiveSpeaker(data.userName);
      // Emit event to reduce video volume
      window.dispatchEvent(new CustomEvent('voice-active', { detail: { active: true } }));
    };

    const onVoiceData = (data) => {
      if (audioElementRef.current) {
        const audioData = new Uint8Array(Object.values(data.audioChunk));
        const blob = new Blob([audioData], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        audioElementRef.current.src = url;
        audioElementRef.current.play().catch(() => {});
      }
    };

    const onVoiceEnd = () => {
      setActiveSpeaker(null);
      // Emit event to restore video volume
      window.dispatchEvent(new CustomEvent('voice-active', { detail: { active: false } }));
    };

    socket.on('voice-start', onVoiceStart);
    socket.on('voice-data', onVoiceData);
    socket.on('voice-end', onVoiceEnd);

    return () => {
      socket.off('voice-start', onVoiceStart);
      socket.off('voice-data', onVoiceData);
      socket.off('voice-end', onVoiceEnd);
    };
  }, [socket]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  const startRecording = async () => {
    try {
      if (!streamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
      }

      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'audio/webm',
      });

      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          socket.emit('voice-chunk', {
            roomId,
            audioData: reader.result,
            userName: name,
          });
        };
        reader.readAsArrayBuffer(blob);
      };

      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setMicPermissionDenied(false);
      
      // Emit voice start event
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
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Emit voice end event
      socket.emit('voice-end', { roomId });
      window.dispatchEvent(new CustomEvent('voice-active', { detail: { active: false } }));
    }
  };

  const handleMouseDown = () => {
    if (!micPermissionDenied) {
      startRecording();
    }
  };

  const handleMouseUp = () => {
    stopRecording();
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    if (!micPermissionDenied) {
      startRecording();
    }
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    stopRecording();
  };

  const send = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    socket.emit('chat-message', { roomId, text, name });
    setDraft('');
  };

  return (
    <div className="flex flex-col h-full bg-panel border border-panel2 rounded-sm">
      <div className="px-4 py-3 border-b border-panel2">
        <p className="font-display tracking-wide text-marquee text-sm">ROOM CHAT</p>
        {activeSpeaker && (
          <p className="text-xs text-green-400 mt-2 animate-pulse">
            🎤 {activeSpeaker} is speaking...
          </p>
        )}
      </div>
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.map((m, i) =>
          m.system ? (
            <p key={i} className="text-xs text-muted italic text-center">
              {m.text}
            </p>
          ) : (
            <div key={i} className="text-sm">
              <span className="text-marquee font-medium">{m.name}: </span>
              <span className="text-cream/90">{m.text}</span>
            </div>
          )
        )}
      </div>
      <form onSubmit={send} className="p-3 border-t border-panel2 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Say something…"
          className="flex-1 bg-void border border-panel2 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-marquee"
        />
        <button
          type="submit"
          className="bg-marquee text-void text-sm font-display px-4 rounded-sm hover:brightness-110 transition"
        >
          Send
        </button>
      </form>
      
      {/* Voice Button */}
      <div className="p-3 border-t border-panel2">
        <button
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={`w-full py-3 rounded-sm font-display font-semibold transition ${
            isRecording
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-green-600 text-white hover:brightness-110'
          } ${micPermissionDenied ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={micPermissionDenied}
          title="Hold to talk (walkie-talkie mode)"
        >
          {isRecording ? '🎤 RECORDING...' : '🎤 HOLD TO TALK'}
        </button>
        {micPermissionDenied && (
          <p className="text-xs text-red-400 mt-2 text-center">
            Microphone access denied. Please enable it in your browser settings.
          </p>
        )}
      </div>

      {/* Hidden audio element for playback */}
      <audio ref={audioElementRef} style={{ display: 'none' }} />
    </div>
  );
}