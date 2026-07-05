import { useNavigate } from 'react-router-dom';
import { SectionBlock, QuizCard, EmptyState } from '../..';
import { formatDate, getWaitingActionLabel } from '../../../utils';
import type { QuizFromAPI } from '../../../types';

interface WaitingSectionProps {
  quizzes: QuizFromAPI[];
  userId?: string;
  activeRoomsWithoutHost: Set<string>;
  onJoinQuiz: (roomCode: string) => void;
  onStartQuiz: (quizId: string) => void;
  onStopQuiz: (quizId: string, roomCode: string) => void;
  onContinueQuiz: (quizId: string) => void;
  onLikeQuiz: (quizId: string) => void;
}

export const WaitingSection = ({
  quizzes,
  userId,
  activeRoomsWithoutHost,
  onJoinQuiz,
  onStartQuiz,
  onStopQuiz,
  onContinueQuiz,
  onLikeQuiz,
} : WaitingSectionProps) => {
  const navigate = useNavigate();

  const getActionForQuiz = (quiz: QuizFromAPI): { label: string; handler: () => void } => {
    const isMyQuiz = quiz.organizer_id === userId;
    const label = getWaitingActionLabel(quiz, isMyQuiz, activeRoomsWithoutHost.has(quiz.id));
    
    let handler: () => void;

    if (isMyQuiz && activeRoomsWithoutHost.has(quiz.id)) {
      handler = () => onContinueQuiz(quiz.id);
    } else if (isMyQuiz && quiz.status === 'active') {
      handler = () => onStopQuiz(quiz.id, quiz.room_code);
    } else if (isMyQuiz && quiz.status === 'waiting') {
      handler = () => onStartQuiz(quiz.id);
    } else {
      handler = () => onJoinQuiz(quiz.room_code);
    }
    
    return { label, handler };
  };

  return (
    <SectionBlock 
      title="WAITING" 
      showMore 
      onShowMore={() => navigate('/more-quizes?section=waiting')}
    >
      {quizzes.length === 0 ? (
        <EmptyState message="No available quizzes" />
      ) : (
        quizzes.map((quiz) => {
          const isMyQuiz = quiz.organizer_id === userId;
          const { label, handler } = getActionForQuiz(quiz);
          
          return (
            <QuizCard
              key={quiz.id}
              roomId={quiz.room_code}
              title={quiz.title}
              author={quiz.author_name || 'Unknown'}
              date={formatDate(quiz.created_at)}
              description={quiz.description || 'No description'}
              tags={quiz.tags || []}
              status={quiz.status}
              role={isMyQuiz ? 'creator' : 'player'}
              isLiked={false}
              onClick={() => navigate(`/quiz/${quiz.id}`)}
              actionLabel={label}
              onAction={handler}
              onLike={() => onLikeQuiz(quiz.id)}
              showEdit={false}
              showDelete={false}
            />
          );
        })
      )}
    </SectionBlock>
  );
};