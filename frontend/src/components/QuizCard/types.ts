export type QuizStatus = 
  | 'waiting' 
  | 'in progress' 
  | 'finished' 
  | 'draft'
  | 'active';

export type QuizRole = 'player' | 'creator';

export interface QuizCardProps {
  roomId: string;
  title: string;
  author: string;
  date: string;
  description: string;
  tags: string[];
  status?: QuizStatus;
  isLiked?: boolean;
  role?: QuizRole;
  actionLabel?: string;
  showEdit?: boolean;
  showDelete?: boolean;
  onJoin?: () => void;
  onLike?: () => void;
  onStart?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAction?: () => void;
  onClick?: () => void; 
}