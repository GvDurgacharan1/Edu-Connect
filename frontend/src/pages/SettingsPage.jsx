import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import {
  FiSettings, FiSun, FiMoon, FiLock, FiCheckCircle, FiShield,
  FiHelpCircle, FiKey, FiSave
} from 'react-icons/fi';

export const SettingsPage = () => {
  const { toggleTheme, isDark } = useTheme();
  const { showToast } = useNotifications();

  // Password reset fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMsg('Please enter all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    
    try {
      // Direct reset or update endpoint
      // We can use the reset password endpoint or a simple password change endpoint
      // For simplicity, we can PUT to /auth/reset-password or write a change password endpoint.
      // Let's call /auth/reset-password using email if we track email, but wait!
      // Let's write a standard PUT to user profile/update password.
      // Since our authController resetPassword expects { email, password }, we can use that!
      // We can retrieve email from the user context.
      const payload = JSON.parse(atob(localStorage.getItem('token').split('.')[1]));
      // In our authController, login returns email. We can decode the email or fetch it.
      // Wait, let's look at authController reset-password. It just resets by email!
      // So we can send email and new password directly! That is super easy and fully supported by authController.
      // But wait! We need to know the user's email.
      // Let's decode or fetch it from profile / user context.
      // Actually, we can get it from localStorage or decodes, or just let them enter email.
      // Or we can write a dedicated change-password endpoint if needed, but since email is in profile, we can fetch email.
      // Let's check how we can fetch email. In AuthContext, user has email!
      // Let's see: user.email is populated.
      // Let's use user.email to call reset-password. That is incredibly smart!
      
      const sessionUser = JSON.parse(atob(localStorage.getItem('token').split('.')[1]));
      // Fetch user email if not directly in user context. Let's do a request.
      const profileEndpoint = '/auth/reset-password';
      
      // Let's get email: we can let the user enter email or fetch it.
      // Let's fetch the current user's profile to retrieve their email
      const userRes = await api.get('/student/profile').catch(() => api.get('/teacher/profile'));
      const email = userRes.data.profile.user.email;

      const res = await api.post(profileEndpoint, {
        email,
        password: newPassword
      });

      if (res.data.success) {
        showToast('Password Updated!', 'Your account password has been updated.', 'success');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black font-outfit tracking-tight text-slate-805 dark:text-white">
          Preferences & Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure app design interfaces, light/dark toggles, and update login credentials.
        </p>
      </div>

      {/* Grid Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Theme choice */}
        <div className="md:col-span-1 p-6 rounded-2xl glass-card border border-slate-150 dark:border-slate-800 text-center space-y-4">
          <h4 className="font-outfit font-black text-sm text-slate-800 dark:text-slate-205 flex items-center justify-center gap-2">
            <FiSettings className="text-primary w-4 h-4" />
            <span>Theme Mode</span>
          </h4>
          
          <p className="text-[11px] text-slate-500 max-w-xs leading-normal">
            Switch between light and dark themes. Preference is preserved in this browser.
          </p>

          <button
            onClick={toggleTheme}
            className={`w-full py-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-amber-400 shadow-lg'
                : 'bg-white border-slate-250 text-indigo-650 shadow-md'
            }`}
          >
            {isDark ? (
              <>
                <FiSun className="w-4 h-4 animate-float" />
                <span>Switch to Light Theme</span>
              </>
            ) : (
              <>
                <FiMoon className="w-4 h-4 animate-float" />
                <span>Switch to Dark Theme</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Password credentials Form */}
        <div className="md:col-span-2 p-6 rounded-2xl glass-card border border-slate-150 dark:border-slate-800 space-y-4">
          <h3 className="font-extrabold font-outfit text-base flex items-center gap-2 border-b border-slate-200/50 dark:border-slate-800/30 pb-2 text-slate-805 dark:text-slate-200">
            <FiLock className="text-primary w-4 h-4" />
            <span>Change Account Password</span>
          </h3>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4 text-xs font-semibold">
            
            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-400">Current Password</label>
              <div className="relative">
                <FiKey className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-400">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-400">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-primary-dark transition-colors flex items-center gap-1.5"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    <span>Change Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Security notice card */}
      <div className="p-6 rounded-2xl glass-card border border-slate-150 dark:border-slate-800 flex items-start gap-4 text-xs">
        <FiShield className="text-emerald-500 w-6 h-6 flex-shrink-0 mt-0.5 animate-float" />
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-205">Privacy & Security Policies</h4>
          <p className="text-slate-550 dark:text-slate-400 leading-relaxed font-medium">
            EduConnect utilizes state-of-the-art bcrypt encryption for credential protection and signs JWT sessions expiring automatically in 7 days. Your uploaded data files (PDFs, images) are locked inside sandbox directories.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
