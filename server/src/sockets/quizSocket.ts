import { Server, Socket } from 'socket.io';
import { query } from '../config/database';

interface Player {
  id: string;
  name: string;
  score: number;
  hasAnswered: boolean;
  userId?: string;
}

interface Room {
  quizId: string;
  hostId: string | null;
  players: Map<string, Player>;
  currentQuestion: number;
  questions: any[];
  timePerQuestion: number;
  answerStatus: Map<string, boolean>;
  playerAnswers: Map<string, any>;
  timer: NodeJS.Timeout | null;
  isActive: boolean;
  isRunning: boolean;
  waitingForNext: boolean;
  timeExpired: boolean;
}

const rooms = new Map<string, Room>();

export const setupQuizSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    socket.on('host:create-room', ({ roomCode, quizId, hostName, userId }) => {
      console.log(`Host create-room: roomCode=${roomCode}, quizId="${quizId}", hostName=${hostName}`);
      if (rooms.has(roomCode)) {
        socket.emit('error', 'Room already exists');
        return;
      }
      
      socket.join(roomCode);
      rooms.set(roomCode, {
        quizId,
        hostId: socket.id,
        players: new Map(),
        currentQuestion: 0,
        questions: [],
        timePerQuestion: 30,
        answerStatus: new Map(),
        playerAnswers: new Map(),
        timer: null,
        isActive: false,
        isRunning: false,
        waitingForNext: false,
        timeExpired: false,
      });
      
      console.log(`Room created: ${roomCode} by ${hostName}`);
      socket.emit('room-created', { roomCode });
    });

    socket.on('host:load-questions', ({ roomCode, questions, timePerQuestion }) => {
      const room = rooms.get(roomCode);
      if (!room || room.hostId !== socket.id) return;
      
      room.questions = questions;
      room.timePerQuestion = timePerQuestion || 30;
      console.log(`Questions loaded: ${questions.length}`);
      socket.emit('questions-loaded');
    });

socket.on('player:get-state', ({ roomCode }) => {
  console.log(`player:get-state request for room ${roomCode}`);
  const room = rooms.get(roomCode);
  if (room) {
    const playersList = Array.from(room.players.values()).map(p => ({
      id: p.id,
      name: p.name,
      score: p.score,
      hasAnswered: p.hasAnswered
    }));
    
    console.log(`Sending room state with ${playersList.length} players`);
    
    socket.emit('room-state', {
      players: playersList,
      isRunning: room.isRunning,
      currentQuestionIndex: room.currentQuestion,
      totalQ: room.questions.length
    });
  } else {
    console.log(`Room ${roomCode} not found`);
    socket.emit('room-state', { players: [], isRunning: false });
  }
});

socket.on('player:join', async ({ roomCode, playerName, userId }) => {
  console.log(`Player join attempt: ${playerName} to ${roomCode}, userId: "${userId}"`);
  const room = rooms.get(roomCode);
  
  if (!room) {
    socket.emit('error', 'Room not found');
    return;
  }
  
  let existingPlayer: Player | null = null;
  for (const p of room.players.values()) {
    if (p.name === playerName) {
      existingPlayer = p;
      break;
    }
  }
  
  if (existingPlayer) {
    socket.emit('error', 'Name already taken');
    return;
  }
  
  socket.join(roomCode);
  
  const newPlayer: Player = { 
    id: socket.id, 
    name: playerName, 
    score: 0,
    hasAnswered: false,
    userId: userId
  };
  
  room.players.set(socket.id, newPlayer);

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  console.log(`player:join validation - room.quizId: "${room.quizId}", userId: "${userId}"`);
  if (userId && uuidRegex.test(userId) && room.quizId && uuidRegex.test(room.quizId)) {
    try {
      await query(
        `INSERT INTO quiz_sessions (quiz_id, user_id, score) VALUES ($1, $2, 0)
         ON CONFLICT (quiz_id, user_id) DO NOTHING`,
        [room.quizId, userId]
      );
      console.log(`Quiz session created for ${playerName} (${userId}) in quiz ${room.quizId}`);
    } catch (err) {
      console.error('Error creating quiz session:', err);
    }
  } else {
    console.log(`Skipping session creation - room.quizId: "${room.quizId}", userId: "${userId}"`);
  }

  console.log(`Player ${playerName} joined ${roomCode}. Total: ${room.players.size}`);
  
  const playersList = Array.from(room.players.values()).map(p => ({
    id: p.id,
    name: p.name,
    score: p.score,
    hasAnswered: p.hasAnswered
  }));
  
  io.to(roomCode).emit('player-joined', { 
    players: playersList,
    count: room.players.size
  });
  
  socket.emit('player-joined', { 
    players: playersList,
    count: room.players.size
  });
});

    socket.on('host:start-quiz', ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room || room.hostId !== socket.id) return;
      
      if (room.isActive) {
        socket.emit('error', 'Quiz already started');
        return;
      }
      
      room.isActive = true;
      room.isRunning = true;
      room.currentQuestion = 0;
      room.waitingForNext = false;
      
      for (const [id, player] of room.players) {
        player.hasAnswered = false;
        player.score = 0;
        room.players.set(id, player);
      }
      room.answerStatus.clear();
      
      query('UPDATE quizzes SET status = $1 WHERE room_code = $2', ['active', roomCode])
        .catch(err => console.error('Error updating quiz status:', err));
      
      console.log(`Quiz started in ${roomCode} with ${room.players.size} players`);
      
      io.to(roomCode).emit('quiz-started', { 
        totalQuestions: room.questions.length 
      });
      
      sendQuestion(io, roomCode, room);
    });

    socket.on('host:next-question', ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room || room.hostId !== socket.id) return;
      if (!room.waitingForNext) return;
      
      console.log(`Host requested next question in ${roomCode}`);
      room.waitingForNext = false;
      
      room.currentQuestion++;
      sendQuestion(io, roomCode, room);
    });

    socket.on('host:show-answer', ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room || room.hostId !== socket.id) return;
      if (!room.isRunning || room.waitingForNext) return;
      
      console.log(`Host showing answer in ${roomCode}`);
      showRoundResults(io, roomCode, room);
    });

    socket.on('host:continue-quiz', async ({ roomCode }) => {
      let room = rooms.get(roomCode);
      
      if (!room) {
        console.log(`Room ${roomCode} not found on continue, creating fresh room`);
        
        let quizId = '';
        try {
          const result = await query('SELECT id FROM quizzes WHERE room_code = $1', [roomCode]);
          if (result.rows.length > 0) {
            quizId = result.rows[0].id;
            console.log(`Found quizId ${quizId} for room ${roomCode}`);
          } else {
            console.log(`No quiz found for room_code ${roomCode}`);
          }
        } catch (err) {
          console.error('Error looking up quizId:', err);
        }
        
        socket.join(roomCode);
        room = {
          quizId,
          hostId: socket.id,
          players: new Map(),
          currentQuestion: 0,
          questions: [],
          timePerQuestion: 30,
          answerStatus: new Map(),
          playerAnswers: new Map(),
          timer: null,
          isActive: false,
          isRunning: false,
          waitingForNext: false,
          timeExpired: false,
        };
        rooms.set(roomCode, room);
        
        socket.emit('host-continued', {
          quizId,
          currentQuestion: 0,
          totalQuestions: 0,
          players: [],
          isRunning: false,
          questions: []
        });
        return;
      }
      
      room.hostId = socket.id;
      socket.join(roomCode);
      
      console.log(`Host continued quiz in ${roomCode} at question ${room.currentQuestion}`);
      
      const playersList = Array.from(room.players.values()).map(p => ({
        id: p.id,
        name: p.name,
        score: p.score,
        hasAnswered: p.hasAnswered
      }));
      
      socket.emit('host-continued', {
        quizId: room.quizId,
        currentQuestion: room.currentQuestion,
        totalQuestions: room.questions.length,
        players: playersList,
        isRunning: room.isRunning,
        questions: room.questions
      });
      
      io.to(roomCode).emit('player-joined', {
        players: playersList,
        count: room.players.size
      });
      
      if (room.isRunning && room.timer) {
        const currentQ = room.questions[room.currentQuestion];
        socket.emit('question:new', {
          question: {
            id: currentQ.id,
            text: currentQ.text,
            type: currentQ.type,
            imageUrl: currentQ.image_url || currentQ.imageUrl || null,
            options: currentQ.options.map((opt: any) => ({
              id: opt.id,
              text: opt.text
            })),
          },
          questionIndex: room.currentQuestion,
          totalQuestions: room.questions.length,
          timeLimit: room.timePerQuestion
        });
        
        socket.emit('quiz-started', { totalQuestions: room.questions.length });
      }
    });

    socket.on('host:stop-quiz', ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room || room.hostId !== socket.id) return;
      if (!room.isRunning) return;
      
      console.log(`Host stopped quiz in ${roomCode}`);
      stopQuiz(io, roomCode, room);
    });

    socket.on('player:answer', async ({ roomCode, answer, timeLeft }) => {
      const room = rooms.get(roomCode);
      if (!room || !room.isRunning) return;
      
      const player = room.players.get(socket.id);
      if (!player || player.hasAnswered) return;
      
      const currentQ = room.questions[room.currentQuestion];
      const isCorrect = checkAnswer(currentQ, answer);
      
      let pointsEarned = 0;
      if (isCorrect) {
        pointsEarned = currentQ.points;
        player.score += pointsEarned;
      }
      
      player.hasAnswered = true;
      room.players.set(socket.id, player);
      room.answerStatus.set(socket.id, isCorrect);
      room.playerAnswers.set(socket.id, answer);
      
      socket.emit('answer-saved', {
        totalScore: player.score
      });

      if (player.userId) {
        try {
          const sessionResult = await query(
            `SELECT id FROM quiz_sessions WHERE quiz_id = $1 AND user_id = $2`,
            [room.quizId, player.userId]
          );
          if (sessionResult.rows.length > 0) {
            const sessionId = sessionResult.rows[0].id;
            const selectedIds = Array.isArray(answer) ? answer : [answer];
            await query(
              `INSERT INTO answers (session_id, question_id, selected_option_ids, is_correct)
               VALUES ($1, $2, $3, $4)`,
              [sessionId, currentQ.id, selectedIds, isCorrect]
            );
          }
        } catch (err) {
          console.error('Error saving answer:', err);
        }
      }
      
      const playersList = Array.from(room.players.values()).map(p => ({
        id: p.id,
        name: p.name,
        score: p.score,
        hasAnswered: p.hasAnswered
      }));
      io.to(roomCode).emit('player-joined', { 
        players: playersList,
        count: room.players.size
      });
      
      let allAnswered = true;
      for (const p of room.players.values()) {
        if (!p.hasAnswered) {
          allAnswered = false;
          break;
        }
      }
      
      if (allAnswered) {
        clearInterval(room.timer!);
        showRoundResults(io, roomCode, room);
      }
    });

    socket.on('quiz:finished', ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room || room.hostId !== socket.id) return;
      
      console.log(`Quiz finished event received for room ${roomCode}`);
      finishQuiz(io, roomCode, room);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      for (const [roomCode, room] of rooms) {
        if (room.players.has(socket.id)) {
          room.players.delete(socket.id);
          room.answerStatus.delete(socket.id);
          room.playerAnswers.delete(socket.id);
          
          const playersList = Array.from(room.players.values()).map(p => ({
            id: p.id,
            name: p.name,
            score: p.score,
            hasAnswered: p.hasAnswered
          }));
          io.to(roomCode).emit('player-joined', { 
            players: playersList,
            count: room.players.size
          });
        }
        
        if (room.hostId === socket.id && room.isRunning) {
          room.hostId = null;
          console.log(`Host disconnected but quiz continues in ${roomCode}`);
          io.to(roomCode).emit('host-left-game', { quizId: room.quizId });
        }
        
        if (room.hostId === socket.id && !room.isRunning) {
          io.to(roomCode).emit('host-disconnected');
          rooms.delete(roomCode);
          console.log(`Room deleted: ${roomCode}`);
        }
      }
    });
  });
};

function sendQuestion(io: Server, roomCode: string, room: Room) {
  if (room.currentQuestion >= room.questions.length) {
    finishQuiz(io, roomCode, room);
    return;
  }
  
  for (const [id, player] of room.players) {
    player.hasAnswered = false;
    room.players.set(id, player);
  }
  room.answerStatus.clear();
  
  const playersList = Array.from(room.players.values()).map(p => ({
    id: p.id,
    name: p.name,
    score: p.score,
    hasAnswered: p.hasAnswered
  }));
  io.to(roomCode).emit('player-joined', { 
    players: playersList,
    count: room.players.size
  });
  
  const question = room.questions[room.currentQuestion];
  
  io.to(roomCode).emit('question:new', {
    question: {
      id: question.id,
      text: question.text,
      type: question.type,
      imageUrl: question.image_url || question.imageUrl || null,
      options: question.options.map((opt: any) => ({
        id: opt.id,
        text: opt.text
      })),
    },
    questionIndex: room.currentQuestion,
    totalQuestions: room.questions.length,
    timeLimit: room.timePerQuestion
  });
  
  let timeLeft = room.timePerQuestion;
  room.timer = setInterval(() => {
    timeLeft--;
    io.to(roomCode).emit('question:tick', { timeLeft });
    
    if (timeLeft <= 0) {
      clearInterval(room.timer!);
      showRoundResults(io, roomCode, room);
    }
  }, 1000);
}

function showRoundResults(io: Server, roomCode: string, room: Room) {
  clearInterval(room.timer!);
  
  const currentQ = room.questions[room.currentQuestion];
  const correctOptions = currentQ.options
    .filter((opt: any) => opt.is_correct === true);
  const correctAnswerTexts = correctOptions.map((opt: any) => opt.text);
  
  const optionVotes: { text: string; isCorrect: boolean; votes: number }[] = currentQ.options.map((opt: any) => {
    let votes = 0;
    for (const [playerId, answer] of room.playerAnswers) {
      if (Array.isArray(answer)) {
        if (answer.includes(opt.id)) votes++;
      } else {
        if (answer === opt.id) votes++;
      }
    }
    return {
      text: opt.text,
      isCorrect: opt.is_correct === true,
      votes
    };
  });
  
  const playerResults = Array.from(room.players.values()).map(p => ({
    id: p.id,
    name: p.name,
    pointsEarned: room.answerStatus.get(p.id) ? currentQ.points : 0,
    totalScore: p.score,
    isCorrect: room.answerStatus.get(p.id) || false,
    hasAnswered: p.hasAnswered
  }));
  
  io.to(roomCode).emit('round-results', { 
    results: playerResults,
    correctAnswers: correctAnswerTexts,
    questionText: currentQ.text,
    imageUrl: currentQ.image_url || currentQ.imageUrl || null,
    totalPlayers: room.players.size,
    optionVotes
  });
  
  room.playerAnswers.clear();
  room.waitingForNext = true;
}

function checkAnswer(question: any, answer: any): boolean {
  if (question.type === 'single') {
    const correctOption = question.options.find((opt: any) => opt.is_correct === true);
    return correctOption?.id === answer;
  } else if (question.type === 'multiple') {
    const correctIds = question.options
      .filter((opt: any) => opt.is_correct === true)
      .map((opt: any) => opt.id)
      .sort();
    const answerIds = [...answer].sort();
    return JSON.stringify(correctIds) === JSON.stringify(answerIds);
  }
  return false;
}

function finishQuiz(io: Server, roomCode: string, room: Room) {
  room.isActive = false;
  room.isRunning = false;
  clearInterval(room.timer!);
  
  const leaderboard = Array.from(room.players.values())
    .map(p => ({ name: p.name, score: p.score }))
    .sort((a, b) => b.score - a.score);
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  for (const player of room.players.values()) {
    if (player.userId && uuidRegex.test(player.userId)) {
      try {
        query(
          `INSERT INTO quiz_sessions (quiz_id, user_id, score) VALUES ($1, $2, $3)
           ON CONFLICT (quiz_id, user_id) DO UPDATE SET score = $3, completed_at = CURRENT_TIMESTAMP`,
          [room.quizId, player.userId, player.score]
        ).then(() => {
          console.log(`Score saved for ${player.name} (${player.userId}): ${player.score}`);
        }).catch(err => console.error('Error saving score:', err));
      } catch (err) {
        console.error('Error in finishQuiz:', err);
      }
    }
  }
  
  query('UPDATE quizzes SET status = $1 WHERE room_code = $2', ['finished', roomCode])
    .catch(err => console.error('Error updating quiz status:', err));
  
  io.to(roomCode).emit('quiz:finished', { leaderboard });
  io.emit('quizzes-updated');
  console.log(`Quiz finished in ${roomCode}`);
  rooms.delete(roomCode);
}

function stopQuiz(io: Server, roomCode: string, room: Room) {
  room.isActive = false;
  room.isRunning = false;
  clearInterval(room.timer!);
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  for (const player of room.players.values()) {
    if (player.userId && uuidRegex.test(player.userId)) {
      query(
        `INSERT INTO quiz_sessions (quiz_id, user_id, score) VALUES ($1, $2, $3)
         ON CONFLICT (quiz_id, user_id) DO UPDATE SET score = $3, completed_at = CURRENT_TIMESTAMP`,
        [room.quizId, player.userId, player.score]
      ).catch(err => console.error('Error saving score:', err));
    }
  }
  
  query('UPDATE quizzes SET status = $1 WHERE room_code = $2', ['finished', roomCode])
    .catch(err => console.error('Error updating quiz status:', err));
  
  io.to(roomCode).emit('quiz:stopped', { message: 'Quiz was stopped by host' });
  io.emit('quizzes-updated');
  
  console.log(`Quiz stopped in ${roomCode}`);
  rooms.delete(roomCode);
}