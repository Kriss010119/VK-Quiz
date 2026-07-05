import styles from './QuizDetails.module.css';

interface QuizInfoProps {
  title: string;
  roomCode: string;
  status: string;
  totalQuestions: number;
  organizerName: string;
  createdAt: string;
  timePerQuestion: number;
  getStatusClass: (status: string) => string;
  getStatusText: (status: string) => string;
}

export const QuizInfo = ({
  title,
  roomCode,
  status,
  totalQuestions,
  organizerName,
  createdAt,
  timePerQuestion,
  getStatusClass,
  getStatusText,
} : QuizInfoProps) => {
  return (
    <div className={styles.quizInfo}>
      <div className={styles.quizInfoTop}>
        <h1 className={styles.quizTitle}>{title}</h1>
        <div className={styles.quizMeta}>
          <div className={styles.roomCode}>{roomCode}</div>
          <div className={`${styles.status} ${getStatusClass(status)}`}>
            {getStatusText(status)}
          </div>
        </div>
      </div>

      <div className={styles.quizStats}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{organizerName}</span>
          <span className={styles.statLabel}>AUTHOR</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{new Date(createdAt).toLocaleDateString('ru-RU')}</span>
          <span className={styles.statLabel}>CREATED</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{timePerQuestion}s</span>
          <span className={styles.statLabel}>TIME</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{totalQuestions}</span>
          <span className={styles.statLabel}>QUESTIONS</span>
        </div>
      </div>
    </div>
  );
};
