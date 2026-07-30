import Post from '../models/Post.js';
import Teacher from '../models/Teacher.js';
import sendNotification from '../utils/notify.js';
import User from '../models/User.js';

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private (Teacher)
export const createPost = async (req, res, next) => {
  try {
    const { title, description, postType } = req.body;

    if (!title || !description || !postType) {
      res.status(400);
      throw new Error('Please fill in all required fields');
    }

    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      res.status(404);
      throw new Error('Teacher profile not found');
    }

    let images = [];
    let pdfFiles = [];

    if (req.files) {
      if (req.files.images) {
        images = req.files.images.map(file => `/uploads/${file.filename}`);
      }
      if (req.files.pdfFiles) {
        pdfFiles = req.files.pdfFiles.map(file => `/uploads/${file.filename}`);
      }
    }

    const post = await Post.create({
      teacher: teacher._id,
      title,
      description,
      postType,
      images,
      pdfFiles
    });

    // Notify students about the new post
    const students = await User.find({ role: 'student' });
    for (const student of students) {
      await sendNotification(req, {
        recipient: student._id,
        sender: req.user._id,
        type: 'NewPost',
        title: `New educational ${postType}`,
        message: `${teacher.fullName} posted: "${post.title}"`,
        data: { postId: post._id }
      });
    }

    res.status(201).json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all educational posts
// @route   GET /api/posts
// @access  Private
export const getPosts = async (req, res, next) => {
  try {
    const { postType, search } = req.query;
    const query = {};

    if (postType) {
      query.postType = postType;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const posts = await Post.find(query)
      .populate('teacher', 'fullName avatar university rating')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: posts.length, posts });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current teacher's own posts
// @route   GET /api/posts/my
// @access  Private (Teacher)
export const getMyPosts = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      res.status(404);
      throw new Error('Teacher profile not found');
    }

    const posts = await Post.find({ teacher: teacher._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: posts.length, posts });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private (Teacher)
export const updatePost = async (req, res, next) => {
  try {
    const { title, description, postType } = req.body;

    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      res.status(404);
      throw new Error('Teacher profile not found');
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    if (post.teacher.toString() !== teacher._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to modify this post');
    }

    post.title = title || post.title;
    post.description = description || post.description;
    post.postType = postType || post.postType;

    if (req.files) {
      if (req.files.images) {
        const list = req.files.images.map(file => `/uploads/${file.filename}`);
        post.images = [...post.images, ...list];
      }
      if (req.files.pdfFiles) {
        const list = req.files.pdfFiles.map(file => `/uploads/${file.filename}`);
        post.pdfFiles = [...post.pdfFiles, ...list];
      }
    }

    await post.save();
    res.json({ success: true, message: 'Post updated successfully', post });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (Teacher/Admin)
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user._id });
      if (post.teacher.toString() !== teacher._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to delete this post');
      }
    }

    await Post.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Like or unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
export const likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    const index = post.likes.indexOf(req.user._id);
    if (index === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    res.json({ success: true, likesCount: post.likes.length, liked: index === -1, likes: post.likes });
  } catch (error) {
    next(error);
  }
};

// @desc    Bookmark or unbookmark a post
// @route   PUT /api/posts/:id/bookmark
// @access  Private
export const bookmarkPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    const index = post.bookmarks.indexOf(req.user._id);
    if (index === -1) {
      post.bookmarks.push(req.user._id);
    } else {
      post.bookmarks.splice(index, 1);
    }

    await post.save();
    res.json({ success: true, bookmarked: index === -1, bookmarks: post.bookmarks });
  } catch (error) {
    next(error);
  }
};
