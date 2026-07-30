export const onlineUsers = new Map(); // userId -> socket.id

export const socketHandler = (io) => {
  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    
    if (userId && userId !== 'undefined' && userId !== 'null') {
      onlineUsers.set(userId, socket.id);
      io.emit('userStatus', { userId, status: 'online' });
    }

    // Handshake requesting list of current online user IDs
    socket.on('getOnlineUsers', () => {
      socket.emit('onlineUsersList', Array.from(onlineUsers.keys()));
    });

    // Real-time Chat message forwarder
    socket.on('sendMessage', (data) => {
      // data: { _id, chatId, sender, receiver, text, attachments, createdAt }
      const receiverSocketId = onlineUsers.get(data.receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receiveMessage', data);
        // Reply back to sender that it was delivered
        socket.emit('messageStatusUpdate', { messageId: data._id, status: 'delivered' });
      }
    });

    // Typing activity indicator
    socket.on('typing', (data) => {
      // data: { senderId, receiverId, isTyping }
      const receiverSocketId = onlineUsers.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing', { senderId: data.senderId, isTyping: data.isTyping });
      }
    });

    // Message read receipts notifier
    socket.on('markAsRead', (data) => {
      // data: { chatId, senderId, readerId }
      const senderSocketId = onlineUsers.get(data.senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('readReceipt', { readerId: data.readerId, chatId: data.chatId });
      }
    });

    socket.on('disconnect', () => {
      if (userId) {
        onlineUsers.delete(userId);
        io.emit('userStatus', { userId, status: 'offline', lastSeen: new Date() });
      }
    });
  });
};
export default socketHandler;
