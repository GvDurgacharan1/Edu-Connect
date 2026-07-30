import Meeting from '../models/Meeting.js';
import Booking from '../models/Booking.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import sendNotification from '../utils/notify.js';

// @desc    Schedule a new meeting
// @route   POST /api/meetings
// @access  Private (Teacher)
export const createMeeting = async (req, res, next) => {
  try {
    const { bookingId, title, courseId, date, startTime, endTime, duration, meetingLink, description } = req.body;

    if (!bookingId || !title || !date || !startTime || !endTime || !duration || !meetingLink) {
      res.status(400);
      throw new Error('Please fill in all required meeting scheduler fields');
    }

    const booking = await Booking.findById(bookingId).populate('student').populate('teacher');
    if (!booking) {
      res.status(404);
      throw new Error('Associated booking not found');
    }

    // Verify booking is Accepted
    if (booking.status !== 'Accepted') {
      res.status(400);
      throw new Error('You can only schedule meetings after a booking is accepted.');
    }

    const teacherProfile = await Teacher.findOne({ user: req.user._id });
    if (!teacherProfile || booking.teacher._id.toString() !== teacherProfile._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to schedule meetings for this booking');
    }

    const meeting = await Meeting.create({
      teacher: teacherProfile._id,
      student: booking.student._id,
      booking: booking._id,
      title,
      course: courseId || booking.course || null,
      date,
      startTime,
      endTime,
      duration: Number(duration),
      meetingLink,
      description: description || '',
      status: 'Upcoming'
    });

    // Notify Student
    await sendNotification(req, {
      recipient: booking.student.user,
      sender: req.user._id,
      type: 'MeetingScheduled',
      title: 'New Meeting Scheduled',
      message: `A meeting titled "${title}" has been scheduled for ${date} at ${startTime}. Link: ${meetingLink}`,
      data: { meetingId: meeting._id }
    });

    res.status(201).json({ success: true, meeting });
  } catch (error) {
    next(error);
  }
};

// @desc    Get meetings list (separated for student / teacher dashboard filters)
// @route   GET /api/meetings
// @access  Private
export const getMeetings = async (req, res, next) => {
  try {
    let meetings = [];
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      if (!student) {
        return res.json({ success: true, meetings: [] });
      }

      meetings = await Meeting.find({ student: student._id })
        .populate('teacher', 'fullName avatar university rating currentPosition')
        .populate('course', 'title subject')
        .sort({ date: 1, startTime: 1 });

    } else if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user._id });
      if (!teacher) {
        return res.json({ success: true, meetings: [] });
      }

      meetings = await Meeting.find({ teacher: teacher._id })
        .populate({
          path: 'student',
          populate: { path: 'user', select: 'email username' }
        })
        .populate('course', 'title subject')
        .sort({ date: 1, startTime: 1 });
        
    } else if (req.user.role === 'admin') {
      meetings = await Meeting.find()
        .populate('teacher', 'fullName university')
        .populate('student', 'fullName university')
        .populate('course', 'title')
        .sort({ date: 1, startTime: 1 });
    }

    res.json({ success: true, count: meetings.length, meetings });
  } catch (error) {
    next(error);
  }
};

// @desc    Update meeting details
// @route   PUT /api/meetings/:id
// @access  Private (Teacher)
export const updateMeeting = async (req, res, next) => {
  try {
    const { title, date, startTime, endTime, duration, meetingLink, description, status } = req.body;

    const meeting = await Meeting.findById(req.params.id)
      .populate({ path: 'student', populate: { path: 'user' } })
      .populate('teacher');

    if (!meeting) {
      res.status(404);
      throw new Error('Meeting not found');
    }

    const teacherProfile = await Teacher.findOne({ user: req.user._id });
    if (!teacherProfile || meeting.teacher._id.toString() !== teacherProfile._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to modify this meeting');
    }

    meeting.title = title || meeting.title;
    meeting.date = date || meeting.date;
    meeting.startTime = startTime || meeting.startTime;
    meeting.endTime = endTime || meeting.endTime;
    meeting.duration = duration ? Number(duration) : meeting.duration;
    meeting.meetingLink = meetingLink || meeting.meetingLink;
    meeting.description = description !== undefined ? description : meeting.description;
    
    const oldStatus = meeting.status;
    if (status) {
      meeting.status = status;
    }

    await meeting.save();

    // Trigger Notification
    let notificationType = 'MeetingUpdated';
    let notificationTitle = 'Meeting Updated';
    let notificationMessage = `Your meeting "${meeting.title}" has been updated by the teacher.`;

    if (status === 'Cancelled' && oldStatus !== 'Cancelled') {
      notificationType = 'MeetingCancelled';
      notificationTitle = 'Meeting Cancelled';
      notificationMessage = `The meeting "${meeting.title}" scheduled for ${meeting.date.toISOString().split('T')[0]} has been cancelled.`;
    }

    await sendNotification(req, {
      recipient: meeting.student.user._id,
      sender: req.user._id,
      type: notificationType,
      title: notificationTitle,
      message: notificationMessage,
      data: { meetingId: meeting._id }
    });

    res.json({ success: true, message: 'Meeting updated successfully', meeting });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a meeting
// @route   DELETE /api/meetings/:id
// @access  Private (Teacher/Admin)
export const deleteMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      res.status(404);
      throw new Error('Meeting not found');
    }

    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user._id });
      if (meeting.teacher.toString() !== teacher._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to delete this meeting');
      }
    }

    await Meeting.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Meeting deleted successfully' });
  } catch (error) {
    next(error);
  }
};
