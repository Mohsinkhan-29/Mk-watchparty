import { roomStore } from '../../store/roomStore.js';

export const registerRoomHandlers = (io, socket, getCurrentRoomId, setCurrentRoomId) => {
  socket.on('join-room', ({ roomId, displayName, name }, ack) => {
    setCurrentRoomId(roomId);
    const room = roomStore.getRoom(roomId, socket.id);
    const userDisplayName = displayName || name || 'Guest';

    if (!room.hostId) {
      room.hostId = socket.id;
    }

    room.users.set(socket.id, userDisplayName);
    socket.join(roomId);

    const serialized = roomStore.serializeRoom(room);

    if (typeof ack === 'function') {
      ack({ state: serialized });
    }

    socket.emit('room-state-update', serialized);
    io.to(roomId).emit('room-state-update', serialized);

    socket.to(roomId).emit('chat-message', {
      system: true,
      text: `${userDisplayName} joined the room`,
      at: Date.now(),
    });
  });

  const handleLeave = (roomIdParam) => {
    const targetRoomId = roomIdParam || getCurrentRoomId();
    if (!targetRoomId) return;

    socket.leave(targetRoomId);
    const room = roomStore.findRoom(targetRoomId);
    if (!room) return;

    const userName = room.users.get(socket.id);
    room.users.delete(socket.id);

    if (room.users.size === 0) {
      roomStore.deleteRoom(targetRoomId);
      return;
    }

    if (room.hostId === socket.id && room.users.size > 0) {
      const nextHostSocketId = room.users.keys().next().value;
      room.hostId = nextHostSocketId;
      io.to(targetRoomId).emit('host-updated', { hostId: nextHostSocketId });
    }

    io.to(targetRoomId).emit('room-state-update', roomStore.serializeRoom(room));
    if (userName) {
      io.to(targetRoomId).emit('chat-message', {
        system: true,
        text: `${userName} left the room`,
        at: Date.now(),
      });
    }
  };

  socket.on('leave-room', ({ roomId }) => handleLeave(roomId));
  socket.on('disconnect', () => handleLeave(getCurrentRoomId()));
};