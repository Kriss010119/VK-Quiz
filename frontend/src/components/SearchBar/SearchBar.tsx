import React, { useState } from 'react';
import { Button, TextButton } from '../Buttons';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onClear?: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const SearchBar = ({ 
  onSearch, 
  onClear, 
  isLoading = false,
  placeholder = "name, author, tag or room"
} : SearchBarProps) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch?.(query);
    }
  };

  const handleClear = () => {
    setQuery('');
    onClear?.();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    
    if (newValue === '') {
      onClear?.();
    }
  };

  return (
    <div className={styles.searchContainer}>
      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
        />
        {query && (
          <TextButton onClick={handleClear} className={styles.clearBtn}>
            ✕
          </TextButton>
        )}
        <Button 
          type="submit" 
          variant="primary" 
          size="md"
          disabled={isLoading || !query.trim()}
          className={styles.searchButton}
        >
          {isLoading ? 'SEARCHING...' : 'FIND QUIZ'}
        </Button>
      </form>
    </div>
  );
};