import styles from './HomeContent.module.css';

export const HomeContent = ({ leftColumn, rightColumn }) => {
  return (
    <main className={styles.mainContent}>
      <div className={styles.leftColumn}>{leftColumn}</div>
      <div className={styles.rightColumn}>{rightColumn}</div>
    </main>
  );
};