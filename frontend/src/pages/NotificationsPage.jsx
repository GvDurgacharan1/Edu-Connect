import React, { useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBell, FiCheck, FiTrash2, FiCalendar, FiMessageSquare,
  FiBookOpen, FiUser, FiInfo, FiClock, FiX, FiCheckCircle
} from 'react-icons/fi';

const iconMap = {
  BookingRequest: <FiCalendar className="text-amber-500 w-5 h-5 flex-shrink-0" />,
  BookingAccepted: <FiCheckCircle className="text-emerald-500 w-5 h-5 flex-shrink-0" />,
  BookingRejected: <FiX className="text-rose-500 w-5 h-5 flex-shrink-0 border rounded-full border-rose-500/20 p-0.5" />,
  MeetingScheduled: <FiClock className="text-indigo-500 w-5 h-5 flex-shrink-0" />,
  MeetingUpdated: <FiClock className="text-sky-505 w-5 h-5 flex-shrink-0" />,
  MeetingCancelled: <FiX className="text-rose-500 w-5 h-5 flex-shrink-0 border rounded-full border-rose-500/20 p-0.5" />,
  NewChatMessage: <FiMessageSquare className="text-blue-500 w-5 h-5 flex-shrink-0" />,
  NewCourse: <FiBookOpen className="text-emerald-500 w-5 h-5 flex-shrink-0" />,
  NewPost: <FiInfo className="text-primary w-5 h-5 flex-shrink-0" />,
  ProfileUpdated: <FiUser className="text-teal-500 w-5 h-5 flex-shrink-0" />
};

export const NotificationsPage = () => {
  const {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    deleteNotification,
    clearAll,
    refresh
  } = useNotifications();

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black font-outfit tracking-tight text-slate-805 dark:text-white">
            Notifications Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your incoming class updates, chats, and booking status alerts.
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-350 transition-colors"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={clearAll}
              className="px-4 py-2 border border-rose-500/20 hover:bg-rose-500/10 text-rose-500 rounded-xl text-xs font-bold transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Notifications list */}
      {notifications.length === 0 ? (
        <div className="p-12 text-center border border-slate-200/50 dark:border-slate-800 rounded-2xl glass-card text-slate-455 space-y-2">
          <FiBell className="w-8 h-8 mx-auto text-slate-350" />
          <p className="font-bold text-sm">No notifications yet.</p>
          <p className="text-xs text-slate-500">
            Updates regarding class schedules and chats will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {notifications.map((notif) => (
              <motion.div
                key={notif._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-2xl glass-card border flex items-start justify-between gap-4 transition-all ${
                  notif.isRead
                    ? 'border-slate-200/40 bg-white/20 dark:border-slate-800/10 dark:bg-slate-900/5'
                    : 'border-primary/20 bg-primary/5 dark:border-accent/20 dark:bg-accent/5 shadow-sm shadow-primary/5'
                }`}
              >
                <div
                  className="flex gap-3 flex-1 cursor-pointer text-xs"
                  onClick={() => !notif.isRead && markRead(notif._id)}
                >
                  <div className="pt-0.5">
                    {iconMap[notif.type] || <FiBell className="text-primary w-5 h-5 flex-shrink-0" />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-bold text-slate-800 dark:text-slate-100 ${!notif.isRead && 'text-primary dark:text-accent font-extrabold'}`}>
                        {notif.title}
                      </h4>
                      {!notif.isRead && (
                        <span className="w-1.5 h-1.5 bg-primary dark:bg-accent rounded-full flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-slate-655 dark:text-slate-400 leading-relaxed font-medium">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-slate-405 font-bold">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Specific notification delete button */}
                <button
                  onClick={() => deleteNotification(notif._id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                  title="Delete notification"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
