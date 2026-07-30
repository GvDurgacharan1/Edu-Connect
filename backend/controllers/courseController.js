import Course from '../models/Course.js';
import Teacher from '../models/Teacher.js';
import sendNotification from '../utils/notify.js';
import User from '../models/User.js';

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (Teacher)
export const createCourse = async (req, res, next) => {
  try {
    const {
      title,
      subject,
      description,
      duration,
      sessionsCount,
      fee,
      prerequisites,
      maxStudents,
      difficultyLevel,
      isPublished
    } = req.body;

    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      res.status(404);
      throw new Error('Teacher profile not found. Complete your profile first.');
    }

    let thumbnail = '';
    let studyMaterials = [];

    if (req.files) {
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        thumbnail = `/uploads/${req.files.thumbnail[0].filename}`;
      }
      if (req.files.studyMaterials) {
        studyMaterials = req.files.studyMaterials.map(file => `/uploads/${file.filename}`);
      }
    }

    const parsedPrerequisites = prerequisites
      ? (Array.isArray(prerequisites) ? prerequisites : prerequisites.split(',').map(p => p.trim()).filter(Boolean))
      : [];

    const course = await Course.create({
      teacher: teacher._id,
      title,
      subject,
      description,
      duration,
      sessionsCount: sessionsCount ? Number(sessionsCount) : 1,
      fee: fee ? Number(fee) : 0,
      prerequisites: parsedPrerequisites,
      maxStudents: maxStudents ? Number(maxStudents) : 20,
      difficultyLevel: difficultyLevel || 'Beginner',
      thumbnail,
      studyMaterials,
      isPublished: isPublished === 'true' || isPublished === true
    });

    // Notify students about a new course
    if (course.isPublished) {
      const students = await User.find({ role: 'student' });
      for (const student of students) {
        await sendNotification(req, {
          recipient: student._id,
          sender: req.user._id,
          type: 'NewCourse',
          title: 'New Course Available',
          message: `${teacher.fullName} has published a new course: ${course.title}`,
          data: { courseId: course._id }
        });
      }
    }

    res.status(201).json({ success: true, course });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all published courses (with search/filter)
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res, next) => {
  try {
    const { search, subject, difficultyLevel, sortBy } = req.query;
    const query = { isPublished: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (subject) {
      query.subject = { $regex: subject, $options: 'i' };
    }

    if (difficultyLevel) {
      query.difficultyLevel = difficultyLevel;
    }

    let mongoQuery = Course.find(query).populate({
      path: 'teacher',
      populate: { path: 'user', select: 'email username' }
    });

    if (sortBy) {
      if (sortBy === 'lowestFee') {
        mongoQuery = mongoQuery.sort({ fee: 1 });
      } else if (sortBy === 'highestFee') {
        mongoQuery = mongoQuery.sort({ fee: -1 });
      } else {
        mongoQuery = mongoQuery.sort({ createdAt: -1 });
      }
    } else {
      mongoQuery = mongoQuery.sort({ createdAt: -1 });
    }

    const courses = await mongoQuery;
    res.json({ success: true, count: courses.length, courses });
  } catch (error) {
    next(error);
  }
};

// @desc    Get courses created by current teacher
// @route   GET /api/courses/my
// @access  Private (Teacher)
export const getMyCourses = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      res.status(404);
      throw new Error('Teacher profile not found.');
    }

    const courses = await Course.find({ teacher: teacher._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: courses.length, courses });
  } catch (error) {
    next(error);
  }
};

// @desc    Get specific course by ID
// @route   GET /api/courses/:id
// @access  Public
export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate({
      path: 'teacher',
      populate: { path: 'user', select: 'email username' }
    });

    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    res.json({ success: true, course });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing course
// @route   PUT /api/courses/:id
// @access  Private (Teacher)
export const updateCourse = async (req, res, next) => {
  try {
    const {
      title,
      subject,
      description,
      duration,
      sessionsCount,
      fee,
      prerequisites,
      maxStudents,
      difficultyLevel,
      isPublished
    } = req.body;

    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      res.status(404);
      throw new Error('Teacher profile not found.');
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    if (course.teacher.toString() !== teacher._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to edit this course');
    }

    course.title = title || course.title;
    course.subject = subject || course.subject;
    course.description = description || course.description;
    course.duration = duration !== undefined ? duration : course.duration;
    course.sessionsCount = sessionsCount !== undefined ? Number(sessionsCount) : course.sessionsCount;
    course.fee = fee !== undefined ? Number(fee) : course.fee;
    course.maxStudents = maxStudents !== undefined ? Number(maxStudents) : course.maxStudents;
    course.difficultyLevel = difficultyLevel || course.difficultyLevel;

    if (isPublished !== undefined) {
      course.isPublished = isPublished === 'true' || isPublished === true;
    }

    if (prerequisites) {
      course.prerequisites = Array.isArray(prerequisites)
        ? prerequisites
        : prerequisites.split(',').map(p => p.trim()).filter(Boolean);
    }

    if (req.files) {
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        course.thumbnail = `/uploads/${req.files.thumbnail[0].filename}`;
      }
      if (req.files.studyMaterials) {
        const materials = req.files.studyMaterials.map(file => `/uploads/${file.filename}`);
        course.studyMaterials = [...course.studyMaterials, ...materials];
      }
    }

    await course.save();
    res.json({ success: true, message: 'Course updated successfully', course });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private (Teacher/Admin)
export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user._id });
      if (course.teacher.toString() !== teacher._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to delete this course');
      }
    }

    await Course.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Publish a course
// @route   PUT /api/courses/:id/publish
// @access  Private (Teacher)
export const publishCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    course.isPublished = true;
    await course.save();

    res.json({ success: true, message: 'Course published successfully', course });
  } catch (error) {
    next(error);
  }
};

// @desc    Unpublish a course
// @route   PUT /api/courses/:id/unpublish
// @access  Private (Teacher)
export const unpublishCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    course.isPublished = false;
    await course.save();

    res.json({ success: true, message: 'Course unpublished successfully', course });
  } catch (error) {
    next(error);
  }
};
