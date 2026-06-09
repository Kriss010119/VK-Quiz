import React from 'react';
import styles from './AuthLayout.module.css';

export interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const AuthLayout = ({ title, children, footer } : AuthLayoutProps) => {
  return (
    <div className={styles.background}>
      <div className={styles.leftPanel}>
        <div className={styles.quizTitle}>
          <span>Q</span>
          <span>U</span>
          <span>I</span>
          <span>Z</span>
        </div>
      </div>

      <div className={styles.waves}>
        <svg className={`${styles.wave} ${styles.wave1}`} viewBox="0 0 1012.18 837.861" preserveAspectRatio="none">
          <path fill="#FFFFFF" d="M389.449 0H55.5068C28.6531 0 15.3262 32.5758 34.4797 51.3976L187.606 201.873C200.226 214.275 199.428 234.847 185.885 246.234L10.6943 393.524C-3.96136 405.846 -3.48005 428.557 11.6844 440.247L185.066 573.9C199.058 584.686 200.747 605.167 188.71 618.099L31.115 787.42C12.9634 806.922 27.3442 838.645 53.9747 837.846L234.104 832.442H617.737H982.177C998.745 832.442 1012.18 819.01 1012.18 802.442V30C1012.18 13.4315 998.745 0 982.177 0H389.449Z"/>
        </svg>
        <svg className={`${styles.wave} ${styles.wave2}`} viewBox="0 0 952.873 837.816" preserveAspectRatio="none">
          <path fill="#E8F1FD" d="M367.025 0H54.1248C27.7116 0 14.1889 31.6667 32.4545 50.7461L177.806 202.573C189.543 214.833 188.782 234.379 176.127 245.688L10.0095 394.142C-3.72177 406.414 -3.25823 428.045 10.9861 439.716L175.3 574.353C188.413 585.098 190.024 604.567 178.856 617.321L29.3605 788.051C12.0787 807.788 26.667 838.635 52.887 837.799L220.881 832.442H581.793H922.873C939.441 832.442 952.873 819.01 952.873 802.442V30C952.873 13.4315 939.441 0 922.873 0H367.025Z"/>
        </svg>
        <svg className={`${styles.wave} ${styles.wave3}`} viewBox="0 0 866.266 837.736" preserveAspectRatio="none">
          <path fill="#C5DEFF" d="M334.227 0H52.1018C26.3719 0 12.5802 30.2662 29.4621 49.6835L163.381 203.716C173.78 215.677 173.081 233.665 161.783 244.782L8.95803 395.17C-3.35039 407.282 -2.91784 427.259 9.90331 438.827L160.957 575.117C172.721 585.731 174.203 603.662 164.342 616.063L26.7718 789.062C10.8344 809.105 25.715 838.615 51.3056 837.716L201.506 832.442H529.27H836.266C852.835 832.442 866.266 819.01 866.266 802.442V30C866.266 13.4315 852.835 0 836.266 0H334.227Z"/>
        </svg>
      </div>

      <div className={styles.formContainer}>
        <div className={styles.formCard}>
          <h1 className={styles.title}>{title}</h1>
          {children}
          {footer && <div className={styles.footerLinks}>{footer}</div>}
        </div>
      </div>
    </div>
  );
};