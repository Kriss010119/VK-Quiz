import React from 'react';
import { Button } from './Button';

interface TextButtonProps {
  onClick: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const TextButton = ({ 
  onClick, 
  children, 
  disabled,
  icon,
  className 
} : TextButtonProps) => {
  return (
    <Button 
      variant="text" 
      size="md"
      onClick={onClick} 
      disabled={disabled}
      icon={icon}
      className={className}
    >
      {children}
    </Button>
  );
};