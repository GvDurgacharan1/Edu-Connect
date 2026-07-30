import express from 'express';
import {
  createPost,
  getPosts,
  getMyPosts,
  updatePost,
  deletePost,
  likePost,
  bookmarkPost
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .post(
    protect,
    authorize('teacher'),
    upload.fields([
      { name: 'images', maxCount: 5 },
      { name: 'pdfFiles', maxCount: 5 }
    ]),
    createPost
  )
  .get(protect, getPosts);

router.get('/my', protect, authorize('teacher'), getMyPosts);

router.route('/:id')
  .put(
    protect,
    authorize('teacher', 'admin'),
    upload.fields([
      { name: 'images', maxCount: 5 },
      { name: 'pdfFiles', maxCount: 5 }
    ]),
    updatePost
  )
  .delete(protect, authorize('teacher', 'admin'), deletePost);

router.put('/:id/like', protect, likePost);
router.put('/:id/bookmark', protect, bookmarkPost);

export default router;
