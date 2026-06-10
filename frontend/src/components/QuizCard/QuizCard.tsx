import React from 'react';
import type { QuizCardProps, QuizStatus } from './types';
import styles from './QuizCard.module.css';

export type { QuizCardProps, QuizStatus };

const getStatusColor = (status?: QuizStatus): string => {
  switch (status) {
    case 'waiting': return styles.statusWaiting;
    case 'in progress': return styles.statusProgress;
    case 'finished': return styles.statusFinished;
    case 'draft': return styles.statusDraft;
    case 'active': return styles.statusProgress;
    default: return '';
  }
};

const getStatusText = (status?: QuizStatus): string => {
  switch (status) {
    case 'waiting': return 'waiting';
    case 'in progress': return 'in progress';
    case 'finished': return 'finished';
    case 'draft': return 'draft';
    case 'active': return 'active';
    default: return '';
  }
};

export const QuizCard = ({
  roomId,
  title,
  author,
  date,
  description,
  tags,
  status,
  isLiked = false,
  role = 'player',
  actionLabel,
  onJoin,
  onLike,
  onStart,
  onEdit,
  onDelete,
  onAction,
  onClick,
  showEdit = true,
  showDelete = true,
} : QuizCardProps) => {
  const visibleTags = tags.slice(0, 3);
  const extraCount = tags.length - 3;

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAction) {
      onAction();
    } else if (role === 'creator') {
      if (status === 'draft' && onStart) onStart();
      else if (status === 'waiting' && onStart) onStart();
      else if (status === 'active' && onStart) onStart();
      else if (status === 'finished' && onStart) onStart();
    } else if (onJoin) {
      onJoin();
    }
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike?.();
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  const getCreatorButtonText = (): string => {
    if (actionLabel === 'CONTINUE') {
      return 'CONTINUE';
    }
    if (actionLabel) {
      return actionLabel;
    }
    if (status === 'draft') {
      return 'PUBLISH';
    }
    if (status === 'waiting') {
      return 'START';
    }
    if (status === 'active') {
      return 'STOP';
    }
    if (status === 'finished') {
      return 'START';
    }
    return 'PLAY';
  };

  const getCreatorButtonClass = (): string => {
    if (actionLabel === 'CONTINUE') return styles.continueBtn;
    if (status === 'active') return styles.stopBtn;
    return styles.startBtn;
  };

  const getPlayerButtonText = (): string => {
    return 'JOIN';
  };

  return (
    <div className={styles.quizCard} onClick={handleCardClick}>
      <div className={styles.roomCode}>
        {roomId}
      </div>

      {status && (
        <div className={`${styles.status} ${getStatusColor(status)}`}>
          <span className={styles.statusDot} />
          <span>{getStatusText(status)}</span>
        </div>
      )}

      <div className={styles.contentWrapper}>
        <h3 className={styles.title}>{title.toUpperCase()}</h3>
        <div className={styles.author}>{author}</div>
        <div className={styles.date}>{date}</div>
        <p className={styles.description}>{description}</p>

        {tags.length > 0 && (
          <div className={styles.tags}>
            {visibleTags.map((tag, i) => (
              <span key={i} className={styles.tag}>
                {tag}
              </span>
            ))}
            {extraCount > 0 && (
              <span className={`${styles.tag} ${styles.tagMore}`}>
                +{extraCount}
              </span>
            )}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        {role === 'creator' ? (
          <>
            <button 
              className={`${styles.actionBtn} ${getCreatorButtonClass()}`}
              onClick={handleActionClick}
            >
              {getCreatorButtonText()}
            </button>
            {showEdit && (
              <button 
                className={styles.iconBtn}
                onClick={handleEditClick}
                title="Edit quiz"
              >
                ✎
              </button>
            )}
            {showDelete && (
              <button 
                className={`${styles.iconBtn} ${styles.deleteBtn}`}
                onClick={handleDeleteClick}
                title="Delete quiz"
              >
                ×
              </button>
            )}
          </>
        ) : (
          <>
            <button 
              className={styles.joinBtn}
              onClick={handleActionClick}
            >
              {getPlayerButtonText()}
            </button>
            <button 
              className={`${styles.likeBtn} ${isLiked ? styles.liked : ''}`}
              onClick={handleLikeClick}
              title={isLiked ? 'Unlike' : 'Like'}
            >
              {isLiked ? '♥' : '♡'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};