import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMenu, FiX, FiGrid, FiSearch, FiBook, FiCalendar,
  FiMessageSquare, FiBell, FiUser, FiSettings, FiLogOut,
  FiSun, FiMoon, FiBookOpen, FiActivity, FiUsers, FiTrendingUp
} from 'react-icons/fi';

export const DashboardLayout = () => {
  const { user, profile, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Define sidebar navigation items based on user role
  const getNavLinks = () => {
    if (!user) return [];
    
    if (user.role === 'student') {
      return [
        { label: 'Dashboard', path: '/student/dashboard', icon: <FiGrid className="w-5 h-5" /> },
        { label: 'Search Teachers', path: '/student/teachers', icon: <FiSearch className="w-5 h-5" /> },
        { label: 'Available Courses', path: '/student/courses', icon: <FiBookOpen className="w-5 h-5" /> },
        { label: 'My Bookings', path: '/student/bookings', icon: <FiCalendar className="w-5 h-5" /> },
        { label: 'Messages', path: '/messages', icon: <FiMessageSquare className="w-5 h-5" /> },
        { label: 'Meetings', path: '/meetings', icon: <FiBook className="w-5 h-5" /> },
        { label: 'Notifications', path: '/notifications', icon: <FiBell className="w-5 h-5" /> },
        { label: 'My Profile', path: '/student/profile', icon: <FiUser className="w-5 h-5" /> },
        { label: 'Settings', path: '/settings', icon: <FiSettings className="w-5 h-5" /> }
      ];
    } else if (user.role === 'teacher') {
      return [
        { label: 'Dashboard', path: '/teacher/dashboard', icon: <FiGrid className="w-5 h-5" /> },
        { label: 'My Courses', path: '/teacher/courses', icon: <FiBookOpen className="w-5 h-5" /> },
        { label: 'Course Posts', path: '/teacher/posts', icon: <FiActivity className="w-5 h-5" /> },
        { label: 'Booking Requests', path: '/teacher/bookings', icon: <FiCalendar className="w-5 h-5" /> },
        { label: 'Messages', path: '/messages', icon: <FiMessageSquare className="w-5 h-5" /> },
        { label: 'Meetings', path: '/meetings', icon: <FiBook className="w-5 h-5" /> },
        { label: 'Notifications', path: '/notifications', icon: <FiBell className="w-5 h-5" /> },
        { label: 'My Profile', path: '/teacher/profile', icon: <FiUser className="w-5 h-5" /> },
        { label: 'Settings', path: '/settings', icon: <FiSettings className="w-5 h-5" /> }
      ];
    } else if (user.role === 'admin') {
      return [
        { label: 'Dashboard', path: '/admin/dashboard', icon: <FiGrid className="w-5 h-5" /> },
        { label: 'Students', path: '/admin/students', icon: <FiUsers className="w-5 h-5" /> },
        { label: 'Teachers', path: '/admin/teachers', icon: <FiUsers className="w-5 h-5" /> },
        { label: 'Courses', path: '/admin/courses', icon: <FiBookOpen className="w-5 h-5" /> },
        { label: 'Bookings', path: '/admin/bookings', icon: <FiCalendar className="w-5 h-5" /> },
        { label: 'Messages', path: '/admin/messages', icon: <FiMessageSquare className="w-5 h-5" /> },
        { label: 'Notifications', path: '/notifications', icon: <FiBell className="w-5 h-5" /> },
        { label: 'Settings', path: '/settings', icon: <FiSettings className="w-5 h-5" /> }
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 glass-nav border-r border-slate-200/50 dark:border-slate-800/30 sticky top-0 h-screen z-20">
        {/* Brand Logo */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-200/50 dark:border-slate-800/30">
          <FiBook className="text-primary w-6 h-6 animate-float" />
          <span className="text-xl font-extrabold font-outfit bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            EduConnect
          </span>
        </div>

        {/* User Card */}
        <div className="p-4 mx-4 my-3 rounded-2xl glass-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-white dark:border-slate-700">
            {profile?.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold text-sm">
                {profile?.fullName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold truncate text-slate-800 dark:text-slate-200">
              {profile?.fullName || user?.username}
            </h4>
            <span className="text-xs text-slate-500 capitalize dark:text-slate-400">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Links Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary dark:hover:text-white'
                }`
              }
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/30">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-600 dark:text-slate-450 hover:bg-rose-500/10 hover:text-rose-500 rounded-xl text-sm font-medium transition-colors"
          >
            <FiLogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Drawer for Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed top-0 bottom-0 left-0 w-64 glass-nav border-r border-slate-200/50 dark:border-slate-800/30 z-40 flex flex-col lg:hidden"
            >
              <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200/50 dark:border-slate-800/30">
                <div className="flex items-center gap-2">
                  <FiBook className="text-primary w-5 h-5" />
                  <span className="text-lg font-extrabold font-outfit bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    EduConnect
                  </span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-primary text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-white'
                      }`
                    }
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </NavLink>
                ))}
              </nav>

              <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/30">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-slate-650 dark:text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 rounded-xl text-sm font-medium transition-colors"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 glass-nav border-b border-slate-200/50 dark:border-slate-800/30 sticky top-0 z-10 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <FiMenu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold font-outfit hidden md:block capitalize text-slate-800 dark:text-slate-200">
              {location.pathname.split('/').pop()?.replace('-', ' ')} Overview
            </h1>
          </div>

          <div className="flex items-center gap-3">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-accent transition-colors"
              title="Toggle theme"
            >
              {isDark ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
            </button>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-355 hover:text-primary dark:hover:text-accent transition-colors relative"
              >
                <FiBell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ring-white dark:ring-slate-900">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setNotifDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 glass-card p-4 shadow-xl z-30"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-slate-250 dark:border-slate-800/30 mb-2">
                        <span className="font-outfit font-bold text-sm text-slate-800 dark:text-slate-200">
                          Notifications ({unreadCount})
                        </span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-xs text-primary dark:text-accent font-semibold hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-64 overflow-y-auto space-y-2 py-1">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-slate-500 text-center py-4">
                            No notifications yet
                          </p>
                        ) : (
                          notifications.slice(0, 5).map((notif) => (
                            <div
                              key={notif._id}
                              onClick={() => {
                                markRead(notif._id);
                                setNotifDropdownOpen(false);
                                navigate('/notifications');
                              }}
                              className={`p-2.5 rounded-xl border text-left cursor-pointer transition-colors ${
                                notif.isRead
                                  ? 'border-slate-100 bg-slate-50/50 dark:border-slate-800/20 dark:bg-slate-800/10'
                                  : 'border-primary/10 bg-primary/5 dark:border-accent/10 dark:bg-accent/5'
                              }`}
                            >
                              <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                {notif.title}
                              </h5>
                              <p className="text-[11px] text-slate-650 dark:text-slate-400 mt-0.5 line-clamp-2">
                                {notif.message}
                              </p>
                            </div>
                          ))
                        )}
                      </div>

                      <Link
                        to="/notifications"
                        onClick={() => setNotifDropdownOpen(false)}
                        className="block text-center text-xs text-primary dark:text-accent font-semibold hover:underline mt-2 pt-2 border-t border-slate-150 dark:border-slate-800/30"
                      >
                        View all notifications
                      </Link>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Avatar Quicklink */}
            <Link
              to={user?.role === 'student' ? '/student/profile' : user?.role === 'teacher' ? '/teacher/profile' : '#'}
              className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-800"
            >
              {profile?.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-primary to-accent text-white font-bold text-xs uppercase">
                  {profile?.fullName?.[0] || user?.username?.[0] || '?'}
                </div>
              )}
            </Link>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
