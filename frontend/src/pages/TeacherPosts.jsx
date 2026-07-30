import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiActivity, FiPlus, FiEdit, FiTrash2, FiFileText, FiImage,
  FiCalendar, FiMessageCircle, FiHeart, FiBookmark, FiX, FiCheck, FiUpload
} from 'react-icons/fi';

export const TeacherPosts = () => {
  const { showToast } = useNotifications();

  // Lists and loading
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form modal toggles
  const [formOpen, setFormOpen] = useState(false);
  const [editPostId, setEditPostId] = useState(null);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [postType, setPostType] = useState('Announcement'); // 'Announcement', 'New Course', 'Assignment', 'Notes', 'Tips', 'Events'
  
  // File attachments state
  const [imageFiles, setImageFiles] = useState([]);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/posts/my');
      if (res.data.success) {
        setPosts(res.data.posts);
      }
    } catch (err) {
      showToast('Error', 'Failed to retrieve educational posts list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditPostId(null);
    setTitle('');
    setDescription('');
    setPostType('Announcement');
    setImageFiles([]);
    setPdfFiles([]);
    setFormOpen(true);
  };

  const handleOpenEditModal = (post) => {
    setEditPostId(post._id);
    setTitle(post.title || '');
    setDescription(post.description || '');
    setPostType(post.postType || 'Announcement');
    setImageFiles([]);
    setPdfFiles([]);
    setFormOpen(true);
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to permanently delete this post?')) return;
    try {
      const res = await api.delete(`/posts/${postId}`);
      if (res.data.success) {
        showToast('Deleted', 'Educational post removed successfully.', 'info');
        setPosts(prev => prev.filter(p => p._id !== postId));
      }
    } catch (err) {
      showToast('Delete Failed', 'Failed to remove educational post.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !postType) {
      showToast('Validation Error', 'Please enter title, description, and type.', 'warning');
      return;
    }

    setSubmitLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('postType', postType);

    if (imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        formData.append('images', imageFiles[i]);
      }
    }
    if (pdfFiles.length > 0) {
      for (let i = 0; i < pdfFiles.length; i++) {
        formData.append('pdfFiles', pdfFiles[i]);
      }
    }

    try {
      let res;
      if (editPostId) {
        res = await api.put(`/posts/${editPostId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await api.post('/posts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data.success) {
        showToast(
          'Success',
          `Post ${editPostId ? 'updated' : 'published'} successfully!`,
          'success'
        );
        setFormOpen(false);
        fetchMyPosts();
      }
    } catch (err) {
      showToast('Submit Failed', err.response?.data?.message || 'Error processing educational post.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const typeStyles = {
    Announcement: 'bg-primary/10 text-primary border-primary/20',
    'New Course': 'bg-accent/10 text-accent-600 dark:text-accent-400 border-accent/20',
    Assignment: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    Notes: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    Tips: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    Events: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
  };

  return (
    <div className="space-y-6 text-left relative">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black font-outfit tracking-tight text-slate-805 dark:text-white">
            Class Announcements & Notes
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Share news, tips, assignments, and educational PDFs directly to student feeds.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md shadow-primary/10 flex items-center gap-2 hover:bg-primary-dark transition-all"
        >
          <FiPlus className="w-4 h-4" />
          <span>Publish Post</span>
        </button>
      </div>

      {/* Posts Lists Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-64 skeleton" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="p-12 text-center border border-slate-200/50 dark:border-slate-800 rounded-2xl glass-card text-slate-455 space-y-2">
          <FiActivity className="w-8 h-8 mx-auto text-slate-350" />
          <p className="font-bold text-sm">No educational posts created yet.</p>
          <p className="text-xs text-slate-500">
            Click Publish Post at top right to share reading recommendations or course notes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 rounded-2xl glass-card border border-slate-200/60 dark:border-slate-800/70 text-left flex flex-col justify-between"
            >
              <div>
                {/* Header info */}
                <div className="flex justify-between items-start gap-4">
                  <span className={`px-2.5 py-0.5 rounded border text-[9px] font-black uppercase tracking-wider ${
                    typeStyles[post.postType] || typeStyles.Announcement
                  }`}>
                    {post.postType}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {new Date(post.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-3.5 space-y-2">
                  <h3 className="font-bold text-sm text-slate-805 dark:text-slate-100 line-clamp-1">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-655 dark:text-slate-350 leading-relaxed line-clamp-4">
                    {post.description}
                  </p>
                </div>

                {/* Render attachment count badges */}
                {(post.images?.length > 0 || post.pdfFiles?.length > 0) && (
                  <div className="flex gap-3 text-[10px] text-slate-500 font-bold mt-4 pt-3 border-t border-slate-200/40">
                    {post.images?.length > 0 && (
                      <span className="flex items-center gap-1.5">
                        <FiImage className="w-3.5 h-3.5 text-primary" />
                        <span>{post.images.length} Images</span>
                      </span>
                    )}
                    {post.pdfFiles?.length > 0 && (
                      <span className="flex items-center gap-1.5">
                        <FiFileText className="w-3.5 h-3.5 text-primary" />
                        <span>{post.pdfFiles.length} PDFs</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom actions */}
              <div className="mt-5 pt-3 border-t border-slate-200/45 flex justify-between items-center text-slate-500 text-xs">
                
                {/* Engagement stats */}
                <div className="flex gap-4 font-bold text-[10px]">
                  <span className="flex items-center gap-1">
                    <FiHeart className="text-rose-500 w-3.5 h-3.5 fill-rose-500" />
                    <span>{post.likes?.length || 0} Likes</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <FiBookmark className="text-amber-500 w-3.5 h-3.5 fill-amber-500" />
                    <span>{post.bookmarks?.length || 0} Saved</span>
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEditModal(post)}
                    className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg"
                  >
                    <FiEdit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeletePost(post._id)}
                    className="p-2 border border-rose-500/20 hover:bg-rose-500/10 text-rose-500 rounded-lg"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create / Edit Post Modal form */}
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
            {/* Modal Centering Wrapper */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="max-w-md w-full glass-card p-6 border border-slate-200/50 dark:border-slate-805 rounded-3xl shadow-2xl text-left space-y-4"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-205 dark:border-slate-805">
                  <h3 className="font-outfit font-black text-base text-slate-800 dark:text-white flex items-center gap-2">
                    <FiActivity className="text-primary w-5 h-5" />
                    <span>{editPostId ? 'Modify Educational Post' : 'Publish Feeds Post'}</span>
                  </h3>
                  <button onClick={() => setFormOpen(false)} className="p-1 rounded hover:bg-slate-100">
                    <FiX />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
                  
                  <div className="space-y-1">
                    <label className="text-slate-600 dark:text-slate-400">Post Title *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Normalization Normal Forms Cheat Sheet"
                      className="w-full px-3 py-2.5 rounded-xl border glass-input text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-650 dark:text-slate-400">Post Category Type *</label>
                    <select
                      value={postType}
                      onChange={(e) => setPostType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border glass-input text-slate-800 dark:text-slate-100"
                    >
                      <option value="Announcement">Announcement</option>
                      <option value="New Course">New Course</option>
                      <option value="Assignment">Assignment</option>
                      <option value="Notes">Lecture Notes</option>
                      <option value="Tips">Study Tips</option>
                      <option value="Events">Virtual Event</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600 dark:text-slate-400">Post Description / Content *</label>
                    <textarea
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      placeholder="Enter detailed content, instructions, links, or notice guidelines..."
                      className="w-full px-3 py-2.5 rounded-xl border glass-input text-slate-800 dark:text-slate-100 resize-none font-normal"
                    />
                  </div>

                  {/* Upload images */}
                  <div className="space-y-1">
                    <label className="text-slate-600 dark:text-slate-400 block">Attach Image Slides</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setImageFiles(Array.from(e.target.files))}
                      className="w-full text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                    />
                  </div>

                  {/* Upload PDFs */}
                  <div className="space-y-1">
                    <label className="text-slate-605 dark:text-slate-400 block">Attach Document Files (PDF)</label>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setPdfFiles(Array.from(e.target.files))}
                      className="w-full text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                    />
                  </div>

                  {/* Form buttons */}
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
                          <span>Publish Post</span>
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

export default TeacherPosts;
