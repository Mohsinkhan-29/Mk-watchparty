import { roomStore } from '../../store/roomStore.js';

export const registerVideoHandlers = (io, socket, getCurrentRoomId) => {
  const handleVideoChange = ({ roomId, file, fileId, fileName, accessToken }) => {
    const targetRoomId = roomId || getCurrentRoomId();
    const room = roomStore.findRoom(targetRoomId);

    if (!room) return;

    if (room.hostId && room.hostId !== socket.id) {
      return socket.emit('error-message', 'Only the room host can change videos.');
    }

    const selectedFile = file || { fileId, fileName };
    const targetFileId = selectedFile.fileId || selectedFile.id || fileId;
    const targetFileName = selectedFile.fileName || selectedFile.name || fileName;
    const targetAccessToken =
      accessToken || selectedFile.accessToken || room.file?.accessToken;

    if (!targetFileId) {
      return socket.emit('error-message', 'Invalid video file specified.');
    }

    room.file = {
      ...selectedFile,
      fileId: targetFileId,
      fileName: targetFileName,
      mimeType: selectedFile.mimeType || room.file?.mimeType,
      accessToken: targetAccessToken,
    };

    room.playback = {
      isPlaying: false,
      currentTime: 0,
      updatedAt: Date.now(),
    };

    const sanitizedFile = {
      fileId: room.file.fileId,
      fileName: room.file.fileName,
    };

    io.to(targetRoomId).emit('file-changed', sanitizedFile);
    io.to(targetRoomId).emit('room-state-update', roomStore.serializeRoom(room));
    io.to(targetRoomId).emit('playback-sync', room.playback);
  };

  socket.on('change-media', handleVideoChange);
  socket.on('select-file', handleVideoChange);

  socket.on('playback-update', ({ roomId, action, currentTime }) => {
    const targetRoomId = roomId || getCurrentRoomId();
    const room = roomStore.findRoom(targetRoomId);

    if (!room) return;

    if (room.hostId && room.hostId !== socket.id) {
      return socket.emit('error-message', 'Only the host can control playback.');
    }

    room.playback = {
      isPlaying:
        action === 'play'
          ? true
          : action === 'pause'
            ? false
            : room.playback.isPlaying,
      currentTime:
        typeof currentTime === 'number'
          ? currentTime
          : room.playback.currentTime,
      updatedAt: Date.now(),
    };

    socket.to(targetRoomId).emit('playback-sync', room.playback);
  });
};