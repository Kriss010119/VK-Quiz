import { useNavigate } from 'react-router-dom';
import { SectionBlock, QuizCard, EmptyState, CreateQuizButton } from '../..';
import { formatDate, shouldShowEditDelete } from '../../../utils';
import type { QuizFromAPI } from '../../../types';

interface YourQuizzesSectionProps {
  quizzes: QuizFromAPI[];
  userName?: string;
  activeRoomsWithoutHost: Set<string>;
  onCreateQuiz: () => void;
  onStartQuiz: (quizId: string) => void;
  onStopQuiz: (quizId: string, roomCode: string) => void;
  onContinueQuiz: (quizId: string) => void;
  onPublishQuiz: (quizId: string) => void;
  onEditQuiz: (quizId: string) => void;
  onDeleteQuiz: (quizId: string) => void;
  onLikeQuiz: (quizId: string) => void;
}

export const YourQuizzesSection = ({
  quizzes,
  userName,
  activeRoomsWithoutHost,
  onCreateQuiz,
  onStartQuiz,
  onStopQuiz,
  onContinueQuiz,
  onPublishQuiz,
  onEditQuiz,
  onDeleteQuiz,
  onLikeQuiz,
} : YourQuizzesSectionProps) => {
  const navigate = useNavigate();

  const getActionForQuiz = (quiz: QuizFromAPI) => {
    if (activeRoomsWithoutHost.has(quiz.id)) {
      return { label: 'CONTINUE', handler: () => onContinueQuiz(quiz.id) };
    }
    switch (quiz.status) {
      case 'draft': 
        return { label: 'PUBLISH', handler: () => onPublishQuiz(quiz.id) };
      case 'waiting':   
        return { label: 'START', handler: () => onStartQuiz(quiz.id) };
      case 'active': 
        return { label: 'STOP', handler: () => onStopQuiz(quiz.id, quiz.room_code) };
      case 'finished':  
        return { label: 'START', handler: () => onStartQuiz(quiz.id) };
      default: 
        return { label: 'START', handler: () => onStartQuiz(quiz.id) };
    }
  };

  return (
    <SectionBlock 
      title="YOUR QUIZES" 
      showMore 
      onShowMore={() => navigate('/more-quizes?section=your')}
      actions={
        <CreateQuizButton onClick={onCreateQuiz} />
      }
    >
      {quizzes.length === 0 ? (
        <EmptyState message="You haven't created any quizzes yet" />
      ) : (
        quizzes.map((quiz) => {
          const { label, handler } = getActionForQuiz(quiz);
          
          return (
            <QuizCard
              key={quiz.id}
              roomId={quiz.room_code}
              title={quiz.title}
              author={userName || 'You'}
              date={formatDate(quiz.created_at)}
              description={quiz.description || 'No description'}
              tags={quiz.tags || []}
              status={quiz.status}
              role="creator"
              isLiked={false}
              onClick={() => navigate(`/quiz/${quiz.id}`)}
              actionLabel={label}
              onAction={handler}
              showEdit={shouldShowEditDelete(quiz.status)}
              showDelete={shouldShowEditDelete(quiz.status)}
              onEdit={() => onEditQuiz(quiz.id)}
              onDelete={() => onDeleteQuiz(quiz.id)}
              onLike={() => onLikeQuiz(quiz.id)}
            />
          );
        })
      )}
    </SectionBlock>
  );
};