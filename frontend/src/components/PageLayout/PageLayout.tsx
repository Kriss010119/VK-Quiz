import React from 'react';
import styles from './PageLayout.module.css';

interface PageLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  hideSidebar?: boolean;
}

export const PageLayout = ({
  children,
  sidebar,
  hideSidebar = false,
} : PageLayoutProps) => {
  return (
    <div className={styles.layout}>
      <main className={`${styles.main} ${hideSidebar ? styles.fullWidth : ''}`}>
        {children}
      </main>
      {!hideSidebar && (
        <aside className={styles.sidebarArea}>
          {sidebar}
        </aside>
      )}
    </div>
  );
};
