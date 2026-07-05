import styles from './ParticipantsBlock.module.css';

interface Player {
  id: string;
  name: string;
  hasAnswered?: boolean;
}

interface ParticipantsBlockProps {
  players: Player[];
}

export const ParticipantsBlock = ({ players } : ParticipantsBlockProps) => {
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.hasAnswered === b.hasAnswered) return 0;
    return a.hasAnswered ? -1 : 1;
  });

  return (
    <div className={styles.participantsBlock}>
      <div className={styles.blockHeader}>
        <span className={styles.blockTitle}>CURRENT GAME</span>
        <span className={styles.blockPlayersCount}>{players.length} players</span>
      </div>
      
      <div className={styles.participantsList}>
        {sortedPlayers.map((player, idx) => (
          <div key={player.id || idx} className={styles.participantRow}>
            <div className={styles.participantAvatar}>
              <span>{player.name.charAt(0).toUpperCase()}</span>
            </div>
            <span className={styles.participantName}>{player.name}</span>
            <div className={styles.participantStatus}>
              <span className={player.hasAnswered ? styles.answeredStatus : styles.notAnsweredStatus}>
                {player.hasAnswered ? 'ANSWERED' : 'WAITING'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};