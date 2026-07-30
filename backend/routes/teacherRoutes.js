import express from 'express';
import {
  getTeachers,
  getTeacherProfile,
  getTeacherProfileById,
  updateTeacherProfile,
  deleteTeacherProfile
} from '../controllers/teacherController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getTeachers);
router.get('/profile', protect, authorize('teacher'), getTeacherProfile);
router.get('/:userId', getTeacherProfileById);

router.put(
  '/profile',
  protect,
  authorize('teacher'),
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
    { name: 'certificates', maxCount: 10 }
  ]),
  updateTeacherProfile
);

router.delete('/profile', protect, authorize('teacher', 'admin'), deleteTeacherProfile);

export default router;
