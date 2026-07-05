import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth, useQuizNavigation, useQuizMutations } from '../../hooks';
import { Header, Footer, Sidebar, HomeContainer, HomeContent, LoadingState } from '../';
import { QuizDetailsHeader } from './QuizDetailsHeader';
import { QuizInfo } from './QuizInfo';
import { QuizDetailsTabs } from './QuizDetailsTabs';
import { InfoTab } from './InfoTab';
import { QuestionsTab } from './QuestionsTab';
import { StatsTab } from './StatsTab';
import api from '../../services/api';
import toast from 'react-hot-toast';
import styles from './QuizDetails.module.css';

interface QuizDetails {
  id: string;
  title: string;
  description: string;
  room_code: string;
  status: string;
  organizer_id: string;
  organizer_name: string;
  created_at: string;
  time_per_question: number;
  max_participants: number;
  questions?: Question[];
}

interface Question {
  id: string;
  text: string;
  type: string;
  points: number;
  options?: { id: string; text: string; is_correct: boolean }[];
}

interface GameSession {
  id: string;
  user_name: string;
  score: number;
  joined_at: string;
  completed_at: string;
}

export const QuizDetails = () => {
  const { quizId } = useParams();
  const { user, logout } = useAuth();
  const { goToHome, goToRoom, goToHost, goToEditQuiz } = useQuizNavigation();
  const { startQuiz, stopQuiz, publishQuiz, deleteQuiz } = useQuizMutations({ onSuccess: () => goToHome() });
  const [quiz, setQuiz] = useState<QuizDetails | null>(null);
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'questions' | 'stats'>('info');

  const isCreator = user?.id === quiz?.organizer_id;

  useEffect(() => {
    fetchQuizDetails();
  }, [quizId]);

  const fetchQuizDetails = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/quizzes/${quizId}`);
      setQuiz(response.data);
    } catch (error) {
      console.error('Error fetching quiz details:', error);
      toast.error('Failed to load quiz details');
      goToHome();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGameStats = async () => {
    if (!quizId) return;
    setIsStatsLoading(true);
    try {
      const response = await api.get(`/quizzes/${quizId}/sessions`);
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching game stats:', error);
    } finally {
      setIsStatsLoading(false);
    }
  };

  const handleTabChange = (tab: 'info' | 'questions' | 'stats') => {
    setActiveTab(tab);
    if (tab === 'stats') {
      fetchGameStats();
    }
  };

  const handleJoinQuiz = () => {
    if (quiz) {
      goToRoom(quiz.room_code);
    }
  };

  const handleStartQuizWrapper = async () => {
    if (quiz) {
      const success = await startQuiz(quiz.id);
      if (success) {
        goToHost(quiz.id);
      }
    }
  };

  const handleStopQuizWrapper = async () => {
    if (quiz) {
      await stopQuiz(quiz.id, quiz.room_code);
      fetchQuizDetails();
    }
  };

  const handlePublishQuizWrapper = async () => {
    if (quiz) {
      await publishQuiz(quiz.id);
      fetchQuizDetails();
    }
  };

  const handleEditQuizWrapper = () => {
    if (quiz) {
      goToEditQuiz(quiz.id);
    }
  };

  const handleDeleteQuizWrapper = async () => {
    if (quiz) {
      await deleteQuiz(quiz.id);
    }
  };

  const getStatusClass = (status: string): string => {
    switch (status) {
      case 'draft': return styles.statusDraft;
      case 'waiting': return styles.statusWaiting;
      case 'active': return styles.statusActive;
      case 'finished': return styles.statusFinished;
      default: return '';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'draft': return 'DRAFT';
      case 'waiting': return 'WAITING';
      case 'active': return 'ACTIVE';
      case 'finished': return 'FINISHED';
      default: return status;
    }
  };

  const getActionButton = () => {
    if (!isCreator) {
      return { label: 'JOIN QUIZ', action: handleJoinQuiz, show: true };
    }
    
    switch (quiz?.status) {
      case 'draft':
        return { label: 'PUBLISH', action: handlePublishQuizWrapper, show: true };
      case 'waiting':
        return { label: 'START', action: handleStartQuizWrapper, show: true };
      case 'active':
        return { label: 'STOP', action: handleStopQuizWrapper, show: true };
      case 'finished':
        return { label: 'START AGAIN', action: handleStartQuizWrapper, show: true };
      default:
        return { label: 'JOIN', action: handleJoinQuiz, show: true };
    }
  };

  const actionButton = getActionButton();
  const canEditDelete = isCreator && (quiz?.status === 'draft' || quiz?.status === 'finished');

  const sidebarUser = user || {
    name: 'Kriss Vector',
    email: 'krissV@vk.com'
  };

  if (isLoading) {
    return (
      <HomeContainer>
        <Header />
        <div className={styles.loadingContainer}>
          <LoadingState message="Loading quiz details..." />
        </div>
        <Footer />
      </HomeContainer>
    );
  }

  if (!quiz) {
    return (
      <HomeContainer>
        <Header />
        <div className={styles.notFound}>Quiz not found</div>
        <Footer />
      </HomeContainer>
    );
  }

  const leftColumnContent = (
    <div className={styles.detailsCard}>
      <QuizDetailsHeader
        onBack={goToHome}
        showEditDelete={canEditDelete}
        onEdit={handleEditQuizWrapper}
        onDelete={handleDeleteQuizWrapper}
        actionButton={actionButton}
        isActive={quiz.status === 'active'}
      />

      <QuizInfo
        title={quiz.title}
        roomCode={quiz.room_code}
        status={quiz.status}
        totalQuestions={ quiz.questions?.length || 0 }
        organizerName={quiz.organizer_name}
        createdAt={quiz.created_at}
        timePerQuestion={quiz.time_per_question}
        maxParticipants={quiz.max_participants}
        getStatusClass={getStatusClass}
        getStatusText={getStatusText}
      />

      <QuizDetailsTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        questionsCount={quiz.questions?.length || 0}
      />

      <div className={styles.tabContent}>
        {activeTab === 'info' && (
          <InfoTab
            description={quiz.description}
          />
        )}

        {activeTab === 'questions' && (
          <QuestionsTab
            questions={quiz.questions}
            isCreator={isCreator}
          />
        )}

        {activeTab === 'stats' && (
          <StatsTab
            sessions={sessions}
            isLoading={isStatsLoading}
          />
        )}
      </div>
    </div>
  );

  const rightColumnContent = (
    <Sidebar 
      user={sidebarUser}
    />
  );

  return (
    <HomeContainer>
      <HomeContent
        leftColumn={leftColumnContent}
        rightColumn={rightColumnContent}
      />
    </HomeContainer>
  );
};