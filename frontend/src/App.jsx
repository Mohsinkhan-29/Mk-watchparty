import { useEffect, useState } from 'react';
import { useSocket } from './hooks/useSocket';
import Login from './components/Login';
import DrivePicker from './components/DrivePicker';
import VideoPlayer from './components/VideoPlayer';
import Chat from './components/Chat';
import RoomBar from './components/RoomBar';

function randomRoomCode() {
  return Math.random().toString(36).slice(2, 7).toUpperCase();
}

export default function App() {
 const { socket, latency } = useSocket();
  const [auth, setAuth] = useState(null); // { accessToken }
  const [name, setName] = useState('');
  const [roomInput, setRoomInput] = useState('');
  const [roomId, setRoomId] = useState(null);

  const [file, setFile] = useState(null);
  const [playback, setPlayback] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!roomId) return;
    socket.emit('join-room', { roomId, name });

    const onRoomState = (state) => {
      setFile(state.file);
      setPlayback(state.playback);
      setMessages(state.messages);
      setUsers(state.users);
    };
    const onFileSelected = (f) => setFile(f);
    const onUsers = (u) => setUsers(u);

    socket.on('room-state', onRoomState);
    socket.on('file-selected', onFileSelected);
    socket.on('users-updated', onUsers);
    return () => {
      socket.off('room-state', onRoomState);
      socket.off('file-selected', onFileSelected);
      socket.off('users-updated', onUsers);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  if (!auth) return <Login onAuth={setAuth} />;

  if (!roomId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full">
          <p className="font-display text-marquee tracking-[0.4em] text-xs mb-2 text-center">
            Mk watchparty
          </p>
          <h1 className="font-display text-3xl font-semibold mb-6 text-center">
            Join or start a room
          </h1>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-panel border border-panel2 rounded-sm px-3 py-2 mb-3 text-sm focus:outline-none focus:ring-1 focus:ring-marquee"
          />
          <input
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
            placeholder="Room code (leave blank to create one)"
            className="w-full bg-panel border border-panel2 rounded-sm px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-1 focus:ring-marquee"
          />
          <button
            disabled={!name.trim()}
            onClick={() => setRoomId(roomInput.trim() || randomRoomCode())}
            className="w-full bg-marquee text-void font-display font-semibold py-3 rounded-sm hover:brightness-110 disabled:opacity-50 transition"
          >
            {roomInput.trim() ? 'Join room' : 'Create room'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 md:px-10 md:py-10">
      <RoomBar roomId={roomId} users={users} latency={latency} />
      <div className="grid md:grid-cols-[1fr_320px] gap-6">
        <div>
          <VideoPlayer
            socket={socket}
            roomId={roomId}
            file={file}
            accessToken={auth.accessToken}
            initialPlayback={playback}
          />
          <div className="mt-4">
            <DrivePicker
              accessToken={auth.accessToken}
              onPick={({ fileId, fileName }) =>
                socket.emit('select-file', { roomId, fileId, fileName })
              }
            />
          </div>
        </div>
        <div className="h-[30vh] md:h-[70vh]">
          <Chat socket={socket} roomId={roomId} name={name} initialMessages={messages} />
        </div>
      </div>
    </div>
  );
}
