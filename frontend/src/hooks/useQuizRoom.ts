/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect } from 'react';
import { socketService } from '../services/socket';
import toast from 'react-hot-toast';

interface Question {
  id: string;
  text: string;
  type: 'single' | 'multiple' | 'text';
  imageUrl?: string;
  options: { id: string; text: string }[];
  points: number;
}

interface Player {
  id: string;
  name: string;
  score: number;
  hasAnswered?: boolean;
}

export const useQuizRoom = (roomCode: string, userId?: string, userName?: string) => {
  const [playerName, setPlayerName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [quizStatus, setQuizStatus] = useState<'waiting' | 'question' | 'roundResult' | 'leaderboard'>('waiting');
  const [players, setPlayers] = useState<Player[]>([]);
  const [myScore, setMyScore] = useState(0);
  const [roundResults, setRoundResults] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [optionVotes, setOptionVotes] = useState<{ text: string; isCorrect: boolean; votes: number }[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [totalPlayers, setTotalPlayers] = useState(0);

  useEffect(() => {
    if (userId && userName && !isNameSet) {
      setPlayerName(userName);
      setIsNameSet(true);
      connectAndJoin(userName);
    }
  }, [userId, userName]);

  const connectAndJoin = useCallback((name: string) => {
    console.log('Connecting and joining as:', name);
    socketService.connect();
    
    socketService.on('room-state', ({ players: currentPlayers, isRunning, currentQuestionIndex, totalQ }) => {
      console.log('Room state received:', { currentPlayers, isRunning });
      if (currentPlayers) {
        setPlayers(currentPlayers);
      }
      if (isRunning) {
        setQuizStatus('question');
        if (totalQ) setTotalQuestions(totalQ);
      }
    });
    
    socketService.on('player-joined', ({ players: updatedPlayers, count }) => {
      console.log('player-joined event received:', { updatedPlayers, count });
      if (updatedPlayers) {
        setPlayers(updatedPlayers);
      }
    });
    
    socketService.on('quiz-started', ({ totalQuestions: total }) => {
      console.log('quiz-started event received, total:', total);
      setTotalQuestions(total);
      setQuizStatus('question');
    });
    
    socketService.on('question:new', ({ question, questionIndex, timeLimit }) => {
      console.log('question:new event received:', questionIndex);
      setCurrentQuestion(question);
      setTimeLeft(timeLimit);
      setSelectedAnswers([]);
      setHasAnswered(false);
      setSavedMessage('');
      setQuestionNumber(questionIndex + 1);
      setOptionVotes([]);
      setCorrectAnswers([]);
      setTotalPlayers(0);
      setQuizStatus('question');
    });
    
    socketService.on('question:tick', ({ timeLeft: remaining }) => {
      setTimeLeft(remaining);
    });
    
    socketService.on('answer-saved', ({ totalScore }) => {
      console.log('answer-saved received:', { totalScore });
      setMyScore(totalScore);
      setSavedMessage('Answer saved!');
      setHasAnswered(true);
    });
    
    socketService.on('round-results', ({ results, optionVotes: votes, correctAnswers: correct, totalPlayers: total }) => {
      console.log('round-results received:', { results, votes, correct, total });
      setRoundResults(results);
      setOptionVotes(votes || []);
      setCorrectAnswers(correct || []);
      setTotalPlayers(total || 0);
      const myResult = results.find((r: any) => r.name === name);
      if (myResult) {
        setMyScore(myResult.totalScore);
      }
      setQuizStatus('roundResult');
    });
    
    socketService.on('quiz:finished', ({ leaderboard: finalLeaderboard }) => {
      console.log('quiz:finished received:', finalLeaderboard);
      setLeaderboard(finalLeaderboard);
      setQuizStatus('leaderboard');
    });
    
    socketService.on('host-disconnected', () => {
      toast.error('Host has disconnected the game');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    });

    socketService.on('host-left-game', () => {
      toast.error('Host has left. Waiting for host to return...');
    });

    socketService.joinRoom(roomCode, name, userId);
    
    setTimeout(() => {
        socketService.emit('player:get-state', { roomCode });
    }, 100); 
  }, [roomCode, userId]);

  const submitAnswer = useCallback(() => {
    if (hasAnswered) return;
    if (currentQuestion && selectedAnswers.length > 0 && quizStatus === 'question') {
      const answer = currentQuestion.type === 'single' ? selectedAnswers[0] : selectedAnswers;
      console.log('Submitting answer:', answer);
      socketService.submitAnswer(roomCode, answer, timeLeft);
    }
  }, [hasAnswered, currentQuestion, selectedAnswers, quizStatus, roomCode, timeLeft]);

  const toggleAnswer = useCallback((optionId: string, isSingle: boolean) => {
    if (hasAnswered) return;
    if (isSingle) {
      setSelectedAnswers([optionId]);
    } else {
      setSelectedAnswers(prev =>
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    }
  }, [hasAnswered]);

  const setName = useCallback((name: string) => {
    if (name.trim()) {
      sessionStorage.setItem('playerName', name);
      setPlayerName(name);
      setIsNameSet(true);
      connectAndJoin(name);
    }
  }, [connectAndJoin]);

  return {
    playerName,
    isNameSet,
    currentQuestion,
    timeLeft,
    selectedAnswers,
    quizStatus,
    players,
    myScore,
    roundResults,
    leaderboard,
    questionNumber,
    totalQuestions,
    hasAnswered,
    savedMessage,
    optionVotes,
    correctAnswers,
    totalPlayers,
    setName,
    submitAnswer,
    toggleAnswer,
  };
};
