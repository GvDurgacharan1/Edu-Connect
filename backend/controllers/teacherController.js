import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
import Course from '../models/Course.js';

// @desc    Get all teachers with search and filters
// @route   GET /api/teachers
// @access  Public
export const getTeachers = async (req, res, next) => {
  try {
    const {
      search,
      subject,
      skill,
      university,
      experience,
      course,
      minFee,
      maxFee,
      rating,
      sortBy,
      availableToday
    } = req.query;

    const query = {};

    // Search by Name, Qualification, Bio
    if (search) {
      query.fullName = { $regex: search, $options: 'i' };
    }

    // Filter by Subject
    if (subject) {
      query.subjects = { $in: [new RegExp(subject, 'i')] };
    }

    // Filter by Skill
    if (skill) {
      query.skills = { $in: [new RegExp(skill, 'i')] };
    }

    // Filter by University
    if (university) {
      query.university = { $regex: university, $options: 'i' };
    }

    // Filter by Experience (minimum years)
    if (experience) {
      query.experience = { $gte: Number(experience) };
    }

    // Filter by Fees
    if (minFee || maxFee) {
      query.fees = {};
      if (minFee) query.fees.$gte = Number(minFee);
      if (maxFee) query.fees.$lte = Number(maxFee);
    }

    // Filter by Rating
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Filter by Available Today
    if (availableToday === 'true') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = days[new Date().getDay()];
      query.availableDays = { $in: [today] };
    }

    // Build the mongoose query
    let mongoQuery = Teacher.find(query).populate('user', 'username email role status');

    // Sorting
    if (sortBy) {
      if (sortBy === 'lowestFee') {
        mongoQuery = mongoQuery.sort({ fees: 1 });
      } else if (sortBy === 'highestRated') {
        mongoQuery = mongoQuery.sort({ rating: -1 });
      } else if (sortBy === 'mostExperienced') {
        mongoQuery = mongoQuery.sort({ experience: -1 });
      } else if (sortBy === 'alphabetical') {
        mongoQuery = mongoQuery.sort({ fullName: 1 });
      }
    } else {
      mongoQuery = mongoQuery.sort({ rating: -1 }); // default sorting
    }

    let teachers = await mongoQuery;

    // Filter by Course Title if requested
    if (course) {
      const MatchingCourses = await Course.find({
        title: { $regex: course, $options: 'i' }
      }).select('teacher');
      const teacherIds = MatchingCourses.map(c => c.teacher.toString());
      teachers = teachers.filter(t => teacherIds.includes(t._id.toString()));
    }

    res.json({ success: true, count: teachers.length, teachers });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current teacher profile
// @route   GET /api/teacher/profile
// @access  Private (Teacher)
export const getTeacherProfile = async (req, res, next) => {
  try {
    let teacher = await Teacher.findOne({ user: req.user._id }).populate('user', 'username email role status');
    if (!teacher) {
      // Create dynamically if profile does not exist
      teacher = await Teacher.create({
        user: req.user._id,
        fullName: req.user.username
      });
      teacher = await Teacher.findById(teacher._id).populate('user', 'username email role status');
    }
    res.json({ success: true, profile: teacher });
  } catch (error) {
    next(error);
  }
};

// @desc    Get teacher profile by User ID (for students / visitors)
// @route   GET /api/teachers/:userId
// @access  Public
export const getTeacherProfileById = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ user: req.params.userId }).populate('user', 'username email role status');
    if (!teacher) {
      res.status(404);
      throw new Error('Teacher profile not found');
    }
    res.json({ success: true, profile: teacher });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current teacher profile
// @route   PUT /api/teacher/profile
// @access  Private (Teacher)
export const updateTeacherProfile = async (req, res, next) => {
  try {
    const {
      fullName,
      age,
      gender,
      phone,
      qualification,
      currentPosition,
      university,
      experience,
      subjects,
      skills,
      languages,
      biography,
      teachingStyle,
      fees,
      availableDays,
      availableTime,
      linkedin,
      website,
      location
    } = req.body;

    let teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      teacher = new Teacher({ user: req.user._id });
    }

    teacher.fullName = fullName || teacher.fullName;
    teacher.age = age !== undefined ? Number(age) : teacher.age;
    teacher.gender = gender !== undefined ? gender : teacher.gender;
    teacher.phone = phone !== undefined ? phone : teacher.phone;
    teacher.qualification = qualification !== undefined ? qualification : teacher.qualification;
    teacher.currentPosition = currentPosition !== undefined ? currentPosition : teacher.currentPosition;
    teacher.university = university !== undefined ? university : teacher.university;
    teacher.experience = experience !== undefined ? Number(experience) : teacher.experience;
    teacher.biography = biography !== undefined ? biography : teacher.biography;
    teacher.teachingStyle = teachingStyle !== undefined ? teachingStyle : teacher.teachingStyle;
    teacher.fees = fees !== undefined ? Number(fees) : teacher.fees;
    teacher.availableTime = availableTime !== undefined ? availableTime : teacher.availableTime;
    teacher.linkedin = linkedin !== undefined ? linkedin : teacher.linkedin;
    teacher.website = website !== undefined ? website : teacher.website;
    teacher.location = location !== undefined ? location : teacher.location;

    // Helper for tag parsing
    if (subjects) {
      teacher.subjects = Array.isArray(subjects) ? subjects : subjects.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (skills) {
      teacher.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (languages) {
      teacher.languages = Array.isArray(languages) ? languages : languages.split(',').map(l => l.trim()).filter(Boolean);
    }
    if (availableDays) {
      teacher.availableDays = Array.isArray(availableDays) ? availableDays : availableDays.split(',').map(d => d.trim()).filter(Boolean);
    }

    // Handle Uploaded Files
    if (req.files) {
      if (req.files.avatar && req.files.avatar[0]) {
        teacher.avatar = `/uploads/${req.files.avatar[0].filename}`;
      }
      if (req.files.resume && req.files.resume[0]) {
        teacher.resume = `/uploads/${req.files.resume[0].filename}`;
      }
      if (req.files.certificates) {
        const paths = req.files.certificates.map(file => `/uploads/${file.filename}`);
        teacher.certificates = [...teacher.certificates, ...paths];
      }
    }

    await teacher.save();
    res.json({ success: true, message: 'Profile updated successfully', profile: teacher });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete teacher profile and account
// @route   DELETE /api/teacher/profile
// @access  Private (Teacher/Admin)
export const deleteTeacherProfile = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      res.status(404);
      throw new Error('Teacher profile not found');
    }
    await Teacher.deleteOne({ _id: teacher._id });
    await User.deleteOne({ _id: req.user._id });

    res.json({ success: true, message: 'Account and profile deleted successfully' });
  } catch (error) {
    next(error);
  }
};
