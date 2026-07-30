import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMail, FiLock, FiUser, FiPhone, FiCheck, FiArrowLeft,
  FiBookOpen, FiSun, FiMoon, FiAlertCircle, FiAward, FiMessageSquare
} from 'react-icons/fi';
import api from '../services/api';

export const AuthPage = () => {
  const { login, register, isAuthenticated, user } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Mode: 'login', 'signup', 'role-selection', 'forgot-password', 'reset-password'
  const [mode, setMode] = useState('login');
  
  // Login states
  const [loginRole, setLoginRole] = useState('student'); // 'student', 'teacher', 'admin'
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Signup states
  const [signupRole, setSignupRole] = useState('student');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Password reset states
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [userResetCode, setUserResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Switch between login and signup depending on query params
  useEffect(() => {
    if (searchParams.get('signup') === 'true') {
      setMode('signup');
    } else {
      setMode('login');
    }
  }, [searchParams]);

  // If already authenticated, redirect to appropriate dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      if (mode !== 'role-selection') {
        redirectUser(user.role);
      }
    }
  }, [isAuthenticated, user, mode]);

  const redirectUser = (role) => {
    if (role === 'student') navigate('/student/dashboard');
    else if (role === 'teacher') navigate('/teacher/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
  };

  // Helper to load quick demo logins
  const loadDefaultLogin = (role) => {
    setLoginRole(role);
    if (role === 'student') {
      setLoginUser('student');
      setLoginPass('student123');
    } else if (role === 'teacher') {
      setLoginUser('teacher');
      setLoginPass('teacher123');
    } else if (role === 'admin') {
      setLoginUser('admin');
      setLoginPass('admin123');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginUser || !loginPass) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const res = await login(loginUser, loginPass);
    setLoading(false);

    if (res.success) {
      showToast('Welcome back!', `Logged in successfully as ${loginUser}.`, 'success');
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !username || !email || !password || !confirmPassword) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (!acceptTerms) {
      setErrorMsg('You must accept the terms & conditions.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const res = await register({
      username,
      email,
      password,
      role: signupRole,
      fullName,
      phone
    });
    setLoading(false);

    if (res.success) {
      showToast('Account Created!', 'Please complete your profile selection next.', 'success');
      setMode('role-selection');
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setErrorMsg('Please enter your email.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post('/auth/forgot-password', { email: resetEmail });
      if (res.data.success) {
        setResetCode(res.data.code);
        showToast('Code sent!', 'Password reset code has been printed to logs.', 'info');
        setMode('reset-password');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error executing forgot password.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!userResetCode || !newPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    if (userResetCode !== resetCode) {
      setErrorMsg('Invalid verification code.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post('/auth/reset-password', {
        email: resetEmail,
        password: newPassword
      });
      if (res.data.success) {
        showToast('Password Updated!', 'You can now log in with your new password.', 'success');
        setMode('login');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const selectRolePostSignup = (role) => {
    // Navigate to profile complete pages
    if (role === 'student') navigate('/student/profile?complete=true');
    else if (role === 'teacher') navigate('/teacher/profile?complete=true');
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Floating Theme Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-xl border border-slate-200 dark:border-slate-805 glass-card text-slate-700 dark:text-slate-300 hover:text-primary transition-colors"
        >
          {isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
        </button>
      </div>

      {/* Left Column - Presentation Graphics */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-tr from-primary to-blue-600 dark:from-slate-900 dark:to-slate-950 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        
        {/* Floating background blur nodes */}
        <div className="w-96 h-96 rounded-full bg-accent/20 absolute top-[-10%] right-[-10%] blur-3xl pointer-events-none" />
        <div className="w-96 h-96 rounded-full bg-blue-500/20 absolute bottom-[-10%] left-[-10%] blur-3xl pointer-events-none" />

        <div className="relative max-w-md text-center text-white z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mx-auto border border-white/20 animate-float"
          >
            <FiBookOpen className="w-8 h-8 text-white" />
          </motion.div>

          <h2 className="text-3xl font-extrabold font-outfit leading-tight">
            EduConnect Platform
          </h2>
          <p className="text-white/80 text-sm leading-relaxed">
            The premium network where university students discover verified professors, request custom classrooms, and schedule private tutoring sessions safely.
          </p>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-4 text-left">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <FiAward className="text-white w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold font-outfit uppercase tracking-wider text-accent">
                Verification checks
              </h4>
              <p className="text-[11px] text-white/70 mt-0.5">
                Every teacher account validation requires academic credentials approval.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Forms container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <div className="max-w-md w-full">
          <AnimatePresence mode="wait">
            
            {/* 1. LOGIN MODE */}
            {mode === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-black font-outfit tracking-tight text-slate-800 dark:text-white">
                    Sign in to EduConnect
                  </h3>
                  <p className="text-xs text-slate-650 dark:text-slate-400 mt-1">
                    Select your access portal to continue.
                  </p>
                </div>

                {/* Role Tabs */}
                <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800/40">
                  {['student', 'teacher', 'admin'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setLoginRole(role)}
                      className={`py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                        loginRole === role
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>

                {/* Default Login presets trigger */}
                <div className="p-3.5 rounded-xl bg-primary/5 dark:bg-accent/5 border border-primary/10 dark:border-accent/10 flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-350">
                    Use quick testing account:
                  </span>
                  <button
                    onClick={() => loadDefaultLogin(loginRole)}
                    className="font-bold text-primary dark:text-accent hover:underline capitalize"
                  >
                    Load Default {loginRole}
                  </button>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-500 text-xs">
                    <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-650 dark:text-slate-400">
                      Username or Email
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        required
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck="false"
                        value={loginUser}
                        onChange={(e) => setLoginUser(e.target.value)}
                        placeholder={`e.g. ${loginRole}`}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-650 dark:text-slate-400">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setMode('forgot-password')}
                        className="text-[11px] text-primary dark:text-accent hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="password"
                        required
                        autoCapitalize="none"
                        autoCorrect="off"
                        value={loginPass}
                        onChange={(e) => setLoginPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="remember_me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary border-slate-300 dark:border-slate-700 rounded bg-transparent"
                    />
                    <label htmlFor="remember_me" className="ml-2 text-xs text-slate-600 dark:text-slate-400">
                      Remember my login
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Sign In</span>
                    )}
                  </button>
                </form>

                <p className="text-xs text-center text-slate-650 dark:text-slate-400">
                  New to the platform?{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className="font-bold text-primary dark:text-accent hover:underline"
                  >
                    Create account
                  </button>
                </p>
              </motion.div>
            )}

            {/* 2. SIGNUP MODE */}
            {mode === 'signup' && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-black font-outfit tracking-tight text-slate-800 dark:text-white">
                    Create your account
                  </h3>
                  <p className="text-xs text-slate-650 dark:text-slate-400 mt-1">
                    Select your system role and enter credentials.
                  </p>
                </div>

                {/* Role selection toggler */}
                <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800/40">
                  {['student', 'teacher'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSignupRole(role)}
                      className={`py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                        signupRole === role
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-slate-650 dark:text-slate-400 hover:text-slate-805 dark:hover:text-white'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-500 text-xs">
                    <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-650 dark:text-slate-400">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-650 dark:text-slate-400">
                        Username
                      </label>
                      <input
                        type="text"
                        required
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck="false"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="johndoe"
                        className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-650 dark:text-slate-400">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck="false"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-650 dark:text-slate-400">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="1234567890"
                        className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-650 dark:text-slate-400">
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        autoCapitalize="none"
                        autoCorrect="off"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-650 dark:text-slate-400">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        required
                        autoCapitalize="none"
                        autoCorrect="off"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="flex items-start">
                    <input
                      id="accept_terms"
                      type="checkbox"
                      required
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary border-slate-350 dark:border-slate-700 rounded bg-transparent mt-0.5"
                    />
                    <label htmlFor="accept_terms" className="ml-2 text-xs text-slate-600 dark:text-slate-400 leading-normal">
                      I accept the{' '}
                      <a href="#" className="font-bold text-primary dark:text-accent hover:underline">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#" className="font-bold text-primary dark:text-accent hover:underline">
                        Privacy Policy
                      </a>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Register Account</span>
                    )}
                  </button>
                </form>

                <p className="text-xs text-center text-slate-650 dark:text-slate-400">
                  Already have an account?{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="font-bold text-primary dark:text-accent hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </motion.div>
            )}

            {/* 3. POST SIGNUP ROLE SELECTION */}
            {mode === 'role-selection' && (
              <motion.div
                key="role-selection"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center"
              >
                <div>
                  <h3 className="text-2xl font-black font-outfit tracking-tight text-slate-805 dark:text-white">
                    Select Your Role Profile
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Choose profile template to complete registration details.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Teacher Choice Card */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => selectRolePostSignup('teacher')}
                    className="p-6 rounded-2xl glass-card border border-slate-200/60 dark:border-slate-800/80 cursor-pointer flex flex-col items-center gap-2 hover:border-primary/50 text-slate-800 dark:text-slate-100"
                  >
                    <FiAward className="w-8 h-8 text-primary animate-float" />
                    <h4 className="font-bold text-base font-outfit">I am a Teacher</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal max-w-xs">
                      Create profiles, courses, manage bookings requests, schedule classes, and upload notes.
                    </p>
                  </motion.div>

                  {/* Student Choice Card */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => selectRolePostSignup('student')}
                    className="p-6 rounded-2xl glass-card border border-slate-200/60 dark:border-slate-800/80 cursor-pointer flex flex-col items-center gap-2 hover:border-accent/50 text-slate-800 dark:text-slate-100"
                  >
                    <FiBookOpen className="w-8 h-8 text-accent animate-float" />
                    <h4 className="font-bold text-base font-outfit">I am a Student</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal max-w-xs">
                      Search expert professors, explore courses, submit bookings, and chat privately.
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* 4. FORGOT PASSWORD */}
            {mode === 'forgot-password' && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMode('login')}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                  >
                    <FiArrowLeft className="w-4 h-4" />
                  </button>
                  <h3 className="text-xl font-bold font-outfit text-slate-800 dark:text-white">
                    Forgot Password
                  </h3>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Enter your email address. We will generate verification code printed directly in server terminal.
                </p>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      Email Address
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Generate Reset Code</span>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* 5. RESET PASSWORD WITH CODE */}
            {mode === 'reset-password' && (
              <motion.div
                key="reset"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <h3 className="text-xl font-bold font-outfit text-slate-800 dark:text-white">
                    Set New Password
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Verification code: <span className="font-bold text-primary dark:text-accent font-mono">{resetCode}</span>
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      Enter Reset Code
                    </label>
                    <input
                      type="text"
                      required
                      value={userResetCode}
                      onChange={(e) => setUserResetCode(e.target.value)}
                      placeholder="e.g. 123456"
                      className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100 font-mono text-center tracking-widest"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Reset Password</span>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

    </div>
  );
};

export default AuthPage;
