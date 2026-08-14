import http from 'http';
import app from './app.js';
import { PORT } from './config/env.js';
import { initializeSocket } from './socket/index.js';

const server = http.createServer(app);

initializeSocket(server);

server.listen(PORT, () => {
  console.log(`WatchParty backend running on port ${PORT}`);
});