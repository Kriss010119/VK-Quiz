import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth, useQuizRoom } from '../../hooks';
import { Header, Footer, Sidebar, PageLayout, NameSetup, WaitingRoom, QuestionArea, Leaderboard, ParticipantsBlock } from '../../components';
import api from '../../services/api';

export const QuizRoom = () => {
  const { roomCode } = useParams();
  const { user } = useAuth();
  const [quizTitle, setQuizTitle] = useState('QUIZ');
  const [authorName, setAuthorName] = useState('');
  
  useEffect(() => {
    const fetchQuizInfo = async () => {
      try {
        const res = await api.get(`/quizzes/search?q=${roomCode}`);
        if (res.data.quizzes && res.data.quizzes.length > 0) {
          setQuizTitle(res.data.quizzes[0].title);
          setAuthorName(res.data.quizzes[0].author_name || '');
        }
      } catch { /* nothing */ }
    };
    if (roomCode) fetchQuizInfo();
  }, [roomCode]);
  
  const {
    playerName,
    isNameSet,
    currentQuestion,
    timeLeft,
    selectedAnswers,
    quizStatus,
    players,
    myScore,
    leaderboard,
    questionNumber,
    totalQuestions,
    hasAnswered,
    savedMessage,
    optionVotes,
    correctAnswers,
    totalPlayers,
    setName,
    submitAnswer,
    toggleAnswer,
  } = useQuizRoom(roomCode!, user?.id, user?.name);

  if (!isNameSet) {
    return <NameSetup roomCode={roomCode!} onSetName={setName} />;
  }

  const handleToggleAnswer = (optionId: string) => {
    toggleAnswer(optionId, currentQuestion?.type === 'single');
  };

  const getLeftColumnContent = () => {
    switch (quizStatus) {
      case 'waiting':
        return(
        <>
         <Header />
         <WaitingRoom />
         <Footer />
        </>
        )
       
      case 'question':
        if (currentQuestion) {
          return (
            <>
            <Header />
            <QuestionArea
              question={currentQuestion}
              questionNumber={questionNumber}
              totalQuestions={totalQuestions}
              timeLeft={timeLeft}
              selectedAnswers={selectedAnswers}
              hasAnswered={hasAnswered}
              savedMessage={savedMessage}
              quizTitle={quizTitle}
              authorName={authorName}
              onToggleAnswer={handleToggleAnswer}
              onSubmit={submitAnswer}
            />
            <Footer />
        </>
          );
        }
        return(
        <>
         <Header />
         <Footer />
        </>
        );

      case 'roundResult':
        if (currentQuestion) {
          return (
            <>
            <Header />
            <QuestionArea
              question={currentQuestion}
              questionNumber={questionNumber}
              totalQuestions={totalQuestions}
              timeLeft={0}
              selectedAnswers={selectedAnswers}
              hasAnswered={true}
              savedMessage=""
              quizTitle={quizTitle}
              authorName={authorName}
              onToggleAnswer={handleToggleAnswer}
              onSubmit={() => {}}
              showResults={true}
              optionVotes={optionVotes}
              correctAnswers={correctAnswers}
            />
            <Footer />
            </>
          );
        }
        return(
        <>
         <Header />
         <Footer />
        </>
        );

      case 'leaderboard':
        return(
        <>
         <Header />
         <Leaderboard leaderboard={leaderboard} />
         <Footer />
        </>
        ) 
      default:
        return(
        <>
         <Header />
         <Footer />
        </>
        );
    }
  };

  const leftColumnContent = getLeftColumnContent();
  const sidebarCustomContent = <ParticipantsBlock players={players} />;

  return (
    <PageLayout
      sidebar={
        <Sidebar 
          user={{ name: playerName, email: `${myScore} POINTS` }}
          customContent={sidebarCustomContent}
          hideLastQuiz={true}
          hideActions={true}
        />
      }
    >
      {leftColumnContent}
    </PageLayout>
  );
};
