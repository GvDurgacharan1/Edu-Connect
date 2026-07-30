import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Course from '../models/Course.js';
import Booking from '../models/Booking.js';
import Meeting from '../models/Meeting.js';

// @desc    Get dashboard metrics & statistical breakdown
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getAdminStats = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalCourses = await Course.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const acceptedBookings = await Booking.countDocuments({ status: 'Accepted' });
    const rejectedBookings = await Booking.countDocuments({ status: 'Rejected' });

    // Calculate revenue based on accepted courses/bookings fees
    const bookings = await Booking.find({ status: 'Accepted' }).populate('course');
    const revenue = bookings.reduce((sum, b) => {
      if (b.course && b.course.fee) {
        return sum + b.course.fee;
      }
      return sum;
    }, 0);

    // Recent activity list
    const recentStudents = await Student.find().sort({ createdAt: -1 }).limit(5);
    const recentTeachers = await Teacher.find().sort({ createdAt: -1 }).limit(5);
    const recentBookings = await Booking.find()
      .populate('student', 'fullName')
      .populate('teacher', 'fullName')
      .sort({ createdAt: -1 })
      .limit(5);

    // Grouping records by month for growth charts (last 6 months)
    const getMonthlyGrowth = async (Model, matchQuery = {}) => {
      const result = await Model.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 6 }
      ]);

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return result.map(item => ({
        label: `${months[item._id.month - 1]} ${item._id.year}`,
        value: item.count
      })).reverse();
    };

    const studentGrowth = await getMonthlyGrowth(User, { role: 'student' });
    const teacherGrowth = await getMonthlyGrowth(User, { role: 'teacher' });
    const bookingStats = await getMonthlyGrowth(Booking);
    const courseStats = await getMonthlyGrowth(Course);

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalTeachers,
        totalCourses,
        totalBookings,
        acceptedBookings,
        rejectedBookings,
        revenue
      },
      recentActivity: {
        recentStudents,
        recentTeachers,
        recentBookings
      },
      charts: {
        studentGrowth,
        teacherGrowth,
        bookingStats,
        courseStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend a user account
// @route   PUT /api/admin/users/:id/suspend
// @access  Private (Admin)
export const suspendUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user.role === 'admin') {
      res.status(400);
      throw new Error('Cannot suspend admin user');
    }

    user.status = 'suspended';
    await user.save();

    res.json({ success: true, message: 'User suspended successfully', user });
  } catch (error) {
    next(error);
  }
};

// @desc    Activate a user account
// @route   PUT /api/admin/users/:id/activate
// @access  Private (Admin)
export const activateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.status = 'active';
    await user.save();

    res.json({ success: true, message: 'User activated successfully', user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user account and profile
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user.role === 'admin') {
      res.status(400);
      throw new Error('Cannot delete admin account');
    }

    if (user.role === 'student') {
      await Student.deleteOne({ user: user._id });
    } else if (user.role === 'teacher') {
      await Teacher.deleteOne({ user: user._id });
      // Delete their courses and posts
      const teacherProfile = await Teacher.findOne({ user: user._id });
      if (teacherProfile) {
        await Course.deleteMany({ teacher: teacherProfile._id });
        await Booking.deleteMany({ teacher: teacherProfile._id });
      }
    }

    await User.deleteOne({ _id: user._id });
    res.json({ success: true, message: 'User and all associated data deleted successfully' });
  } catch (error) {
    next(error);
  }
};
