import styles from './QuizDetails.module.css';

interface InfoTabProps {
  description: string;
}

export const InfoTab = ({
  description,
} : InfoTabProps) => {
  return (
    <div className={styles.infoTab}>
      <div className={styles.infoSection}>
        <h3 className={styles.sectionTitle}>ABOUT THIS QUIZ</h3>
        <p className={styles.infoText}>{description || 'No description provided.'}</p>
      </div>
    </div>
  );
};