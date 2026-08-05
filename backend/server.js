import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import fetch from 'node-fetch';

const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

const app = express();
app.use(cors({ origin: CORS_ORIGIN }));

// ---------------------------------------------------------------------------
// Drive streaming proxy
// The <video> tag can't send an Authorization header, so the browser points
// at this route instead. This route attaches the caller's Google access
// token server-side and forwards Range requests, so seeking/buffering work
// like a normal streamed video instead of a full download.
// ---------------------------------------------------------------------------
app.get('/api/stream', async (req, res) => {
  const { fileId, access_token: accessToken } = req.query;
  if (!fileId || !accessToken) {
    return res.status(400).json({ error: 'fileId and access_token are required' });
  }

  try {
    const driveUrl = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
      fileId
    )}?alt=media`;

    const driveRes = await fetch(driveUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(req.headers.range ? { Range: req.headers.range } : {}),
      },
    });

    if (!driveRes.ok && driveRes.status !== 206) {
      const text = await driveRes.text();
      return res.status(driveRes.status).json({ error: 'Drive request failed', detail: text });
    }

    res.status(driveRes.status);
    ['content-type', 'content-length', 'content-range', 'accept-ranges'].forEach((h) => {
      const v = driveRes.headers.get(h);
      if (v) res.setHeader(h, v);
    });
    if (!driveRes.headers.get('accept-ranges')) res.setHeader('Accept-Ranges', 'bytes');

    driveRes.body.pipe(res);
  } catch (err) {
    console.error('stream proxy error', err);
    res.status(500).json({ error: 'proxy failure' });
  }



});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: CORS_ORIGIN } });

// In-memory room state. Fine for a prototype / small deployment;
// swap for Redis or a DB if you need rooms to survive a server restart.
const rooms = new Map();

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      file: null, // { fileId, fileName }
      playback: { isPlaying: false, currentTime: 0, updatedAt: Date.now() },
      messages: [],
      users: new Map(), // socketId -> name
    });
  }
  return rooms.get(roomId);
}

function serializeRoom(room) {
  return {
    file: room.file,
    playback: room.playback,
    messages: room.messages.slice(-100),
    users: [...room.users.values()],
  };
}

io.on('connection', (socket) => {
  socket.on('ping', (data) => {
    socket.emit('pong', { timestamp: data.timestamp });
  });

  let currentRoomId = null;

  socket.on('join-room', ({ roomId, name }) => {
    currentRoomId = roomId;
    const room = getRoom(roomId);
    room.users.set(socket.id, name || 'Guest');
    socket.join(roomId);

    socket.emit('room-state', serializeRoom(room));
    io.to(roomId).emit('users-updated', [...room.users.values()]);
    socket.to(roomId).emit('chat-message', {
      system: true,
      text: `${name || 'Guest'} joined the room`,
      at: Date.now(),
    });
  });

  socket.on('select-file', ({ roomId, fileId, fileName }) => {
    const room = getRoom(roomId);
    room.file = { fileId, fileName };
    room.playback = { isPlaying: false, currentTime: 0, updatedAt: Date.now() };
    io.to(roomId).emit('file-selected', room.file);
    io.to(roomId).emit('playback-sync', room.playback);
  });

  socket.on('playback-update', ({ roomId, action, currentTime }) => {
    const room = getRoom(roomId);
    room.playback = {
      isPlaying: action === 'play' ? true : action === 'pause' ? false : room.playback.isPlaying,
      currentTime: typeof currentTime === 'number' ? currentTime : room.playback.currentTime,
      updatedAt: Date.now(),
    };
    socket.to(roomId).emit('playback-sync', room.playback);
  });

  socket.on('chat-message', ({ roomId, text, name }) => {
    const room = getRoom(roomId);
    const msg = { name: name || 'Guest', text: String(text).slice(0, 2000), at: Date.now() };
    room.messages.push(msg);
    io.to(roomId).emit('chat-message', msg);
  });

  socket.on('voice-start', ({ roomId, userName }) => {
    socket.to(roomId).emit('voice-start', { userName });
  });

  socket.on('voice-chunk', ({ roomId, audioData, userName }) => {
    socket.to(roomId).emit('voice-data', { audioChunk: audioData, userName });
  });

  socket.on('voice-end', ({ roomId }) => {
    socket.to(roomId).emit('voice-end');
  });


  socket.on('disconnect', () => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;
    const name = room.users.get(socket.id);
    room.users.delete(socket.id);
    io.to(currentRoomId).emit('users-updated', [...room.users.values()]);
    if (name) {
      io.to(currentRoomId).emit('chat-message', {
        system: true,
        text: `${name} left the room`,
        at: Date.now(),
      });
    }
  });
});

server.listen(PORT, () => console.log(`watchparty backend listening on :${PORT}`));
