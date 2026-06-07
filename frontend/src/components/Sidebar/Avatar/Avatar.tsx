import styles from './Avatar.module.css';
import logoImg from '../../../assets/logo.png';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const Avatar = ({ 
  src, 
  name = '', 
  size = 'medium',
  className 
} : AvatarProps) => {
  const sizeClass = {
    small: styles.avatarSmall,
    medium: styles.avatarMedium,
    large: styles.avatarLarge
  }[size];

  return (
    <img 
      src={src || logoImg} 
      alt={name || 'Avatar'} 
      className={`${styles.avatar} ${sizeClass} ${className}`}
    />
  );
};
