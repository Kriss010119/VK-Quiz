import { useNavigate } from 'react-router-dom';

export const useQuizNavigation = () => {
  const navigate = useNavigate();

  const goToHome = () => {
    navigate('/');
  };

  const goToRoom = (roomCode: string) => {
    navigate(`/room/${roomCode}`);
  };

  const goToHost = (quizId: string) => {
    navigate(`/host/${quizId}`);
  };

  const goToContinueHost = (quizId: string) => {
    navigate(`/host/${quizId}/continue`);
  };

  const goToEditQuiz = (quizId: string) => {
    navigate(`/edit-quiz/${quizId}`);
  };

  const goToCreateQuiz = () => {
    navigate('/create-quiz');
  };

  const goToProfile = () => {
    navigate('/profile');
  };

  const goToQuizDetails = (quizId: string) => {
    navigate(`/quiz/${quizId}`);
  };

  const goBack = () => {
    navigate(-1);
  };

  return {
    goToHome,
    goToRoom,
    goToHost,
    goToContinueHost,
    goToEditQuiz,
    goToCreateQuiz,
    goToProfile,
    goToQuizDetails,
    goBack,
  };
};