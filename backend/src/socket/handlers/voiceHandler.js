export const registerVoiceHandlers = (socket, getCurrentRoomId) => {
  const broadcastToRoom = (eventName, data) => {
    const targetRoomId = data?.roomId || getCurrentRoomId();
    if (targetRoomId) socket.to(targetRoomId).emit(eventName, data);
  };

  socket.on('voice-start', (data) => broadcastToRoom('voice-start', data));
  socket.on('voice-data', (data) => broadcastToRoom('voice-data', data));
  socket.on('voice-chunk', (data) => broadcastToRoom('voice-data', data));
  socket.on('voice-end', (data) => broadcastToRoom('voice-end', data));
};