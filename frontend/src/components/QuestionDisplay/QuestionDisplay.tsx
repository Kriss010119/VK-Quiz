import { Check, Clock } from '../Icons';
import styles from './QuestionDisplay.module.css';

interface Option {
  id: string;
  text: string;
  is_correct: boolean;
}

interface QuestionDisplayProps {
  questionNumber: number;
  totalQuestions: number;
  answeredCount: number;
  totalPlayers: number;
  timeLeft: number;
  questionText: string;
  options: Option[];
  showAnswers?: boolean;
}

export const QuestionDisplay = ({
  questionNumber,
  totalQuestions,
  answeredCount,
  totalPlayers,
  timeLeft,
  questionText,
  options,
  showAnswers = false,
} : QuestionDisplayProps) => {
  const progress = (questionNumber / totalQuestions) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className={styles.questionDisplay}>
      <div className={styles.infoPanel}>
        <div className={styles.progress}>
          <span className={styles.questionNumber}>Question {questionNumber}/{totalQuestions}</span>
          <div className={styles.progressBarContainer}>
            <div className={styles.progressBar} style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className={styles.stats}>
          <div className={styles.answeredCount}>
            <Check size={14} className={styles.answeredIcon} />
            <span>answered {answeredCount}/{totalPlayers}</span>
          </div>
          <div className={styles.timer}>
            <span>{minutes}:{seconds.toString().padStart(2, '0')}</span>
            <Clock size={16} className={styles.timerIcon} />
          </div>
        </div>
      </div>

      <div className={styles.questionBox}>
        <p>{questionText}</p>
      </div>

      <div className={styles.optionsList}>
        {options.map((option, idx) => {
          const letter = String.fromCharCode(65 + idx);
          let optionClass = styles.optionRow;
          if (showAnswers) {
            optionClass += option.is_correct ? ` ${styles.correctOption}` : ` ${styles.wrongOption}`;
          }
          return (
            <div key={option.id} className={optionClass}>
              <div className={styles.optionContent}>
                <span className={styles.optionLetter}>{letter}</span>
                <span className={styles.optionText}>{option.text}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};