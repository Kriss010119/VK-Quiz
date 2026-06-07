import { ArrowLeft } from '../Icons';
import styles from './BackLink.module.css';

interface BackLinkProps {
  onClick: () => void;
  className?: string;
}

export const BackLink = ({ onClick, className } : BackLinkProps) => {
  return (
    <span
      className={`${styles.backLink} ${className || ''}`}
      onClick={onClick}
    >
      <ArrowLeft size={12} className={styles.arrow} />
      <span className={styles.text}>BACK</span>
    </span>
  );
};
