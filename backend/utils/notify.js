import { onlineUsers } from '../socket/socketHandler.js';
import Notification from '../models/Notification.js';

export const sendNotification = async (req, { recipient, sender, type, title, message, data }) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      data
    });

    if (req.io) {
      const socketId = onlineUsers.get(recipient.toString());
      if (socketId) {
        req.io.to(socketId).emit('newNotification', notification);
      }
    }

    return notification;
  } catch (error) {
    console.error('Error sending socket notification:', error.message);
  }
};
export default sendNotification;
