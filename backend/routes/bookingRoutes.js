import express from 'express';
import {
  createBooking,
  getBookings,
  acceptBooking,
  rejectBooking,
  cancelBooking,
  payBooking
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('student'), createBooking)
  .get(protect, getBookings);

router.put('/:id/accept', protect, authorize('teacher'), acceptBooking);
router.put('/:id/reject', protect, authorize('teacher'), rejectBooking);
router.put('/:id/cancel', protect, authorize('student'), cancelBooking);
router.put('/:id/pay', protect, authorize('student'), payBooking);

export default router;
