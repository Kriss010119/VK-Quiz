import { useState, useEffect } from 'react';
import api from '../services/api';

export interface TopPlayer {
  name: string;
  place: 1 | 2 | 3;
  score?: number;
  avatar?: string;
}

export interface LastQuizData {
  name: string;
  author: string;
  date: string;
  userPlace: string;
  topPlayers: TopPlayer[];
}

export const useLastQuiz = () => {
  const [lastQuizData, setLastQuizData] = useState<LastQuizData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLastQuizData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/users/last-quiz');
      const data = response.data;
      
      if (data && data.topPlayers) {
        setLastQuizData({
          name: data.name,
          author: data.author,
          date: data.date,
          userPlace: data.userPlace,
          topPlayers: data.topPlayers.map((p: any, idx: number) => ({
            name: p.name,
            place: (idx + 1) as 1 | 2 | 3,
            score: p.score,
            avatar: p.avatar
          }))
        });
      } else {
        setLastQuizData({
          name: 'No quizzes yet',
          author: '',
          date: '',
          userPlace: '',
          topPlayers: [
            { name: '', place: 1 },
            { name: '', place: 2 },
            { name: '', place: 3 },
          ]
        });
      }
    } catch (err) {
      console.error('Error fetching last quiz data:', err);
      setError('Failed to load last quiz data');
      setLastQuizData({
        name: 'No quizzes yet',
        author: '',
        date: '',
        userPlace: '',
        topPlayers: [
          { name: '', place: 1 },
          { name: '', place: 2 },
          { name: '', place: 3 },
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLastQuizData();
  }, []);

  return { lastQuizData, isLoading, error, refetch: fetchLastQuizData };
};