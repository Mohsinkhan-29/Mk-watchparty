class RoomStore {
  constructor() {
    this.rooms = new Map();
  }

  getRoom(roomId, creatorSocketId = null) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        hostId: creatorSocketId,
        file: null, // { fileId, fileName, accessToken }
        playback: { isPlaying: false, currentTime: 0, updatedAt: Date.now() },
        messages: [],
        users: new Map(),
      });
    }
    return this.rooms.get(roomId);
  }

  findRoom(roomId) {
    return this.rooms.get(roomId);
  }

  deleteRoom(roomId) {
    return this.rooms.delete(roomId);
  }

  serializeRoom(room) {
  if (!room) return null;

  const sanitizedFile = room.file
    ? { fileId: room.file.fileId, fileName: room.file.fileName }
    : null;

  const elapsedSeconds = room.playback.isPlaying
    ? (Date.now() - room.playback.updatedAt) / 1000
    : 0;

  return {
    hostId: room.hostId,
    currentFile: sanitizedFile,
    playback: {
      ...room.playback,
      currentTime: room.playback.currentTime + elapsedSeconds,
      updatedAt: Date.now(),
    },
    messages: room.messages.slice(-100),
    members: [...room.users.values()],
  };
}
}

export const roomStore = new RoomStore();