import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { motion } from 'framer-motion';
import {
  FiUser, FiFileText, FiAward, FiMapPin, FiPhone, FiBook,
  FiCompass, FiActivity, FiSave, FiUpload, FiSettings
} from 'react-icons/fi';

export const StudentProfile = () => {
  const { profile, updateProfile, fetchProfile } = useAuth();
  const { showToast } = useNotifications();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isCompleting = searchParams.get('complete') === 'true';

  // Form states
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [university, setUniversity] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [branch, setBranch] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [careerGoal, setCareerGoal] = useState('');
  const [biography, setBiography] = useState('');
  const [location, setLocation] = useState('');
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync profile details into inputs
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setAge(profile.age || '');
      setGender(profile.gender || '');
      setPhone(profile.phone || '');
      setUniversity(profile.university || '');
      setCollege(profile.college || '');
      setDepartment(profile.department || '');
      setBranch(profile.branch || '');
      setCourse(profile.course || '');
      setYear(profile.year || '');
      setSemester(profile.semester || '');
      setSkills(profile.skills?.join(', ') || '');
      setInterests(profile.interests?.join(', ') || '');
      setCareerGoal(profile.careerGoal || '');
      setBiography(profile.biography || '');
      setLocation(profile.location || '');
      setAvatarPreview(profile.avatar || '');
    }
  }, [profile]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('age', age);
    formData.append('gender', gender);
    formData.append('phone', phone);
    formData.append('university', university);
    formData.append('college', college);
    formData.append('department', department);
    formData.append('branch', branch);
    formData.append('course', course);
    formData.append('year', year);
    formData.append('semester', semester);
    formData.append('skills', skills);
    formData.append('interests', interests);
    formData.append('careerGoal', careerGoal);
    formData.append('biography', biography);
    formData.append('location', location);

    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    const res = await updateProfile(formData, false);
    setLoading(false);

    if (res && res.success) {
      showToast('Profile Saved!', 'Your student profile has been updated successfully.', 'success');
      if (isCompleting) {
        navigate('/student/dashboard');
      }
    } else {
      showToast('Error', res?.message || 'Failed to save profile.', 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {isCompleting && (
        <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div>
            <h3 className="font-black font-outfit text-primary text-lg">
              Complete Your Student Profile
            </h3>
            <p className="text-xs text-slate-655 dark:text-slate-400 mt-1">
              Please fill in your academic details to unlock professor search and bookings.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Upload Grid */}
        <div className="p-6 rounded-2xl glass-card border border-slate-150 dark:border-slate-800 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative border-2 border-white dark:border-slate-700 shadow-md">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold text-2xl uppercase">
                {fullName?.[0] || '?'}
              </div>
            )}
          </div>
          <div className="text-center md:text-left space-y-2">
            <h4 className="font-bold text-sm">Profile Picture</h4>
            <p className="text-[11px] text-slate-500 max-w-xs">
              Upload a professional portrait. Accepted types: JPG, JPEG, PNG (max 10MB).
            </p>
            <label className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold cursor-pointer transition-colors text-slate-700 dark:text-slate-350">
              <FiUpload className="w-4 h-4" />
              <span>Upload Photo</span>
              <input type="file" onChange={handleAvatarChange} accept="image/*" className="hidden" />
            </label>
          </div>
        </div>

        {/* Section 1: Basic Info */}
        <div className="p-6 rounded-2xl glass-card border border-slate-150 dark:border-slate-800 space-y-4 text-left">
          <h3 className="font-extrabold font-outfit text-base flex items-center gap-2 border-b border-slate-200/50 dark:border-slate-800/30 pb-2 text-slate-805 dark:text-slate-200">
            <FiUser className="text-primary w-4 h-4" />
            <span>Basic Personal Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-400">Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-400">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="21"
                className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-400">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-655 dark:text-slate-400">Phone Number</label>
              <div className="relative">
                <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-655 dark:text-slate-400">Location / City</label>
              <div className="relative">
                <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="New York, USA"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Academic Info */}
        <div className="p-6 rounded-2xl glass-card border border-slate-150 dark:border-slate-800 space-y-4 text-left">
          <h3 className="font-extrabold font-outfit text-base flex items-center gap-2 border-b border-slate-200/50 dark:border-slate-800/30 pb-2 text-slate-805 dark:text-slate-200">
            <FiBook className="text-primary w-4 h-4" />
            <span>Academic & University Info</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-400">University / School</label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="Massachusetts Institute of Technology"
                className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-400">College / Department</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="School of Engineering"
                className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-400">Department / Branch</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Computer Science"
                className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-400">Course / Degree</label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="B.Tech / M.Sc"
                className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400">Year</label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="3rd Year"
                  className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400">Semester</label>
                <input
                  type="text"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  placeholder="6th"
                  className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Professional Info */}
        <div className="p-6 rounded-2xl glass-card border border-slate-150 dark:border-slate-800 space-y-4 text-left">
          <h3 className="font-extrabold font-outfit text-base flex items-center gap-2 border-b border-slate-200/50 dark:border-slate-800/30 pb-2 text-slate-805 dark:text-slate-200">
            <FiCompass className="text-primary w-4 h-4" />
            <span>Skills, Goals & Biography</span>
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-650 dark:text-slate-400">Skills (Comma-separated)</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="HTML, CSS, JavaScript, React, Node.js"
              className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-650 dark:text-slate-400">Interests (Comma-separated)</label>
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="Web Apps, Artificial Intelligence, Algorithms"
              className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-650 dark:text-slate-400">Career Goal</label>
            <input
              type="text"
              value={careerGoal}
              onChange={(e) => setCareerGoal(e.target.value)}
              placeholder="To become a Staff Cloud Architect."
              className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-650 dark:text-slate-400">Biography / Short Summary</label>
            <textarea
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              rows={4}
              placeholder="Tell professors a bit about your research interests and what you look to achieve from mentoring classes..."
              className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100 resize-none"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 flex items-center gap-2 hover:-translate-y-0.5 transition-all"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FiSave className="w-4 h-4" />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default StudentProfile;
