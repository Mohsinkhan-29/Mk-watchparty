import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Landing from './components/Landing';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import RoomBar from './components/RoomBar';
import VideoPlayer from './components/VideoPlayer';
import { useSocket } from './hooks/useSocket';


export default function App() {
  // Initialize state directly from storage/URL to avoid flicker and duplicate renders
  const [authToken, setAuthToken] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token') || params.get('code');
    const savedToken = localStorage.getItem('auth_token');

    if (tokenFromUrl) {
      if (!savedToken) localStorage.setItem('auth_token', tokenFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
      return tokenFromUrl;
    }
    return savedToken || '';
  });

  const [auth, setAuth] = useState(() => Boolean(authToken));

  const [displayName, setDisplayName] = useState(() => {
    const savedUser = localStorage.getItem('oauth_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser)?.name || '';
      } catch (e) {
        console.error('Failed to parse OAuth user profile', e);
      }
    }
    return '';
  });

  const [history, setHistory] = useState(() => {
    const savedHistory = localStorage.getItem('wp_history');
    if (savedHistory) {
      try {
        return JSON.parse(savedHistory);
      } catch (e) { }
    }
    return [];
  });

  const [watchTimeSeconds, setWatchTimeSeconds] = useState(() => {
    const savedWatchTime = localStorage.getItem('wp_watch_time');
    return parseInt(savedWatchTime, 10) || 0;
  });

  const [currentView, setCurrentView] = useState(() => (auth ? 'dashboard' : 'landing'));
  const [inRoom, setInRoom] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [currentFile, setCurrentFile] = useState(null);

  const { socket, connected, latency, roomState, joinRoom } = useSocket();

  // Host status evaluation based on Socket ID
  const isHost = useMemo(() => {
    return Boolean(roomState?.hostId && socket?.id && roomState.hostId === socket.id);
  }, [roomState?.hostId, socket?.id]);

  // Synchronize room state and media updates from Socket.io
  useEffect(() => {
    if (!socket) return;

    const handleFileChanged = (fileData) => {
      if (fileData) setCurrentFile(fileData);
    };

    const handleRoomStateUpdate = (state) => {
      if (state?.currentFile) setCurrentFile(state.currentFile);
    };

    socket.on('file-changed', handleFileChanged);
    socket.on('room-state-update', handleRoomStateUpdate);

    return () => {
      socket.off('file-changed', handleFileChanged);
      socket.off('room-state-update', handleRoomStateUpdate);
    };
  }, [socket]);

  const enterRoom = useCallback(
    (targetRoomCode, name) => {
      const activeName = (name || displayName || '').trim() || 'Anonymous';

      setRoomId(targetRoomCode);
      setInRoom(true);
      setCurrentView('room');

      const historyItem = {
        roomId: targetRoomCode,
        fileName: currentFile ? currentFile.fileName || currentFile.name : 'Shared Session',
        timestamp: Date.now(),
      };

      setHistory((prev) => {
        const updated = [historyItem, ...prev.filter((h) => h.roomId !== targetRoomCode)].slice(0, 20);
        localStorage.setItem('wp_history', JSON.stringify(updated));
        return updated;
      });

      if (joinRoom) {
        joinRoom(targetRoomCode, activeName, (res) => {
          if (res?.state?.currentFile) {
            setCurrentFile(res.state.currentFile);
          }
        });
      }
    },
    [displayName, currentFile, joinRoom]
  );

  const handleCreateRoom = useCallback(() => {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    enterRoom(newCode, displayName);
  }, [enterRoom, displayName]);

  const handleJoinRoom = useCallback(() => {
    if (!roomId.trim()) return;
    enterRoom(roomId.trim().toUpperCase(), displayName);
  }, [roomId, enterRoom, displayName]);

  const handleLeaveRoom = useCallback(() => {
    setInRoom(false);
    setCurrentView('dashboard');
    if (socket && roomId) {
      socket.emit('leave-room', { roomId });
    }
  }, [socket, roomId]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setAuth(false);
    setAuthToken('');
    setDisplayName('');
    setRoomId('');
    setInRoom(false);
    setCurrentView('landing');
  }, []);

  const handleAuthSuccess = useCallback((authData) => {
    if (authData?.accessToken) {
      localStorage.setItem('auth_token', authData.accessToken);
      setAuthToken(authData.accessToken);
    }
    setAuth(true);
    setCurrentView('dashboard');
  }, []);

  const handleFileSelect = useCallback(
    (selectedFile) => {
      const fileData = {
        fileId: selectedFile.fileId || selectedFile.id,
        fileName: selectedFile.fileName || selectedFile.name,
        url: selectedFile.url || '',
        mimeType: selectedFile.mimeType || '',
        accessToken:
          selectedFile.accessToken || authToken || localStorage.getItem('auth_token'),
      };
      setCurrentFile(fileData);
      if (socket) {
        socket.emit('change-media', { roomId, file: fileData, accessToken: fileData.accessToken });
      }
    },
    [authToken, socket, roomId]
  );

  const handleWatchTimeTick = useCallback((seconds) => {
    setWatchTimeSeconds((prev) => {
      const updated = prev + seconds;
      localStorage.setItem('wp_watch_time', updated.toString());
      return updated;
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#070312] text-white font-sans">
      {currentView === 'landing' && (
        <Landing onGetStarted={() => setCurrentView('login')} />
      )}

      {currentView === 'login' && (
        <Login
          onAuth={handleAuthSuccess}
          onBackToLanding={() => setCurrentView('landing')}
        />
      )}

      {currentView === 'dashboard' && (
        <Dashboard
          auth={auth}
          history={history}
          watchTimeSeconds={watchTimeSeconds}
          displayName={displayName}
          setDisplayName={setDisplayName}
          roomId={roomId}
          setRoomId={setRoomId}
          onJoinRoom={handleJoinRoom}
          onCreateRoom={handleCreateRoom}
          onLogout={handleLogout}
        />
      )}

      {currentView === 'room' && (
        <div className="flex flex-col h-screen overflow-hidden">
          <RoomBar
            roomId={roomId}
            connected={connected}
            latency={latency}
            users={roomState?.members || []}
            currentFile={currentFile}
            accessToken={authToken}
            isHost={isHost}
            onFileSelect={handleFileSelect}
            onLeaveRoom={handleLeaveRoom}
          />

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
            <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden p-4">
              <VideoPlayer
                socket={socket}
                roomId={roomId}
                file={currentFile}
                initialPlayback={roomState?.playback}
                isHost={isHost}
                onWatchTimeTick={handleWatchTimeTick}
              />
            </div>

            <div className="w-full lg:w-80 h-64 lg:h-full border-t lg:border-t-0 lg:border-l border-purple-500/20 bg-[#110726]/80 backdrop-blur-md flex flex-col">
              <Chat
                socket={socket}
                roomId={roomId}
                name={displayName}
                initialMessages={roomState?.messages || []}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}