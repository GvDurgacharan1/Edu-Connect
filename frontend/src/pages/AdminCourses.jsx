import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBookOpen, FiTrash2, FiSearch, FiDollarSign } from 'react-icons/fi';

export const AdminCourses = () => {
  const { showToast } = useNotifications();

  // States
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/courses');
      if (res.data.success) {
        setCourses(res.data.courses);
      }
    } catch (err) {
      showToast('Error', 'Failed to retrieve all courses.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to permanently delete this course?')) return;
    try {
      const res = await api.delete(`/courses/${courseId}`);
      if (res.data.success) {
        showToast('Deleted', 'Course removed successfully.', 'info');
        setCourses(prev => prev.filter(c => c._id !== courseId));
      }
    } catch (err) {
      showToast('Delete Failed', 'Failed to remove course.', 'error');
    }
  };

  const filteredCourses = courses.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.subject?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left relative">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black font-outfit tracking-tight text-slate-805 dark:text-white">
          Moderate Published Courses
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          View all published curricula across the platform and delete terms violating safety parameters.
        </p>
      </div>

      {/* Search Filter */}
      <div className="p-4 rounded-xl border border-slate-200/50 dark:border-slate-805 glass-card flex items-center gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search course title or subject..."
            className="w-full pl-9 pr-4 py-2 rounded-lg glass-input text-slate-808 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Courses lists */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 skeleton" />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="p-12 text-center border border-slate-200/50 dark:border-slate-800 rounded-2xl glass-card text-slate-455 space-y-2">
          <FiBookOpen className="w-8 h-8 mx-auto text-slate-350" />
          <p className="font-bold text-sm">No courses matching search found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 rounded-2xl glass-card border border-slate-200/60 dark:border-slate-800/70 text-left flex flex-col justify-between"
            >
              <div>
                <div className="w-full h-28 bg-slate-205 dark:bg-slate-850 rounded-xl overflow-hidden border border-slate-200/40 relative">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-primary to-accent text-white font-black text-2xl uppercase">
                      {course.subject?.[0]}
                    </div>
                  )}
                </div>

                <div className="mt-3 space-y-1 text-xs">
                  <h3 className="font-bold text-slate-808 dark:text-slate-100 truncate">
                    {course.title}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">
                    {course.subject}
                  </p>
                  {course.teacher && (
                    <p className="text-primary dark:text-accent font-semibold mt-1">
                      Prof: {course.teacher.fullName}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-200/40 text-xs">
                <span className="font-black text-slate-800 dark:text-white">
                  ${course.fee}
                </span>

                <button
                  onClick={() => handleDelete(course._id)}
                  className="p-2 border border-rose-500/20 hover:bg-rose-500/10 text-rose-500 rounded-lg flex items-center gap-1.5 font-bold"
                >
                  <FiTrash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>

            </motion.div>
          ))}
        </div>
      )}

    </div>
  );
};

export default AdminCourses;
