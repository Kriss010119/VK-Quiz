import editImage from '../../../assets/edit.svg';
import styles from './ActionButtons.module.css';

interface ActionButtonsProps {
  onEdit?: () => void;
  onDeleteAccount?: () => void;
  onLogout?: () => void;
}

export const ActionButtons = ({
  onEdit,
  onDeleteAccount,
  onLogout
} : ActionButtonsProps) => {
  return (
    <div className={styles.actionButtons}>
      <button 
        className={styles.editBtn} 
        onClick={onEdit}
        title="Edit Profile"
      >
        <img src={editImage} alt="edit" />
      </button>
      <button 
        className={styles.deleteBtn} 
        onClick={onDeleteAccount}
      >
        DELETE ACCOUNT
      </button>
      <button 
        className={styles.logoutBtn} 
        onClick={onLogout}
      >
        LOG OUT
      </button>
    </div>
  );
};
