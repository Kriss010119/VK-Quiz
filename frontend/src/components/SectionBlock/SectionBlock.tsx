import React from 'react';
import { TextButton } from '../Buttons';
import styles from './SectionBlock.module.css';

interface SectionBlockProps {
  title: string;
  children: React.ReactNode;
  showMore?: boolean;
  onShowMore?: () => void;
  actions?: React.ReactNode;
}

export const SectionBlock = ({
  title,
  children,
  showMore,
  onShowMore,
  actions
} : SectionBlockProps) => {
  return (
    <div className={styles.sectionBlock}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <div className={styles.sectionActions}>
          {showMore && onShowMore && (
            <TextButton onClick={onShowMore}>
              SHOW MORE
            </TextButton>
          )}
          {actions}
        </div>
      </div>
      <div className={styles.sectionContent}>
        {children}
      </div>
    </div>
  );
};