import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../Buttons';
import { Podium } from '../Sidebar/Podium';
import styles from './Leaderboard.module.css';

interface Player {
  name: string;
  score: number;
}

interface LeaderboardProps {
  leaderboard: Player[];
}

export const Leaderboard = ({ leaderboard } : LeaderboardProps) => {
  const navigate = useNavigate();
  const [animatedPlayers, setAnimatedPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPlayers(leaderboard);
    }, 100);
    return () => clearTimeout(timer);
  }, [leaderboard]);

  const top3 = leaderboard.slice(0, 3).map((player, idx) => ({
    name: player.name,
    place: (idx + 1) as 1 | 2 | 3,
    score: player.score
  }));

  const handleExportResult = () => {
    const csvRows = [
      ['Place', 'Player Name', 'Score'],
      ...leaderboard.map((player, idx) => [idx + 1, player.name, player.score])
    ];
    
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'quiz_results.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.leaderboardContainer}>
      <div className={styles.podiumColumn}>
        <div className={`${styles.podiumWrapper} ${animatedPlayers.length > 0 ? styles.animate : ''}`}>
          <Podium topPlayers={top3} />
        </div>
      </div>

      <div className={styles.tableColumn}>
        <div className={styles.resultsTable}>
          <div className={styles.tableHeader}>
            <span className={styles.headerPlace}>PLACE</span>
            <span className={styles.headerName}>PLAYER</span>
            <span className={styles.headerScore}>SCORE</span>
          </div>
          
          <div className={styles.tableBody}>
            {leaderboard.map((player, idx) => {
              let rowClass = styles.tableRow;
              if (idx < 3) rowClass += ` ${styles.topRow}`;
              else if (idx < 7) rowClass += ` ${styles.middleRow}`;
              
              return (
                <div key={idx} className={rowClass}>
                  <span className={styles.rowPlace}>#{idx + 1}</span>
                  <span className={styles.rowName}>{player.name}</span>
                  <span className={styles.rowScore}>{player.score} pts</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.actionButtons}>
        <Button 
          onClick={handleExportResult} 
          variant="outline" 
          size="lg"
          className={styles.exportBtn}
        >
          EXPORT RESULT
        </Button>
        <Button 
          onClick={() => navigate('/')} 
          variant="primary" 
          size="lg"
        >
          BACK TO HOME
        </Button>
      </div>
    </div>
  );
};