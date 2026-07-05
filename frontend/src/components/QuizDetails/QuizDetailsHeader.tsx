import { BackLink } from '../BackLink';
import styles from './QuizDetails.module.css';

interface QuizDetailsHeaderProps {
  onBack: () => void;
  showEditDelete?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  actionButton: {
    label: string;
    action: () => void;
    show: boolean;
  };
  isActive?: boolean;
}

export const QuizDetailsHeader = ({
  onBack,
  showEditDelete,
  onEdit,
  onDelete,
  actionButton,
  isActive,
} : QuizDetailsHeaderProps) => {
  return (
    <div className={styles.topBar}>
      <BackLink onClick={onBack} />
      <div className={styles.actionButtonsTop}>
        {showEditDelete && (
          <>
            <button className={styles.editTopBtn} onClick={onEdit}>
              EDIT
            </button>
            <button className={styles.deleteTopBtn} onClick={onDelete}>
              DELETE
            </button>
          </>
        )}
        {actionButton.show && (
          <button 
            className={`${styles.actionTopBtn} ${isActive ? styles.stopTopBtn : styles.startTopBtn}`}
            onClick={actionButton.action}
          >
            {actionButton.label}
          </button>
        )}
      </div>
    </div>
  );
};