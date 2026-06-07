import styles from './LoadingState.module.css';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState = ({ message = 'Loading...' } : LoadingStateProps) => {
  return (
    <div className={styles.loadingContainer}>
      <p>{message}</p>
    </div>
  );
};