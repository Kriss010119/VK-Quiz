import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../hooks';
import styles from './ProfileEditModal.module.css';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileEditModal = ({ isOpen, onClose } : ProfileEditModalProps) => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [isOpen, user]);

  if (!isOpen) {
    return null;
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }

    setIsSaving(true);
    try {
      const response = await api.patch('/users/profile', { name: name.trim(), email: email.trim() });
      const updatedUser = response.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      onClose();
      toast.success('Profile updated');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <h2 className={styles.title}>EDIT PROFILE</h2>

        <div className={styles.field}>
          <label className={styles.label}>Name:</label>
          <input
            type="text"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Email:</label>
          <input
            type="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.buttons}>
          <button className={styles.cancelBtn} onClick={onClose}>CANCEL</button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'SAVING...' : 'SAVE'}
          </button>
        </div>
      </div>
    </div>
  );
};
