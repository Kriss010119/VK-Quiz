import { Avatar } from '../Avatar';
import crownSvg from '../../../assets/crown.svg';
import styles from './Podium.module.css';

interface PodiumColumnProps {
  place: 1 | 2 | 3;
  playerName: string;
  avatarSrc?: string;
}

export const PodiumColumn = ({ 
  place, 
  playerName, 
  avatarSrc 
} : PodiumColumnProps) => {
  const getPedestalClass = () => {
    switch (place) {
      case 1: return styles.pedestalHigh;
      case 2: return styles.pedestalMedium;
      case 3: return styles.pedestalLow;
    }
  };

  const getPlaceClass = () => {
    switch (place) {
      case 1: return styles.firstPlace;
      case 2: return styles.secondPlace;
      case 3: return styles.thirdPlace;
    }
  };

  const getCrownEmoji = () => { return <img src={crownSvg} alt="crown" /> };

  return (
    <div className={`${styles.podiumColumn} ${getPlaceClass()}`}>
      <div className={styles.medalWrapper}>
        <span className={styles.medalIcon}>{getCrownEmoji()}</span>
      </div>
      <Avatar src={avatarSrc} name={playerName} size="small" />
      <div className={styles.pedestal}>
        <div className={`${styles.pedestalBar} ${getPedestalClass()}`}>
          <span className={`${styles.playerName} ${place === 1 ? styles.nameLight : styles.nameDark}`}>
            {playerName}
          </span>
        </div>
      </div>
    </div>
  );
};