import { QuizCard } from '../QuizCard';
import type { QuizStatus } from '../QuizCard';
import styles from './QuizGrid.module.css';
import { useNavigate } from 'react-router-dom';

export interface QuizGridItem {
  organizer_id: string;
  id: string;
  title: string;
  description: string;
  room_code: string;
  status: QuizStatus;
  author_name?: string;
  organizer_name?: string;
  created_at: string;
}

interface QuizGridProps {
  quizzes: QuizGridItem[];
  section?: 'waiting' | 'your' | 'likes';
  userId?: string;
  activeRoomsWithoutHost?: Set<string>;
  onJoinQuiz: (roomCode: string) => void;
  onStartQuiz?: (quizId: string) => void;
  onStopQuiz?: (quizId: string, roomCode: string) => void;
  onContinueQuiz?: (quizId: string) => void;
  onPublishQuiz?: (quizId: string) => void;
  onEditQuiz?: (quizId: string) => void;
  onDeleteQuiz?: (quizId: string) => void;
  onLikeQuiz: (quizId: string) => void;
}

export const QuizGrid = ({
  quizzes,
  section = 'waiting',
  userId,
  activeRoomsWithoutHost = new Set(),
  onJoinQuiz,
  onStartQuiz,
  onStopQuiz,
  onContinueQuiz,
  onPublishQuiz,
  onEditQuiz,
  onDeleteQuiz,
  onLikeQuiz,
} : QuizGridProps) => {
  const navigate = useNavigate();
   
  const getActionLabel = (quiz: QuizGridItem): string => {
    if (section === 'your') {
      if (activeRoomsWithoutHost.has(quiz.id)) {
        return 'CONTINUE';
      }
      
      switch (quiz.status) {
        case 'draft': return 'PUBLISH';
        case 'waiting': return 'START';
        case 'active': return 'STOP';
        case 'finished': return 'START';
        default: return 'PLAY';
      }
    }
    return 'JOIN';
  };

  const getActionHandler = (quiz: QuizGridItem) => {
    if (section === 'your') {
      if (activeRoomsWithoutHost.has(quiz.id)) {
        return () => onContinueQuiz?.(quiz.id);
      }
      
      switch (quiz.status) {
        case 'draft': return () => onPublishQuiz?.(quiz.id);
        case 'waiting': return () => onStartQuiz?.(quiz.id);
        case 'active': return () => onStopQuiz?.(quiz.id, quiz.room_code);
        case 'finished': return () => onStartQuiz?.(quiz.id);
        default: return () => onJoinQuiz(quiz.room_code);
      }
    }
    return () => onJoinQuiz(quiz.room_code);
  };

  const isLiked = section === 'likes';
  const isCreator = section === 'your';
  const showEditDelete = (status: QuizStatus): boolean => {
    return status === 'draft' || status === 'finished';
  };

  return (
    <div className={styles.cardsGrid}>
      {quizzes.map((quiz) => (
        <QuizCard
          key={quiz.id}
          roomId={quiz.room_code}
          title={quiz.title}
          author={quiz.author_name || quiz.organizer_name || 'Unknown'}
          date={new Date(quiz.created_at).toLocaleDateString('ru-RU')}
          description={quiz.description || 'No description'}
          tags={['quiz']}
          status={quiz.status}
          isLiked={isLiked}
          role={isCreator ? 'creator' : 'player'}
          showEdit={isCreator && showEditDelete(quiz.status)}
          showDelete={isCreator && showEditDelete(quiz.status)}
          actionLabel={getActionLabel(quiz)}
          onAction={getActionHandler(quiz)}
          onEdit={() => onEditQuiz?.(quiz.id)}
          onDelete={() => onDeleteQuiz?.(quiz.id)}
          onLike={() => onLikeQuiz(quiz.id)}
          onClick={() => navigate(`/quiz/${quiz.id}`)}
        />
      ))}
    </div>
  );
};