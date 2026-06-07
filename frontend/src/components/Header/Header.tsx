import styles from './Header.module.css';

export const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <span className={styles.logoBold}>QUIZ</span>
        <span className={styles.logoLight}>— a comfortable place for your quizes</span>
      </div>
    </header>
  );
};