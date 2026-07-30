import express from 'express';
import {
  createCourse,
  getCourses,
  getMyCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  publishCourse,
  unpublishCourse
} from '../controllers/courseController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .post(
    protect,
    authorize('teacher'),
    upload.fields([
      { name: 'thumbnail', maxCount: 1 },
      { name: 'studyMaterials', maxCount: 10 }
    ]),
    createCourse
  )
  .get(getCourses);

router.get('/my', protect, authorize('teacher'), getMyCourses);

router.route('/:id')
  .get(getCourseById)
  .put(
    protect,
    authorize('teacher', 'admin'),
    upload.fields([
      { name: 'thumbnail', maxCount: 1 },
      { name: 'studyMaterials', maxCount: 10 }
    ]),
    updateCourse
  )
  .delete(protect, authorize('teacher', 'admin'), deleteCourse);

router.put('/:id/publish', protect, authorize('teacher'), publishCourse);
router.put('/:id/unpublish', protect, authorize('teacher'), unpublishCourse);

export default router;
