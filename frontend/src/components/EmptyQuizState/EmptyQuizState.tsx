import styles from './EmptyQuizState.module.css';
import catHideImage from '../../assets/catHidden.svg';

interface EmptyQuizStateProps {
  message?: string;
  showCat?: boolean;
}

export const EmptyQuizState = ({ 
  message = 'No quizzes found',
  showCat = true 
} : EmptyQuizStateProps) => {
  return (
    <div className={styles.emptyState}>
      {showCat && (
        <img src={catHideImage}/>
      )}
      <p>{message}</p>
    </div>
  );
};