import React, { useState } from 'react';
import { PersonalInfo, LastQuizBlock, StatisticsBlock, ActionButtons, SidebarLoadingState } from './';
import { useLastQuiz, useAccountActions } from '../../hooks';
import { ProfileEditModal } from '../ProfileEditModal';
import styles from './Sidebar.module.css';

interface User {
  name: string;
  email: string;
  avatar?: string;
}

interface SidebarProps {
  user: User | null;
  customContent?: React.ReactNode;
  hideLastQuiz?: boolean;
  hideStatistics?: boolean;
  hideActions?: boolean;
}

export const Sidebar = ({
  user,
  customContent,
  hideLastQuiz = false,
  hideStatistics = false,
  hideActions = false,
} : SidebarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lastQuizData, isLoading } = useLastQuiz();
  const { handleDeleteAccount, handleLogout, handleEditProfile, profileModalOpen, setProfileModalOpen } = useAccountActions();

  const userName = user?.name || 'Kriss Vector';
  const userEmail = user?.email || 'krissV@vk.com';
  const userAvatar = user?.avatar;

  const quizData = lastQuizData || {
    name: 'No quizzes yet',
    author: '',
    date: '',
    userPlace: '',
    topPlayers: [
      { name: '', place: 1 },
      { name: '', place: 2 },
      { name: '', place: 3 },
    ],
  };

  const sidebarClass = `${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : styles.sidebarClosed}`;

  const sidebarContent = isLoading ? (
    <div className={styles.sidebarElements}>
      <PersonalInfo name={userName} email={userEmail} avatar={userAvatar} />
      <SidebarLoadingState />
    </div>
  ) : (
    <div className={styles.sidebarDiv}>
      <div className={styles.sidebarElements}>
        <PersonalInfo name={userName} email={userEmail} avatar={userAvatar} />
        
        {customContent ? (
          customContent
        ) : !hideLastQuiz && (
          <LastQuizBlock
            quizName={quizData.name}
            author={quizData.author}
            date={quizData.date}
            userPlace={quizData.userPlace}
            topPlayers={quizData.topPlayers}
          />
        )}
        
        {!hideStatistics && <StatisticsBlock />}
      </div>
      {!hideActions && (
        <ActionButtons
          onEdit={handleEditProfile}
          onDeleteAccount={handleDeleteAccount}
          onLogout={handleLogout}
        />
      )}
    </div>
  );

  return (
    <>
      <button
        className={styles.mobileToggle}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? '✕' : '☰'}
      </button>
      <div
        className={`${styles.mobileOverlay} ${mobileOpen ? styles.visible : ''}`}
        onClick={() => setMobileOpen(false)}
      />
      <aside className={sidebarClass}>
        {sidebarContent}
      </aside>
      <ProfileEditModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
    </>
  );
};
