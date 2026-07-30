import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiFilter, FiDollarSign, FiStar, FiClock, FiMapPin,
  FiBookOpen, FiUser, FiInfo, FiCalendar, FiArrowRight, FiX, FiCheck
} from 'react-icons/fi';

export const StudentSearchTeachers = () => {
  const navigate = useNavigate();
  const { showToast } = useNotifications();
  const { isOnline } = useSocket();

  // Search & Filter Parameters
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [skill, setSkill] = useState('');
  const [university, setUniversity] = useState('');
  const [experience, setExperience] = useState('');
  const [minFee, setMinFee] = useState('');
  const [maxFee, setMaxFee] = useState('');
  const [rating, setRating] = useState('');
  const [sortBy, setSortBy] = useState('highestRated');
  const [availableToday, setAvailableToday] = useState(false);

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal States
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [learningGoal, setLearningGoal] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [coursesList, setCoursesList] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [bookingSubmitLoading, setBookingSubmitLoading] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, [sortBy, availableToday]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const params = {
        search,
        subject,
        skill,
        university,
        experience,
        minFee,
        maxFee,
        rating,
        sortBy,
        availableToday
      };
      const res = await api.get('/teachers', { params });
      if (res.data.success) {
        setTeachers(res.data.teachers);
      }
    } catch (err) {
      showToast('Error', 'Failed to retrieve teachers list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTeachers();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSubject('');
    setSkill('');
    setUniversity('');
    setExperience('');
    setMinFee('');
    setMaxFee('');
    setRating('');
    setSortBy('highestRated');
    setAvailableToday(false);
    // Trigger immediate reload
    setTimeout(fetchTeachers, 0);
  };

  const openBookingModal = async (teacher) => {
    setSelectedTeacher(teacher);
    setBookingModalOpen(true);
    setBookingDate('');
    setBookingTime('');
    setLearningGoal('');
    setAdditionalNotes('');
    setSelectedCourseId('');

    // Fetch teacher's published courses to populate selection
    try {
      const res = await api.get('/courses');
      if (res.data.success) {
        // Filter courses created by this specific teacher
        const list = res.data.courses.filter(c => c.teacher._id === teacher._id);
        setCoursesList(list);
      }
    } catch (err) {
      console.warn('Failed to load teacher courses:', err.message);
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
        teacherId: selectedTeacher._id,
        courseId: selectedCourseId || null,
        preferredDate: bookingDate,
        preferredTime: bookingTime,
        learningGoal,
        additionalNotes
      });

      if (res.data.success) {
        showToast('Booking Requested!', 'Your request was sent. Unread alerts will notify you on acceptance.', 'success');
        setBookingModalOpen(false);
      }
    } catch (err) {
      showToast('Request Failed', err.response?.data?.message || 'Error creating booking request.', 'error');
    } finally {
      setBookingSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left relative">
      
      {/* Page Title Header */}
      <div>
        <h2 className="text-2xl font-black font-outfit tracking-tight text-slate-800 dark:text-white">
          Mentoring Professors
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Browse verified university professors, filter by subjects, and book slot schedules.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Left Column: Filter Panel */}
        <aside className="w-full lg:w-80 glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 space-y-5">
          <div className="flex justify-between items-center pb-2 border-b border-slate-205 dark:border-slate-800/30">
            <h3 className="font-outfit font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <FiFilter className="w-4 h-4 text-primary" />
              <span>Search Filters</span>
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-primary dark:text-accent font-semibold hover:underline"
            >
              Reset All
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-600 dark:text-slate-400">Teacher Name</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full pl-8 pr-3 py-2 rounded-lg glass-input text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-600 dark:text-slate-400">Subject Area</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Databases"
                className="w-full px-3 py-2 rounded-lg glass-input text-slate-805 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-600 dark:text-slate-400">Specific Skill</label>
              <input
                type="text"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                placeholder="e.g. React"
                className="w-full px-3 py-2 rounded-lg glass-input text-slate-805 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-600 dark:text-slate-400">University</label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="e.g. Global Tech"
                className="w-full px-3 py-2 rounded-lg glass-input text-slate-805 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-slate-400">Min Fee ($)</label>
                <input
                  type="number"
                  value={minFee}
                  onChange={(e) => setMinFee(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-lg glass-input text-slate-805 dark:text-slate-100"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-slate-400">Max Fee ($)</label>
                <input
                  type="number"
                  value={maxFee}
                  onChange={(e) => setMaxFee(e.target.value)}
                  placeholder="150"
                  className="w-full px-3 py-2 rounded-lg glass-input text-slate-805 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 font-bold text-slate-600 dark:text-slate-400">
              <div className="space-y-1">
                <label>Exp (Years)</label>
                <input
                  type="number"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="2"
                  className="w-full px-3 py-2 rounded-lg glass-input text-slate-800 dark:text-slate-100"
                />
              </div>
              <div className="space-y-1">
                <label>Rating (Min)</label>
                <input
                  type="number"
                  step="0.1"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  placeholder="4.0"
                  className="w-full px-3 py-2 rounded-lg glass-input text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                id="available_today"
                type="checkbox"
                checked={availableToday}
                onChange={(e) => setAvailableToday(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded bg-transparent"
              />
              <label htmlFor="available_today" className="font-semibold text-slate-750 dark:text-slate-350">
                Available Today
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary text-white rounded-lg font-bold shadow-md shadow-primary/10 hover:bg-primary-dark transition-colors mt-2"
            >
              Apply Filter Parameters
            </button>
          </form>
        </aside>

        {/* Right Column: Search Results */}
        <div className="flex-1 w-full space-y-4">
          
          {/* Sorting Headers Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/40 glass-card gap-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Found {teachers.length} verified professors
            </span>

            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-450">
              <span>Sort:</span>
              {[
                { label: 'Highest Rated', val: 'highestRated' },
                { label: 'Lowest Fee', val: 'lowestFee' },
                { label: 'Most Experienced', val: 'mostExperienced' },
                { label: 'Alphabetical', val: 'alphabetical' }
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => setSortBy(opt.val)}
                  className={`px-3 py-1.5 rounded-lg border transition-colors ${
                    sortBy === opt.val
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'border-slate-200/50 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid list */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 skeleton" />
              ))}
            </div>
          ) : teachers.length === 0 ? (
            <div className="p-12 rounded-2xl glass-card border border-slate-200/50 dark:border-slate-800 text-center text-slate-450 space-y-2">
              <FiUser className="w-10 h-10 mx-auto text-slate-350" />
              <p className="font-bold text-sm">No professors match current filters.</p>
              <p className="text-xs text-slate-500">Try modifying subject queries or hitting Reset.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teachers.map((teacher) => (
                <motion.div
                  key={teacher._id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-5 rounded-2xl glass-card border border-slate-200/60 dark:border-slate-800/70 text-left flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Photo, Name, Online Status */}
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden flex-shrink-0 relative border border-slate-200/40">
                        {teacher.avatar ? (
                          <img src={teacher.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold text-base uppercase">
                            {teacher.fullName?.[0]}
                          </div>
                        )}
                        {/* Presence badge */}
                        {isOnline(teacher.user?._id) && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800" title="Online" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm truncate text-slate-800 dark:text-slate-200">
                            {teacher.fullName}
                          </h4>
                          <div className="flex items-center gap-0.5 text-amber-500 font-bold text-xs flex-shrink-0">
                            <FiStar className="fill-amber-500 w-3.5 h-3.5" />
                            <span>{teacher.rating?.toFixed(1) || '5.0'}</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-semibold">
                          {teacher.qualification || 'Professor'}
                        </p>
                        <p className="text-[10px] text-slate-655 dark:text-slate-450 truncate">
                          {teacher.university}
                        </p>
                      </div>
                    </div>

                    {/* Meta stats details */}
                    <div className="grid grid-cols-2 gap-2 mt-4 bg-slate-100/50 dark:bg-slate-900/30 p-2.5 rounded-xl border border-slate-200/30 dark:border-slate-800/10 text-[10px] font-semibold text-slate-650 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <FiCalendar className="text-primary w-3.5 h-3.5" />
                        <span>Exp: {teacher.experience} Years</span>
                      </span>
                      <span className="flex items-center gap-1.5 justify-end">
                        <FiDollarSign className="text-primary w-3.5 h-3.5" />
                        <span>Rate: ${teacher.fees}/hr</span>
                      </span>
                    </div>

                    {/* Tag collections */}
                    <div className="space-y-1.5 mt-4">
                      {teacher.subjects?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {teacher.subjects.slice(0, 3).map((sub, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-bold">
                              {sub}
                            </span>
                          ))}
                        </div>
                      )}
                      {teacher.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {teacher.skills.slice(0, 3).map((sk, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-accent/10 text-accent-600 dark:text-accent-500 text-[9px] font-bold">
                              {sk}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-5">
                    <button
                      onClick={() => navigate(`/student/teachers/${teacher.user?._id}`)}
                      className="py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl text-xs font-bold text-center text-slate-700 dark:text-slate-350"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => openBookingModal(teacher)}
                      className="py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-md shadow-primary/10 text-center"
                    >
                      Book Now
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Booking Form Overlay Modal */}
      <AnimatePresence>
        {bookingModalOpen && selectedTeacher && (
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
                  <h3 className="font-outfit font-black text-base text-slate-800 dark:text-white flex items-center gap-2">
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

                {/* Mini Professor profile summary */}
                <div className="p-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/30 flex items-center gap-3 mb-4 text-xs">
                  <div className="w-10 h-10 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0">
                    {selectedTeacher.avatar ? (
                      <img src={selectedTeacher.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold">
                        {selectedTeacher.fullName?.[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100">{selectedTeacher.fullName}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{selectedTeacher.qualification}</p>
                  </div>
                </div>

                <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
                  {/* Course select if any */}
                  {coursesList.length > 0 && (
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 dark:text-slate-400">Request Target Course (Optional)</label>
                      <select
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border glass-input text-slate-800 dark:text-slate-100"
                      >
                        <option value="">No Course (Custom mentorship request)</option>
                        {coursesList.map(c => (
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
                      placeholder="Describe what you want to learn (e.g. databases Normalization study, assignment queries support)..."
                      className="w-full px-3 py-2.5 rounded-xl border glass-input text-slate-800 dark:text-slate-100 resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 dark:text-slate-400">Additional Notes (Optional)</label>
                    <input
                      type="text"
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder="Any comments, syllabus attachments link, papers info..."
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

export default StudentSearchTeachers;
