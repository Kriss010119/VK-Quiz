export type QuizStatus = 'draft' | 'waiting' | 'active' | 'finished';

export interface QuizFromAPI {
  id: string;
  title: string;
  description: string;
  room_code: string;
  status: QuizStatus;
  author_name?: string;
  organizer_name?: string;
  organizer_id?: string;
  created_at: string;
  participant_count?: number;
  tags?: string[];
}

export interface LastQuizInfo {
  name: string;
  author: string;
  date: string;
  userPlace: string;
  topPlayers: Array<{ name: string; place: number }>;
}

export interface SidebarUser {
  name: string;
  email: string;
}