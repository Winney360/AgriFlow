import express from 'express';
import {
  signup,
  login,
  getProfile,
  switchRole,
  updateNotifications,
  updateProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getProfile);
router.patch('/role', protect, switchRole);
router.patch('/notifications', protect, updateNotifications);
router.patch('/profile', protect, updateProfile);

export default router;
