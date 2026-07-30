import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBookOpen, FiSearch, FiFilter, FiAward, FiClock, FiFileText,
  FiDownload, FiDollarSign, FiUser, FiInfo
} from 'react-icons/fi';

export const StudentCourses = () => {
  const { showToast } = useNotifications();
  
  // States
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('');
  const [sortBy, setSortBy] = useState('');

  // Course Details Modal
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, [subject, difficultyLevel, sortBy]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {
        search,
        subject,
        difficultyLevel,
        sortBy
      };
      const res = await api.get('/courses', { params });
      if (res.data.success) {
        setCourses(res.data.courses);
      }
    } catch (err) {
      showToast('Error', 'Failed to retrieve courses list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleDownload = (materialUrl) => {
    if (!materialUrl) return;
    const link = document.createElement('a');
    link.href = materialUrl;
    link.download = materialUrl.split('/').pop() || 'material.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-left relative">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black font-outfit tracking-tight text-slate-805 dark:text-white">
          Academic Courses
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Explore structured syllabi published by professors and download study resources.
        </p>
      </div>

      {/* Filter Options Panel */}
      <div className="p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/45 glass-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 text-xs">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md flex gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search course title or description..."
              className="w-full pl-10 pr-4 py-2 rounded-lg glass-input text-slate-800 dark:text-slate-100"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark">
            Find
          </button>
        </form>

        {/* Filter select elements */}
        <div className="flex flex-wrap gap-2 items-center font-semibold text-slate-600 dark:text-slate-400">
          <select
            value={difficultyLevel}
            onChange={(e) => setDifficultyLevel(e.target.value)}
            className="px-3 py-2 rounded-lg glass-input text-slate-800 dark:text-slate-100"
          >
            <option value="">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg glass-input text-slate-800 dark:text-slate-100"
          >
            <option value="">Sort By</option>
            <option value="lowestFee">Lowest Fee</option>
            <option value="highestFee">Highest Fee</option>
          </select>
        </div>

      </div>

      {/* Cards list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-72 skeleton" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="p-12 text-center border border-slate-200/50 dark:border-slate-800 rounded-2xl glass-card text-slate-450 space-y-2">
          <FiBookOpen className="w-8 h-8 mx-auto text-slate-350" />
          <p className="font-bold text-sm">No courses matching filters found.</p>
          <p className="text-xs text-slate-500">
            Check back later as professors publish new curriculum paths.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 rounded-2xl glass-card border border-slate-200/60 dark:border-slate-800/70 text-left flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail */}
                <div className="w-full h-36 bg-slate-200 dark:bg-slate-850 rounded-xl overflow-hidden border border-slate-200/40 relative">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-primary to-accent text-white font-black text-2xl uppercase">
                      {course.subject?.[0]}
                    </div>
                  )}
                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[9px] font-bold text-white uppercase">
                    {course.difficultyLevel}
                  </span>
                </div>

                <div className="mt-3.5 space-y-1">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                    {course.subject}
                  </p>
                  <p className="text-[11px] text-slate-655 dark:text-slate-400 line-clamp-2 leading-relaxed mt-1.5">
                    {course.description}
                  </p>
                </div>

                {/* Info row */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-200/40 pt-3">
                  <span className="flex items-center gap-1">
                    <FiClock className="w-3.5 h-3.5 text-primary" />
                    <span>{course.duration || '4 weeks'}</span>
                  </span>
                  <span className="flex items-center gap-1 justify-end">
                    <FiFileText className="w-3.5 h-3.5 text-primary" />
                    <span>{course.sessionsCount} Sessions</span>
                  </span>
                </div>
              </div>

              {/* Action row */}
              <div className="flex justify-between items-center mt-5 pt-3 border-t border-slate-200/40">
                <span className="text-sm font-black text-primary dark:text-accent">
                  ₹{course.fee}
                </span>

                <button
                  onClick={() => {
                    setSelectedCourse(course);
                    setDetailsModalOpen(true);
                  }}
                  className="px-4 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary dark:text-accent dark:bg-accent/10 dark:hover:bg-accent/20 rounded-lg text-xs font-bold transition-all"
                >
                  View Details
                </button>
              </div>

            </motion.div>
          ))}
        </div>
      )}

      {/* Course Detail Modal */}
      <AnimatePresence>
        {detailsModalOpen && selectedCourse && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetailsModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            {/* Modal */}
            {/* Modal Centering Wrapper */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="max-w-lg w-full glass-card p-6 border border-slate-200/50 dark:border-slate-800 rounded-3xl shadow-2xl text-left space-y-4"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-205 dark:border-slate-805">
                  <h3 className="font-outfit font-black text-base text-slate-800 dark:text-white flex items-center gap-2">
                    <FiBookOpen className="text-primary w-5 h-5" />
                    <span>Course Syllabus Details</span>
                  </h3>
                  <button
                    onClick={() => setDetailsModalOpen(false)}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <FiX />
                  </button>
                </div>

                {/* Title & Prof summary */}
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                    {selectedCourse.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">
                    {selectedCourse.subject} • {selectedCourse.difficultyLevel} Level
                  </p>
                  {selectedCourse.teacher && (
                    <p className="text-xs text-primary dark:text-accent font-semibold mt-1">
                      Professor: {selectedCourse.teacher.fullName}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <h5 className="text-[10px] font-bold uppercase text-slate-450">Syllabus Overview</h5>
                  <p className="text-xs text-slate-655 dark:text-slate-350 leading-relaxed">
                    {selectedCourse.description}
                  </p>
                </div>

                {/* Prerequisites list */}
                {selectedCourse.prerequisites?.length > 0 && (
                  <div className="space-y-1">
                    <h5 className="text-[10px] font-bold uppercase text-slate-450">Prerequisites</h5>
                    <div className="flex flex-wrap gap-1">
                      {selectedCourse.prerequisites.map((p, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-105 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 text-[10px] font-semibold rounded">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Study Materials downloads */}
                <div className="space-y-2 pt-2 border-t border-slate-200/40">
                  <h5 className="text-[10px] font-bold uppercase text-slate-450 flex items-center gap-1.5">
                    <FiFileText className="w-3.5 h-3.5" />
                    <span>Syllabus PDFs & Reading Materials ({selectedCourse.studyMaterials?.length || 0})</span>
                  </h5>
                  
                  {selectedCourse.studyMaterials?.length === 0 ? (
                    <p className="text-[10px] text-slate-500 italic">No notes uploaded for this course yet.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {selectedCourse.studyMaterials.map((mat, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center p-2 rounded-lg bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-900 text-xs text-slate-600 dark:text-slate-350"
                        >
                          <span className="truncate max-w-xs font-medium">
                            Material #{i + 1}: {mat.split('/').pop()}
                          </span>
                          <button
                            onClick={() => handleDownload(mat)}
                            className="p-1 text-primary dark:text-accent hover:bg-primary/10 rounded"
                          >
                            <FiDownload className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-slate-200/40 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Class Registration Fee</span>
                    <span className="text-base font-black text-primary dark:text-accent">₹{selectedCourse.fee}</span>
                  </div>
                  <button
                    onClick={() => {
                      setDetailsModalOpen(false);
                      navigate(`/student/teachers/${selectedCourse.teacher?.user?._id || selectedCourse.teacher?.user}`);
                    }}
                    className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-md shadow-primary/10"
                  >
                    Book Professor
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const FiX = () => <svg className="w-5 h-5 text-slate-500 hover:text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

export default StudentCourses;
