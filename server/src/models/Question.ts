import type { Option, CreateOptionDto } from './Option';

export type QuestionType = 'single' | 'multiple' | 'text' | 'image';

export interface Question {
  id: string;
  quiz_id: string;
  type: QuestionType;
  text: string;
  image_url?: string;
  points: number;
  order_index: number;
  created_at: Date;
}

export interface QuestionWithOptions extends Question {
  options: Option[];
}

export interface CreateQuestionDto {
  type: QuestionType;
  text: string;
  image_url?: string;
  points?: number;
  options?: CreateOptionDto[];
}

export interface UpdateQuestionDto {
  type?: QuestionType;
  text?: string;
  image_url?: string;
  points?: number;
  options?: CreateOptionDto[];
}