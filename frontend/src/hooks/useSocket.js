import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export function useSocket() {
  const socketRef = useRef(null);
  const [latency, setLatency] = useState(0);

  if (!socketRef.current) {
    socketRef.current = io(API_BASE, { autoConnect: false });
  }

  useEffect(() => {
    const socket = socketRef.current;
    socket.connect();

    // Track latency via ping/pong
    let pingTimeout;
    const measureLatency = () => {
      const sentTime = Date.now();
      socket.emit('ping', { timestamp: sentTime });
    };

    socket.on('pong', (data) => {
      const latency = Date.now() - data.timestamp;
      setLatency(latency);
    });

    // Measure latency every 2 seconds
    const pingInterval = setInterval(measureLatency, 2000);

    return () => {
      clearInterval(pingInterval);
      clearTimeout(pingTimeout);
      socket.disconnect();
    };
  }, []);

  return { socket: socketRef.current, latency };
}

export { API_BASE };