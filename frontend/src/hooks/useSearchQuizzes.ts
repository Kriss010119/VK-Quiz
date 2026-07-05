import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import api from '../services/api';
import toast from 'react-hot-toast';
import type { QuizGridItem } from '../components/QuizGrid';

interface SearchFilters {
  query: string;
  type?: 'all' | 'waiting' | 'your';
}

export const useSearchQuizzes = () => {
  const [searchResults, setSearchResults] = useState<QuizGridItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<SearchFilters>({ query: '', type: 'all' });
  
  const debouncedQuery = useDebounce(filters.query, 500);

  const performSearch = useCallback(async (query: string, type?: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      setTotalCount(0);
      return;
    }

    setIsSearching(true);
    try {
      console.log('Searching for:', query);
      const response = await api.get('/quizzes/search', {
        params: {
          q: query,
          type: type !== 'all' ? type : undefined,
          limit: 50
        }
      });
      
      const results = response.data.quizzes || response.data;
      console.log('Search results:', results);
      setSearchResults(results);
      setTotalCount(response.data.total || results.length);
      setHasSearched(true);
    } catch (error) {
      console.error('Error searching quizzes:', error);
      toast.error('Failed to search quizzes');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery, filters.type);
    } else {
      setSearchResults([]);
      setHasSearched(false);
      setTotalCount(0);
    }
  }, [debouncedQuery, filters.type, performSearch]);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearSearch = useCallback(() => {
    setFilters({ query: '', type: 'all' });
    setSearchResults([]);
    setHasSearched(false);
    setTotalCount(0);
  }, []);

  return {
    searchResults,
    isSearching,
    hasSearched,
    totalCount,
    filters,
    updateFilters,
    clearSearch,
    performSearch,
  };
};