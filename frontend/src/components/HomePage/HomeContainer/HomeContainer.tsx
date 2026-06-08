import styles from './HomeContainer.module.css';

export const HomeContainer = ({ children }) => {
  return <div className={styles.homePage}>{children}</div>;
};