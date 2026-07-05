import { Podium, type TopPlayer } from '../Podium';
import { QuizDetails } from '../QuizDetails';
import styles from './LastQuizBlock.module.css';

interface LastQuizBlockProps {
  quizName: string;
  author: string;
  date: string;
  userPlace: string;
  topPlayers: TopPlayer[];
}

export const LastQuizBlock = ({
  quizName,
  author,
  date,
  userPlace,
  topPlayers
} : LastQuizBlockProps) => {
  return (
    <div className={styles.lastQuizBlock}>
      <div className={styles.blockHeader}>
        <span className={styles.blockTitle}>LAST QUIZ</span>
        <span className={styles.blockDate}>{date}</span>
      </div>

      <Podium topPlayers={topPlayers} />

      <QuizDetails 
        name={quizName}
        author={author}
        userPlace={userPlace}
      />
    </div>
  );
};
