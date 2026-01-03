export type QuizStatus = 'draft' | 'waiting' | 'active' | 'finished';

export interface Quiz {
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  room_code: string;
  status: QuizStatus;
  time_per_question: number;
  max_participants: number;
  created_at: Date;
  updated_at: Date;
}

export interface QuizWithOrganizer extends Quiz {
  organizer_name: string;
  participant_count?: number;
}

export interface CreateQuizDto {
  title: string;
  description?: string;
  time_per_question?: number;
  max_participants?: number;
}

export interface UpdateQuizDto {
  title?: string;
  description?: string;
  time_per_question?: number;
  max_participants?: number;
  status?: QuizStatus;
}