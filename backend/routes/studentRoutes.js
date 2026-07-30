import express from 'express';
import {
  getStudentProfile,
  getStudentProfileById,
  updateStudentProfile,
  deleteStudentProfile
} from '../controllers/studentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/profile')
  .get(protect, authorize('student'), getStudentProfile)
  .put(protect, authorize('student'), upload.single('avatar'), updateStudentProfile)
  .delete(protect, authorize('student', 'admin'), deleteStudentProfile);

router.get('/profile/:userId', protect, getStudentProfileById);

export default router;
