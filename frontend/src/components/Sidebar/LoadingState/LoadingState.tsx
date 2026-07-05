import styles from './LoadingState.module.css';

interface LoadingStateProps {
  message?: string;
}

export const SidebarLoadingState = ({ 
  message = 'Loading...' 
} : LoadingStateProps) => {
  return (
    <div className={styles.loadingState}>
      <div className={styles.spinner}></div>
      <p>{message}</p>
    </div>
  );
};
