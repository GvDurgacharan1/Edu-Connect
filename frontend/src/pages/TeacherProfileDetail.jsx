import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft, FiUser, FiAward, FiBook, FiClock, FiDollarSign,
  FiMapPin, FiStar, FiLinkedin, FiGlobe, FiMessageSquare, FiBookOpen,
  FiCalendar, FiX, FiCheck, FiMail
} from 'react-icons/fi';

export const TeacherProfileDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useNotifications();
  const { isOnline } = useSocket();

  const [teacher, setTeacher] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal States
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [learningGoal, setLearningGoal] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [bookingSubmitLoading, setBookingSubmitLoading] = useState(false);

  useEffect(() => {
    fetchProfileDetails();
  }, [userId]);

  const fetchProfileDetails = async () => {
    try {
      setLoading(true);
      const [profileRes, coursesRes] = await Promise.all([
        api.get(`/teachers/${userId}`),
        api.get('/courses')
      ]);

      if (profileRes.data.success) {
        setTeacher(profileRes.data.profile);
        
        // Filter courses created by this specific teacher
        if (coursesRes.data.success) {
          const list = coursesRes.data.courses.filter(
            c => c.teacher._id === profileRes.data.profile._id
          );
          setCourses(list);
        }
      }
    } catch (err) {
      showToast('Error', 'Failed to retrieve professor profile details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingDate || !bookingTime || !learningGoal) {
      showToast('Validation Error', 'Please enter preferred date, time, and goal.', 'warning');
      return;
    }

    setBookingSubmitLoading(true);
    try {
      const res = await api.post('/bookings', {
        teacherId: teacher._id,
        courseId: selectedCourseId || null,
        preferredDate: bookingDate,
        preferredTime: bookingTime,
        learningGoal,
        additionalNotes
      });

      if (res.data.success) {
        showToast('Booking Requested!', 'Your session request was sent successfully.', 'success');
        setBookingModalOpen(false);
      }
    } catch (err) {
      showToast('Request Failed', err.response?.data?.message || 'Error creating booking request.', 'error');
    } finally {
      setBookingSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 skeleton" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 skeleton" />
          <div className="h-96 skeleton" />
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="p-12 text-center text-slate-500">
        <p className="font-bold text-sm">Professor profile not found.</p>
        <button onClick={() => navigate(-1)} className="text-primary hover:underline text-xs mt-2">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left relative">
      
      {/* Back Button & Title Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-black font-outfit tracking-tight text-slate-800 dark:text-white">
            Professor Profile Details
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            View curriculum, credentials, and book tutoring hours.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Columns: Bio, Qualifications, Courses */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Biography & Teaching Method */}
          <div className="p-6 rounded-2xl glass-card border border-slate-150 dark:border-slate-805 space-y-4">
            <div>
              <h3 className="font-outfit font-black text-base text-slate-800 dark:text-white">Biography</h3>
              <p className="text-slate-655 dark:text-slate-400 text-xs mt-3 leading-relaxed whitespace-pre-line">
                {teacher.biography || `${teacher.fullName} is a dedicated academic offering custom mentorship programs.`}
              </p>
            </div>

            {teacher.teachingStyle && (
              <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/30">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Teaching Methodology</h4>
                <p className="text-slate-655 dark:text-slate-400 text-xs mt-2 leading-relaxed">
                  {teacher.teachingStyle}
                </p>
              </div>
            )}
          </div>

          {/* Card 2: Professional Courses Published */}
          <div className="p-6 rounded-2xl glass-card border border-slate-150 dark:border-slate-805 space-y-4">
            <h3 className="font-outfit font-black text-base text-slate-800 dark:text-white flex items-center gap-2">
              <FiBookOpen className="text-primary w-5 h-5" />
              <span>Published Courses ({courses.length})</span>
            </h3>

            {courses.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                This professor has not published any specific courses yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <div
                    key={course._id}
                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-900 bg-white/40 dark:bg-slate-900/20 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-full h-28 rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden border border-slate-200/40">
                        {course.thumbnail ? (
                          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-primary to-accent text-white font-black text-lg uppercase">
                            {course.subject?.[0]}
                          </div>
                        )}
                      </div>
                      <h4 className="font-bold text-xs mt-3 text-slate-850 dark:text-slate-200 line-clamp-1">
                        {course.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-2 border-t border-slate-200/30">
                      <span className="text-xs font-black text-primary dark:text-accent">
                        ${course.fee}
                      </span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold">
                        {course.difficultyLevel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Profile Sidecard, Pricing, Timings */}
        <aside className="space-y-6">
          
          {/* Main profile sidecard */}
          <div className="p-6 rounded-2xl glass-card border border-slate-150 dark:border-slate-805 text-center space-y-4">
            
            {/* Avatar block */}
            <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mx-auto relative border border-white dark:border-slate-700 shadow-md">
              {teacher.avatar ? (
                <img src={teacher.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary text-white font-black text-2xl uppercase">
                  {teacher.fullName?.[0]}
                </div>
              )}
              {isOnline(teacher.user?._id) && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800" title="Online" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex justify-center items-center gap-1.5">
                <h3 className="font-outfit font-black text-base text-slate-800 dark:text-white">
                  {teacher.fullName}
                </h3>
                <div className="flex items-center gap-0.5 text-amber-500 font-bold text-xs flex-shrink-0">
                  <FiStar className="fill-amber-500 w-3.5 h-3.5" />
                  <span>{teacher.rating?.toFixed(1) || '5.0'}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{teacher.qualification}</p>
              <p className="text-[11px] text-slate-655 dark:text-slate-450 flex items-center justify-center gap-1">
                <FiMapPin className="w-3.5 h-3.5" />
                <span>{teacher.location || 'Harvard University'}</span>
              </p>
            </div>

            {/* Social channels */}
            <div className="flex items-center justify-center gap-3 pt-1 border-t border-slate-200/50 dark:border-slate-800/30">
              {teacher.linkedin && (
                <a href={teacher.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-primary hover:text-white rounded-lg transition-all text-slate-600 dark:text-slate-400">
                  <FiLinkedin className="w-4 h-4" />
                </a>
              )}
              {teacher.website && (
                <a href={teacher.website} target="_blank" rel="noopener noreferrer" className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-primary hover:text-white rounded-lg transition-all text-slate-600 dark:text-slate-400">
                  <FiGlobe className="w-4 h-4" />
                </a>
              )}
              {teacher.user?.email && (
                <a href={`mailto:${teacher.user.email}`} className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-primary hover:text-white rounded-lg transition-all text-slate-600 dark:text-slate-400">
                  <FiMail className="w-4 h-4" />
                </a>
              )}
            </div>

            <button
              onClick={() => setBookingModalOpen(true)}
              className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 flex items-center justify-center gap-2"
            >
              <FiCalendar className="w-4 h-4" />
              <span>Book Class Session</span>
            </button>
          </div>

          {/* Timings & pricing parameters */}
          <div className="p-6 rounded-2xl glass-card border border-slate-150 dark:border-slate-805 space-y-4 text-xs font-semibold text-slate-650 dark:text-slate-400">
            <h4 className="font-outfit font-black text-sm text-slate-800 dark:text-slate-200 pb-2 border-b border-slate-200/50 dark:border-slate-800/30">
              Session Info & availability
            </h4>
            
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-slate-500">
                <FiDollarSign className="w-4 h-4" />
                <span>Hourly Mentorship Fee</span>
              </span>
              <span className="font-bold text-slate-850 dark:text-white">${teacher.fees}/hr</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-slate-500">
                <FiClock className="w-4 h-4" />
                <span>Slot Hours</span>
              </span>
              <span className="font-bold text-slate-850 dark:text-white">{teacher.availableTime || '09:00 - 17:00'}</span>
            </div>

            <div className="space-y-1.5 pt-2">
              <span className="text-slate-500 block">Weekly Days Available:</span>
              <div className="flex flex-wrap gap-1">
                {teacher.availableDays?.length === 0 ? (
                  <span className="text-slate-500">Contact directly</span>
                ) : (
                  teacher.availableDays?.map((day, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-105 border border-slate-200/40 dark:bg-slate-800 text-[10px] font-bold">
                      {day.slice(0, 3)}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </aside>

      </div>

      {/* Booking Form overlay Modal */}
      <AnimatePresence>
        {bookingModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBookingModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            {/* Modal */}
            {/* Modal Centering Wrapper */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="max-w-md w-full glass-card p-6 border border-slate-200/50 dark:border-slate-800 rounded-3xl shadow-2xl text-left"
              >
                <div className="flex justify-between items-center pb-3 border-b border-slate-205 dark:border-slate-805 mb-4">
                  <h3 className="font-outfit font-black text-base text-slate-805 dark:text-white flex items-center gap-2">
                    <FiCalendar className="text-primary w-5 h-5" />
                    <span>Request Class Booking</span>
                  </h3>
                  <button
                    onClick={() => setBookingModalOpen(false)}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
                  {/* Course select if any */}
                  {courses.length > 0 && (
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 dark:text-slate-400">Request Target Course (Optional)</label>
                      <select
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border glass-input text-slate-800 dark:text-slate-100"
                      >
                        <option value="">No Course (Custom mentorship request)</option>
                        {courses.map(c => (
                          <option key={c._id} value={c._id}>{c.title} (${c.fee})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 dark:text-slate-400">Preferred Date *</label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border glass-input text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 dark:text-slate-400">Preferred Time Slot *</label>
                      <input
                        type="text"
                        required
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        placeholder="e.g. 10:00 AM"
                        className="w-full px-3 py-2.5 rounded-xl border glass-input text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 dark:text-slate-400">Learning Goal *</label>
                    <textarea
                      required
                      value={learningGoal}
                      onChange={(e) => setLearningGoal(e.target.value)}
                      rows={3}
                      placeholder="Describe what you want to learn..."
                      className="w-full px-3 py-2.5 rounded-xl border glass-input text-slate-800 dark:text-slate-100 resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 dark:text-slate-400">Additional Notes (Optional)</label>
                    <input
                      type="text"
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder="Any comments, syllabus attachments..."
                      className="w-full px-3 py-2.5 rounded-xl border glass-input text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  {/* Footer Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setBookingModalOpen(false)}
                      className="py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl font-bold text-center text-slate-600 dark:text-slate-350"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={bookingSubmitLoading}
                      className="py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-md shadow-primary/10 flex items-center justify-center gap-2"
                    >
                      {bookingSubmitLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <FiCheck className="w-4 h-4" />
                          <span>Submit Booking</span>
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

export default TeacherProfileDetail;
