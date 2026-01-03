export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'player' | 'organizer' | 'admin';
  created_at: Date;
  updated_at: Date;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: Date;
}

export interface UserStats {
  quizzes_played: number;
  total_score: number;
  avg_score: number;
  best_score: number;
}

export interface UserHistory {
  id: string;
  title: string;
  score: number;
  joined_at: Date;
  completed_at: Date;
  total_participants: number;
}