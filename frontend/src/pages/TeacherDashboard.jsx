import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import {
  FiGrid, FiUsers, FiBookOpen, FiCalendar, FiClock, FiVideo,
  FiArrowRight, FiActivity, FiArrowUpRight, FiBook, FiCheckCircle
} from 'react-icons/fi';

export const TeacherDashboard = () => {
  const { profile } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  // Metrics states
  const [studentsCount, setStudentsCount] = useState(0);
  const [coursesCount, setCoursesCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [acceptedStudents, setAcceptedStudents] = useState(0);
  const [scheduledMeetings, setScheduledMeetings] = useState(0);
  
  const [recentBookings, setRecentBookings] = useState([]);
  const [todayMeetings, setTodayMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [coursesRes, bookingsRes, meetingsRes] = await Promise.all([
        api.get('/courses/my'),
        api.get('/bookings'),
        api.get('/meetings')
      ]);

      if (coursesRes.data.success) {
        setCoursesCount(coursesRes.data.count);
      }
      if (bookingsRes.data.success) {
        const list = bookingsRes.data.bookings;
        const pending = list.filter(b => b.status === 'Pending');
        const accepted = list.filter(b => b.status === 'Accepted');
        
        setPendingRequests(pending.length);
        setAcceptedStudents(accepted.length);
        
        // Count unique students
        const studentIds = new Set(accepted.map(b => b.student?._id || b.student));
        setStudentsCount(studentIds.size);
        
        setRecentBookings(pending.slice(0, 3));
      }
      if (meetingsRes.data.success) {
        const list = meetingsRes.data.meetings;
        const upcoming = list.filter(m => m.status === 'Upcoming');
        setScheduledMeetings(upcoming.length);

        // Find meetings happening today
        const todayStr = new Date().toISOString().split('T')[0];
        const today = upcoming.filter(m => new Date(m.date).toISOString().split('T')[0] === todayStr);
        setTodayMeetings(today);
      }
    } catch (err) {
      showToast('Error', 'Failed to retrieve teacher dashboard metrics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const widgetVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.1, type: 'spring', stiffness: 100 }
    })
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 skeleton" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 skeleton" />
          <div className="h-80 skeleton" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      
      {/* Welcome Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-tr from-primary to-blue-600 dark:from-slate-900 dark:to-slate-950 text-white relative overflow-hidden shadow-lg border border-white/10">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="relative z-10 max-w-lg space-y-2">
          <h2 className="text-2xl md:text-3xl font-black font-outfit">
            Welcome back, {profile?.fullName || 'Professor'}!
          </h2>
          <p className="text-xs md:text-sm text-white/80 leading-relaxed">
            Manage your courses, review incoming booking requests, and schedule virtual mentorship classes for your students.
          </p>
          <div className="pt-2">
            <Link
              to="/teacher/courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary text-xs font-bold rounded-xl shadow-md hover:bg-slate-50 hover:translate-x-0.5 transition-all"
            >
              <span>Manage Courses</span>
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Widgets Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Students', value: studentsCount, icon: <FiUsers className="text-primary w-5 h-5" />, color: 'border-primary/20 bg-primary/5' },
          { label: 'Active Courses', value: coursesCount, icon: <FiBookOpen className="text-accent w-5 h-5" />, color: 'border-accent/20 bg-accent/5' },
          { label: 'Pending Requests', value: pendingRequests, icon: <FiCalendar className="text-amber-500 w-5 h-5" />, color: 'border-amber-500/20 bg-amber-500/5' },
          { label: 'Accepted Students', value: acceptedStudents, icon: <FiCheckCircle className="text-emerald-500 w-5 h-5" />, color: 'border-emerald-500/20 bg-emerald-500/5' },
          { label: 'Scheduled Meetings', value: scheduledMeetings, icon: <FiVideo className="text-indigo-500 w-5 h-5" />, color: 'border-indigo-500/20 bg-indigo-500/5' }
        ].map((widget, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={widgetVariants}
            initial="hidden"
            animate="visible"
            className={`p-5 rounded-2xl border glass-card flex flex-col justify-between h-28 ${widget.color}`}
          >
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider dark:text-slate-405">
                {widget.label}
              </span>
              <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-205/50 dark:border-slate-700/50 shadow-sm">
                {widget.icon}
              </div>
            </div>
            <span className="text-2xl font-black font-outfit text-slate-805 dark:text-white mt-2">
              {widget.value}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Main Grid: Pending Bookings & Today's Meetings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pending Requests Column */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-card border border-slate-150 dark:border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200/50 dark:border-slate-800/30">
            <h3 className="font-outfit font-black text-base flex items-center gap-2 text-slate-800 dark:text-white">
              <FiCalendar className="text-primary w-5 h-5" />
              <span>Pending Booking Requests</span>
            </h3>
            <Link to="/teacher/bookings" className="text-xs font-bold text-primary dark:text-accent hover:underline flex items-center gap-1">
              <span>Review Requests</span>
              <FiArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4 flex-1 py-2">
            {recentBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                <FiCheckCircle className="w-8 h-8 text-emerald-500" />
                <p className="text-xs">No pending booking requests.</p>
              </div>
            ) : (
              recentBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="p-4 rounded-xl border border-slate-100 dark:border-slate-900 bg-white/40 dark:bg-slate-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      Student: {booking.studentName}
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                      Course: {booking.course?.title || 'Custom Mentorship Program'}
                    </p>
                    <p className="text-slate-655 dark:text-slate-400 line-clamp-1">
                      Goal: {booking.learningGoal}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      {booking.preferredTime}
                    </span>
                    <button
                      onClick={() => navigate('/teacher/bookings')}
                      className="px-3 py-1.5 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Respond
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's Meetings Column */}
        <div className="p-6 rounded-2xl glass-card border border-slate-150 dark:border-slate-800 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200/50 dark:border-slate-800/30">
            <h3 className="font-outfit font-black text-base flex items-center gap-2 text-slate-800 dark:text-white">
              <FiClock className="text-accent w-5 h-5" />
              <span>Today's Meetings</span>
            </h3>
            <Link to="/meetings" className="text-xs font-bold text-primary dark:text-accent hover:underline flex items-center gap-1">
              <span>View All</span>
              <FiArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4 py-2">
            {todayMeetings.length === 0 ? (
              <p className="text-xs text-slate-550 py-6 text-center">
                No classes scheduled for today.
              </p>
            ) : (
              todayMeetings.map((meet) => (
                <div
                  key={meet._id}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-900 bg-white/30 dark:bg-slate-900/20 flex flex-col gap-2 text-xs"
                >
                  <h4 className="font-bold text-slate-805 dark:text-slate-200 truncate">
                    {meet.title}
                  </h4>
                  <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                    <span>{meet.startTime}</span>
                    <span>{meet.duration} mins</span>
                  </div>
                  <a
                    href={meet.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-center flex items-center justify-center gap-1 text-[10px]"
                  >
                    <FiVideo className="w-3.5 h-3.5" />
                    <span>Start Class</span>
                  </a>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeacherDashboard;
