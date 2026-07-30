import Student from '../models/Student.js';
import User from '../models/User.js';

// @desc    Get current student profile
// @route   GET /api/student/profile
// @access  Private (Student)
export const getStudentProfile = async (req, res, next) => {
  try {
    let student = await Student.findOne({ user: req.user._id }).populate('user', 'username email role status');
    if (!student) {
      // Create profile dynamically if not found
      student = await Student.create({
        user: req.user._id,
        fullName: req.user.username
      });
      student = await Student.findById(student._id).populate('user', 'username email role status');
    }
    res.json({ success: true, profile: student });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student profile by User ID (for teachers / admins)
// @route   GET /api/student/profile/:userId
// @access  Private
export const getStudentProfileById = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.params.userId }).populate('user', 'username email role status');
    if (!student) {
      res.status(404);
      throw new Error('Student profile not found');
    }
    res.json({ success: true, profile: student });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current student profile
// @route   PUT /api/student/profile
// @access  Private (Student)
export const updateStudentProfile = async (req, res, next) => {
  try {
    const {
      fullName,
      age,
      gender,
      phone,
      university,
      college,
      department,
      branch,
      course,
      year,
      semester,
      skills,
      interests,
      careerGoal,
      biography,
      location
    } = req.body;

    let student = await Student.findOne({ user: req.user._id });
    if (!student) {
      student = new Student({ user: req.user._id });
    }

    student.fullName = fullName || student.fullName;
    student.age = age !== undefined ? Number(age) : student.age;
    student.gender = gender !== undefined ? gender : student.gender;
    student.phone = phone !== undefined ? phone : student.phone;
    student.university = university !== undefined ? university : student.university;
    student.college = college !== undefined ? college : student.college;
    student.department = department !== undefined ? department : student.department;
    student.branch = branch !== undefined ? branch : student.branch;
    student.course = course !== undefined ? course : student.course;
    student.year = year !== undefined ? year : student.year;
    student.semester = semester !== undefined ? semester : student.semester;
    student.careerGoal = careerGoal !== undefined ? careerGoal : student.careerGoal;
    student.biography = biography !== undefined ? biography : student.biography;
    student.location = location !== undefined ? location : student.location;

    // Handle parsed tags
    if (skills) {
      student.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (interests) {
      student.interests = Array.isArray(interests) ? interests : interests.split(',').map(i => i.trim()).filter(Boolean);
    }

    if (req.file) {
      student.avatar = `/uploads/${req.file.filename}`;
    }

    await student.save();
    res.json({ success: true, message: 'Profile updated successfully', profile: student });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student profile and account
// @route   DELETE /api/student/profile
// @access  Private (Student/Admin)
export const deleteStudentProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      res.status(404);
      throw new Error('Student profile not found');
    }
    await Student.deleteOne({ _id: student._id });
    await User.deleteOne({ _id: req.user._id });

    res.json({ success: true, message: 'Account and profile deleted successfully' });
  } catch (error) {
    next(error);
  }
};
