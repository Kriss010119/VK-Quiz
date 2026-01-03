export interface QuizSession {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  joined_at: Date;
  completed_at: Date | null;
}

export interface Answer {
  id: string;
  session_id: string;
  question_id: string;
  selected_option_ids: string[];
  is_correct: boolean;
  answered_at: Date;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  rank: number;
  userId?: string;
}

export interface SessionWithDetails extends QuizSession {
  quiz_title: string;
  quiz_author: string;
  total_questions: number;
  correct_answers: number;
}

export interface SubmitAnswerDto {
  questionId: string;
  selectedOptionIds: string[];
  timeLeft: number;
}

export interface QuizResult {
  sessionId: string;
  score: number;
  totalPossible: number;
  percentage: number;
  leaderboard: LeaderboardEntry[];
  questions: {
    questionId: string;
    text: string;
    userAnswer: string[];
    correctAnswer: string[];
    isCorrect: boolean;
    pointsEarned: number;
  }[];
}