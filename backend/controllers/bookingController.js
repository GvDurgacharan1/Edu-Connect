import Booking from '../models/Booking.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import sendNotification from '../utils/notify.js';

// @desc    Create a new booking request
// @route   POST /api/bookings
// @access  Private (Student)
export const createBooking = async (req, res, next) => {
  try {
    const { teacherId, courseId, preferredDate, preferredTime, learningGoal, additionalNotes } = req.body;

    if (!teacherId || !preferredDate || !preferredTime || !learningGoal) {
      res.status(400);
      throw new Error('Please fill in all required booking fields');
    }

    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      res.status(404);
      throw new Error('Student profile not found. Please complete your profile first.');
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      res.status(404);
      throw new Error('Teacher not found');
    }

    // Check if duplicate pending booking exists
    const duplicate = await Booking.findOne({
      student: student._id,
      teacher: teacherId,
      status: 'Pending'
    });
    if (duplicate) {
      res.status(400);
      throw new Error('You already have a pending booking request with this teacher.');
    }

    const booking = await Booking.create({
      student: student._id,
      teacher: teacherId,
      course: courseId || null,
      studentName: student.fullName || req.user.username,
      preferredDate,
      preferredTime,
      learningGoal,
      additionalNotes: additionalNotes || '',
      status: 'Pending'
    });

    // Notify Teacher
    await sendNotification(req, {
      recipient: teacher.user,
      sender: req.user._id,
      type: 'BookingRequest',
      title: 'New Booking Request',
      message: `${student.fullName} has requested a slot for ${preferredDate} at ${preferredTime}.`,
      data: { bookingId: booking._id }
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking history (Student perspective or Teacher perspective)
// @route   GET /api/bookings
// @access  Private
export const getBookings = async (req, res, next) => {
  try {
    let bookings = [];

    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      if (student) {
        bookings = await Booking.find({ student: student._id })
          .populate('teacher', 'fullName avatar university rating subjects currentPosition user fees')
          .populate('course', 'title subject description fee')
          .sort({ createdAt: -1 });
      }
    } else if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user._id });
      if (teacher) {
        bookings = await Booking.find({ teacher: teacher._id })
          .populate({
            path: 'student',
            populate: { path: 'user', select: 'email username' }
          })
          .populate('course', 'title subject description')
          .sort({ createdAt: -1 });
      }
    } else if (req.user.role === 'admin') {
      bookings = await Booking.find()
        .populate('teacher', 'fullName university')
        .populate('student', 'fullName university')
        .populate('course', 'title')
        .sort({ createdAt: -1 });
    }

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept a booking request
// @route   PUT /api/bookings/:id/accept
// @access  Private (Teacher)
export const acceptBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('student')
      .populate('teacher');
    
    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher || booking.teacher._id.toString() !== teacher._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to accept this booking request');
    }

    booking.status = 'Accepted';
    await booking.save();

    // Notify Student
    await sendNotification(req, {
      recipient: booking.student.user,
      sender: req.user._id,
      type: 'BookingAccepted',
      title: 'Booking Request Approved',
      message: `Your booking request with ${teacher.fullName} has been accepted! You can now chat and schedule meetings.`,
      data: { bookingId: booking._id }
    });

    res.json({ success: true, message: 'Booking accepted successfully', booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a booking request
// @route   PUT /api/bookings/:id/reject
// @access  Private (Teacher)
export const rejectBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('student')
      .populate('teacher');

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher || booking.teacher._id.toString() !== teacher._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to reject this booking request');
    }

    booking.status = 'Rejected';
    await booking.save();

    // Notify Student
    await sendNotification(req, {
      recipient: booking.student.user,
      sender: req.user._id,
      type: 'BookingRejected',
      title: 'Booking Request Rejected',
      message: `Your booking request with ${teacher.fullName} was not accepted.`,
      data: { bookingId: booking._id }
    });

    res.json({ success: true, message: 'Booking rejected successfully', booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a pending booking request
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Student)
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('student');
    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    const student = await Student.findOne({ user: req.user._id });
    if (!student || booking.student._id.toString() !== student._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to cancel this booking');
    }

    if (booking.status !== 'Pending') {
      res.status(400);
      throw new Error(`Cannot cancel a booking that is already ${booking.status}`);
    }

    booking.status = 'Cancelled';
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled successfully', booking });
  } catch (error) {
    next(error);
  }
};
