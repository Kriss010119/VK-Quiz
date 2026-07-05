import styles from './StandingsBlock.module.css';

interface Player {
  name: string;
  score: number;
}

interface StandingsBlockProps {
  players: Player[];
  title?: string;
}

export const StandingsBlock = ({
  players,
  title = 'FINAL STANDINGS'
} : StandingsBlockProps) => {
  return (
    <div className={styles.standingsBlock}>
      <div className={styles.blockHeader}>
        <span className={styles.blockTitle}>{title}</span>
      </div>
      <div className={styles.standingsList}>
        {players.length === 0 ? (
          <div className={styles.noPlayers}>No players yet</div>
        ) : (
          players.map((player, idx) => (
            <div key={idx} className={styles.standingsRow}>
              <div className={styles.rankBadge}>
                <span>{idx + 1}</span>
              </div>
              <div className={styles.playerAvatar}>
                <span>{player.name.charAt(0)}</span>
              </div>
              <span className={styles.playerName}>{player.name}</span>
              <span className={styles.playerScore}>{player.score} pts</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
