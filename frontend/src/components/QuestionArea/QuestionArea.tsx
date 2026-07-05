import { useNavigate } from 'react-router-dom';
import { Button } from '../Buttons';
import { BackLink } from '../BackLink';
import { Clock } from '../Icons';
import styles from './QuestionArea.module.css';

interface OptionVote {
  text: string;
  isCorrect: boolean;
  votes: number;
  optionId?: string;
}

interface Question {
  id: string;
  text: string;
  type: 'single' | 'multiple' | 'text';
  imageUrl?: string;
  options: { id: string; text: string }[];
  points: number;
}

interface QuestionAreaProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  timeLeft: number;
  selectedAnswers: string[];
  hasAnswered: boolean;
  savedMessage: string;
  answeredCount?: number;
  totalPlayers?: number;
  quizTitle?: string;
  authorName?: string;
  onToggleAnswer: (optionId: string) => void;
  onSubmit: () => void;
  showResults?: boolean;
  optionVotes?: OptionVote[];
  correctAnswers?: string[];
}

export const QuestionArea = ({
  question,
  questionNumber,
  totalQuestions,
  timeLeft,
  selectedAnswers,
  hasAnswered,
  savedMessage,
  quizTitle = 'QUIZ',
  authorName,
  onToggleAnswer,
  onSubmit,
  showResults = false,
  optionVotes = [],
  correctAnswers = [],
} : QuestionAreaProps) => {
  const navigate = useNavigate();

  const getOptionState = (option: { id: string; text: string }) => {
    if (!showResults) {
      return selectedAnswers.includes(option.id) ? 'selected' : 'default';
    }
    const voteInfo = optionVotes.find(v => v.text === option.text);
    if (voteInfo?.isCorrect) return 'correct';
    if (selectedAnswers.includes(option.id) && !voteInfo?.isCorrect) return 'wrong';
    return 'result-default';
  };

  const getVoteCount = (option: { id: string; text: string }): number => {
    const voteInfo = optionVotes.find(v => v.text === option.text);
    return voteInfo?.votes || 0;
  };

  return (
    <div className={styles.quizCard}>
      <div className={styles.topBar}>
        <BackLink onClick={() => navigate('/')} />
        <h1 className={styles.quizTitle}>{quizTitle}</h1>
        <span className={styles.authorName}>{authorName}</span>
      </div>
      
      <div className={styles.questionArea}>
        <div className={styles.questionHeader}>
          <span className={styles.questionNumber}>QUESTION {questionNumber}/{totalQuestions}</span>
          <div className={styles.statsBadge}>
            <span>{timeLeft}s</span>
            <Clock size={16} />
          </div>
        </div>
        
        <div className={styles.questionBox}>
          <p>{question.text}</p>
        </div>

        {question.imageUrl && (
          <div className={styles.questionImage}>
            <img src={question.imageUrl} alt="question" />
          </div>
        )}
        
        <div className={styles.optionsList}>
          {question.options.map((option, idx) => {
            const state = getOptionState(option);
            const voteCount = getVoteCount(option);
            const letter = String.fromCharCode(65 + idx);
            
            return (
              <div key={option.id} className={styles.optionRow}>
                <button
                  className={`${styles.optionBtn} ${styles[`option-${state}`]}`}
                  onClick={() => !showResults && onToggleAnswer(option.id)}
                  disabled={hasAnswered || showResults}
                >
                  <span className={styles.optionLetter}>{letter}</span>
                  <span className={styles.optionText}>{option.text}</span>
                </button>
                {showResults && (
                  <div className={styles.voteBadge}>
                    {voteCount}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {!showResults && (
          <Button 
            onClick={onSubmit}
            disabled={selectedAnswers.length === 0 || hasAnswered}
            variant={hasAnswered ? 'secondary' : 'primary'}
            size="lg"
            fullWidth
          >
            {hasAnswered ? 'SAVED' : 'SAVE'}
          </Button>
        )}
        
        {savedMessage && !showResults && (
          <p className={styles.savedMessage}>{savedMessage}</p>
        )}

        {showResults && (
          <p className={styles.waitingText}>Next question coming...</p>
        )}
      </div>
    </div>
  );
};
