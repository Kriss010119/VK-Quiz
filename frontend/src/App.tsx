import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage, RegisterPage, HomePage, MoreQuizesPage, CreateQuizPage, QuizDetailsPage, EditQuizPage, QuizRoom, HostRoom } from './pages';
import { useAuth } from './hooks';
import { useEffect } from 'react';
import './styles/global.css';
import { socketService } from './services/socket';

function App() {
  const { user } = useAuth();

useEffect(() => {
    socketService.connect();
    
    return () => {
      socketService.disconnect();
    };
  }, []);

    useEffect(() => {
    const handleBeforeUnload = () => {
      socketService.disconnect();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      socketService.disconnect();
    };
  }, []);

  return (

    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={user ? <HomePage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" /> : <LoginPage />} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to="/" /> : <RegisterPage />} 
        />
        <Route 
          path="/create-quiz" 
          element={user ? <CreateQuizPage /> : <Navigate to="/login" />} 
        />
        <Route path="/more-quizes" element={user ? <MoreQuizesPage /> : <Navigate to="/login" />} />

        <Route path="/quiz/:quizId" element={user ? <QuizDetailsPage /> : <Navigate to="/login" />} />

        <Route path="/edit-quiz/:quizId" element={user ? <EditQuizPage /> : <Navigate to="/login" />} />

        <Route path="/host/:quizId" element={user ? <HostRoom /> : <Navigate to="/login" />} />

        <Route path="/room/:roomCode" element={<QuizRoom />} />

        <Route path="/host/:quizId/continue" element={user ? <HostRoom /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;