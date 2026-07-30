import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import {
  FiGrid, FiUsers, FiBookOpen, FiCalendar, FiClock, FiVideo,
  FiArrowRight, FiActivity, FiArrowUpRight, FiBook
} from 'react-icons/fi';

export const StudentDashboard = () => {
  const { profile } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  // Metrics states
  const [teachersCount, setTeachersCount] = useState(0);
  const [coursesCount, setCoursesCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [meetingsCount, setMeetingsCount] = useState(0);
  
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [teachersRes, coursesRes, bookingsRes, meetingsRes] = await Promise.all([
        api.get('/teachers'),
        api.get('/courses'),
        api.get('/bookings'),
        api.get('/meetings')
      ]);

      if (teachersRes.data.success) {
        setTeachersCount(teachersRes.data.count);
      }
      if (coursesRes.data.success) {
        setCoursesCount(coursesRes.data.count);
        setFeaturedCourses(coursesRes.data.courses.slice(0, 3)); // show top 3
      }
      if (bookingsRes.data.success) {
        const list = bookingsRes.data.bookings;
        setPendingCount(list.filter(b => b.status === 'Pending').length);
        setAcceptedCount(list.filter(b => b.status === 'Accepted').length);
      }
      if (meetingsRes.data.success) {
        const list = meetingsRes.data.meetings;
        const upcoming = list.filter(m => m.status === 'Upcoming');
        setMeetingsCount(upcoming.length);
        setUpcomingMeetings(upcoming.slice(0, 3));
      }
    } catch (err) {
      showToast('Error', 'Failed to retrieve dashboard metrics.', 'error');
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
            Welcome back, {profile?.fullName || 'Student'}!
          </h2>
          <p className="text-xs md:text-sm text-white/80 leading-relaxed">
            Discover verified university professors, review course materials, and check your upcoming scheduled meetings.
          </p>
          <div className="pt-2">
            <Link
              to="/student/teachers"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary text-xs font-bold rounded-xl shadow-md hover:bg-slate-50 hover:translate-x-0.5 transition-all"
            >
              <span>Search Professors</span>
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Widgets Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Available Professors', value: teachersCount, icon: <FiUsers className="text-primary w-5 h-5" />, color: 'border-primary/20 bg-primary/5' },
          { label: 'Active Courses', value: coursesCount, icon: <FiBookOpen className="text-accent w-5 h-5" />, color: 'border-accent/20 bg-accent/5' },
          { label: 'Pending Bookings', value: pendingCount, icon: <FiCalendar className="text-amber-500 w-5 h-5" />, color: 'border-amber-500/20 bg-amber-500/5' },
          { label: 'Accepted Bookings', value: acceptedCount, icon: <FiCheck className="text-emerald-500 w-5 h-5" /> || <FiCalendar />, color: 'border-emerald-500/20 bg-emerald-500/5' },
          { label: 'Upcoming Meetings', value: meetingsCount, icon: <FiVideo className="text-indigo-500 w-5 h-5" />, color: 'border-indigo-500/20 bg-indigo-500/5' }
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
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                {widget.label}
              </span>
              <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                {widget.icon}
              </div>
            </div>
            <span className="text-2xl font-black font-outfit text-slate-800 dark:text-white mt-2">
              {widget.value}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Main Grid: Upcoming Classes and Featured Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upcoming Classes Column */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-card border border-slate-150 dark:border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200/50 dark:border-slate-800/30">
            <h3 className="font-extrabold font-outfit text-base flex items-center gap-2 text-slate-800 dark:text-white">
              <FiVideo className="text-primary w-5 h-5" />
              <span>Upcoming Mentorship Meetings</span>
            </h3>
            <Link to="/meetings" className="text-xs font-bold text-primary dark:text-accent hover:underline flex items-center gap-1">
              <span>All Meetings</span>
              <FiArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4 flex-1 py-2">
            {upcomingMeetings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                <FiCalendar className="w-8 h-8" />
                <p className="text-xs">No upcoming classes scheduled.</p>
              </div>
            ) : (
              upcomingMeetings.map((meet) => (
                <div
                  key={meet._id}
                  className="p-4 rounded-xl border border-slate-100 dark:border-slate-900 bg-white/40 dark:bg-slate-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      {meet.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 dark:text-slate-400 text-xs">
                      <span className="font-semibold text-primary dark:text-accent">
                        Prof: {meet.teacher?.fullName}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-3.5 h-3.5" />
                        {new Date(meet.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiClock className="w-3.5 h-3.5" />
                        {meet.startTime} ({meet.duration} min)
                      </span>
                    </div>
                  </div>
                  <a
                    href={meet.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-md transition-colors w-full sm:w-auto"
                  >
                    <FiVideo className="w-4 h-4" />
                    <span>Join Room</span>
                  </a>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Featured Courses Column */}
        <div className="p-6 rounded-2xl glass-card border border-slate-150 dark:border-slate-800 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200/50 dark:border-slate-800/30">
            <h3 className="font-extrabold font-outfit text-base flex items-center gap-2 text-slate-800 dark:text-white">
              <FiBookOpen className="text-accent w-5 h-5" />
              <span>Available Courses</span>
            </h3>
            <Link to="/student/courses" className="text-xs font-bold text-primary dark:text-accent hover:underline flex items-center gap-1">
              <span>View All</span>
              <FiArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4 py-2">
            {featuredCourses.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No active courses available.
              </p>
            ) : (
              featuredCourses.map((course) => (
                <div
                  key={course._id}
                  onClick={() => navigate(`/student/courses`)}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-900 bg-white/30 dark:bg-slate-900/20 hover:border-primary/20 cursor-pointer transition-all flex gap-3"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex-shrink-0 overflow-hidden border border-slate-200/40">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold text-xs uppercase">
                        {course.subject?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs truncate text-slate-850 dark:text-slate-200">
                      {course.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 truncate dark:text-slate-400">
                      {course.subject} • {course.difficultyLevel}
                    </p>
                    <span className="text-xs font-bold text-primary dark:text-accent mt-1 block">
                      ₹{course.fee}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

const FiCheck = () => <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;

export default StudentDashboard;
