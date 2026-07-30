import express from 'express';
import {
  createMeeting,
  getMeetings,
  updateMeeting,
  deleteMeeting
} from '../controllers/meetingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('teacher'), createMeeting)
  .get(protect, getMeetings);

router.route('/:id')
  .put(protect, authorize('teacher'), updateMeeting)
  .delete(protect, authorize('teacher', 'admin'), deleteMeeting);

export default router;
