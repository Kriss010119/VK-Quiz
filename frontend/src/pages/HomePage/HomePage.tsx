import React, { useState } from 'react';
import { useAuth, useQuizData, useQuizActions, useQuizSocket, useActiveRooms, useQuizNavigation, useQuizMutations, useSearchQuizzes } from '../../hooks';
import { 
  Header, 
  SearchBar, 
  Sidebar, 
  Footer,
  PageLayout,
  WaitingSection,
  YourQuizzesSection,
  YourLikesSection,
  HomePageSkeleton,
  SearchSection
} from '../../components';

export const HomePage = () => {
  const { user } = useAuth();
  const { goToCreateQuiz, goToEditQuiz, goToHost } = useQuizNavigation();
  const { availableQuizzes, myQuizzes, likedQuizzes, isLoading, fetchData } = useQuizData(user?.id);
  const { activeRoomsWithoutHost, checkActiveRooms, addActiveRoom, removeActiveRoom } = useActiveRooms();
  
  const { 
    likeQuiz, 
    publishQuiz, 
    deleteQuiz, 
    startQuiz, 
    stopQuiz 
  } = useQuizMutations({ onSuccess: fetchData });
  
  const {
    handleJoinQuiz,
    handleContinueQuiz,
  } = useQuizActions(fetchData);

  const { 
    searchResults, 
    isSearching, 
    hasSearched, 
    totalCount,
    clearSearch,
    performSearch 
  } = useSearchQuizzes();

  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useQuizSocket({
    onQuizStarted: fetchData,
    onQuizStopped: fetchData,
    onQuizFinished: fetchData,
    onHostLeftGame: addActiveRoom,
    onHostContinued: removeActiveRoom,
    onQuizzesUpdated: fetchData
  });

  React.useEffect(() => {
    fetchData();
    checkActiveRooms(user?.id);
  }, [user]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    performSearch(query);
    setIsSearchMode(true);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    clearSearch();
    setIsSearchMode(false);
  };

  const handleStartQuizWrapper = async (quizId: string) => {
    const success = await startQuiz(quizId);
    if (success) {
      goToHost(quizId);
    }
  };

  const handleStopQuizWrapper = (quizId: string, roomCode: string) => {
    stopQuiz(quizId, roomCode);
  };

  const handleLikeQuizWrapper = (quizId: string) => {
    likeQuiz(quizId);
  };

  if (isLoading) {
    return <HomePageSkeleton message="Loading quizzes..." />;
  }

  return (
    <PageLayout
      sidebar={
        <Sidebar 
          user={user}
        />
      }
    >
      <Header />
      <SearchBar 
        onSearch={handleSearch} 
        onClear={handleClearSearch}
        isLoading={isSearching}
      />
      
      {isSearchMode ? (
        <SearchSection
          userId={user?.id}
          searchQuery={searchQuery}
          isSearchMode={isSearchMode}
          isSearching={isSearching}
          hasSearched={hasSearched}
          searchResults={searchResults}
          totalCount={totalCount}
          onClose={handleClearSearch}
          onJoinQuiz={handleJoinQuiz}
          onStartQuiz={handleStartQuizWrapper}
          onStopQuiz={stopQuiz}
          onContinueQuiz={handleContinueQuiz}
          onPublishQuiz={publishQuiz}
          onEditQuiz={goToEditQuiz}
          onDeleteQuiz={deleteQuiz}
          onLikeQuiz={handleLikeQuizWrapper}
        />
      ) : (
        <>
          <WaitingSection
            quizzes={availableQuizzes}
            userId={user?.id}
            activeRoomsWithoutHost={activeRoomsWithoutHost}
            onJoinQuiz={handleJoinQuiz}
            onStartQuiz={handleStartQuizWrapper}
            onStopQuiz={handleStopQuizWrapper}
            onContinueQuiz={handleContinueQuiz}
            onLikeQuiz={handleLikeQuizWrapper}
          />
          
          <YourQuizzesSection
            quizzes={myQuizzes}
            userName={user?.name}
            activeRoomsWithoutHost={activeRoomsWithoutHost}
            onCreateQuiz={goToCreateQuiz}
            onStartQuiz={handleStartQuizWrapper}
            onStopQuiz={handleStopQuizWrapper}
            onContinueQuiz={handleContinueQuiz}
            onPublishQuiz={publishQuiz}
            onEditQuiz={goToEditQuiz}
            onDeleteQuiz={deleteQuiz}
            onLikeQuiz={handleLikeQuizWrapper}
          />

          <YourLikesSection
            quizzes={likedQuizzes}
            userId={user?.id}
            onJoinQuiz={handleJoinQuiz}
            onLikeQuiz={handleLikeQuizWrapper}
          />
        </>
      )}
      
      <Footer />
    </PageLayout>
  );
};