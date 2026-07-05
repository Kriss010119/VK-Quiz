import { Button } from '../Buttons';
import { QuestionDisplay } from '../QuestionDisplay';
import styles from './RoundResultsDisplay.module.css';

interface RoundResult {
  name: string;
  pointsEarned: number;
  totalScore: number;
  isCorrect: boolean;
}

interface RoundResultsDisplayProps {
  results: RoundResult[];
  correctAnswers: string[];
  questionText: string;
  options: { id: string; text: string; is_correct: boolean }[];
  questionNumber: number;
  totalQuestions: number;
  answeredCount: number;
  totalPlayers: number;
  onNextQuestion: () => void;
}

export const RoundResultsDisplay = ({
  results,
  correctAnswers,
  questionText,
  options,
  questionNumber,
  totalQuestions,
  answeredCount,
  totalPlayers,
  onNextQuestion,
} : RoundResultsDisplayProps) => {
  return (
    <div className={styles.roundResults}>
      {/* Отображаем вопрос с подсветкой правильных/неправильных ответов */}
      <QuestionDisplay
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        answeredCount={answeredCount}
        totalPlayers={totalPlayers}
        timeLeft={0}
        questionText={questionText}
        options={options}
        showAnswers={true}
      />
      
      <Button onClick={onNextQuestion} variant="primary" size="lg" fullWidth>
        NEXT QUESTION
      </Button>
    </div>
  );
};