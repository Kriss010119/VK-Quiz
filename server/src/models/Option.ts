export interface Option {
  id: string;
  question_id: string;
  text: string;
  is_correct: boolean;
  order_index: number;
}

export interface CreateOptionDto {
  text: string;
  is_correct: boolean;
}

export interface UpdateOptionDto {
  text?: string;
  is_correct?: boolean;
  order_index?: number;
}

export interface OptionWithQuestion extends Option {
  question_text: string;
  quiz_id: string;
}