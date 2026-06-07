import { Avatar } from '../Avatar';
import styles from './PersonalInfo.module.css';

interface PersonalInfoProps {
  name: string;
  email: string;
  avatar?: string;
}

export const PersonalInfo = ({ name, email, avatar } : PersonalInfoProps) => {
  return (
    <div className={styles.personalInfo}>
      <div className={styles.avatarWrapper}>
        <Avatar src={avatar} name={name} size="medium" />
      </div>
      <div className={styles.userTextInfo}>
        <h3 className={styles.userName}>{name}</h3>
        <p className={styles.userEmail}>{email}</p>
      </div>
    </div>
  );
};