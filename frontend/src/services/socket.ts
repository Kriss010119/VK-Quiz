import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;
  private isConnecting = false;
  private pendingCalls: Array<{ event: string; data: any }> = [];

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect() {
    if (this.socket && this.socket.connected) {
      console.log('Socket already connected');
      return this.socket;
    }
    
    if (this.isConnecting) {
      console.log('Socket already connecting');
      return this.socket;
    }
    
    this.isConnecting = true;
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    console.log('Connecting to socket:', SOCKET_URL);
    
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      autoConnect: true,
    });
    
    this.socket.on('connect', () => {
      console.log('Socket connected successfully, id:', this.socket?.id);
      this.isConnecting = false;
      
      this.pendingCalls.forEach(call => {
        this.socket?.emit(call.event, call.data);
      });
      this.pendingCalls = [];
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      this.isConnecting = false;
    });
    
    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });
    
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.pendingCalls = [];
  }

  getSocket() {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }

  emit(event: string, data: any) {
    if (!this.socket || !this.socket.connected) {
      console.log(`Socket not connected, queueing: ${event}`);
      this.pendingCalls.push({ event, data });
      this.connect();
      return;
    }
    this.socket.emit(event, data);
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  createRoom(roomCode: string, quizId: string, hostName: string, userId?: string) {
    this.emit('host:create-room', { roomCode, quizId, hostName, userId });
  }

  loadQuestions(roomCode: string, questions: any[], timePerQuestion: number, scoringSettings: any) {
    this.emit('host:load-questions', { roomCode, questions, timePerQuestion, scoringSettings });
  }

  startQuiz(roomCode: string) {
    this.emit('host:start-quiz', { roomCode });
  }

  joinRoom(roomCode: string, playerName: string, userId?: string) {
    console.log(`Joining room ${roomCode} as ${playerName}`);
    this.emit('player:join', { roomCode, playerName, userId });
  }

  submitAnswer(roomCode: string, answer: any, timeLeft: number) {
    this.emit('player:answer', { roomCode, answer, timeLeft });
  }
}

export const socketService = SocketService.getInstance();