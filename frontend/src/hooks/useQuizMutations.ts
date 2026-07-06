/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { socketService } from '../services/socket';

interface UseQuizMutationsProps {
  onSuccess?: () => void;
}

export const useQuizMutations = ({ onSuccess }: UseQuizMutationsProps = {}) => {
  
  const likeQuiz = useCallback(async (quizId: string) => {
    try {
      await api.post(`/quizzes/${quizId}/like`);
      toast.success('Quiz liked!');
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to like quiz');
    }
  }, [onSuccess]);

  const unlikeQuiz = useCallback(async (quizId: string) => {
    try {
      await api.delete(`/quizzes/${quizId}/like`);
      toast.success('Quiz unliked!');
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to unlike quiz');
    }
  }, [onSuccess]);

  const publishQuiz = useCallback(async (quizId: string) => {
    try {
      await api.patch(`/quizzes/${quizId}/publish`);
      toast.success('Quiz published!');
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to publish quiz');
    }
  }, [onSuccess]);

  const deleteQuiz = useCallback(async (quizId: string) => {
    if (confirm('Are you sure you want to delete this quiz?')) {
      try {
        await api.delete(`/quizzes/${quizId}`);
        toast.success('Quiz deleted');
        onSuccess?.();
      } catch (error) {
        toast.error('Failed to delete quiz');
      }
    }
  }, [onSuccess]);

  const startQuiz = useCallback(async (quizId: string) => {
    try {
      await api.patch(`/quizzes/${quizId}/start`);
      return true;
    } catch (error) {
      toast.error('Failed to start quiz');
      return false;
    }
  }, []);

    
  const stopQuiz = useCallback(async (quizId: string, roomCode: string) => {
    if (confirm('Are you sure you want to stop this quiz? This will end the game for all players.')) {
        try {
        await api.patch(`/quizzes/${quizId}/stop`);
        toast.success('Quiz stopped successfully');
        
        socketService.emit('host:stop-quiz', { roomCode });
        
        onSuccess?.();
        return true;
        } catch (error) {
        toast.error('Failed to stop quiz');
        return false;
        }
    }
    return false;
    }, [onSuccess]);

  return {
    likeQuiz,
    unlikeQuiz,
    publishQuiz,
    deleteQuiz,
    startQuiz,
    stopQuiz,
  };
};