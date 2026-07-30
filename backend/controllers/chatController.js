import Message from '../models/Message.js';
import Booking from '../models/Booking.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// Helper function to verify if chat is allowed between two users
const verifyBookingAccepted = async (userAId, userBId) => {
  try {
    const userA = await User.findById(userAId);
    const userB = await User.findById(userBId);

    if (!userA || !userB) return false;

    // Check if either is admin (admins can inspect chats or talk to users)
    if (userA.role === 'admin' || userB.role === 'admin') return true;

    // Determine who is student and who is teacher
    let studentUser = null;
    let teacherUser = null;

    if (userA.role === 'student' && userB.role === 'teacher') {
      studentUser = userA;
      teacherUser = userB;
    } else if (userB.role === 'student' && userA.role === 'teacher') {
      studentUser = userB;
      teacherUser = userA;
    } else {
      // Chat between student-student or teacher-teacher is not supported/approved
      return false;
    }

    const studentProfile = await Student.findOne({ user: studentUser._id });
    const teacherProfile = await Teacher.findOne({ user: teacherUser._id });

    if (!studentProfile || !teacherProfile) return false;

    // Check for an 'Accepted' booking
    const booking = await Booking.findOne({
      student: studentProfile._id,
      teacher: teacherProfile._id,
      status: 'Accepted'
    });

    return !!booking;
  } catch (error) {
    console.error('Error verifying booking in chat validation:', error.message);
    return false;
  }
};

// Helper to construct alphabetical Chat Room ID
const getChatRoomId = (id1, id2) => {
  return [id1.toString(), id2.toString()].sort().join('_');
};

// @desc    Send a private chat message
// @route   POST /api/chat/message
// @access  Private
export const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, text } = req.body;

    if (!receiverId) {
      res.status(400);
      throw new Error('Receiver ID is required');
    }

    // Verify booking is accepted
    const allowed = await verifyBookingAccepted(req.user._id, receiverId);
    if (!allowed) {
      res.status(403);
      throw new Error('Chat is disabled. You can only chat after a booking request has been accepted.');
    }

    const chatId = getChatRoomId(req.user._id, receiverId);
    
    let attachments = [];
    if (req.files) {
      if (req.files.attachments) {
        attachments = req.files.attachments.map(file => {
          let fileType = 'other';
          if (file.mimetype.startsWith('image/')) fileType = 'image';
          else if (file.mimetype === 'application/pdf') fileType = 'pdf';
          return {
            fileUrl: `/uploads/${file.filename}`,
            fileType,
            fileName: file.originalname
          };
        });
      }
    }

    const message = await Message.create({
      chatId,
      sender: req.user._id,
      receiver: receiverId,
      text: text || '',
      attachments,
      isRead: false,
      delivered: true,
      deletedFor: []
    });

    // Notify recipient of new message
    await Notification.create({
      recipient: receiverId,
      sender: req.user._id,
      type: 'NewChatMessage',
      title: 'New Chat Message',
      message: `You received a message from ${req.user.username}.`,
      data: { senderId: req.user._id, text: text || 'Sent an attachment' }
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/chat/messages/:receiverId
// @access  Private
export const getMessages = async (req, res, next) => {
  try {
    const { receiverId } = req.params;
    const { search } = req.query;

    const allowed = await verifyBookingAccepted(req.user._id, receiverId);
    if (!allowed) {
      res.status(403);
      throw new Error('Access denied. No active accepted booking matches this conversation.');
    }

    const chatId = getChatRoomId(req.user._id, receiverId);

    // Build query to fetch only messages that are NOT deleted for the current user
    const query = {
      chatId,
      deletedFor: { $ne: req.user._id }
    };

    // Message search feature
    if (search) {
      query.text = { $regex: search, $options: 'i' };
    }

    const messages = await Message.find(query).sort({ createdAt: 1 });

    // Mark messages sent to us as read
    await Message.updateMany(
      { chatId, receiver: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ success: true, count: messages.length, messages });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete message for me (soft delete)
// @route   DELETE /api/chat/message/:id
// @access  Private
export const deleteMessageForMe = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      res.status(404);
      throw new Error('Message not found');
    }

    // Check if user is either sender or receiver
    if (message.sender.toString() !== req.user._id.toString() && message.receiver.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this message');
    }

    // Add user to deletedFor array if not already present
    if (!message.deletedFor.includes(req.user._id)) {
      message.deletedFor.push(req.user._id);
      await message.save();
    }

    res.json({ success: true, message: 'Message deleted for you' });
  } catch (error) {
    next(error);
  }
};
