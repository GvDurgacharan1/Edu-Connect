import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiUserCheck, FiSlash, FiTrash2, FiSearch, FiAlertTriangle, FiCheck } from 'react-icons/fi';

export const AdminUsers = () => {
  const { showToast } = useNotifications();

  // States
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All'); // 'All', 'student', 'teacher'

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      showToast('Error', 'Failed to retrieve registered users.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/suspend`);
      if (res.data.success) {
        showToast('Account Suspended', 'User account access has been revoked.', 'info');
        setUsers(prev =>
          prev.map(u => u._id === userId ? { ...u, status: 'suspended' } : u)
        );
      }
    } catch (err) {
      showToast('Action Failed', 'Failed to suspend user.', 'error');
    }
  };

  const handleActivate = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/activate`);
      if (res.data.success) {
        showToast('Account Activated', 'User account access has been restored.', 'success');
        setUsers(prev =>
          prev.map(u => u._id === userId ? { ...u, status: 'active' } : u)
        );
      }
    } catch (err) {
      showToast('Action Failed', 'Failed to activate user.', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('WARNING: Permanently delete this account? This action removes all profiles data, bookings, and uploaded PDFs. It cannot be undone.')) return;
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        showToast('Account Deleted', 'User has been removed from database.', 'info');
        setUsers(prev => prev.filter(u => u._id !== userId));
      }
    } catch (err) {
      showToast('Delete Failed', 'Failed to delete user account.', 'error');
    }
  };

  // Filter lists based on search & role
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = roleFilter === 'All' ? true : u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 text-left relative">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black font-outfit tracking-tight text-slate-805 dark:text-white">
          Moderate User Accounts
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          View all registered student and teacher profiles, suspend security violations, or clear database records.
        </p>
      </div>

      {/* Filter panel */}
      <div className="p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/40 glass-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 text-xs">
        
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search username or email..."
            className="w-full pl-9 pr-4 py-2 rounded-lg glass-input text-slate-808 dark:text-slate-100"
          />
        </div>

        {/* Role Filters */}
        <div className="flex gap-1.5 font-semibold text-slate-600 dark:text-slate-400">
          {['All', 'student', 'teacher'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg border transition-all capitalize ${
                roleFilter === r
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'border-slate-205 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {r === 'All' ? 'All Roles' : `${r}s`}
            </button>
          ))}
        </div>

      </div>

      {/* User list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 skeleton" />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 text-center border border-slate-200/50 dark:border-slate-800 rounded-2xl glass-card text-slate-455 space-y-2">
          <FiUsers className="w-8 h-8 mx-auto text-slate-350" />
          <p className="font-bold text-sm">No accounts found.</p>
          <p className="text-xs text-slate-500">Try modifying your search or filter values.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredUsers.map((item) => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-xl border glass-card flex items-center justify-between gap-4 text-xs ${
                  item.status === 'suspended' ? 'border-rose-500/20 bg-rose-500/5' : 'border-slate-200/50 dark:border-slate-800/30'
                }`}
              >
                {/* Details */}
                <div className="text-left flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-850 dark:text-slate-100">
                      {item.username}
                    </span>
                    <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded uppercase font-black tracking-wider">
                      {item.role}
                    </span>
                    {item.status === 'suspended' && (
                      <span className="text-[9px] bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded font-bold uppercase flex items-center gap-0.5">
                        <FiAlertTriangle className="w-3 h-3" />
                        <span>Suspended</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {item.email} • Registered: {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Moderate buttons */}
                <div className="flex items-center gap-2">
                  {item.status === 'active' ? (
                    <button
                      onClick={() => handleSuspend(item._id)}
                      className="px-3 py-1.5 border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 rounded-lg font-bold flex items-center gap-1"
                      title="Suspend User Access"
                    >
                      <FiSlash className="w-3.5 h-3.5" />
                      <span>Suspend</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivate(item._id)}
                      className="px-3 py-1.5 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 rounded-lg font-bold flex items-center gap-1"
                      title="Restore User Access"
                    >
                      <FiUserCheck className="w-3.5 h-3.5" />
                      <span>Activate</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteUser(item._id)}
                    className="p-2 border border-rose-500/20 hover:bg-rose-500/10 text-rose-500 rounded-lg"
                    title="Delete Account"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
};

export default AdminUsers;
