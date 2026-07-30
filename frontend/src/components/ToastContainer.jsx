import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { AnimatePresence, motion } from 'framer-motion';
import { FiX, FiCheckCircle, FiInfo, FiAlertTriangle, FiAlertCircle } from 'react-icons/fi';

const iconMap = {
  success: <FiCheckCircle className="text-emerald-500 w-5 h-5 flex-shrink-0" />,
  error: <FiAlertCircle className="text-rose-500 w-5 h-5 flex-shrink-0" />,
  warning: <FiAlertTriangle className="text-amber-500 w-5 h-5 flex-shrink-0" />,
  info: <FiInfo className="text-blue-500 w-5 h-5 flex-shrink-0" />
};

const borderMap = {
  success: 'border-emerald-500/20 bg-emerald-500/5',
  error: 'border-rose-500/20 bg-rose-500/5',
  warning: 'border-amber-500/20 bg-amber-500/5',
  info: 'border-blue-500/20 bg-blue-500/5'
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className={`pointer-events-auto p-4 rounded-xl border glass-card flex items-start justify-between gap-3 ${borderMap[toast.type] || borderMap.info}`}
          >
            <div className="flex gap-3">
              {iconMap[toast.type] || iconMap.info}
              <div>
                <h4 className="font-outfit font-semibold text-slate-800 dark:text-slate-100 text-sm">
                  {toast.title}
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                  {toast.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
