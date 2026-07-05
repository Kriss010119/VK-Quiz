import React from 'react';
import { Check } from '../Icons';
import styles from './QuizDetails.module.css';
import catHideImage from '../../assets/catHidden.svg';

interface Question {
  id: string;
  text: string;
  type: string;
  points: number;
  options?: { id: string; text: string; is_correct: boolean }[];
}

interface QuestionsTabProps {
  questions?: Question[];
  isCreator: boolean;
}

export const QuestionsTab = ({ questions, isCreator } : QuestionsTabProps) => {
  if (!isCreator) {
    return (
      <div className={styles.hiddenQuestions}>
        <img src={catHideImage} alt="Cat hide" className={styles.catHideImage} />
        <p className={styles.hiddenText}>Questions are visible only for the author :)</p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className={styles.emptyQuestions}>
        <div className={styles.emptyIcon}></div>
        <p>No questions in this quiz yet</p>
      </div>
    );
  }

  return (
    <div className={styles.questionsTab}>
      {questions.map((question, idx) => (
        <div key={question.id} className={styles.questionCard}>
          <div className={styles.questionHeader}>
            <span className={styles.questionNumber}>QUESTION {idx + 1}</span>
            <span className={styles.questionType}>
              {question.type === 'single' ? 'SINGLE CHOICE' : 
               question.type === 'multiple' ? 'MULTIPLE CHOICE' : 
               'TEXT ANSWER'}
            </span>
            <span className={styles.questionPoints}>{question.points} PTS</span>
          </div>
          <p className={styles.questionText}>{question.text}</p>
          
          {(question.type === 'single' || question.type === 'multiple') && question.options && (
            <div className={styles.optionsContainer}>
              {question.options.map((opt, optIdx) => (
                <div 
                  key={opt.id} 
                  className={`${styles.optionRow} ${opt.is_correct ? styles.correctOption : ''}`}
                >
                  <span className={styles.optionLetter}>
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className={styles.optionText}>{opt.text}</span>
                  {opt.is_correct && (
                    <span className={styles.correctMark}><Check size={12} /> CORRECT</span>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {question.type === 'text' && (
            <div className={styles.textAnswerPlaceholder}>
              <span className={styles.textAnswerIcon}>✎</span>
              <span className={styles.textAnswerText}>Participants will type their answer</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};