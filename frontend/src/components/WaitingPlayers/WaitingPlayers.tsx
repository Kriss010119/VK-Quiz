import styles from './WaitingPlayers.module.css';

interface Player {
  id: string;
  name: string;
  score: number;
  hasAnswered: boolean;
}

interface WaitingPlayersProps {
  players: Player[];
  onStartQuiz: () => void;
  disabled?: boolean;
}

export const WaitingPlayers = ({
  players,
  onStartQuiz,
  disabled,
} : WaitingPlayersProps) => {
  return (
    <div className={styles.waitingArea}>
      <div className={styles.waitingMessage}>
        <div className={styles.loader}></div>
        <p>WAITING FOR PLAYERS TO JOIN...</p>
      </div>

      <button
        className={styles.startBtn}
        onClick={onStartQuiz}
        disabled={disabled}
      >
        START QUIZ ({players.length} PLAYERS)
      </button>
    </div>
  );
};