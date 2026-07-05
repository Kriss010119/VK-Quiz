import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { socketService } from '../services/socket';

export const useQuizActions = (onDataRefresh: () => void) => {
  const navigate = useNavigate();

  const handleJoinQuiz = (roomCode: string) => {
    navigate(`/room/${roomCode}`);
  };

  const handleStartQuiz = async (quizId: string) => {
    try {
      await api.patch(`/quizzes/${quizId}/start`);
      navigate(`/host/${quizId}`);
    } catch (error) {
      console.error('Error starting quiz:', error);
      toast.error('Failed to start quiz');
    }
  };

  const handleContinueQuiz = (quizId: string) => {
    navigate(`/host/${quizId}/continue`);
  };

  const handleStopQuiz = async (quizId: string, roomCode: string) => {
    if (confirm('Are you sure you want to stop this quiz? This will end the game for all players.')) {
      try {
        await api.patch(`/quizzes/${quizId}/stop`);
        toast.success('Quiz stopped successfully');
        socketService.emit('host:stop-quiz', { roomCode });
        onDataRefresh();
      } catch (error) {
        toast.error('Failed to stop quiz');
      }
    }
  };

  const handleCreateQuiz = () => {
    navigate('/create-quiz');
  };

  const handleEditQuiz = (quizId: string) => {
    navigate(`/edit-quiz/${quizId}`);
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (confirm('Are you sure you want to delete this quiz?')) {
      try {
        await api.delete(`/quizzes/${quizId}`);
        toast.success('Quiz deleted');
        onDataRefresh();
      } catch (error) {
        toast.error('Failed to delete quiz');
      }
    }
  };

  const handleLikeQuiz = async (quizId: string) => {
    try {
      await api.post(`/quizzes/${quizId}/like`);
      toast.success('Quiz liked!');
      onDataRefresh();
    } catch (error) {
      toast.error('Failed to like quiz');
    }
  };

  const handlePublishQuiz = async (quizId: string) => {
    try {
      await api.patch(`/quizzes/${quizId}/publish`);
      toast.success('Quiz published!');
      onDataRefresh();
    } catch (error) {
      toast.error('Failed to publish quiz');
    }
  };

  return {
    handleJoinQuiz,
    handleStartQuiz,
    handleContinueQuiz,
    handleStopQuiz,
    handleCreateQuiz,
    handleEditQuiz,
    handleDeleteQuiz,
    handleLikeQuiz,
    handlePublishQuiz
  };
};