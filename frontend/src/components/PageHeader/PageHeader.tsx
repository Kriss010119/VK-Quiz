import { BackLink } from '../BackLink';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: string;
  totalCount?: number;
  onBack?: () => void;
  showBack?: boolean;
}

export const PageHeader = ({
  title,
  totalCount,
  onBack,
  showBack = true,
} : PageHeaderProps) => {
  return (
    <div className={styles.headerRow}>
      {showBack && onBack && (
        <BackLink onClick={onBack} />
      )}
      <h1 className={styles.title}>{title}</h1>
      {totalCount !== undefined && (
        <div className={styles.totalCount}>
          Total: {totalCount}
        </div>
      )}
    </div>
  );
};