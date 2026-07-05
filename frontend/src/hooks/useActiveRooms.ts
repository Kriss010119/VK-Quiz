import { useState, useCallback } from 'react';
import api from '../services/api';

export const useActiveRooms = () => {
  const [activeRoomsWithoutHost, setActiveRoomsWithoutHost] = useState<Set<string>>(new Set());

  const checkActiveRooms = useCallback(async (userId?: string) => {
    if (!userId) return;
    try {
      const response = await api.get('/quizzes/active-rooms');
      setActiveRoomsWithoutHost(new Set(response.data));
    } catch (error) {
      console.error('Error checking active rooms:', error);
    }
  }, []);

  const addActiveRoom = useCallback((quizId: string) => {
    setActiveRoomsWithoutHost(prev => new Set(prev).add(quizId));
  }, []);

  const removeActiveRoom = useCallback((quizId: string) => {
    setActiveRoomsWithoutHost(prev => {
      const newSet = new Set(prev);
      newSet.delete(quizId);
      return newSet;
    });
  }, []);

  return {
    activeRoomsWithoutHost,
    checkActiveRooms,
    addActiveRoom,
    removeActiveRoom
  };
};