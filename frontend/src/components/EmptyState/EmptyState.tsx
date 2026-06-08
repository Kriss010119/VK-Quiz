import styles from './EmptyState.module.css';

interface EmptyStateProps {
  message: string;
}

export const EmptyState = ({ message } : EmptyStateProps) => {
  return (
    <div className={styles.emptyState}>
      <p>{message}</p>
    </div>
  );
};