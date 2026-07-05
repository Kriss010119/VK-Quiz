import { PodiumColumn } from './PodiumColumn';
import styles from './Podium.module.css';

export interface TopPlayer {
  name: string;
  place: 1 | 2 | 3;
  score?: number;
  avatar?: string;
}

interface PodiumProps {
  topPlayers: TopPlayer[];
}

export const Podium = ({ topPlayers } : PodiumProps) => {
  const firstPlace = topPlayers.find(p => p.place === 1);
  const secondPlace = topPlayers.find(p => p.place === 2);
  const thirdPlace = topPlayers.find(p => p.place === 3);

  return (
    <div className={styles.winnersTable}>
      <PodiumColumn 
        place={2} 
        playerName={secondPlace?.name || ''} 
        avatarSrc={secondPlace?.avatar}
      />
      <PodiumColumn 
        place={1} 
        playerName={firstPlace?.name || ''} 
        avatarSrc={firstPlace?.avatar}
      />
      <PodiumColumn 
        place={3} 
        playerName={thirdPlace?.name || ''} 
        avatarSrc={thirdPlace?.avatar}
      />
    </div>
  );
};
