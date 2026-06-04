import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  updateProfile,
  deleteAccount,
  getLastQuiz,
} from '../controllers/userController';

const router = Router();

router.use(authenticate);

router.patch('/profile', updateProfile);
router.get('/last-quiz', getLastQuiz);
router.delete('/account', deleteAccount);

export default router;