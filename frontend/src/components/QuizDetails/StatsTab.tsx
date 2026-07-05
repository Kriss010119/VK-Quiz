import { LoadingState } from '../LoadingState';
import styles from './QuizDetails.module.css';
import catHideImage from '../../assets/catHidden.svg';

interface GameSession {
  id: string;
  user_name: string;
  score: number;
  joined_at: string;
  completed_at: string;
}

interface StatsTabProps {
  sessions: GameSession[];
  isLoading: boolean;
}

export const StatsTab = ({ sessions, isLoading } : StatsTabProps) => {
  if (isLoading) {
    return <LoadingState message="Loading statistics..." />;
  }

  if (sessions.length === 0) {
    return (
      <div className={styles.statsPlaceholder}>
        <img src={catHideImage} alt="Cat hide" className={styles.catHideImage} />
        <p>No games played yet</p>
        <p className={styles.statsSubtext}>Statistics will appear after someone plays this quiz</p>
      </div>
    );
  }

  const highestScore = Math.max(...sessions.map(s => s.score), 0);
  const averageScore = Math.round(sessions.reduce((a, b) => a + b.score, 0) / sessions.length);

  return (
    <div className={styles.statsContent}>
      <div className={styles.statsSummary}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>TOTAL PLAYERS</span>
          <span className={styles.summaryValue}>{sessions.length}</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>HIGHEST SCORE</span>
          <span className={styles.summaryValue}>{highestScore}</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>AVERAGE SCORE</span>
          <span className={styles.summaryValue}>{averageScore}</span>
        </div>
      </div>

      <div className={styles.leaderboard}>
        <h3 className={styles.leaderboardTitle}>LEADERBOARD</h3>
        <div className={styles.leaderboardTable}>
          <div className={styles.leaderboardHeader}>
            <span className={styles.rank}>#</span>
            <span className={styles.player}>PLAYER</span>
            <span className={styles.score}>SCORE</span>
            <span className={styles.date}>DATE</span>
          </div>
          {sessions
            .sort((a, b) => b.score - a.score)
            .map((session, idx) => (
              <div key={session.id} className={styles.leaderboardRow}>
                <span className={styles.rank}>{idx + 1}</span>
                <span className={styles.player}>{session.user_name}</span>
                <span className={styles.score}>{session.score}</span>
                <span className={styles.date}>
                  {new Date(session.completed_at).toLocaleDateString('ru-RU')}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};