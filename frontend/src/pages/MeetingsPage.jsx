import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar, FiClock, FiVideo, FiPlus, FiCheck, FiX,
  FiSlash, FiCheckCircle, FiBookOpen, FiBookmark, FiInfo, FiTrash2
} from 'react-icons/fi';

export const MeetingsPage = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  // Lists and tab state
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Upcoming'); // 'Upcoming', 'Completed', 'Cancelled', 'Today'

  // Booking details for scheduler dropdown
  const [acceptedBookings, setAcceptedBookings] = useState([]);

  // Form modal triggers
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/new');
  const [description, setDescription] = useState('');
  
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchMeetings();
    if (user?.role === 'teacher') {
      fetchAcceptedBookings();
    }
  }, [user]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/meetings');
      if (res.data.success) {
        setMeetings(res.data.meetings);
      }
    } catch (err) {
      showToast('Error', 'Failed to retrieve scheduled meetings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAcceptedBookings = async () => {
    try {
      const res = await api.get('/bookings');
      if (res.data.success) {
        setAcceptedBookings(res.data.bookings.filter(b => b.status === 'Accepted'));
      }
    } catch (err) {
      console.warn('Failed to retrieve bookings:', err.message);
    }
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    if (!bookingId || !title || !date || !startTime || !endTime || !meetingLink) {
      showToast('Validation Error', 'Please enter all required fields.', 'warning');
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await api.post('/meetings', {
        bookingId,
        title,
        date,
        startTime,
        endTime,
        duration,
        meetingLink,
        description
      });

      if (res.data.success) {
        showToast('Meeting Scheduled!', 'Student has been notified of the class schedule.', 'success');
        setScheduleModalOpen(false);
        fetchMeetings();
      }
    } catch (err) {
      showToast('Schedule Failed', err.response?.data?.message || 'Error scheduling meeting.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdateStatus = async (meetingId, status) => {
    try {
      const res = await api.put(`/meetings/${meetingId}`, { status });
      if (res.data.success) {
        showToast('Meeting Status Saved', `Class has been marked as ${status.toLowerCase()}.`, 'success');
        setMeetings(prev =>
          prev.map(m => m._id === meetingId ? { ...m, status } : m)
        );
      }
    } catch (err) {
      showToast('Action Failed', 'Failed to update meeting status.', 'error');
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!window.confirm('Are you sure you want to delete this meeting?')) return;
    try {
      const res = await api.delete(`/meetings/${meetingId}`);
      if (res.data.success) {
        showToast('Deleted', 'Meeting record removed.', 'info');
        setMeetings(prev => prev.filter(m => m._id !== meetingId));
      }
    } catch (err) {
      showToast('Delete Failed', 'Failed to delete meeting record.', 'error');
    }
  };

  // Organize Filter Lists
  const getFilteredMeetings = () => {
    const todayStr = new Date().toISOString().split('T')[0];

    if (activeTab === 'Today') {
      return meetings.filter(
        m => new Date(m.date).toISOString().split('T')[0] === todayStr && m.status === 'Upcoming'
      );
    }
    return meetings.filter(m => m.status === activeTab);
  };

  const filteredList = getFilteredMeetings();

  const tabOptions = user?.role === 'teacher'
    ? ['Today', 'Upcoming', 'Completed', 'Cancelled']
    : ['Upcoming', 'Completed', 'Cancelled'];

  const statusColors = {
    Upcoming: 'border-primary/20 bg-primary/5 text-primary dark:text-accent',
    Completed: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400',
    Cancelled: 'border-rose-500/20 bg-rose-500/5 text-rose-500'
  };

  return (
    <div className="space-y-6 text-left relative">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black font-outfit tracking-tight text-slate-805 dark:text-white">
            Virtual Classrooms
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Coordinate virtual meeting links, join active rooms, and log completed mentorship hours.
          </p>
        </div>

        {user?.role === 'teacher' && (
          <button
            onClick={() => {
              if (acceptedBookings.length === 0) {
                showToast('Validation Error', 'You must accept at least one booking request to schedule a class.', 'warning');
                return;
              }
              setScheduleModalOpen(true);
              setBookingId(acceptedBookings[0]?._id);
              setTitle('');
              setDate('');
              setStartTime('');
              setEndTime('');
              setDuration('60');
              setMeetingLink('https://meet.google.com/new');
              setDescription('');
            }}
            className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md shadow-primary/10 flex items-center gap-2 hover:bg-primary-dark transition-all"
          >
            <FiPlus className="w-4 h-4" />
            <span>Schedule Class</span>
          </button>
        )}
      </div>

      {/* Tabs Menu selectors */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-200/50 dark:border-slate-800/30 text-xs font-semibold text-slate-650 dark:text-slate-400">
        {tabOptions.map((tab) => {
          let count = 0;
          if (tab === 'Today') {
            const todayStr = new Date().toISOString().split('T')[0];
            count = meetings.filter(m => new Date(m.date).toISOString().split('T')[0] === todayStr && m.status === 'Upcoming').length;
          } else {
            count = meetings.filter(m => m.status === tab).length;
          }
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl border transition-all ${
                activeTab === tab
                  ? 'bg-primary text-white border-primary shadow-md shadow-primary/10'
                  : 'border-slate-200/60 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* Meetings Grid/List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 skeleton" />
          ))}
        </div>
      ) : filteredList.length === 0 ? (
        <div className="p-12 text-center border border-slate-200/50 dark:border-slate-800 rounded-2xl glass-card text-slate-455 space-y-2">
          <FiVideo className="w-8 h-8 mx-auto text-slate-350 animate-float" />
          <p className="font-bold text-sm">No {activeTab.toLowerCase()} meetings scheduled.</p>
          <p className="text-xs text-slate-500">
            {user?.role === 'teacher'
              ? 'Schedule a virtual class to coordinate learning slots.'
              : 'Classroom links will appear here once scheduled by the professor.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredList.map((meet) => (
            <div
              key={meet._id}
              className="p-5 rounded-2xl glass-card border border-slate-200/60 dark:border-slate-800/70 flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              {/* Left Column: Meeting Title, Date, Course, Partner */}
              <div className="flex gap-4 items-start text-xs text-left">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 flex-shrink-0">
                  <FiVideo className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                      {meet.title}
                    </h4>
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${statusColors[meet.status]}`}>
                      {meet.status}
                    </span>
                  </div>

                  <p className="text-slate-550 dark:text-slate-400 font-semibold">
                    {user?.role === 'student' ? 'Professor: ' : 'Student: '}
                    <span className="text-primary dark:text-accent font-bold">
                      {user?.role === 'student' ? meet.teacher?.fullName : meet.student?.fullName || meet.studentName}
                    </span>
                  </p>

                  {meet.course && (
                    <p className="text-slate-500">
                      Course: {meet.course.title}
                    </p>
                  )}

                  {meet.description && (
                    <p className="text-slate-655 dark:text-slate-400 mt-1 max-w-lg leading-relaxed">
                      Syllabus: {meet.description}
                    </p>
                  )}

                  {/* Date & Time slots */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500 dark:text-slate-450 text-[10px] font-bold pt-1.5">
                    <span className="flex items-center gap-1">
                      <FiCalendar className="w-3.5 h-3.5 text-primary" />
                      <span>Date: {new Date(meet.date).toLocaleDateString()}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock className="w-3.5 h-3.5 text-primary" />
                      <span>Time: {meet.startTime} - {meet.endTime} ({meet.duration} min)</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Active buttons or controls */}
              <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end justify-center gap-2 flex-shrink-0">
                {meet.status === 'Upcoming' && (
                  <div className="flex flex-wrap gap-2 justify-end text-[10px] font-bold">
                    <a
                      href={meet.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-755 text-white rounded-xl shadow-md shadow-indigo-500/10 flex items-center justify-center gap-1.5"
                    >
                      <FiVideo className="w-4 h-4" />
                      <span>Join Classroom</span>
                    </a>

                    {user?.role === 'teacher' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(meet._id, 'Completed')}
                          className="px-3 py-2 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 rounded-xl"
                        >
                          Mark Completed
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(meet._id, 'Cancelled')}
                          className="px-3 py-2 border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 rounded-xl"
                        >
                          Cancel Class
                        </button>
                      </>
                    )}
                  </div>
                )}

                {meet.status === 'Completed' && (
                  <span className="text-emerald-500 font-bold text-xs flex items-center gap-1.5 py-2">
                    <FiCheckCircle className="w-4.5 h-4.5" />
                    <span>Mentorship complete</span>
                  </span>
                )}

                {meet.status === 'Cancelled' && (
                  <span className="text-rose-500 font-bold text-xs flex items-center gap-1.5 py-2">
                    <FiSlash className="w-4.5 h-4.5" />
                    <span>Meeting cancelled</span>
                  </span>
                )}

                {user?.role === 'teacher' && (
                  <button
                    onClick={() => handleDeleteMeeting(meet._id)}
                    className="p-2 border border-rose-500/10 text-rose-500/70 hover:text-rose-500 hover:bg-rose-500/5 rounded-lg mt-1 text-[10px]"
                    title="Remove Meeting Log"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Meeting Modal form (Teacher Only) */}
      <AnimatePresence>
        {scheduleModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setScheduleModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            {/* Modal Centering Wrapper */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="max-w-md w-full glass-card p-6 border border-slate-205 dark:border-slate-805 rounded-3xl shadow-2xl text-left space-y-4"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-205 dark:border-slate-805">
                  <h3 className="font-outfit font-black text-base text-slate-800 dark:text-white flex items-center gap-2">
                    <FiCalendar className="text-primary w-5 h-5" />
                    <span>Schedule Virtual Mentorship</span>
                  </h3>
                  <button onClick={() => setScheduleModalOpen(false)} className="p-1 rounded hover:bg-slate-100">
                    <FiX />
                  </button>
                </div>

                <form onSubmit={handleCreateMeeting} className="space-y-4 text-xs font-semibold">
                  
                  <div className="space-y-1">
                    <label className="text-slate-600 dark:text-slate-400">Select Approved Student *</label>
                    <select
                      value={bookingId}
                      required
                      onChange={(e) => setBookingId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border glass-input text-slate-808 dark:text-slate-100"
                    >
                      {acceptedBookings.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.studentName} ({b.course?.title || 'Custom Slot'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-655 dark:text-slate-400">Class Session Title *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Relational Normalizations Review"
                      className="w-full px-3 py-2.5 rounded-xl border glass-input text-slate-808 dark:text-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-655 dark:text-slate-400">Date *</label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border glass-input text-slate-808 dark:text-slate-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-655 dark:text-slate-400">Duration (Minutes)</label>
                      <input
                        type="number"
                        required
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="60"
                        className="w-full px-3 py-2.5 rounded-xl border glass-input text-slate-808 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-655 dark:text-slate-400">Start Time *</label>
                      <input
                        type="text"
                        required
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        placeholder="e.g. 10:00 AM"
                        className="w-full px-3 py-2.5 rounded-xl border glass-input text-slate-808 dark:text-slate-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-655 dark:text-slate-400">End Time *</label>
                      <input
                        type="text"
                        required
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        placeholder="e.g. 11:00 AM"
                        className="w-full px-3 py-2.5 rounded-xl border glass-input text-slate-808 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-655 dark:text-slate-400">Meeting Room URL (Google Meet / Zoom) *</label>
                    <input
                      type="url"
                      required
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      placeholder="https://meet.google.com/xyz"
                      className="w-full px-3 py-2.5 rounded-xl border glass-input text-slate-808 dark:text-slate-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-655 dark:text-slate-400 font-bold">Class notes / agenda</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      placeholder="Please review Normal Forms 1NF to 3NF slide PDFs before joining..."
                      className="w-full px-3 py-2.5 rounded-xl border glass-input text-slate-808 dark:text-slate-100 resize-none font-normal"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/40">
                    <button
                      type="button"
                      onClick={() => setScheduleModalOpen(false)}
                      className="py-2.5 border border-slate-250 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl font-bold text-center text-slate-605 dark:text-slate-350"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-md shadow-primary/10 flex items-center justify-center gap-2"
                    >
                      {submitLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <FiCheck className="w-4 h-4" />
                          <span>Schedule Meeting</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MeetingsPage;
