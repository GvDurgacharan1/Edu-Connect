import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiClock, FiCheckCircle, FiInfo } from 'react-icons/fi';

export const AdminBookings = () => {
  const { showToast } = useNotifications();

  // States
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings');
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      showToast('Error', 'Failed to retrieve bookings records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    Pending: 'border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400',
    Accepted: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400',
    Rejected: 'border-rose-500/20 bg-rose-500/5 text-rose-600 dark:text-rose-400',
    Cancelled: 'border-slate-500/20 bg-slate-500/5 text-slate-600 dark:text-slate-400'
  };

  return (
    <div className="space-y-6 text-left relative">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black font-outfit tracking-tight text-slate-805 dark:text-white">
          Monitor Class Bookings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          View all tutoring booking sessions log history between students and professors.
        </p>
      </div>

      {/* Bookings Lists */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 skeleton" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-12 text-center border border-slate-200/50 dark:border-slate-805 rounded-2xl glass-card text-slate-455 space-y-2">
          <FiCalendar className="w-8 h-8 mx-auto text-slate-350" />
          <p className="font-bold text-sm">No bookings logs found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((book) => (
            <div
              key={book._id}
              className="p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/30 glass-card flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-left"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-850 dark:text-slate-100">
                    Student: {book.studentName || book.student?.fullName}
                  </span>
                  <span className="text-slate-400">→</span>
                  <span className="font-bold text-slate-800 dark:text-slate-205">
                    Professor: {book.teacher?.fullName}
                  </span>
                </div>
                <p className="text-slate-550 dark:text-slate-400">
                  Goal: {book.learningGoal}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-455 font-semibold text-[10px] pt-1">
                  <span className="flex items-center gap-1">
                    <FiCalendar className="w-3.5 h-3.5 text-primary" />
                    <span>Date: {new Date(book.preferredDate).toLocaleDateString()}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <FiClock className="w-3.5 h-3.5 text-primary" />
                    <span>Time: {book.preferredTime}</span>
                  </span>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded border text-[9px] font-black uppercase text-center flex-shrink-0 ${statusColors[book.status] || statusColors.Pending}`}>
                {book.status}
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default AdminBookings;
