import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createQuiz,
  getMyQuizzes,
  getQuizById,
  addQuestion,
  publishQuiz,
  getAvailableQuizzes,
  updateQuiz,
  updateQuestion,
  deleteQuestion,
  deleteQuiz,
  stopQuiz,
  finishQuizController,
  startQuiz,
  getActiveRoomsWithoutHost,
  searchQuizzes,
  likeQuiz,
  unlikeQuiz,
  getLikedQuizzes,
  getQuizSessions
} from '../controllers/quizController';

const router = Router();

router.get('/available', getAvailableQuizzes);
router.get('/my', authenticate, getMyQuizzes);
router.get('/liked', authenticate, getLikedQuizzes);
router.get('/active-rooms', authenticate, getActiveRoomsWithoutHost);
router.get('/search', searchQuizzes);

router.get('/:id', getQuizById);
router.delete('/:id', authenticate, deleteQuiz);
router.get('/:id/sessions', authenticate, getQuizSessions);
router.post('/', authenticate, createQuiz);
router.patch('/:id', authenticate, updateQuiz);
router.post('/:id/questions', authenticate, addQuestion);
router.patch('/:id/publish', authenticate, publishQuiz);
router.patch('/:id/start', authenticate, startQuiz);
router.patch('/:id/stop', authenticate, stopQuiz);
router.patch('/:id/finish', authenticate, finishQuizController);
router.post('/:id/like', authenticate, likeQuiz);
router.delete('/:id/like', authenticate, unlikeQuiz);

router.patch('/:quizId/questions/:questionId', authenticate, updateQuestion);
router.delete('/:quizId/questions/:questionId', authenticate, deleteQuestion);

export default router;