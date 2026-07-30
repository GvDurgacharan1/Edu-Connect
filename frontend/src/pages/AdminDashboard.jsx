import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import {
  FiGrid, FiUsers, FiBookOpen, FiCalendar, FiDollarSign,
  FiTrendingUp, FiActivity, FiClock, FiPlusCircle, FiBarChart2
} from 'react-icons/fi';

export const AdminDashboard = () => {
  const { showToast } = useNotifications();

  // States
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentActivity(res.data.recentActivity);
        setCharts(res.data.charts);
      }
    } catch (err) {
      showToast('Error', 'Failed to retrieve administrative statistics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 skeleton" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 skeleton" />
          <div className="h-80 skeleton" />
        </div>
      </div>
    );
  }

  // A custom, premium SVG Bar Chart component
  const SvgBarChart = ({ data, title, colorClass = 'fill-primary' }) => {
    if (!data || data.length === 0) {
      return <p className="text-[10px] text-slate-500 py-6 text-center">No statistical records available</p>;
    }
    const maxVal = Math.max(...data.map(d => d.value), 5);
    const height = 150;
    const width = 300;
    const padding = 30;

    return (
      <div className="space-y-2 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20 text-xs">
        <h4 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
          <FiBarChart2 className="w-4 h-4 text-primary" />
          <span>{title}</span>
        </h4>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40">
          {/* Grids */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding + (height - padding * 2) * (1 - ratio);
            return (
              <line
                key={i}
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                className="stroke-slate-200 dark:stroke-slate-800/80 stroke-1"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Bars */}
          {data.map((item, idx) => {
            const barWidth = 20;
            const gap = (width - padding * 2 - data.length * barWidth) / (data.length - 1 || 1);
            const x = padding + idx * (barWidth + gap);
            const barHeight = (item.value / maxVal) * (height - padding * 2);
            const y = height - padding - barHeight;

            return (
              <g key={idx}>
                {/* Rect bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="3"
                  className={`${colorClass} hover:opacity-85 transition-opacity cursor-pointer`}
                />
                {/* Value tooltip label */}
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  className="fill-slate-600 dark:fill-slate-400 font-bold text-[9px]"
                >
                  {item.value}
                </text>
                {/* Month label */}
                <text
                  x={x + barWidth / 2}
                  y={height - padding + 15}
                  textAnchor="middle"
                  className="fill-slate-500 dark:fill-slate-500 text-[8px] font-bold"
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black font-outfit tracking-tight text-slate-805 dark:text-white">
          System Administration
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Access platform parameters, review database statistics, and moderate accounts.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: stats?.totalStudents, icon: <FiUsers className="text-primary w-5 h-5" />, color: 'border-primary/20 bg-primary/5' },
          { label: 'Total Teachers', value: stats?.totalTeachers, icon: <FiUsers className="text-accent w-5 h-5" />, color: 'border-accent/20 bg-accent/5' },
          { label: 'Total Courses', value: stats?.totalCourses, icon: <FiBookOpen className="text-emerald-505 w-5 h-5" />, color: 'border-emerald-500/20 bg-emerald-500/5' },
          { label: 'Total Bookings', value: stats?.totalBookings, icon: <FiCalendar className="text-indigo-505 w-5 h-5" />, color: 'border-indigo-500/20 bg-indigo-500/5' },
          { label: 'Approved Bookings', value: stats?.acceptedBookings, icon: <FiCalendar className="text-emerald-500 w-5 h-5" />, color: 'border-emerald-500/20 bg-emerald-500/5' },
          { label: 'Declined Bookings', value: stats?.rejectedBookings, icon: <FiCalendar className="text-rose-500 w-5 h-5" />, color: 'border-rose-500/20 bg-rose-500/5' },
          { label: 'Accrued Revenue', value: `$${stats?.revenue}`, icon: <FiDollarSign className="text-amber-500 w-5 h-5" />, color: 'border-amber-500/20 bg-amber-500/5' }
        ].slice(0, 4).map((widget, i) => (
          <div
            key={i}
            className={`p-5 rounded-2xl border glass-card flex flex-col justify-between h-28 ${widget.color}`}
          >
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                {widget.label}
              </span>
              <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 shadow-sm">
                {widget.icon}
              </div>
            </div>
            <span className="text-2xl font-black font-outfit text-slate-800 dark:text-white mt-2">
              {widget.value}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Approved Bookings', value: stats?.acceptedBookings, icon: <FiCalendar className="text-emerald-500 w-5 h-5" />, color: 'border-emerald-500/20 bg-emerald-500/5' },
          { label: 'Declined Bookings', value: stats?.rejectedBookings, icon: <FiCalendar className="text-rose-500 w-5 h-5" />, color: 'border-rose-500/20 bg-rose-500/5' },
          { label: 'Accrued Revenue', value: `$${stats?.revenue}`, icon: <FiDollarSign className="text-amber-500 w-5 h-5" />, color: 'border-amber-500/20 bg-amber-500/5' }
        ].map((widget, i) => (
          <div
            key={i}
            className={`p-5 rounded-2xl border glass-card flex flex-col justify-between h-28 ${widget.color}`}
          >
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                {widget.label}
              </span>
              <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 shadow-sm">
                {widget.icon}
              </div>
            </div>
            <span className="text-2xl font-black font-outfit text-slate-800 dark:text-white mt-2">
              {widget.value}
            </span>
          </div>
        ))}
      </div>

      {/* SVG Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SvgBarChart data={charts?.studentGrowth} title="Student Growth (Monthly)" colorClass="fill-primary" />
        <SvgBarChart data={charts?.teacherGrowth} title="Teacher Growth (Monthly)" colorClass="fill-accent" />
        <SvgBarChart data={charts?.bookingStats} title="Booking Requests (Monthly)" colorClass="fill-indigo-500" />
        <SvgBarChart data={charts?.courseStats} title="Course Catalog Growth" colorClass="fill-emerald-500" />
      </div>

      {/* Recent Activity lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bookings */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-card border border-slate-150 dark:border-slate-800 space-y-4 text-xs">
          <h3 className="font-outfit font-black text-sm text-slate-808 dark:text-slate-200 border-b border-slate-200/50 dark:border-slate-800/30 pb-2">
            Recent Booking Requests log
          </h3>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {recentActivity?.recentBookings?.length === 0 ? (
              <p className="text-slate-500 py-6 text-center">No bookings logs yet.</p>
            ) : (
              recentActivity?.recentBookings?.map((book) => (
                <div
                  key={book._id}
                  className="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-900 bg-white/40 dark:bg-slate-900/30 text-left"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Student: {book.studentName}
                    </span>
                    <p className="text-slate-550 dark:text-slate-400">
                      Target Goal: {book.learningGoal}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase ${
                    book.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {book.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Teacher registrations */}
        <div className="p-6 rounded-2xl glass-card border border-slate-150 dark:border-slate-805 space-y-4 text-xs">
          <h3 className="font-outfit font-black text-sm text-slate-808 dark:text-slate-200 border-b border-slate-200/50 dark:border-slate-805 pb-2">
            New Verified Professors
          </h3>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {recentActivity?.recentTeachers?.length === 0 ? (
              <p className="text-slate-500 py-6 text-center">No professors registered yet.</p>
            ) : (
              recentActivity?.recentTeachers?.map((teach) => (
                <div
                  key={teach._id}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 dark:border-slate-900 bg-white/30 dark:bg-slate-900/20 text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary text-white font-bold flex items-center justify-center text-xs uppercase flex-shrink-0">
                    {teach.fullName?.[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {teach.fullName}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {teach.qualification || 'PhD Scholar'}
                    </p>
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

export default AdminDashboard;
