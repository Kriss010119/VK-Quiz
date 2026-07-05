import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionBlock, QuizCard, EmptyState } from '../..';
import { formatDate } from '../../../utils';
import type { QuizFromAPI } from '../../../types';

interface YourLikesSectionProps {
  quizzes: QuizFromAPI[];
  userId?: string;
  onJoinQuiz: (roomCode: string) => void;
  onLikeQuiz: (quizId: string) => void;
}

export const YourLikesSection = ({
  quizzes,
  userId,
  onJoinQuiz,
  onLikeQuiz,
} : YourLikesSectionProps) => {
  const navigate = useNavigate();

  return (
    <SectionBlock 
      title="YOUR LIKES" 
      showMore 
      onShowMore={() => navigate('/more-quizes?section=likes')}
    >
      {quizzes.length === 0 ? (
        <EmptyState message="No liked quizzes yet" />
      ) : (
        quizzes.map((quiz) => (
          <QuizCard
            key={quiz.id}
            roomId={quiz.room_code}
            title={quiz.title}
            author={quiz.author_name || 'Unknown'}
            date={formatDate(quiz.created_at)}
            description={quiz.description || 'No description'}
            tags={quiz.tags || []}
            status={quiz.status}
            role="player"
            isLiked={true}
            onClick={() => navigate(`/quiz/${quiz.id}`)}
            actionLabel="JOIN"
            onAction={() => onJoinQuiz(quiz.room_code)}
            onLike={() => onLikeQuiz(quiz.id)}
            showEdit={false}
            showDelete={false}
          />
        ))
      )}
    </SectionBlock>
  );
};
