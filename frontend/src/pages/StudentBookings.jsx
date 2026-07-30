import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiClock, FiVideo, FiXCircle, FiCheckCircle, FiInfo, FiSlash, FiUser } from 'react-icons/fi';

export const StudentBookings = () => {
  const { showToast } = useNotifications();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All'); // 'All', 'Pending', 'Accepted', 'Rejected', 'Cancelled'

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
      showToast('Error', 'Failed to retrieve booking records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking request?')) return;
    try {
      const res = await api.put(`/bookings/${bookingId}/cancel`);
      if (res.data.success) {
        showToast('Booking Cancelled', 'Your request has been cancelled successfully.', 'info');
        // Refresh local items
        setBookings(prev =>
          prev.map(b => b._id === bookingId ? { ...b, status: 'Cancelled' } : b)
        );
      }
    } catch (err) {
      showToast('Cancellation Failed', err.response?.data?.message || 'Error cancelling booking.', 'error');
    }
  };

  // Filter lists based on tab
  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'All') return true;
    return b.status === activeTab;
  });

  const statusColors = {
    Pending: 'border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400',
    Accepted: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400',
    Rejected: 'border-rose-500/20 bg-rose-500/5 text-rose-600 dark:text-rose-400',
    Cancelled: 'border-slate-500/20 bg-slate-500/5 text-slate-600 dark:text-slate-400'
  };

  return (
    <div className="space-y-6 text-left">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black font-outfit tracking-tight text-slate-805 dark:text-white">
          My Class Bookings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Monitor your tutoring sessions, track approvals, and coordinate with professors.
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-200/50 dark:border-slate-800/30 text-xs font-semibold text-slate-600 dark:text-slate-400">
        {['All', 'Pending', 'Accepted', 'Rejected', 'Cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl border transition-colors ${
              activeTab === tab
                ? 'bg-primary text-white border-primary shadow-md shadow-primary/10'
                : 'border-slate-200/60 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab} ({tab === 'All' ? bookings.length : bookings.filter((b) => b.status === tab).length})
          </button>
        ))}
      </div>

      {/* Bookings Lists */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 skeleton" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-12 text-center border border-slate-200/50 dark:border-slate-800 rounded-2xl glass-card text-slate-450 space-y-2">
          <FiCalendar className="w-8 h-8 mx-auto text-slate-350" />
          <p className="font-bold text-sm">No bookings records found.</p>
          <p className="text-xs text-slate-500">
            Book a session from Search Teachers page to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredBookings.map((booking) => (
              <motion.div
                key={booking._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-5 rounded-2xl glass-card border border-slate-200/60 dark:border-slate-800/70 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Professor Info & Booking Goal */}
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200/40">
                    {booking.teacher?.avatar ? (
                      <img src={booking.teacher.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold uppercase">
                        {booking.teacher?.fullName?.[0] || '?'}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                        Prof: {booking.teacher?.fullName || 'Teacher'}
                      </h4>
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${statusColors[booking.status]}`}>
                        {booking.status}
                      </span>
                    </div>

                    <p className="text-slate-550 dark:text-slate-400 font-semibold">
                      Course: {booking.course?.title || 'Custom Mentorship Program'}
                    </p>

                    <p className="text-slate-655 dark:text-slate-400 leading-relaxed text-[11px] mt-1 max-w-xl">
                      <span className="font-bold">Goal:</span> {booking.learningGoal}
                    </p>

                    {booking.additionalNotes && (
                      <p className="text-slate-500 dark:text-slate-500 text-[11px] italic mt-0.5">
                        Note: {booking.additionalNotes}
                      </p>
                    )}

                    {/* Preferred Slot */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500 dark:text-slate-450 text-[10px] font-bold pt-1.5">
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-3.5 h-3.5 text-primary" />
                        <span>Date: {new Date(booking.preferredDate).toLocaleDateString()}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <FiClock className="w-3.5 h-3.5 text-primary" />
                        <span>Time: {booking.preferredTime}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Booking Controls */}
                <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end justify-center gap-2 flex-shrink-0">
                  {booking.status === 'Pending' && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="px-4 py-2 border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <FiSlash className="w-3.5 h-3.5" />
                      <span>Cancel Request</span>
                    </button>
                  )}
                  {booking.status === 'Accepted' && (
                    <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex flex-col md:items-end gap-1.5">
                      <span className="text-emerald-500 flex items-center gap-1">
                        <FiCheckCircle className="w-4 h-4" />
                        <span>Active class unlocked</span>
                      </span>
                      <span className="text-[10px] text-slate-455">
                        Access messages/meetings menu
                      </span>
                    </div>
                  )}
                  {booking.status === 'Rejected' && (
                    <span className="text-[11px] text-slate-450 italic flex items-center gap-1">
                      <FiXCircle className="w-4 h-4 text-rose-500" />
                      <span>Prof unavailable</span>
                    </span>
                  )}
                  {booking.status === 'Cancelled' && (
                    <span className="text-[11px] text-slate-450 italic">
                      Cancelled
                    </span>
                  )}
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default StudentBookings;
