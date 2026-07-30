import express from 'express';
import {
  getAdminStats,
  getUsers,
  suspendUser,
  activateUser,
  deleteUser
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/stats', protect, authorize('admin'), getAdminStats);
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/users/:id/suspend', protect, authorize('admin'), suspendUser);
router.put('/users/:id/activate', protect, authorize('admin'), activateUser);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

export default router;
