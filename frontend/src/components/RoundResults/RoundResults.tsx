import styles from './RoundResults.module.css';

interface RoundResult {
  name: string;
  pointsEarned: number;
  totalScore: number;
}

interface RoundResultsProps {
  results: RoundResult[];
}

export const RoundResults = ({ results } : RoundResultsProps) => {
  return (
    <div className={styles.quizCard}>
      <div className={styles.topBar}>
        <h1 className={styles.quizTitle}>ROUND RESULTS</h1>
      </div>
      
      <div className={styles.resultsArea}>
        <div className={styles.resultsList}>
          <div className={styles.resultsHeader}>
            <span>PLAYER</span>
            <span>POINTS</span>
            <span>TOTAL</span>
          </div>
          {results.map((result, idx) => (
            <div key={idx} className={styles.resultItem}>
              <span className={styles.resultName}>{result.name}</span>
              <span className={styles.resultPoints}>+{result.pointsEarned}</span>
              <span className={styles.resultTotal}>{result.totalScore} pts</span>
            </div>
          ))}
        </div>
        
        <div className={styles.nextLoader}>
          <div className={styles.loaderSmall}></div>
          <p>Next question coming...</p>
        </div>
      </div>
    </div>
  );
};