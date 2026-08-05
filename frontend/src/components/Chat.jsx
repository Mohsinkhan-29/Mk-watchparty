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
  const audioElementRef = useRef(null);

  useEffect(() => setMessages(initialMessages), [initialMessages]);

  useEffect(() => {
    const onMessage = (msg) => setMessages((prev) => [...prev, msg]);
    socket.on('chat-message', onMessage);
    return () => socket.off('chat-message', onMessage);
  }, [socket]);

  // Handle incoming voice data from socket
  useEffect(() => {
    const onVoiceStart = (data) => {
      setActiveSpeaker(data.userName);
      window.dispatchEvent(new CustomEvent('voice-active', { detail: { active: true } }));
    };

    const onVoiceData = (data) => {
      if (audioElementRef.current && data.audioChunk) {
        const audioBlob = new Blob([data.audioChunk], { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        const player = new Audio(url);
        player.play().catch((err) => console.error('Audio play error:', err));
      }
    };

    const onVoiceEnd = () => {
      setActiveSpeaker(null);
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

      const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType: 'audio/webm' });

      // Emit chunk every time data is available (streaming mode)
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          const reader = new FileReader();
          reader.onloadend = () => {
            socket.emit('voice-chunk', {
              roomId,
              audioData: reader.result,
              userName: name,
            });
          };
          reader.readAsArrayBuffer(event.data);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setMicPermissionDenied(false);

      socket.emit('voice-start', { roomId, userName: name });
      window.dispatchEvent(new CustomEvent('voice-active', { detail: { active: true } }));

      // Record in 250ms slice intervals for low latency transmission
      mediaRecorder.start(250);
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

      socket.emit('voice-end', { roomId });
      window.dispatchEvent(new CustomEvent('voice-active', { detail: { active: false } }));
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

      {/* Walkie-Talkie Button */}
      <div className="p-3 border-t border-panel2">
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={stopRecording}
          onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
          onTouchEnd={(e) => { e.preventDefault(); stopRecording(); }}
          className={`w-full py-3 rounded-sm font-display font-semibold transition select-none ${isRecording
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-green-600 text-white hover:brightness-110'
            } ${micPermissionDenied ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={micPermissionDenied}
        >
          {isRecording ? '🎤 TRANSMITTING...' : '🎤 HOLD TO TALK'}
        </button>
        {micPermissionDenied && (
          <p className="text-xs text-red-400 mt-2 text-center">
            Microphone access denied. Please enable it in browser settings.
          </p>
        )}
      </div>

      <audio ref={audioElementRef} className="hidden" />
    </div>
  );
}