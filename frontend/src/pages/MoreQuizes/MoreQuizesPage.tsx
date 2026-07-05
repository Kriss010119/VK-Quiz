import { 
  useAuth, 
  useInfiniteQuizzes, 
  useQuizNavigation, 
  useQuizMutations, 
  useSectionFromUrl, 
  getSectionTitle 
} from '../../hooks';
import { 
  Header, 
  SearchBar, 
  Sidebar, 
  Footer,
  QuizGrid,
  LoadMoreButton,
  EmptyQuizState,
  PageHeader,
  LoadingState,
  HomeContainer
} from '../../components';
import styles from './MoreQuizesPage.module.css';

export const MoreQuizesPage = () => {
  const { user } = useAuth();
  const section = useSectionFromUrl();
  const { 
    goToHome, 
    goToRoom, 
    goToHost, 
    goToContinueHost, 
    goToEditQuiz 
  } = useQuizNavigation();
  const { 
    quizzes, 
    isLoading, 
    isLoadingMore, 
    hasMore, 
    totalCount, 
    loadMore, 
    refresh 
  } = useInfiniteQuizzes(section);
  
  const { 
    likeQuiz, 
    publishQuiz, 
    deleteQuiz, 
    startQuiz, 
    stopQuiz 
  } = useQuizMutations({ onSuccess: refresh });

  const handleJoinQuiz = (roomCode: string) => {
    goToRoom(roomCode);
  };

  const handleStartQuiz = async (quizId: string) => {
    const success = await startQuiz(quizId);
    if (success) {
      goToHost(quizId);
    }
  };

  const handleStopQuiz = (quizId: string, roomCode: string) => {
    stopQuiz(quizId, roomCode);
  };

  const handleContinueQuiz = (quizId: string) => {
    goToContinueHost(quizId);
  };

  const handlePublishQuiz = (quizId: string) => {
    publishQuiz(quizId);
  };

  const handleEditQuiz = (quizId: string) => {
    goToEditQuiz(quizId);
  };

  const handleDeleteQuiz = (quizId: string) => {
    deleteQuiz(quizId);
  };

  const handleLikeQuiz = (quizId: string) => {
    likeQuiz(quizId);
  };

  const sidebarUser = user;

  return (
    <HomeContainer>
      
      
      <main className={styles.mainContent}>
        <div className={styles.leftColumn}>
          <Header />
          <SearchBar onSearch={() => {}} />
          
          <div className={styles.whiteCard}>
            <PageHeader 
              title={getSectionTitle(section)}
              totalCount={totalCount}
              onBack={goToHome}
              showBack={true}
            />
            
            <div className={styles.cardsContainer}>
              {isLoading ? (
                <LoadingState message="Loading quizzes..." />
              ) : quizzes.length === 0 ? (
                <EmptyQuizState message="No quizzes found" />
              ) : (
                <>
                  <QuizGrid
                    quizzes={quizzes}
                    section={section}
                    userId={user?.id}
                    onJoinQuiz={handleJoinQuiz}
                    onStartQuiz={handleStartQuiz}
                    onStopQuiz={handleStopQuiz}
                    onContinueQuiz={handleContinueQuiz}
                    onPublishQuiz={handlePublishQuiz}
                    onEditQuiz={handleEditQuiz}
                    onDeleteQuiz={handleDeleteQuiz}
                    onLikeQuiz={handleLikeQuiz}
                  />
                  
                  <div className={styles.loadMoreWrapper}>
                    <LoadMoreButton 
                      onClick={loadMore}
                      isLoading={isLoadingMore}
                      hasMore={hasMore}
                    />
                  </div>
                  
                  {!hasMore && quizzes.length > 0 && (
                    <div className={styles.endMessage}>You've reached the end</div>
                  )}
                </>
              )}
            </div>
          </div>
          
          <Footer />
        </div>
        
        <div className={styles.rightColumn}>
          <Sidebar 
            user={sidebarUser}
          />
        </div>
      </main>
    </HomeContainer>
  );
};