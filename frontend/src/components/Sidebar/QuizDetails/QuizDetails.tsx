import styles from './QuizDetails.module.css';

interface QuizDetailsProps {
  name: string;
  author: string;
  userPlace: string;
}

export const QuizDetails = ({ name, author, userPlace } : QuizDetailsProps) => {
  return (
    <div className={styles.quizDetails}>
      <div className={styles.detailRow}>
        <span className={styles.detailKey}>Name:</span>
        <span className={styles.detailValue}>{name}</span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailKey}>Author:</span>
        <span className={styles.detailValue}>{author}</span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailKey}>Your place:</span>
        <span className={styles.detailValue}>{userPlace}</span>
      </div>
    </div>
  );
};