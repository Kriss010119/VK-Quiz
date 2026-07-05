import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { socketService } from '../../services/socket';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { Leaderboard } from '../../components/Leaderboard';
import { Sidebar } from '../../components/Sidebar';
import { ParticipantsBlock } from '../../components/ParticipantsBlock';
import { StandingsBlock } from '../../components/Sidebar/StandingsBlock';
import { PageLayout, BackLink } from '../../components';
import { Clock } from '../../components/Icons';
import styles from './HostRoom.module.css';

interface Player {
  id: string;
  name: string;
  score: number;
  hasAnswered: boolean;
}

interface Question {
  id: string;
  text: string;
  type: 'single' | 'multiple' | 'text';
  imageUrl?: string;
  options: { id: string; text: string; is_correct: boolean }[];
  points: number;
}

interface RoundResult {
  name: string;
  pointsEarned: number;
  totalScore: number;
  isCorrect: boolean;
}

export const HostRoom = () => {
  const { quizId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [quizStatus, setQuizStatus] = useState<'waiting' | 'question' | 'answer' | 'results'>('waiting');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [quizName, setQuizName] = useState('');
  const [timePerQuestion, setTimePerQuestion] = useState(30);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [currentQuestionText, setCurrentQuestionText] = useState('');
  const [optionVotes, setOptionVotes] = useState<{ text: string; isCorrect: boolean; votes: number }[]>([]);

  const isContinue = location.pathname.includes('/continue');

  useEffect(() => {
    setupSocketListeners();
    
    if (isContinue) {
      continueQuiz();
    } else {
      fetchQuizAndCreateRoom();
    }
    
    return () => {
      socketService.off('room-created');
      socketService.off('player-joined');
      socketService.off('questions-loaded');
      socketService.off('quiz-started');
      socketService.off('question:new');
      socketService.off('question:tick');
      socketService.off('round-results');
      socketService.off('quiz:finished');
      socketService.off('host-continued');
      socketService.off('host-left-game');
      socketService.off('error');
    };
  }, [quizId, location.pathname]);

  const setupSocketListeners = () => {
    socketService.on('room-created', ({ roomCode: code }) => {
      console.log('Room created:', code);
      toast.success(`Room created: ${code}`);
    });

    socketService.on('player-joined', ({ players: updatedPlayers, count }) => {
      setPlayers(updatedPlayers);
      const answered = updatedPlayers.filter((p: Player) => p.hasAnswered).length;
      setAnsweredCount(answered);
      toast.success(`Player joined. Total: ${count}`);
    });

    socketService.on('questions-loaded', () => {
      console.log('Questions loaded');
    });

    socketService.on('quiz-started', () => {
      console.log('Quiz started');
    });

    socketService.on('question:new', ({ question, questionIndex, totalQuestions, timeLimit }) => {
      setCurrentQuestionIndex(questionIndex);
      setTimeLeft(timeLimit);
      setAnsweredCount(0);
      setQuizStatus('question');
      setIsLoading(false);
    });

    socketService.on('question:tick', ({ timeLeft }) => {
      setTimeLeft(timeLeft);
    });

    socketService.on('round-results', ({ results, correctAnswers: correct, questionText, optionVotes }) => {
      setRoundResults(results);
      setCorrectAnswers(correct);
      setCurrentQuestionText(questionText);
      setOptionVotes(optionVotes || []);
      setQuizStatus('answer');
      setIsLoading(false);
    });

    socketService.on('quiz:finished', ({ leaderboard }) => {
      setPlayers(leaderboard);
      setQuizStatus('results');
      setIsLoading(false);
    });

    socketService.on('host-continued', ({ currentQuestion, totalQuestions, players: savedPlayers, isRunning, questions: savedQuestions }) => {
      console.log('Host continued event received:', { currentQuestion, totalQuestions, isRunning });
      
      if (savedQuestions && savedQuestions.length > 0) {
        setQuestions(savedQuestions);
      }
      
      if (savedPlayers && savedPlayers.length > 0) {
        setPlayers(savedPlayers);
      }
      
      setCurrentQuestionIndex(currentQuestion || 0);
      
      if (isRunning) {
        setQuizStatus('question');
        toast.success('Quiz continued!');
      } else {
        setQuizStatus('waiting');
      }
      
      setIsLoading(false);
    });

    socketService.on('host-left-game', () => {
      toast.info('You left the game, but the quiz continues. Click CONTINUE to rejoin.');
      setIsLoading(false);
    });

    socketService.on('error', (msg: string) => {
      console.error('Socket error:', msg);
      toast.error(msg);
    });
  };

  const continueQuiz = async () => {
    setIsLoading(true);
    try {
      socketService.connect();
      
      const response = await api.get(`/quizzes/${quizId}`);
      const quizData = response.data;
      
      setQuizName(quizData.title);
      setRoomCode(quizData.room_code);
      setTimePerQuestion(quizData.time_per_question || 30);
      
      const gameQuestions = (quizData.questions || []).map((q: any) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        imageUrl: q.image_url || undefined,
        options: q.options || [],
        points: q.points || 100,
      }));
      
      setQuestions(gameQuestions);
      
      socketService.emit('host:continue-quiz', { roomCode: quizData.room_code });
      
    } catch (error) {
      console.error('Error continuing quiz:', error);
      toast.error('Failed to continue quiz');
      navigate('/');
      setIsLoading(false);
    }
  };

  const fetchQuizAndCreateRoom = async () => {
    setIsLoading(true);
    try {
      socketService.connect();
      
      const response = await api.get(`/quizzes/${quizId}`);
      const quizData = response.data;
      
      setQuizName(quizData.title);
      
      if (quizData.status === 'active' || quizData.status === 'waiting') {
        setRoomCode(quizData.room_code);
        setTimePerQuestion(quizData.time_per_question || 30);
        
        const gameQuestions = (quizData.questions || []).map((q: any) => ({
          id: q.id,
          text: q.text,
          type: q.type,
          imageUrl: q.image_url || undefined,
          options: q.options || [],
          points: q.points || 100,
        }));
        setQuestions(gameQuestions);
        
        socketService.emit('host:continue-quiz', { roomCode: quizData.room_code });
        toast.success('Reconnecting to room...');
        return;
      }
      
      if (quizData.status === 'draft') {
        await api.patch(`/quizzes/${quizId}/publish`);
        toast.success('Quiz published! Players can now see it in WAITING section');
      }
      
      if (quizData.status === 'finished') {
        await api.patch(`/quizzes/${quizId}/stop`);
        await api.patch(`/quizzes/${quizId}/publish`);
        toast.success('Quiz re-published!');
      }
      
      const gameQuestions = (quizData.questions || []).map((q: any) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        imageUrl: q.image_url || undefined,
        options: q.options || [],
        points: q.points || 100,
      }));
      
      setQuestions(gameQuestions);
      
      const newRoomCode = quizData.room_code;
      setRoomCode(newRoomCode);
      
      socketService.createRoom(newRoomCode, quizId || '', user?.name || 'Host', user?.id);
      
      toast.success(`Room created! Code: ${newRoomCode}`);
      
    } catch (error) {
      console.error('Error loading quiz:', error);
      toast.error('Failed to load quiz');
      navigate('/');
      setIsLoading(false);
    }
  };

  const startQuiz = async () => {
    if (players.length === 0) {
      toast.error('No players joined');
      return;
    }
    
    try {
      await api.patch(`/quizzes/${quizId}/start`);
      socketService.loadQuestions(roomCode, questions, timePerQuestion, {});
      socketService.startQuiz(roomCode);
    } catch (error) {
      console.error('Error starting quiz:', error);
      toast.error('Failed to start quiz');
    }
  };

  const stopQuiz = () => {
  if (confirm('Are you sure you want to stop the quiz? This will end the game for all players.')) {
    socketService.emit('host:stop-quiz', { roomCode });
    setQuizStatus('results');
    toast.success('Quiz stopped');
    setTimeout(() => {
      navigate('/');
    }, 2000);
  }
};

  const nextQuestion = () => {
    socketService.emit('host:next-question', { roomCode });
  };

  const showAnswer = () => {
    socketService.emit('host:show-answer', { roomCode });
  };

  const finishQuiz = async () => {
    try {
      await api.patch(`/quizzes/${quizId}/finish`);
      setQuizStatus('results');
      socketService.emit('quiz:finished', { roomCode });
      toast.success('Quiz finished');
    } catch (error) {
      console.error('Error finishing quiz:', error);
      toast.error('Failed to finish quiz');
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast.success('Room code copied');
  };

  const getCurrentQuestion = (): Question | null => {
    if (questions.length === 0) return null;
    if (currentQuestionIndex < 0 || currentQuestionIndex >= questions.length) return null;
    return questions[currentQuestionIndex];
  };

  const currentQuestion = getCurrentQuestion();

  const getSidebarContent = () => {
    if (quizStatus === 'results') {
      return (
        <StandingsBlock
          players={players.map(p => ({ name: p.name, score: p.score }))}
          title="FINAL STANDINGS"
        />
      );
    }
    
    return (
      <ParticipantsBlock
        players={players.map(p => ({
          id: p.id,
          name: p.name,
          hasAnswered: p.hasAnswered
        }))}
      />
    );
  };

  const sidebarElement = (
    <Sidebar
      user={{ name: user?.name || 'Host', email: 'ORGANIZER' }}
      customContent={getSidebarContent()}
      hideLastQuiz={true}
      hideStatistics={false}
    />
  );

  if (isLoading) {
    return (
      <PageLayout sidebar={sidebarElement}>
        <Header />
        <div className={styles.loading}>Loading quiz...</div>
        <Footer />
      </PageLayout>
    );
  }

  if (quizStatus === 'waiting') {
    return (
      <PageLayout sidebar={sidebarElement}>
        <Header />
        <div className={styles.quizCard}>
          <div className={styles.topBar}>
            <BackLink onClick={() => navigate('/')} />
            <h1 className={styles.quizTitle}>{quizName}</h1>
            <div className={styles.hostActions}>
              <button className={styles.stopHostBtn} onClick={stopQuiz}>
                STOP QUIZ
              </button>
              <div className={styles.hostName}>{user?.name || 'Host'}</div>
            </div>
          </div>
          
          <div className={styles.roomInfo}>
            <div className={styles.roomCodeCard}>
              <span className={styles.roomCodeLabel}>ROOM CODE</span>
              <div className={styles.roomCodeValue}>
                {roomCode}
                <button className={styles.copyBtn} onClick={copyRoomCode}>
                  COPY
                </button>
              </div>
            </div>
          </div>
          
          <div className={styles.waitingArea}>
            <div className={styles.waitingMessage}>
              <div className={styles.loader}></div>
              <p>WAITING FOR PLAYERS TO JOIN...</p>
            </div>
          </div>
          
          <button 
            className={styles.startBtn} 
            onClick={startQuiz}
            disabled={players.length === 0}
          >
            START QUIZ ({players.length} PLAYERS)
          </button>
        </div>
        <Footer />
      </PageLayout>
    );
  }

  if (quizStatus === 'question') {
    if (questions.length === 0) {
      return (
        <PageLayout sidebar={sidebarElement}>
          <Header />
          <div className={styles.loading}>Loading questions...</div>
          <Footer />
        </PageLayout>
      );
    }
    
    if (!currentQuestion) {
      return (
        <PageLayout sidebar={sidebarElement}>
          <Header />
          <div className={styles.loading}>Loading question...</div>
          <Footer />
        </PageLayout>
      );
    }
    
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    
    return (
      <PageLayout sidebar={sidebarElement}>
        <Header />
        <div className={styles.quizCard}>
          <div className={styles.topBar}>
            <BackLink onClick={() => navigate('/')} />
            <h1 className={styles.quizTitle}>{quizName}</h1>
            <div className={styles.hostName}>{user?.name || 'Host'}</div>
          </div>
          
          <div className={styles.questionArea}>
            <div className={styles.questionHeader}>
              <span className={styles.questionNumber}>QUESTION {currentQuestionIndex + 1}/{questions.length}</span>
              <div className={styles.statsBadge}>
                <span>answered {answeredCount}/{players.length}</span>
                <span>{timeLeft}s</span>
                <Clock size={16} />
              </div>
            </div>
            
            <div className={styles.progressBarContainer}>
              <div className={styles.progressBar} style={{ width: `${progress}%` }} />
            </div>
            
            <div className={styles.questionBox}>
              <p>{currentQuestion.text}</p>
            </div>
            
            {currentQuestion.imageUrl && (
              <div className={styles.questionImage}>
                <img src={currentQuestion.imageUrl} alt="question" />
              </div>
            )}
            
            <div className={styles.optionsList}>
              {currentQuestion.options.map((option, idx) => (
                <div key={option.id} className={styles.optionPreview}>
                  <span className={styles.optionLetter}>{String.fromCharCode(65 + idx)}</span>
                  <span className={styles.optionText}>{option.text}</span>
                </div>
              ))}
            </div>
            
            <button className={styles.nextBtn} onClick={showAnswer}>
              SHOW ANSWER
            </button>
          </div>
        </div>
        <Footer />
      </PageLayout>
    );
  }

  if (quizStatus === 'answer') {
    return (
      <PageLayout sidebar={sidebarElement}>
        <Header />
        <div className={styles.quizCard}>
          <div className={styles.topBar}>
            <BackLink onClick={() => navigate('/')} />
            <h1 className={styles.quizTitle}>{quizName}</h1>
            <div className={styles.hostName}>{user?.name || 'Host'}</div>
          </div>
          
          <div className={styles.questionArea}>
            <div className={styles.questionHeader}>
              <span className={styles.questionNumber}>Question {currentQuestionIndex + 1}/{questions.length}</span>
              <div className={styles.statsBadge}>
                <span>answered {answeredCount}/{players.length}</span>
                <span>|</span>
                <span>{timeLeft}s</span>
                <Clock size={16} />
              </div>
            </div>
            
            <div className={styles.questionBox}>
              <p>{currentQuestionText}</p>
            </div>
            
            {currentQuestion?.imageUrl && (
              <div className={styles.questionImage}>
                <img src={currentQuestion.imageUrl} alt="question" />
              </div>
            )}
            
            <div className={styles.answerResults}>
              {optionVotes.map((opt, idx) => (
                <div key={idx} className={styles.answerResultRow}>
                  <div className={`${styles.answerBlock} ${opt.isCorrect ? styles.answerCorrect : styles.answerWrong}`}>
                    <span>{opt.text}</span>
                  </div>
                  <div className={styles.voteCount}>
                    <span>{opt.votes} votes</span>
                  </div>
                </div>
              ))}
            </div>
            
            <button className={styles.nextBtn} onClick={nextQuestion}>
              {currentQuestionIndex + 1 >= questions.length ? 'FINISH' : 'NEXT QUESTION'}
            </button>
          </div>
        </div>
        <Footer />
      </PageLayout>
    );
  }

  if (quizStatus === 'results') {
    return (
      <PageLayout sidebar={sidebarElement}>
        <Header />
        <div className={styles.quizCard}>
          <div className={styles.topBar}>
            <BackLink onClick={() => navigate('/')} />
            <h1 className={styles.quizTitle}>FINAL RESULTS</h1>
            <div className={styles.hostName}>{quizName}</div>
          </div>
          
          <div className={styles.leaderboardArea}>
            <Leaderboard
              leaderboard={players.map(p => ({
                name: p.name,
                score: p.score,
              }))}
            />
          </div>
        </div>
        <Footer />
      </PageLayout>
    );
  }

  return null;
};
