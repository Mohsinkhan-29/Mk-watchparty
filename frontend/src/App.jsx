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
      <div className="min-h-screen bg-[#090317] text-purple-100 font-['Plus_Jakarta_Sans',sans-serif] flex items-center justify-center px-4 relative overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-fuchsia-600/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-md w-full bg-[#110726]/70 backdrop-blur-2xl border border-purple-500/20 rounded-3xl p-8 shadow-2xl shadow-purple-950/80 relative z-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-400 animate-pulse" />
            <p className="font-bold text-xs tracking-[0.3em] text-fuchsia-300 uppercase">
              MK WATCHPARTY
            </p>
          </div>

          <h1 className="text-2xl font-extrabold text-white text-center mb-6 tracking-tight">
            Join or Start a Room
          </h1>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-purple-300/70 uppercase tracking-wider mb-1.5 ml-1">
                Your Display Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="name"
                className="w-full bg-[#090317] border border-purple-500/30 rounded-xl px-4 py-3 text-sm text-purple-100 placeholder-purple-400/30 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-purple-300/70 uppercase tracking-wider mb-1.5 ml-1">
                Room Code
              </label>
              <input
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                placeholder="Leave blank to create a new room"
                className="w-full bg-[#090317] border border-purple-500/30 rounded-xl px-4 py-3 text-sm text-purple-100 placeholder-purple-400/30 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all font-mono tracking-widest uppercase"
              />
            </div>

            <button
              disabled={!name.trim()}
              onClick={() => setRoomId(roomInput.trim() || randomRoomCode())}
              className="w-full mt-2 bg-gradient-to-r from-purple-600 via-purple-500 to-fuchsia-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:hover:scale-100 disabled:shadow-none transition-all duration-200 cursor-pointer"
            >
              {roomInput.trim() ? 'Join Room' : 'Create New Room'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090317] text-purple-100 font-['Plus_Jakarta_Sans',sans-serif] px-4 py-6 md:px-10 md:py-8 relative overflow-x-hidden">
      {/* Subtle Background Glows for Active Session */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-fuchsia-900/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-6">
        <RoomBar roomId={roomId} users={users} latency={latency} />

        <div className="grid md:grid-cols-[1fr_340px] gap-6 items-start">
          <div className="space-y-4">
            <VideoPlayer
              socket={socket}
              roomId={roomId}
              file={file}
              accessToken={auth.accessToken}
              initialPlayback={playback}
            />
            <DrivePicker
              accessToken={auth.accessToken}
              onPick={({ fileId, fileName }) =>
                socket.emit('select-file', { roomId, fileId, fileName })
              }
            />
          </div>

          <div className="h-[450px] md:h-[calc(100vh-180px)] md:sticky md:top-6">
            <Chat socket={socket} roomId={roomId} name={name} initialMessages={messages} />
          </div>
        </div>
      </div>
    </div>
  );
}