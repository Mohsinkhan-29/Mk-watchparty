import { useEffect, useRef, useState } from 'react';

export default function Chat({ socket, roomId, name, initialMessages = [] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState('');
  const listRef = useRef(null);

  useEffect(() => setMessages(initialMessages), [initialMessages]);

  useEffect(() => {
    const onMessage = (msg) => setMessages((prev) => [...prev, msg]);
    socket.on('chat-message', onMessage);
    return () => socket.off('chat-message', onMessage);
  }, [socket]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

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
    </div>
  );
}
