import React from 'react';
import { Button } from './Button';

interface CreateQuizButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  children?: React.ReactNode;
}

export const CreateQuizButton = ({ 
  onClick, 
  variant = 'primary',
  children = 'CREATE QUIZ'
} : CreateQuizButtonProps) => {
  return (
    <Button variant={variant} size="md" onClick={onClick}>
      {children}
    </Button>
  );
};