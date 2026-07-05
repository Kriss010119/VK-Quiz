import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './useAuth';
import api from '../services/api';

export const useAccountActions = () => {
  const { logout } = useAuth();
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const handleDeleteAccount = useCallback(async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await api.delete('/users/account');
        toast.success('Account deleted');
        logout();
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to delete account');
      }
    }
  }, [logout]);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const handleEditProfile = useCallback(() => {
    setProfileModalOpen(true);
  }, []);

  return {
    handleDeleteAccount,
    handleLogout,
    handleEditProfile,
    profileModalOpen,
    setProfileModalOpen,
  };
};