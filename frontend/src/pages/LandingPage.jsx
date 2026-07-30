import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import {
  FiBook, FiSun, FiMoon, FiAward, FiShield, FiCheckCircle,
  FiArrowRight, FiUserPlus, FiArrowUpRight, FiMail, FiMessageCircle, FiTv,
  FiGithub, FiTwitter, FiLinkedin, FiUsers
} from 'react-icons/fi';

export const LandingPage = () => {
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-x-hidden font-sans">
      
      {/* Landing Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-nav h-16 flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-2">
          <FiBook className="text-primary w-6 h-6 animate-float" />
          <span className="text-xl font-extrabold font-outfit bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            EduConnect
          </span>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-650 dark:text-slate-300">
          <a href="#home" className="hover:text-primary transition-colors">Home</a>
          <a href="#about" className="hover:text-primary transition-colors">About</a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
          <a href="#why-choose-us" className="hover:text-primary transition-colors">Why Us</a>
          <a href="#testimonials" className="hover:text-primary transition-colors">Reviews</a>
        </nav>

        <div className="flex items-center gap-3">
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 transition-colors"
          >
            {isDark ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
          </button>

          {/* Authentication Redirect Buttons */}
          <Link
            to="/login"
            className="hidden sm:inline-block px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-primary transition-colors"
          >
            Login
          </Link>
          <Link
            to="/login?signup=true"
            className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all duration-200"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center relative">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-primary/10 dark:bg-accent/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-primary/10 dark:bg-accent/10 px-4 py-1.5 rounded-full text-xs font-bold text-primary dark:text-accent mb-6"
        >
          <FiAward className="w-4 h-4" />
          <span>The Leading Professor-Student Network</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-black font-outfit tracking-tight max-w-3xl leading-tight text-slate-850 dark:text-white"
        >
          Connect Students With{' '}
          <span className="bg-gradient-to-r from-primary via-blue-500 to-accent bg-clip-text text-transparent">
            Expert Professors
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-slate-600 dark:text-slate-400 mt-6 text-base md:text-lg max-w-2xl leading-relaxed"
        >
          EduConnect helps students discover professors, book personalized learning sessions, and communicate securely.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 mt-10"
        >
          <button
            onClick={() => navigate('/login?signup=true')}
            className="px-8 py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 flex items-center gap-2 hover:translate-x-0.5 transition-all"
          >
            <span>Get Started</span>
            <FiArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#how-it-works"
            className="px-8 py-3.5 border border-slate-250 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-850 font-bold rounded-xl transition-all"
          >
            Learn More
          </a>
        </motion.div>
      </section>

      {/* Feature Cards Section */}
      <section id="about" className="py-12 px-6 md:px-12 max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Card 1 */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -6 }}
            className="p-6 rounded-2xl glass-card border border-slate-100 dark:border-slate-800/40 text-left"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-5">
              <FiUsers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-outfit">Expert Teachers</h3>
            <p className="text-slate-655 dark:text-slate-400 text-sm mt-3 leading-relaxed">
              Find certified professors with years of academic teaching experience across diverse technical and research subjects.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -6 }}
            className="p-6 rounded-2xl glass-card border border-slate-100 dark:border-slate-800/40 text-left"
          >
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent mb-5">
              <FiCheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-outfit">Verified Profiles</h3>
            <p className="text-slate-655 dark:text-slate-400 text-sm mt-3 leading-relaxed">
              Every professor profile undergoes verification checks for qualifications, current universities, and background.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -6 }}
            className="p-6 rounded-2xl glass-card border border-slate-100 dark:border-slate-800/40 text-left"
          >
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 mb-5">
              <FiShield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-outfit">Secure Booking</h3>
            <p className="text-slate-655 dark:text-slate-400 text-sm mt-3 leading-relaxed">
              Request sessions, wait for approvals, and schedule private learning meetings safely through our structured workflow.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 md:px-12 max-w-7xl mx-auto text-center border-t border-slate-200/50 dark:border-slate-800/30">
        <h2 className="text-3xl font-extrabold font-outfit">How It Works</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 max-w-lg mx-auto">
          Start your learning journey in six simple steps.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mt-12">
          {[
            { step: '1', title: 'Create account', desc: 'Sign up securely as student or teacher.' },
            { step: '2', title: 'Complete profile', desc: 'Fill in details, skills, and academic papers.' },
            { step: '3', title: 'Book professor', desc: 'Find your target teacher and request a slot.' },
            { step: '4', title: 'Professor accepts', desc: 'Your teacher reviews the goal and accepts.' },
            { step: '5', title: 'Chat privately', desc: 'Unlocked chat lets you talk and share PDFs.' },
            { step: '6', title: 'Schedule meeting', desc: 'Schedule private virtual meeting rooms.' }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-5 rounded-2xl glass-card text-left flex flex-col justify-between border border-slate-100 dark:border-slate-900"
            >
              <div>
                <span className="text-2xl font-black font-outfit text-primary/45 dark:text-accent/35">
                  0{item.step}
                </span>
                <h4 className="text-sm font-bold font-outfit mt-2 text-slate-800 dark:text-slate-200">
                  {item.title}
                </h4>
              </div>
              <p className="text-slate-550 dark:text-slate-400 text-[11px] mt-2 leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Choose Section */}
      <section id="why-choose-us" className="py-20 px-6 md:px-12 max-w-7xl mx-auto border-t border-slate-200/50 dark:border-slate-800/30 flex flex-col lg:flex-row items-center gap-12 text-left">
        <div className="lg:w-1/2">
          <h2 className="text-3xl font-extrabold font-outfit">Why Choose EduConnect</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-3 leading-relaxed">
            We bridge the gap between academic research and students, creating an optimized ecosystem for higher learning and mentorship.
          </p>

          <div className="space-y-4 mt-8">
            {[
              { title: 'Professional professors', desc: 'Direct access to certified PhDs and leading researchers.' },
              { title: 'Easy booking & approvals', desc: 'Frictionless schedule coordination directly from the app.' },
              { title: 'Private encrypted chat', desc: 'Instant private message channels to discuss materials.' },
              { title: 'Modern interactive dashboard', desc: 'Highly intuitive glassmorphism views with unread flags.' },
              { title: 'Responsive design theme', desc: 'Works beautifully on desktops, tablets, and phones.' }
            ].map((item, index) => (
              <div key={index} className="flex gap-3">
                <FiCheckCircle className="text-emerald-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-205">{item.title}</h4>
                  <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:w-1/2 flex items-center justify-center relative">
          <div className="w-80 h-80 bg-accent/20 rounded-full blur-3xl absolute pointer-events-none" />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl glass-card border border-white/40 dark:border-slate-800 max-w-md w-full relative overflow-hidden"
          >
            <FiTv className="text-primary w-12 h-12 mb-4 animate-float" />
            <h4 className="text-xl font-bold font-outfit text-slate-800 dark:text-slate-100">
              Interactive Learning Ecosystem
            </h4>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mt-3">
              Students and professors enjoy dedicated features matching their learning flow. Teachers publish courses and upload educational posts, while students ask questions directly after request verification.
            </p>
            <div className="mt-6 flex justify-between items-center bg-slate-100 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/40">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-305">Want to join?</span>
              <button
                onClick={() => navigate('/login?signup=true')}
                className="text-xs text-white bg-primary px-4 py-2 rounded-xl font-bold hover:bg-primary-dark transition-colors"
              >
                Join Now
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-6 md:px-12 max-w-7xl mx-auto border-t border-slate-200/50 dark:border-slate-800/30 text-center">
        <h2 className="text-3xl font-extrabold font-outfit">Student & Teacher Reviews</h2>
        <p className="text-slate-650 dark:text-slate-400 text-sm mt-2">
          Read what users say about their EduConnect experiences.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {/* Student Review */}
          <div className="p-6 rounded-2xl glass-card border border-slate-100 dark:border-slate-850 text-left">
            <p className="text-slate-600 dark:text-slate-350 text-sm italic leading-relaxed">
              "Booking Dr. Doe for database architecture was incredibly easy. We cleared up relational normalizations in an hour of virtual meet, and we still chat about new assignment sheets."
            </p>
            <div className="flex items-center gap-3 mt-6">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-850 overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-sm bg-primary text-white">
                JS
              </div>
              <div>
                <h4 className="text-sm font-bold">Jane Smith</h4>
                <span className="text-xs text-slate-500">Computer Science Student</span>
              </div>
            </div>
          </div>

          {/* Teacher Review */}
          <div className="p-6 rounded-2xl glass-card border border-slate-100 dark:border-slate-850 text-left">
            <p className="text-slate-600 dark:text-slate-350 text-sm italic leading-relaxed">
              "EduConnect helps me organize additional mentorship hours efficiently. I can review student profiles, accept their slot bookings, and schedule virtual classes, keeping academic chats completely separate from email."
            </p>
            <div className="flex items-center gap-3 mt-6">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-850 overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-sm bg-accent text-white">
                JD
              </div>
              <div>
                <h4 className="text-sm font-bold">Dr. John Doe</h4>
                <span className="text-xs text-slate-500">Computer Science Professor</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 dark:border-slate-800/30 bg-slate-100/50 dark:bg-slate-900/20 py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
          
          {/* Logo & About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FiBook className="text-primary w-5 h-5" />
              <span className="text-lg font-black font-outfit bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                EduConnect
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Discover professors, book private tutoring, chat after verification, and schedule classrooms.
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="font-bold text-sm font-outfit mb-4">Platform</h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li><a href="#home" className="hover:text-primary transition-colors">Home</a></li>
              <li><a href="#about" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a></li>
              <li><a href="#why-choose-us" className="hover:text-primary transition-colors">Why Choose Us</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="font-bold text-sm font-outfit mb-4">Legal</h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Support Center</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm font-outfit">Contact Us</h4>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <FiMail className="text-primary w-4 h-4" />
              <span>info@educonnect.com</span>
            </div>
            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-primary hover:text-white transition-all text-slate-600 dark:text-slate-400">
                <FiTwitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-primary hover:text-white transition-all text-slate-600 dark:text-slate-400">
                <FiLinkedin className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-primary hover:text-white transition-all text-slate-600 dark:text-slate-400">
                <FiGithub className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-200/50 dark:border-slate-800/30 mt-8 pt-6 text-center text-[10px] text-slate-500">
          © {new Date().getFullYear()} EduConnect Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
