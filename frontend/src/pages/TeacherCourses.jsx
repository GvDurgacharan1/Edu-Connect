import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBookOpen, FiPlus, FiEdit, FiTrash2, FiClock, FiFileText,
  FiDollarSign, FiGlobe, FiEye, FiEyeOff, FiX, FiCheck, FiUpload
} from 'react-icons/fi';

export const TeacherCourses = () => {
  const { showToast } = useNotifications();

  // Lists and loading
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form modal toggles
  const [formOpen, setFormOpen] = useState(false);
  const [editCourseId, setEditCourseId] = useState(null);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [sessionsCount, setSessionsCount] = useState('');
  const [fee, setFee] = useState('');
  const [prerequisites, setPrerequisites] = useState('');
  const [maxStudents, setMaxStudents] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('Beginner');
  
  // File fields
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [materialsFiles, setMaterialsFiles] = useState([]);
  
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/courses/my');
      if (res.data.success) {
        setCourses(res.data.courses);
      }
    } catch (err) {
      showToast('Error', 'Failed to retrieve your courses.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditCourseId(null);
    setTitle('');
    setSubject('');
    setDescription('');
    setDuration('');
    setSessionsCount('10');
    setFee('0');
    setPrerequisites('');
    setMaxStudents('20');
    setDifficultyLevel('Beginner');
    setThumbnailFile(null);
    setThumbnailPreview('');
    setMaterialsFiles([]);
    setFormOpen(true);
  };

  const handleOpenEditModal = (course) => {
    setEditCourseId(course._id);
    setTitle(course.title || '');
    setSubject(course.subject || '');
    setDescription(course.description || '');
    setDuration(course.duration || '');
    setSessionsCount(course.sessionsCount?.toString() || '10');
    setFee(course.fee?.toString() || '0');
    setPrerequisites(course.prerequisites?.join(', ') || '');
    setMaxStudents(course.maxStudents?.toString() || '20');
    setDifficultyLevel(course.difficultyLevel || 'Beginner');
    setThumbnailFile(null);
    setThumbnailPreview(course.thumbnail || '');
    setMaterialsFiles([]);
    setFormOpen(true);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleTogglePublish = async (courseId, currentStatus) => {
    try {
      const endpoint = `/courses/${courseId}/${currentStatus ? 'unpublish' : 'publish'}`;
      const res = await api.put(endpoint);
      if (res.data.success) {
        showToast(
          'Status Changed',
          `Course has been ${currentStatus ? 'unpublished' : 'published'} successfully.`,
          'success'
        );
        setCourses(prev =>
          prev.map(c => c._id === courseId ? { ...c, isPublished: !currentStatus } : c)
        );
      }
    } catch (err) {
      showToast('Action Failed', 'Failed to modify publish status.', 'error');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to permanently delete this course? All uploaded study materials will be removed.')) return;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !subject || !description || !fee) {
      showToast('Validation Error', 'Please fill in all required fields.', 'warning');
      return;
    }

    setSubmitLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('subject', subject);
    formData.append('description', description);
    formData.append('duration', duration);
    formData.append('sessionsCount', sessionsCount);
    formData.append('fee', fee);
    formData.append('prerequisites', prerequisites);
    formData.append('maxStudents', maxStudents);
    formData.append('difficultyLevel', difficultyLevel);

    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }
    if (materialsFiles.length > 0) {
      for (let i = 0; i < materialsFiles.length; i++) {
        formData.append('studyMaterials', materialsFiles[i]);
      }
    }

    try {
      let res;
      if (editCourseId) {
        res = await api.put(`/courses/${editCourseId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await api.post('/courses', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data.success) {
        showToast(
          'Success',
          `Course ${editCourseId ? 'updated' : 'created'} successfully!`,
          'success'
        );
        setFormOpen(false);
        fetchMyCourses();
      }
    } catch (err) {
      showToast('Submit Failed', err.response?.data?.message || 'Error processing course parameters.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left relative">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black font-outfit tracking-tight text-slate-805 dark:text-white">
            Course Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Publish syllabi, upload course PDF resources, and set hourly pricing.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md shadow-primary/10 flex items-center gap-2 hover:bg-primary-dark transition-all"
        >
          <FiPlus className="w-4 h-4" />
          <span>Create Course</span>
        </button>
      </div>

      {/* Courses Grid list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 skeleton" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="p-12 text-center border border-slate-200/50 dark:border-slate-800 rounded-2xl glass-card text-slate-455 space-y-2">
          <FiBookOpen className="w-8 h-8 mx-auto text-slate-350" />
          <p className="font-bold text-sm">No courses created yet.</p>
          <p className="text-xs text-slate-500">
            Click Create Course at top right to begin publishing notes.
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
                {/* Thumbnail Header banner */}
                <div className="w-full h-32 bg-slate-200 dark:bg-slate-850 rounded-xl overflow-hidden border border-slate-200/40 relative">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-primary to-accent text-white font-black text-2xl uppercase">
                      {course.subject?.[0]}
                    </div>
                  )}
                  {/* Status label */}
                  <span className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[8px] font-black text-white flex items-center gap-1 uppercase ${
                    course.isPublished ? 'bg-emerald-500' : 'bg-slate-500/80 backdrop-blur'
                  }`}>
                    {course.isPublished ? <FiEye className="w-2.5 h-2.5" /> : <FiEyeOff className="w-2.5 h-2.5" />}
                    <span>{course.isPublished ? 'Published' : 'Draft'}</span>
                  </span>
                </div>

                <div className="mt-3.5 space-y-1">
                  <h3 className="font-bold text-sm text-slate-805 dark:text-slate-100 truncate">
                    {course.title}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                    {course.subject}
                  </p>
                  <p className="text-[11px] text-slate-655 dark:text-slate-400 line-clamp-2 leading-relaxed mt-1">
                    {course.description}
                  </p>
                </div>
              </div>

              {/* Bottom controls */}
              <div className="mt-5 pt-3 border-t border-slate-200/45 flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-black text-slate-800 dark:text-white">
                    ₹{course.fee}
                  </span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold">
                    {course.difficultyLevel}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] font-bold">
                  <button
                    onClick={() => handleTogglePublish(course._id, course.isPublished)}
                    className={`py-1.5 rounded-lg border text-center transition-colors flex items-center justify-center gap-1 ${
                      course.isPublished
                        ? 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/5'
                        : 'border-slate-350 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {course.isPublished ? <span>Unpublish</span> : <span>Publish</span>}
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(course)}
                    className="py-1.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-center flex items-center justify-center gap-1"
                  >
                    <FiEdit className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course._id)}
                    className="py-1.5 border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 rounded-lg text-center flex items-center justify-center gap-1"
                  >
                    <FiTrash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

            </motion.div>
          ))}
        </div>
      )}

      {/* Create / Edit Course Modal form */}
      <AnimatePresence>
        {formOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFormOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            {/* Modal Form */}
            {/* Modal Centering Wrapper */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="max-w-lg w-full max-h-[85vh] overflow-y-auto glass-card p-6 border border-slate-200/50 dark:border-slate-805 rounded-3xl shadow-2xl text-left space-y-4"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-205 dark:border-slate-805">
                  <h3 className="font-outfit font-black text-base text-slate-800 dark:text-white flex items-center gap-2">
                    <FiBookOpen className="text-primary w-5 h-5" />
                    <span>{editCourseId ? 'Edit Course Settings' : 'Publish New Course'}</span>
                  </h3>
                  <button onClick={() => setFormOpen(false)} className="p-1 rounded hover:bg-slate-100">
                    <FiX />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-650 dark:text-slate-400">Course Title *</label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Distributed Database Management"
                        className="w-full px-3 py-2.5 rounded-xl border glass-input text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-655 dark:text-slate-400">Subject Area *</label>
                      <input
                        type="text"
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Computer Science"
                        className="w-full px-3 py-2.5 rounded-xl border glass-input text-slate-805 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-650 dark:text-slate-400">Course Description / Outline *</label>
                    <textarea
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      placeholder="Enter comprehensive syllabus goals and requirements..."
                      className="w-full px-3 py-2.5 rounded-xl border glass-input text-slate-800 dark:text-slate-100 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-650 dark:text-slate-400">Duration (Weeks)</label>
                      <input
                        type="text"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="e.g. 8 Weeks"
                        className="w-full px-3 py-2.5 rounded-xl border glass-input text-slate-808 dark:text-slate-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-650 dark:text-slate-400">Sessions Total</label>
                      <input
                        type="number"
                        value={sessionsCount}
                        onChange={(e) => setSessionsCount(e.target.value)}
                        placeholder="12"
                        className="w-full px-3 py-2.5 rounded-xl border glass-input text-slate-808 dark:text-slate-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-650 dark:text-slate-400">Course Fee (₹) *</label>
                      <input
                        type="number"
                        required
                        value={fee}
                        onChange={(e) => setFee(e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2.5 rounded-xl border glass-input text-slate-808 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 font-bold text-slate-650 dark:text-slate-400">
                    <div className="space-y-1">
                      <label>Prerequisites</label>
                      <input
                        type="text"
                        value={prerequisites}
                        onChange={(e) => setPrerequisites(e.target.value)}
                        placeholder="SQL, Math"
                        className="w-full px-3 py-2.5 rounded-xl border glass-input text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label>Max Students</label>
                      <input
                        type="number"
                        value={maxStudents}
                        onChange={(e) => setMaxStudents(e.target.value)}
                        placeholder="30"
                        className="w-full px-3 py-2.5 rounded-xl border glass-input text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label>Difficulty</label>
                      <select
                        value={difficultyLevel}
                        onChange={(e) => setDifficultyLevel(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border glass-input text-slate-800 dark:text-slate-100"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  {/* Upload Thumbnail */}
                  <div className="space-y-2 p-3 bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/40 rounded-xl">
                    <label className="font-bold text-slate-650 dark:text-slate-400 block">Thumbnail Image</label>
                    <div className="flex items-center gap-3">
                      {thumbnailPreview && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border">
                          <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <label className="inline-flex items-center gap-2 px-3 py-1.5 border hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-semibold cursor-pointer text-slate-700 dark:text-slate-350">
                        <FiUpload className="w-3.5 h-3.5" />
                        <span>Select Image File</span>
                        <input type="file" onChange={handleThumbnailChange} accept="image/*" className="hidden" />
                      </label>
                    </div>
                  </div>

                  {/* Upload reading materials files */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-655 dark:text-slate-400 block">Upload Study Materials (PDFs)</label>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setMaterialsFiles(Array.from(e.target.files))}
                      className="w-full text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[11px] file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                    />
                  </div>

                  {/* Form actions */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/40">
                    <button
                      type="button"
                      onClick={() => setFormOpen(false)}
                      className="py-2.5 border border-slate-250 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl font-bold text-center text-slate-600 dark:text-slate-350"
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
                          <span>Save Course parameters</span>
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

export default TeacherCourses;
