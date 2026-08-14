import { Server } from 'socket.io';
import { CORS_ORIGIN } from '../config/env.js';
import { registerRoomHandlers } from './handlers/roomHandler.js';
import { registerVideoHandlers } from './handlers/videoHandler.js';
import { registerChatHandlers } from './handlers/chatHandler.js';
import { registerVoiceHandlers } from './handlers/voiceHandler.js';

export const initializeSocket = (server) => {
  const io = new Server(server, { cors: { origin: CORS_ORIGIN } });

  io.on('connection', (socket) => {
    let currentRoomId = null;

    const getCurrentRoomId = () => currentRoomId;
    const setCurrentRoomId = (id) => {
      currentRoomId = id;
    };

    socket.on('ping', (data) => socket.emit('pong', data));

    registerRoomHandlers(io, socket, getCurrentRoomId, setCurrentRoomId);
    registerVideoHandlers(io, socket, getCurrentRoomId);
    registerChatHandlers(io, socket, getCurrentRoomId);
    registerVoiceHandlers(socket, getCurrentRoomId);
  });

  return io;
};