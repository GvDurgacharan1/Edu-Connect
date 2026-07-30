import express from 'express';
import {
  sendMessage,
  getMessages,
  deleteMessageForMe
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/message', protect, upload.fields([{ name: 'attachments', maxCount: 10 }]), sendMessage);
router.get('/messages/:receiverId', protect, getMessages);
router.delete('/message/:id', protect, deleteMessageForMe);

export default router;
