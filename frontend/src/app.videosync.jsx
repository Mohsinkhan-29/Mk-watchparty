import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Landing from './components/Landing';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import RoomBar from './components/RoomBar';
import VideoPlayer from './components/VideoPlayer';
import { useSocket } from './hooks/useSocket';

// This version uses the Socket.IO events implemented by the supplied
// watch-party backend: join-room, room-state, select-file and file-selected.
export default function App() {
  const [authToken, setAuthToken] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token') || params.get('code');
    const savedToken = localStorage.getItem('auth_token');

    if (tokenFromUrl) {
      localStorage.setItem('auth_token', tokenFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
      return tokenFromUrl;
    }
    return savedToken || '';
  });
  const [auth, setAuth] = useState(() => Boolean(authToken));
  const [displayName, setDisplayName] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('oauth_user'))?.name || '';
    } catch {
      return '';
    }
  });
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('wp_history')) || [];
    } catch {
      return [];
    }
  });
  const [watchTimeSeconds, setWatchTimeSeconds] = useState(
    () => Number.parseInt(localStorage.getItem('wp_watch_time'), 10) || 0
  );
  const [currentView, setCurrentView] = useState(() => (auth ? 'dashboard' : 'landing'));
  const [roomInput, setRoomInput] = useState('');
  const [activeRoomId, setActiveRoomId] = useState('');
  const [currentFile, setCurrentFile] = useState(null);
  const [playback, setPlayback] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  const { socket, latency } = useSocket();
  const connected = Boolean(socket?.connected);
  // The supplied backend has no host role: every room participant can control playback.
  const isHost = useMemo(() => false, []);

  // Join once the room screen is entered, then hydrate the UI from the server's
  // authoritative in-memory room state. Listener cleanup prevents duplicates.
  useEffect(() => {
    if (!activeRoomId || !socket) return;

    const onRoomState = (state) => {
      setCurrentFile(state.file || null);
      setPlayback(state.playback || null);
      setMessages(state.messages || []);
      setUsers(state.users || []);
    };
    const onFileSelected = (file) => setCurrentFile(file || null);
    const onUsersUpdated = (nextUsers) => setUsers(nextUsers || []);

    socket.on('room-state', onRoomState);
    socket.on('file-selected', onFileSelected);
    socket.on('users-updated', onUsersUpdated);
    socket.emit('join-room', { roomId: activeRoomId, name: displayName.trim() || 'Anonymous' });

    return () => {
      socket.off('room-state', onRoomState);
      socket.off('file-selected', onFileSelected);
      socket.off('users-updated', onUsersUpdated);
    };
  }, [socket, activeRoomId, displayName]);

  const enterRoom = useCallback((targetRoomCode) => {
    const normalizedRoomId = targetRoomCode.trim().toUpperCase();
    if (!normalizedRoomId) return;

    setActiveRoomId(normalizedRoomId);
    setCurrentView('room');
    setHistory((previous) => {
      const item = { roomId: normalizedRoomId, fileName: 'Shared Session', timestamp: Date.now() };
      const next = [item, ...previous.filter((entry) => entry.roomId !== normalizedRoomId)].slice(0, 20);
      localStorage.setItem('wp_history', JSON.stringify(next));
      return next;
    });
  }, []);

  const handleCreateRoom = useCallback(() => {
    enterRoom(Math.random().toString(36).slice(2, 7));
  }, [enterRoom]);

  const handleJoinRoom = useCallback(() => enterRoom(roomInput), [enterRoom, roomInput]);

  const handleLeaveRoom = useCallback(() => {
    // server.js must implement the accompanying `leave-room` handler below.
    socket?.emit('leave-room', { roomId: activeRoomId });
    setActiveRoomId('');
    setCurrentFile(null);
    setPlayback(null);
    setMessages([]);
    setUsers([]);
    setCurrentView('dashboard');
  }, [socket, activeRoomId]);

  const handleLogout = useCallback(() => {
    handleLeaveRoom();
    localStorage.removeItem('auth_token');
    setAuthToken('');
    setAuth(false);
    setDisplayName('');
    setCurrentView('landing');
  }, [handleLeaveRoom]);

  const handleAuthSuccess = useCallback((authData) => {
    if (authData?.accessToken) {
      localStorage.setItem('auth_token', authData.accessToken);
      setAuthToken(authData.accessToken);
    }
    setAuth(true);
    setCurrentView('dashboard');
  }, []);

  const handleFileSelect = useCallback((selectedFile) => {
    const fileId = selectedFile.fileId || selectedFile.id;
    const fileName = selectedFile.fileName || selectedFile.name;
    if (!socket || !activeRoomId || !fileId || !fileName) return;

    // Do not transmit the Google token. Each viewer streams using their own token.
    socket.emit('select-file', { roomId: activeRoomId, fileId, fileName });
  }, [socket, activeRoomId]);

  const handleWatchTimeTick = useCallback((seconds) => {
    setWatchTimeSeconds((previous) => {
      const next = previous + seconds;
      localStorage.setItem('wp_watch_time', String(next));
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#070312] text-white font-sans">
      {currentView === 'landing' && <Landing onGetStarted={() => setCurrentView('login')} />}
      {currentView === 'login' && <Login onAuth={handleAuthSuccess} onBackToLanding={() => setCurrentView('landing')} />}
      {currentView === 'dashboard' && (
        <Dashboard auth={auth} history={history} watchTimeSeconds={watchTimeSeconds}
          displayName={displayName} setDisplayName={setDisplayName}
          roomId={roomInput} setRoomId={setRoomInput} onJoinRoom={handleJoinRoom}
          onCreateRoom={handleCreateRoom} onLogout={handleLogout} />
      )}
      {currentView === 'room' && (
        <div className="flex flex-col h-screen overflow-hidden">
          <RoomBar roomId={activeRoomId} connected={connected} latency={latency} users={users}
            currentFile={currentFile} accessToken={authToken} isHost={isHost}
            onFileSelect={handleFileSelect} onLeaveRoom={handleLeaveRoom} />
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
            <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden p-4">
              <VideoPlayer socket={socket} roomId={activeRoomId} file={currentFile}
                accessToken={authToken} initialPlayback={playback} isHost={isHost}
                onWatchTimeTick={handleWatchTimeTick} />
            </div>
            <div className="w-full lg:w-80 h-64 lg:h-full border-t lg:border-t-0 lg:border-l border-purple-500/20 bg-[#110726]/80 backdrop-blur-md flex flex-col">
              <Chat socket={socket} roomId={activeRoomId} name={displayName} initialMessages={messages} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
