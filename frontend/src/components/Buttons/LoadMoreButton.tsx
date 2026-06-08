import React from 'react';
import { Button } from './Button';

interface LoadMoreButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
}

export const LoadMoreButton = ({ 
  onClick, 
  isLoading = false,
  hasMore = true 
} : LoadMoreButtonProps) => {
  if (!hasMore) return null;
  
  return (
    <Button 
      variant="loadMore" 
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? 'LOADING...' : 'LOAD MORE'}
    </Button>
  );
};