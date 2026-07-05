import { useEffect } from 'react';
import { socketService } from '../services/socket';

interface UseQuizSocketProps {
  onQuizStarted?: () => void;
  onQuizStopped?: () => void;
  onQuizFinished?: () => void;
  onHostLeftGame?: (quizId: string) => void;
  onHostContinued?: (quizId: string) => void;
  onQuizzesUpdated?: () => void;
}

export const useQuizSocket = ({
  onQuizStarted,
  onQuizStopped,
  onQuizFinished,
  onHostLeftGame,
  onHostContinued,
  onQuizzesUpdated
}: UseQuizSocketProps) => {
  useEffect(() => {
    socketService.connect();

    const handleQuizStarted = ({ quizId }: { quizId: string }) => {
      console.log('Quiz started event:', quizId);
      onQuizStarted?.();
    };

    const handleQuizStopped = ({ quizId }: { quizId: string }) => {
      console.log('Quiz stopped event:', quizId);
      onQuizStopped?.();
    };

    const handleQuizFinished = () => {
      console.log('Quiz finished event');
      onQuizFinished?.();
    };

    const handleHostLeftGame = ({ quizId }: { quizId: string }) => {
      console.log('Host left game:', quizId);
      onHostLeftGame?.(quizId);
    };

    const handleHostContinued = ({ quizId }: { quizId: string }) => {
      console.log('Host continued:', quizId);
      onHostContinued?.(quizId);
    };

    const handleQuizzesUpdated = () => {
      console.log('Quizzes updated event');
      onQuizzesUpdated?.();
    };

    socketService.on('quiz-started', handleQuizStarted);
    socketService.on('quiz-stopped', handleQuizStopped);
    socketService.on('quiz-finished', handleQuizFinished);
    socketService.on('host-left-game', handleHostLeftGame);
    socketService.on('host-continued', handleHostContinued);
    socketService.on('quizzes-updated', handleQuizzesUpdated);

    return () => {
      socketService.off('quiz-started', handleQuizStarted);
      socketService.off('quiz-stopped', handleQuizStopped);
      socketService.off('quiz-finished', handleQuizFinished);
      socketService.off('host-left-game', handleHostLeftGame);
      socketService.off('host-continued', handleHostContinued);
      socketService.off('quizzes-updated', handleQuizzesUpdated);
    };
  }, [onQuizStarted, onQuizStopped, onQuizFinished, onHostLeftGame, onHostContinued, onQuizzesUpdated]);
};