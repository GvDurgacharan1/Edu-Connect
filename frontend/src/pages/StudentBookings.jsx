import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiClock, FiVideo, FiXCircle, FiCheckCircle, FiInfo, FiSlash, FiUser, FiDollarSign } from 'react-icons/fi';

export const StudentBookings = () => {
  const { showToast } = useNotifications();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All'); // 'All', 'Pending', 'Accepted', 'Rejected', 'Cancelled'

  // Payment UI States
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payingBooking, setPayingBooking] = useState(null);
  const [payMethod, setPayMethod] = useState('card'); // 'card', 'upi', 'netbanking', 'wallet'
  const [cardNum, setCardNum] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [paymentSubmitLoading, setPaymentSubmitLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings');
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      showToast('Error', 'Failed to retrieve booking records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking request?')) return;
    try {
      const res = await api.put(`/bookings/${bookingId}/cancel`);
      if (res.data.success) {
        showToast('Booking Cancelled', 'Your request has been cancelled successfully.', 'info');
        // Refresh local items
        setBookings(prev =>
          prev.map(b => b._id === bookingId ? { ...b, status: 'Cancelled' } : b)
        );
      }
    } catch (err) {
      showToast('Cancellation Failed', err.response?.data?.message || 'Error cancelling booking.', 'error');
    }
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!payingBooking) return;

    if (payMethod === 'card' && (!cardNum || !cardExp || !cardCvv || !cardName)) {
      showToast('Validation Error', 'Please complete all card details.', 'warning');
      return;
    }
    if (payMethod === 'upi' && !upiId.includes('@')) {
      showToast('Validation Error', 'Please enter a valid UPI ID (e.g. name@bank).', 'warning');
      return;
    }
    if (payMethod === 'netbanking' && !selectedBank) {
      showToast('Validation Error', 'Please choose a bank.', 'warning');
      return;
    }

    setPaymentSubmitLoading(true);
    try {
      const res = await api.put(`/bookings/${payingBooking._id}/pay`, {
        paymentMethod: payMethod.toUpperCase()
      });
      if (res.data.success) {
        showToast('Payment Successful!', `Paid ₹${payingBooking.course?.fee || payingBooking.teacher?.fees || 50} successfully.`, 'success');
        setPayModalOpen(false);
        setBookings(prev =>
          prev.map(b => b._id === payingBooking._id ? { ...b, paymentStatus: 'Paid', paymentMethod: payMethod.toUpperCase() } : b)
        );
      }
    } catch (err) {
      showToast('Payment Failed', err.response?.data?.message || 'Error processing payment.', 'error');
    } finally {
      setPaymentSubmitLoading(false);
    }
  };

  // Filter lists based on tab
  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'All') return true;
    return b.status === activeTab;
  });

  const statusColors = {
    Pending: 'border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400',
    Accepted: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400',
    Rejected: 'border-rose-500/20 bg-rose-500/5 text-rose-600 dark:text-rose-400',
    Cancelled: 'border-slate-500/20 bg-slate-500/5 text-slate-600 dark:text-slate-400'
  };

  return (
    <div className="space-y-6 text-left">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black font-outfit tracking-tight text-slate-805 dark:text-white">
          My Class Bookings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Monitor your tutoring sessions, track approvals, and coordinate with professors.
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-200/50 dark:border-slate-800/30 text-xs font-semibold text-slate-600 dark:text-slate-400">
        {['All', 'Pending', 'Accepted', 'Rejected', 'Cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl border transition-colors ${
              activeTab === tab
                ? 'bg-primary text-white border-primary shadow-md shadow-primary/10'
                : 'border-slate-200/60 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab} ({tab === 'All' ? bookings.length : bookings.filter((b) => b.status === tab).length})
          </button>
        ))}
      </div>

      {/* Bookings Lists */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 skeleton" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-12 text-center border border-slate-200/50 dark:border-slate-800 rounded-2xl glass-card text-slate-450 space-y-2">
          <FiCalendar className="w-8 h-8 mx-auto text-slate-350" />
          <p className="font-bold text-sm">No bookings records found.</p>
          <p className="text-xs text-slate-500">
            Book a session from Search Teachers page to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredBookings.map((booking) => (
              <motion.div
                key={booking._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-5 rounded-2xl glass-card border border-slate-200/60 dark:border-slate-800/70 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Professor Info & Booking Goal */}
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200/40">
                    {booking.teacher?.avatar ? (
                      <img src={booking.teacher.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold uppercase">
                        {booking.teacher?.fullName?.[0] || '?'}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                        Prof: {booking.teacher?.fullName || 'Teacher'}
                      </h4>
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${statusColors[booking.status]}`}>
                        {booking.status}
                      </span>
                    </div>

                    <p className="text-slate-550 dark:text-slate-400 font-semibold">
                      Course: {booking.course?.title || 'Custom Mentorship Program'}
                    </p>

                    <p className="text-slate-655 dark:text-slate-400 leading-relaxed text-[11px] mt-1 max-w-xl">
                      <span className="font-bold">Goal:</span> {booking.learningGoal}
                    </p>

                    {booking.additionalNotes && (
                      <p className="text-slate-500 dark:text-slate-500 text-[11px] italic mt-0.5">
                        Note: {booking.additionalNotes}
                      </p>
                    )}

                    {/* Preferred Slot */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500 dark:text-slate-450 text-[10px] font-bold pt-1.5">
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-3.5 h-3.5 text-primary" />
                        <span>Date: {new Date(booking.preferredDate).toLocaleDateString()}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <FiClock className="w-3.5 h-3.5 text-primary" />
                        <span>Time: {booking.preferredTime}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Booking Controls */}
                <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end justify-center gap-2 flex-shrink-0">
                  {booking.status === 'Pending' && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="px-4 py-2 border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <FiSlash className="w-3.5 h-3.5" />
                      <span>Cancel Request</span>
                    </button>
                  )}
                  {booking.status === 'Accepted' && (
                    <div className="flex flex-col items-stretch md:items-end gap-2 text-right">
                      {booking.paymentStatus === 'Paid' ? (
                        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex flex-col md:items-end gap-1">
                          <span className="text-emerald-500 flex items-center gap-1">
                            <FiCheckCircle className="w-4 h-4" />
                            <span>Paid & Unlocked</span>
                          </span>
                          <span className="text-[9px] text-slate-400">
                            Method: {booking.paymentMethod || 'CARD'}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setPayingBooking(booking);
                            setPayMethod('card');
                            setCardNum('');
                            setCardExp('');
                            setCardCvv('');
                            setCardName('');
                            setUpiId('');
                            setSelectedBank('');
                            setPayModalOpen(true);
                          }}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5"
                        >
                          <FiDollarSign className="w-3.5 h-3.5" />
                          <span>Pay Fee (₹{booking.course?.fee || booking.teacher?.fees || 50})</span>
                        </button>
                      )}
                      <span className="text-[9px] text-slate-400 font-bold">
                        Access messages/meetings menu
                      </span>
                    </div>
                  )}
                  {booking.status === 'Rejected' && (
                    <span className="text-[11px] text-slate-450 italic flex items-center gap-1">
                      <FiXCircle className="w-4 h-4 text-rose-500" />
                      <span>Prof unavailable</span>
                    </span>
                  )}
                  {booking.status === 'Cancelled' && (
                    <span className="text-[11px] text-slate-450 italic">
                      Cancelled
                    </span>
                  )}
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Payment Modal */}
      <AnimatePresence>
        {payModalOpen && payingBooking && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPayModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 15, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200/50 dark:border-slate-800/80 shadow-2xl space-y-6 text-left"
              >
                {/* Modal Header */}
                <div className="flex justify-between items-center pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
                  <div>
                    <h3 className="text-lg font-black font-outfit text-slate-800 dark:text-white">
                      Complete Payment
                    </h3>
                    <p className="text-xs text-slate-500">Secure Checkout Portal</p>
                  </div>
                  <button onClick={() => setPayModalOpen(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                    <FiX className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                  </button>
                </div>

                {/* Course details / Cost */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/40 space-y-1 text-xs">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Requested Item</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {payingBooking.course?.title || 'Custom Mentorship Program'}
                  </p>
                  <p className="text-slate-500">Tutor: {payingBooking.teacher?.fullName}</p>
                  <div className="pt-2 flex justify-between items-center text-sm font-extrabold border-t border-slate-200/50 dark:border-slate-800/50 mt-2">
                    <span className="text-slate-600 dark:text-slate-450">Total Amount:</span>
                    <span className="text-primary dark:text-accent text-lg">
                      ₹{payingBooking.course?.fee || payingBooking.teacher?.fees || 50}
                    </span>
                  </div>
                </div>

                {/* Method Tabs */}
                <div className="grid grid-cols-4 gap-1.5 bg-slate-100 dark:bg-slate-805 p-1 rounded-xl text-[10px] font-bold">
                  {[
                    { id: 'card', name: 'Card' },
                    { id: 'upi', name: 'UPI / QR' },
                    { id: 'netbanking', name: 'Net Banking' },
                    { id: 'wallet', name: 'Wallets' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPayMethod(m.id)}
                      className={`py-2 rounded-lg text-center transition-all ${
                        payMethod === m.id
                          ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>

                {/* Payment Forms */}
                <form onSubmit={handleProcessPayment} className="space-y-4 text-xs">
                  {payMethod === 'card' && (
                    <div className="space-y-3">
                      {/* Interactive mockup card */}
                      <div className="p-4 bg-gradient-to-br from-slate-800 to-slate-950 text-white rounded-2xl space-y-4 shadow-lg border border-slate-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono tracking-widest text-slate-400">CREDIT CARD</span>
                          <span className="text-xs italic font-bold">VISA</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] text-slate-500 font-bold">CARD NUMBER</p>
                          <p className="font-mono text-sm tracking-wider">
                            {cardNum ? cardNum.replace(/(\d{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
                          </p>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-[8px] text-slate-500 font-bold">CARDHOLDER</p>
                            <p className="font-mono text-[10px] uppercase tracking-wide">
                              {cardName || 'YOUR FULL NAME'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[8px] text-slate-500 font-bold">EXPIRES</p>
                            <p className="font-mono text-[10px]">{cardExp || 'MM/YY'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="space-y-0.5">
                          <label className="font-bold text-slate-605 dark:text-slate-400">Cardholder Name</label>
                          <input
                            type="text"
                            required
                            placeholder="John Doe"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border glass-input text-slate-800 dark:text-slate-100"
                          />
                        </div>

                        <div className="space-y-0.5">
                          <label className="font-bold text-slate-605 dark:text-slate-400">Card Number</label>
                          <input
                            type="text"
                            required
                            maxLength="16"
                            placeholder="4111222233334444"
                            value={cardNum}
                            onChange={(e) => setCardNum(e.target.value.replace(/\D/g, ''))}
                            className="w-full px-3 py-2 rounded-lg border glass-input text-slate-800 dark:text-slate-100 font-mono"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-0.5">
                            <label className="font-bold text-slate-605 dark:text-slate-400">Expiry (MM/YY)</label>
                            <input
                              type="text"
                              required
                              placeholder="12/28"
                              maxLength="5"
                              value={cardExp}
                              onChange={(e) => setCardExp(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border glass-input text-slate-800 dark:text-slate-100 font-mono"
                            />
                          </div>
                          <div className="space-y-0.5">
                            <label className="font-bold text-slate-605 dark:text-slate-400">CVV</label>
                            <input
                              type="password"
                              required
                              maxLength="3"
                              placeholder="•••"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                              className="w-full px-3 py-2 rounded-lg border glass-input text-slate-800 dark:text-slate-100 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {payMethod === 'upi' && (
                    <div className="space-y-4 text-center">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/40 flex flex-col items-center justify-center space-y-2">
                        {/* Static SVG QR Code */}
                        <svg className="w-32 h-32 bg-white p-2 rounded-xl border border-slate-200" viewBox="0 0 100 100">
                          <path d="M10,10 h30 v30 h-30 z M20,20 h10 v10 h-10 z" fill="black" />
                          <path d="M60,10 h30 v30 h-30 z M70,20 h10 v10 h-10 z" fill="black" />
                          <path d="M10,60 h30 v30 h-30 z M20,70 h10 v10 h-10 z" fill="black" />
                          <rect x="70" y="70" width="10" height="10" fill="black" />
                          <rect x="60" y="60" width="10" height="10" fill="black" />
                          <rect x="80" y="80" width="10" height="10" fill="black" />
                          <rect x="50" y="80" width="10" height="10" fill="black" />
                          <rect x="80" y="50" width="10" height="10" fill="black" />
                        </svg>
                        <p className="text-[10px] text-slate-500 font-bold">Scan QR code using any UPI App (GPay, PhonePe, BHIM)</p>
                      </div>

                      <div className="relative flex items-center justify-center my-2 text-slate-400 font-bold text-[10px]">
                        <span className="px-2 bg-white dark:bg-slate-900 z-10">OR PAY VIA UPI ID</span>
                        <div className="absolute inset-x-0 h-px bg-slate-200 dark:bg-slate-800" />
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="font-bold text-slate-600 dark:text-slate-400">Virtual Payment Address (VPA) / UPI ID</label>
                        <input
                          type="text"
                          placeholder="e.g. name@bank"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg border glass-input text-slate-800 dark:text-slate-100 font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {payMethod === 'netbanking' && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-600 dark:text-slate-400">Select Bank</label>
                        <select
                          required
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg border glass-input text-slate-800 dark:text-slate-100"
                        >
                          <option value="">-- Select Bank --</option>
                          <option value="sbi">State Bank of India</option>
                          <option value="hdfc">HDFC Bank</option>
                          <option value="icici">ICICI Bank</option>
                          <option value="axis">Axis Bank</option>
                          <option value="kotak">Kotak Mahindra Bank</option>
                        </select>
                      </div>
                      <p className="text-[10px] text-slate-500 italic">You will be redirected to the secure NetBanking login portal once submitted.</p>
                    </div>
                  )}

                  {payMethod === 'wallet' && (
                    <div className="grid grid-cols-2 gap-2 py-4">
                      {[
                        { id: 'paypal', name: 'PayPal' },
                        { id: 'gpay', name: 'Google Pay' },
                        { id: 'apple', name: 'Apple Pay' },
                        { id: 'stripe', name: 'Stripe Pay' }
                      ].map((w) => (
                        <button
                          key={w.id}
                          type="submit"
                          onClick={() => setCardName(w.name)}
                          className="py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center font-bold gap-2 text-slate-800 dark:text-slate-150 transition-colors"
                        >
                          <span>{w.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Submission Buttons */}
                  {payMethod !== 'wallet' && (
                    <div className="grid grid-cols-2 gap-2 pt-4">
                      <button
                        type="button"
                        onClick={() => setPayModalOpen(false)}
                        className="py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl font-bold text-center text-slate-600 dark:text-slate-350"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={paymentSubmitLoading}
                        className="py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5"
                      >
                        {paymentSubmitLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <FiCheckCircle className="w-4 h-4" />
                            <span>Confirm & Pay</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const FiX = () => <svg className="w-5 h-5 text-slate-500 hover:text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

export default StudentBookings;
