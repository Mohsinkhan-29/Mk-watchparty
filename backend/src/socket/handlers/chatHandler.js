import { roomStore } from '../../store/roomStore.js';

export const registerChatHandlers = (io, socket, getCurrentRoomId) => {
  socket.on('chat-message', ({ roomId, text, name, displayName }) => {
    const targetRoomId = roomId || getCurrentRoomId();
    const room = roomStore.findRoom(targetRoomId);
    if (!room) return;

    const senderName = displayName || name || room.users.get(socket.id) || 'Guest';
    const msg = { name: senderName, text: String(text).slice(0, 2000), at: Date.now() };

    room.messages.push(msg);
    io.to(targetRoomId).emit('chat-message', msg);
  });
};