import type { QuizFromAPI, QuizStatus } from '../types';
import { QUIZ_ACTION_LABELS, EDITABLE_STATUSES } from '../constants';

export const shouldShowEditDelete = (status: QuizStatus): boolean => {
  return EDITABLE_STATUSES.has(status);
};

export const getMyQuizActionLabel = (
  quiz: QuizFromAPI, 
  isActiveRoomWithoutHost: boolean
): string => {
  if (isActiveRoomWithoutHost) {
    return QUIZ_ACTION_LABELS.CONTINUE;
  }
  
  switch (quiz.status) {
    case 'draft':
      return QUIZ_ACTION_LABELS.DRAFT;
    case 'waiting':
      return QUIZ_ACTION_LABELS.WAITING;
    case 'active':
      return QUIZ_ACTION_LABELS.ACTIVE;
    case 'finished':
      return QUIZ_ACTION_LABELS.FINISHED;
    default:
      return QUIZ_ACTION_LABELS.WAITING;
  }
};

export const getWaitingActionLabel = (
  quiz: QuizFromAPI,
  isMyQuiz: boolean,
  isActiveRoomWithoutHost: boolean
): string => {
  if (isMyQuiz && isActiveRoomWithoutHost) {
    return QUIZ_ACTION_LABELS.CONTINUE;
  }
  if (isMyQuiz && quiz.status === 'active') {
    return QUIZ_ACTION_LABELS.ACTIVE;
  }
  if (isMyQuiz && quiz.status === 'waiting') {
    return QUIZ_ACTION_LABELS.WAITING;
  }
  return QUIZ_ACTION_LABELS.JOIN;
};