import { QuizGrid, LoadingState, EmptyState } from '../';
import styles from './SearchSection.module.css';

interface SearchSectionProps {
  userId?: string;
  searchQuery: string;
  isSearchMode: boolean;
  isSearching: boolean;
  hasSearched: boolean;
  searchResults: any[];
  totalCount: number;
  onClose: () => void;
  onJoinQuiz: (roomCode: string) => void;
  onStartQuiz?: (quizId: string) => void;
  onStopQuiz?: (quizId: string, roomCode: string) => void;
  onContinueQuiz?: (quizId: string) => void;
  onPublishQuiz?: (quizId: string) => void;
  onEditQuiz?: (quizId: string) => void;
  onDeleteQuiz?: (quizId: string) => void;
  onLikeQuiz: (quizId: string) => void;
}

export const SearchSection = ({
  userId,
  searchQuery,
  isSearchMode,
  isSearching,
  hasSearched,
  searchResults,
  totalCount,
  onClose,
  onJoinQuiz,
  onStartQuiz,
  onStopQuiz,
  onContinueQuiz,
  onPublishQuiz,
  onEditQuiz,
  onDeleteQuiz,
  onLikeQuiz,
} : SearchSectionProps) => {
  if (!isSearchMode) {
    return null;
  }

  const myQuizzes = searchResults.filter((quiz: any) => quiz.organizer_id === userId);
  const otherQuizzes = searchResults.filter((quiz: any) => quiz.organizer_id !== userId);

  console.log('SearchSection render:', { 
    searchResults, 
    myQuizzes: myQuizzes.length, 
    otherQuizzes: otherQuizzes.length,
    isSearching,
    hasSearched 
  });

  return (
    <div className={styles.searchResultsCard}>
      <div className={styles.searchResultsHeader}>
        <div className={styles.searchResultsTitleBlock}>
          <h2 className={styles.searchResultsTitle}>Search Results</h2>
          {hasSearched && (
            <span className={styles.searchResultsCount}>Found: {totalCount} quizzes</span>
          )}
        </div>
        <button className={styles.closeSearchBtn} onClick={onClose}>
          ✕
        </button>
      </div>
      
      <div className={styles.searchResultsContent}>
        {isSearching ? (
          <LoadingState message="Searching..." />
        ) : !hasSearched ? (
          <EmptyState message="Enter a search term to find quizzes" />
        ) : searchResults.length === 0 ? (
          <EmptyState message={`No quizzes found matching "${searchQuery}"`} />
        ) : (
          <>
            {myQuizzes.length > 0 && (
              <div className={styles.searchGroup}>
                <h3 className={styles.searchGroupTitle}>Your Quizzes</h3>
                <QuizGrid
                  quizzes={myQuizzes}
                  section="your"
                  userId={userId}
                  onJoinQuiz={onJoinQuiz}
                  onStartQuiz={onStartQuiz}
                  onStopQuiz={onStopQuiz}
                  onContinueQuiz={onContinueQuiz}
                  onPublishQuiz={onPublishQuiz}
                  onEditQuiz={onEditQuiz}
                  onDeleteQuiz={onDeleteQuiz}
                  onLikeQuiz={onLikeQuiz}
                />
              </div>
            )}
            
            {otherQuizzes.length > 0 && (
              <div className={styles.searchGroup}>
                <h3 className={styles.searchGroupTitle}>Other Quizzes</h3>
                <QuizGrid
                  quizzes={otherQuizzes}
                  section="waiting"
                  userId={userId}
                  onJoinQuiz={onJoinQuiz}
                  onLikeQuiz={onLikeQuiz}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};