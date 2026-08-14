import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export function useSocket() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [latency, setLatency] = useState(0);
  const [roomState, setRoomState] = useState({
    members: [],
    currentFile: null,
  });

  if (!socketRef.current) {
    socketRef.current = io(API_BASE, { autoConnect: false });
  }

  useEffect(() => {
    const socket = socketRef.current;
    socket.connect();

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    // Handle room updates (members list, selected file changes)
    socket.on('room-state-update', (updatedState) => {
      setRoomState((prev) => ({ ...prev, ...updatedState }));
    });

    socket.on('file-changed', (file) => {
      setRoomState((prev) => ({ ...prev, currentFile: file }));
    });

    // Track latency via ping/pong
    const measureLatency = () => {
      if (socket.connected) {
        socket.emit('ping', { timestamp: Date.now() });
      }
    };

    socket.on('pong', (data) => {
      if (data?.timestamp) {
        setLatency(Date.now() - data.timestamp);
      }
    });

    const pingInterval = setInterval(measureLatency, 2000);

    return () => {
      clearInterval(pingInterval);
      socket.off('connect');
      socket.off('disconnect');
      socket.off('room-state-update');
      socket.off('file-changed');
      socket.off('pong');
      socket.disconnect();
    };
  }, []);

  const joinRoom = (roomId, displayName, callback) => {
    const socket = socketRef.current;
    if (!socket) return;

    // Ensure socket is connected before emitting
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('join-room', { roomId, displayName }, (response) => {
      if (response?.state) {
        setRoomState((prev) => ({ ...prev, ...response.state }));
      }
      if (callback) callback(response);
    });
  };

  return {
    socket: socketRef.current,
    connected,
    latency,
    roomState,
    joinRoom,
  };
}

// Added default export so both named and default imports work seamlessly
export default useSocket;