import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar, FiClock, FiCheck, FiX, FiUser, FiInfo,
  FiSlash, FiCheckCircle, FiXCircle, FiTrendingUp, FiMapPin, FiMail
} from 'react-icons/fi';

export const TeacherBookings = () => {
  const { showToast } = useNotifications();

  // Booking requests lists
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Pending'); // 'Pending', 'Accepted', 'Rejected'

  // Student Inspector Modal States
  const [studentInspectorOpen, setStudentInspectorOpen] = useState(false);
  const [selectedStudentProfile, setSelectedStudentProfile] = useState(null);
  const [inspectorLoading, setInspectorLoading] = useState(false);

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
      showToast('Error', 'Failed to retrieve booking requests.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (bookingId) => {
    try {
      const res = await api.put(`/bookings/${bookingId}/accept`);
      if (res.data.success) {
        showToast('Accepted!', 'Booking approved. Private chat and meeting scheduler are now unlocked.', 'success');
        setBookings(prev =>
          prev.map(b => b._id === bookingId ? { ...b, status: 'Accepted' } : b)
        );
      }
    } catch (err) {
      showToast('Action Failed', 'Failed to accept booking request.', 'error');
    }
  };

  const handleReject = async (bookingId) => {
    if (!window.confirm('Are you sure you want to decline this booking request?')) return;
    try {
      const res = await api.put(`/bookings/${bookingId}/reject`);
      if (res.data.success) {
        showToast('Rejected', 'Booking request declined.', 'info');
        setBookings(prev =>
          prev.map(b => b._id === bookingId ? { ...b, status: 'Rejected' } : b)
        );
      }
    } catch (err) {
      showToast('Action Failed', 'Failed to reject booking request.', 'error');
    }
  };

  const inspectStudentProfile = async (userId) => {
    setInspectorLoading(true);
    setStudentInspectorOpen(true);
    try {
      const res = await api.get(`/student/profile/${userId}`);
      if (res.data.success) {
        setSelectedStudentProfile(res.data.profile);
      }
    } catch (err) {
      showToast('Inspector Error', 'Failed to retrieve student profile.', 'error');
      setStudentInspectorOpen(false);
    } finally {
      setInspectorLoading(false);
    }
  };

  // Filter lists based on tab
  const filteredBookings = bookings.filter((b) => b.status === activeTab);

  return (
    <div className="space-y-6 text-left">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black font-outfit tracking-tight text-slate-805 dark:text-white">
          Mentorship Booking Requests
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Review incoming requests, inspect student academic backgrounds, and manage classroom availability.
        </p>
      </div>

      {/* Tabs selectors */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-200/50 dark:border-slate-800/30 text-xs font-semibold text-slate-650 dark:text-slate-400">
        {['Pending', 'Accepted', 'Rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl border transition-colors ${
              activeTab === tab
                ? 'bg-primary text-white border-primary shadow-md shadow-primary/10'
                : 'border-slate-200/60 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab} Requests ({bookings.filter((b) => b.status === tab).length})
          </button>
        ))}
      </div>

      {/* Requests list */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 skeleton" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-12 text-center border border-slate-200/50 dark:border-slate-800 rounded-2xl glass-card text-slate-455 space-y-2">
          <FiCalendar className="w-8 h-8 mx-auto text-slate-350" />
          <p className="font-bold text-sm">No {activeTab.toLowerCase()} requests found.</p>
          <p className="text-xs text-slate-500">
            Incoming student tutoring requests will appear here.
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
                {/* Student Info & Request Meta */}
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200/40">
                    {booking.student?.avatar ? (
                      <img src={booking.student.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold uppercase">
                        {booking.studentName?.[0] || '?'}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <h4 className="font-bold text-sm text-slate-808 dark:text-slate-200">
                      Student: {booking.studentName}
                    </h4>

                    <p className="text-slate-550 dark:text-slate-400 font-semibold">
                      Course Target: {booking.course?.title || 'Custom Mentorship Program'}
                    </p>

                    <p className="text-slate-655 dark:text-slate-400 leading-relaxed text-[11px] mt-1 max-w-xl">
                      <span className="font-bold">Goal:</span> {booking.learningGoal}
                    </p>

                    {booking.additionalNotes && (
                      <p className="text-slate-500 dark:text-slate-500 text-[11px] italic">
                        Note: {booking.additionalNotes}
                      </p>
                    )}

                    {/* Preferred Slot */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-505 dark:text-slate-450 text-[10px] font-bold pt-1.5">
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

                {/* Actions row */}
                <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end justify-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => inspectStudentProfile(booking.student?.user?._id || booking.student?.user || booking.student)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-350 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <FiUser className="w-3.5 h-3.5" />
                    <span>View Student Profile</span>
                  </button>

                  {booking.status === 'Pending' && (
                    <div className="grid grid-cols-2 gap-2 mt-1 sm:mt-0 md:mt-1">
                      <button
                        onClick={() => handleAccept(booking._id)}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-650 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1"
                      >
                        <FiCheck className="w-4 h-4" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleReject(booking._id)}
                        className="px-4 py-2 bg-rose-500 hover:bg-rose-650 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/10 flex items-center justify-center gap-1"
                      >
                        <FiX className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}

                  {booking.status === 'Accepted' && (
                    <span className="text-emerald-500 font-bold text-xs flex items-center gap-1 py-2">
                      <FiCheckCircle className="w-4.5 h-4.5" />
                      <span>Approved request</span>
                    </span>
                  )}

                  {booking.status === 'Rejected' && (
                    <span className="text-rose-550 font-bold text-xs flex items-center gap-1 py-2">
                      <FiXCircle className="w-4.5 h-4.5" />
                      <span>Declined request</span>
                    </span>
                  )}
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Student Inspector Modal overlay */}
      <AnimatePresence>
        {studentInspectorOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStudentInspectorOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            {/* Modal Centering Wrapper */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="max-w-md w-full glass-card p-6 border border-slate-200/50 dark:border-slate-800 rounded-3xl shadow-2xl text-left space-y-4"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-205 dark:border-slate-805">
                  <h3 className="font-outfit font-black text-base text-slate-800 dark:text-white flex items-center gap-2">
                    <FiUser className="text-primary w-5 h-5" />
                    <span>Student Academic Background</span>
                  </h3>
                  <button
                    onClick={() => setStudentInspectorOpen(false)}
                    className="p-1 rounded-lg hover:bg-slate-100"
                  >
                    <FiX />
                  </button>
                </div>

                {inspectorLoading ? (
                  <div className="py-12 space-y-4">
                    <div className="w-12 h-12 rounded-full skeleton mx-auto" />
                    <div className="h-6 skeleton max-w-xs mx-auto" />
                    <div className="h-20 skeleton" />
                  </div>
                ) : selectedStudentProfile ? (
                  <div className="space-y-4 text-xs">
                    {/* Photo & Name card */}
                    <div className="flex items-center gap-3 bg-slate-100/50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-200/30">
                      <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0">
                        {selectedStudentProfile.avatar ? (
                          <img src={selectedStudentProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold text-lg uppercase">
                            {selectedStudentProfile.fullName?.[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100">
                          {selectedStudentProfile.fullName}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          {selectedStudentProfile.user?.email || 'email@example.com'}
                        </p>
                      </div>
                    </div>

                    {/* University */}
                    <div className="space-y-1.5 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <h5 className="text-[10px] font-bold uppercase text-slate-450">Institution Parameters</h5>
                      <p className="font-bold text-slate-700 dark:text-slate-305">
                        {selectedStudentProfile.university || 'Not Provided'}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">
                        {selectedStudentProfile.college} {selectedStudentProfile.department && `• ${selectedStudentProfile.department}`}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-[10px]">
                        {selectedStudentProfile.course} {selectedStudentProfile.year && `• ${selectedStudentProfile.year}`} {selectedStudentProfile.semester && `• Sem: ${selectedStudentProfile.semester}`}
                      </p>
                    </div>

                    {/* Biography */}
                    {selectedStudentProfile.biography && (
                      <div className="space-y-1">
                        <h5 className="text-[10px] font-bold uppercase text-slate-450">Biography</h5>
                        <p className="text-slate-655 dark:text-slate-350 leading-relaxed">
                          {selectedStudentProfile.biography}
                        </p>
                      </div>
                    )}

                    {/* Skills tags */}
                    {selectedStudentProfile.skills?.length > 0 && (
                      <div className="space-y-1">
                        <h5 className="text-[10px] font-bold uppercase text-slate-450">Acquired Skills</h5>
                        <div className="flex flex-wrap gap-1">
                          {selectedStudentProfile.skills.map((s, i) => (
                            <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Career Goal */}
                    {selectedStudentProfile.careerGoal && (
                      <div className="space-y-1">
                        <h5 className="text-[10px] font-bold uppercase text-slate-450">Career Objective</h5>
                        <p className="text-slate-655 dark:text-slate-350 leading-relaxed font-semibold">
                          {selectedStudentProfile.careerGoal}
                        </p>
                      </div>
                    )}

                    {/* Close button */}
                    <button
                      onClick={() => setStudentInspectorOpen(false)}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-center"
                    >
                      Close Profile
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-6 text-center">Failed to load student details.</p>
                )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherBookings;
