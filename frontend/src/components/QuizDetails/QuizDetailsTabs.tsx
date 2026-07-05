import styles from './QuizDetails.module.css';

interface QuizDetailsTabsProps {
  activeTab: 'info' | 'questions' | 'stats';
  onTabChange: (tab: 'info' | 'questions' | 'stats') => void;
  questionsCount: number;
}

export const QuizDetailsTabs = ({
  activeTab,
  onTabChange,
} : QuizDetailsTabsProps) => {
  return (
    <div className={styles.tabs}>
      <button 
        className={`${styles.tab} ${activeTab === 'info' ? styles.activeTab : ''}`}
        onClick={() => onTabChange('info')}
      >
        INFORMATION
      </button>
      <button 
        className={`${styles.tab} ${activeTab === 'questions' ? styles.activeTab : ''}`}
        onClick={() => onTabChange('questions')}
      >
        QUESTIONS
      </button>
      <button 
        className={`${styles.tab} ${activeTab === 'stats' ? styles.activeTab : ''}`}
        onClick={() => onTabChange('stats')}
      >
        STATISTICS
      </button>
    </div>
  );
};