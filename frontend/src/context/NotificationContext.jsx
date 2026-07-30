import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]); // Array of active popups { id, title, message, type }
  const { user } = useAuth();
  const { socket } = useSocket();

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.warn('Failed to load notifications:', err.message);
    }
  };

  // Add a visual toast popup
  const showToast = (title, message, type = 'info') => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    
    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial fetch and polling
  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000); // Poll every 20s
      return () => clearInterval(interval);
    }
  }, [user]);

  // Listen to real-time events via socket
  useEffect(() => {
    if (!socket) return;

    const handleNewChatMessage = (msg) => {
      // Trigger toast for messages if they are not in chat screen
      // (we can check route or path if needed, but showing generic toast is fine)
      showToast('New Chat Message', `You received a message: "${msg.text || 'Attachment'}"`, 'info');
      fetchNotifications();
    };

    socket.on('receiveMessage', handleNewChatMessage);

    // Let's also listen to general in-app notifications
    socket.on('newNotification', (notif) => {
      showToast(notif.title, notif.message, 'success');
      fetchNotifications();
    });

    return () => {
      socket.off('receiveMessage', handleNewChatMessage);
      socket.off('newNotification');
    };
  }, [socket]);

  const markRead = async (id) => {
    try {
      const res = await api.put(`/notifications/${id}/read`);
      if (res.data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const markAllRead = async () => {
    try {
      const res = await api.put('/notifications/read-all');
      if (res.data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        showToast('Success', 'All notifications marked as read', 'success');
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const res = await api.delete(`/notifications/${id}`);
      if (res.data.success) {
        const deleted = notifications.find((n) => n._id === id);
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        if (deleted && !deleted.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const clearAll = async () => {
    try {
      const res = await api.delete('/notifications');
      if (res.data.success) {
        setNotifications([]);
        setUnreadCount(0);
        showToast('Success', 'Cleared all notifications', 'success');
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        showToast,
        removeToast,
        markRead,
        markAllRead,
        deleteNotification,
        clearAll,
        refresh: fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
export default NotificationContext;
