import styles from './WaitingRoom.module.css';

export const WaitingRoom = () => {
  return (
    <div className={styles.quizCard}>
      <div className={styles.topBar}>
        <h1 className={styles.quizTitle}>QUIZ ROOM</h1>
      </div>
      
      <div className={styles.waitingArea}>
        <div className={styles.waitingMessage}>
          <div className={styles.loader}></div>
          <p>WAITING FOR HOST TO START THE GAME...</p>
        </div>
      </div>
    </div>
  );
};