import { io } from 'socket.io-client';

// Connect to socket backend
const socket = io('/', {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

export default socket;
