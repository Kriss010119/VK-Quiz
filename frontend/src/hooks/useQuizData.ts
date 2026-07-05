import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import type { QuizFromAPI } from '../types';

export const useQuizData = (userId?: string) => {
  const [availableQuizzes, setAvailableQuizzes] = useState<QuizFromAPI[]>([]);
  const [myQuizzes, setMyQuizzes] = useState<QuizFromAPI[]>([]);
  const [likedQuizzes, setLikedQuizzes] = useState<QuizFromAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const availableRes = await api.get('/quizzes/available');
      setAvailableQuizzes(availableRes.data);

      if (userId) {
        const myQuizzesRes = await api.get('/quizzes/my');
        setMyQuizzes(myQuizzesRes.data);

        const likedRes = await api.get('/quizzes/liked');
        setLikedQuizzes(likedRes.data);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  return {
    availableQuizzes,
    myQuizzes,
    likedQuizzes,
    isLoading,
    fetchData,
    setAvailableQuizzes,
    setMyQuizzes,
    setLikedQuizzes
  };
};