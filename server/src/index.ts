import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { config } from './config/env';
import { setupQuizSocket } from './sockets/quizSocket';

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.frontendUrl,
    credentials: true,
  },
});


setupQuizSocket(io);

server.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
  console.log(`WebSocket ready`);
});