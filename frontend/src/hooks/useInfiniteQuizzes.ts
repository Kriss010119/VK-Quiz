import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import type { QuizGridItem } from '../components/QuizGrid';

const PAGE_SIZE = 21;

export const useInfiniteQuizzes = (section: string) => {
  const [quizzes, setQuizzes] = useState<QuizGridItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchQuizzes = useCallback(async (pageNum: number, isLoadMore = false) => {
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      let response;
      switch (section) {
        case 'waiting':
          response = await api.get(`/quizzes/available?page=${pageNum}&limit=${PAGE_SIZE}`);
          break;
        case 'your':
          response = await api.get(`/quizzes/my?page=${pageNum}&limit=${PAGE_SIZE}`);
          break;
        case 'likes':
          response = await api.get(`/quizzes/liked?page=${pageNum}&limit=${PAGE_SIZE}`);
          break;
        default:
          response = await api.get(`/quizzes/available?page=${pageNum}&limit=${PAGE_SIZE}`);
      }

      const newQuizzes = response.data.quizzes || response.data;
      const total = response.data.total || newQuizzes.length;

      console.log('Fetched quizzes:', newQuizzes);

      if (pageNum === 1) {
        setQuizzes(newQuizzes);
      } else {
        setQuizzes(prev => [...prev, ...newQuizzes]);
      }

      setTotalCount(total);
      setHasMore(newQuizzes.length === PAGE_SIZE);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [section]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingMore && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchQuizzes(nextPage, true);
    }
  }, [hasMore, isLoadingMore, isLoading, page, fetchQuizzes]);

  const refresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    fetchQuizzes(1, false);
  }, [fetchQuizzes]);

  useEffect(() => {
    refresh();
  }, [section]);

  return {
    quizzes,
    isLoading,
    isLoadingMore,
    hasMore,
    totalCount,
    loadMore,
    refresh,
  };
};