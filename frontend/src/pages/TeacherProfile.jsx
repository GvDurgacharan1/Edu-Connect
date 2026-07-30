import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { motion } from 'framer-motion';
import {
  FiUser, FiFileText, FiAward, FiMapPin, FiPhone, FiBook,
  FiCompass, FiActivity, FiSave, FiUpload, FiLinkedin, FiGlobe, FiDollarSign, FiClock
} from 'react-icons/fi';

export const TeacherProfile = () => {
  const { profile, updateProfile } = useAuth();
  const { showToast } = useNotifications();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isCompleting = searchParams.get('complete') === 'true';

  // Form fields
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [qualification, setQualification] = useState('');
  const [currentPosition, setCurrentPosition] = useState('');
  const [university, setUniversity] = useState('');
  const [experience, setExperience] = useState('');
  const [subjects, setSubjects] = useState('');
  const [skills, setSkills] = useState('');
  const [languages, setLanguages] = useState('');
  const [biography, setBiography] = useState('');
  const [teachingStyle, setTeachingStyle] = useState('');
  const [fees, setFees] = useState('');
  const [availableDays, setAvailableDays] = useState([]);
  const [availableTime, setAvailableTime] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');

  // File Upload State
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [certificatesFiles, setCertificatesFiles] = useState([]);
  
  const [loading, setLoading] = useState(false);

  // Sync profile details into inputs
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setAge(profile.age || '');
      setGender(profile.gender || '');
      setPhone(profile.phone || '');
      setQualification(profile.qualification || '');
      setCurrentPosition(profile.currentPosition || '');
      setUniversity(profile.university || '');
      setExperience(profile.experience || '');
      setSubjects(profile.subjects?.join(', ') || '');
      setSkills(profile.skills?.join(', ') || '');
      setLanguages(profile.languages?.join(', ') || '');
      setBiography(profile.biography || '');
      setTeachingStyle(profile.teachingStyle || '');
      setFees(profile.fees || '');
      setAvailableDays(profile.availableDays || []);
      setAvailableTime(profile.availableTime || '');
      setLinkedin(profile.linkedin || '');
      setWebsite(profile.website || '');
      setLocation(profile.location || '');
      setAvatarPreview(profile.avatar || '');
    }
  }, [profile]);

  const handleDayToggle = (day) => {
    setAvailableDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

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
    formData.append('qualification', qualification);
    formData.append('currentPosition', currentPosition);
    formData.append('university', university);
    formData.append('experience', experience);
    formData.append('subjects', subjects);
    formData.append('skills', skills);
    formData.append('languages', languages);
    formData.append('biography', biography);
    formData.append('teachingStyle', teachingStyle);
    formData.append('fees', fees);
    formData.append('availableTime', availableTime);
    formData.append('linkedin', linkedin);
    formData.append('website', website);
    formData.append('location', location);

    availableDays.forEach(day => {
      formData.append('availableDays', day);
    });

    if (avatarFile) formData.append('avatar', avatarFile);
    if (resumeFile) formData.append('resume', resumeFile);
    
    if (certificatesFiles.length > 0) {
      for (let i = 0; i < certificatesFiles.length; i++) {
        formData.append('certificates', certificatesFiles[i]);
      }
    }

    const res = await updateProfile(formData, true);
    setLoading(false);

    if (res && res.success) {
      showToast('Profile Saved!', 'Your professor profile has been updated successfully.', 'success');
      if (isCompleting) {
        navigate('/teacher/dashboard');
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
              Complete Your Teacher Profile
            </h3>
            <p className="text-xs text-slate-655 dark:text-slate-400 mt-1">
              Please enter your details, hourly fees, availability, and certificates to receive booking requests.
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
            <h4 className="font-bold text-sm">Profile Portrait</h4>
            <p className="text-[11px] text-slate-500 max-w-xs">
              Upload a professional portrait image (JPG, JPEG, PNG).
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
            <span>Professor Identity</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-400">Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. John Doe"
                className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-400">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="42"
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
                  placeholder="Boston, USA"
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
            <span>Academic Qualifications & University</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-400">Qualification Degree</label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="Ph.D. in Distributed Systems"
                className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-400">Current Position</label>
              <input
                type="text"
                value={currentPosition}
                onChange={(e) => setCurrentPosition(e.target.value)}
                placeholder="Senior Research Fellow"
                className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-400">University / Affiliation</label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="Harvard University"
                className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-400">Experience (Years) *</label>
              <input
                type="number"
                required
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="8"
                className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-650 dark:text-slate-400">Subjects Taught (Comma-separated)</label>
            <input
              type="text"
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
              placeholder="Web Development, Database Management, Algorithms"
              className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-400">Expertise Skills (Comma-separated)</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, MongoDB, Cloud Services, Python"
                className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-400">Languages (Comma-separated)</label>
              <input
                type="text"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                placeholder="English, Spanish, French"
                className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Availability & Fees */}
        <div className="p-6 rounded-2xl glass-card border border-slate-150 dark:border-slate-800 space-y-4 text-left">
          <h3 className="font-extrabold font-outfit text-base flex items-center gap-2 border-b border-slate-200/50 dark:border-slate-800/30 pb-2 text-slate-805 dark:text-slate-200">
            <FiClock className="text-primary w-4 h-4" />
            <span>Availability & Pricing Parameters</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-655 dark:text-slate-400">Hourly Session Fees (₹) *</label>
              <div className="relative">
                <FiDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="number"
                  required
                  value={fees}
                  onChange={(e) => setFees(e.target.value)}
                  placeholder="50"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-400">Daily Slots Hours</label>
              <input
                type="text"
                value={availableTime}
                onChange={(e) => setAvailableTime(e.target.value)}
                placeholder="09:00 - 17:00"
                className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-650 dark:text-slate-400 block">Available Days</label>
            <div className="flex flex-wrap gap-2">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    availableDays.includes(day)
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Details & Documents */}
        <div className="p-6 rounded-2xl glass-card border border-slate-150 dark:border-slate-800 space-y-4 text-left">
          <h3 className="font-extrabold font-outfit text-base flex items-center gap-2 border-b border-slate-200/50 dark:border-slate-800/30 pb-2 text-slate-805 dark:text-slate-200">
            <FiCompass className="text-primary w-4 h-4" />
            <span>Biography, Method & Documents</span>
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-650 dark:text-slate-400">Biography / Research Summary</label>
            <textarea
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              rows={4}
              placeholder="Detail your research fields, publications, and background..."
              className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100 resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-650 dark:text-slate-400">Teaching Philosophy / Style</label>
            <textarea
              value={teachingStyle}
              onChange={(e) => setTeachingStyle(e.target.value)}
              rows={3}
              placeholder="Hands-on coding, academic theory matching, board problem solving..."
              className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-655 dark:text-slate-400">LinkedIn URL</label>
              <div className="relative">
                <FiLinkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-655 dark:text-slate-400">Personal Website / Scholar URL</label>
              <div className="relative">
                <FiGlobe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://username.github.io"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass-input text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* PDF files uploads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-400">Upload Professional Resume (PDF)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files[0])}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
              {profile?.resume && (
                <p className="text-[10px] text-emerald-500 font-semibold">
                  ✓ Current Resume PDF uploaded.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-400">Upload Degrees / Certificates</label>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setCertificatesFiles(Array.from(e.target.files))}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
              {profile?.certificates?.length > 0 && (
                <p className="text-[10px] text-emerald-500 font-semibold">
                  ✓ {profile.certificates.length} certificates currently stored.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
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

export default TeacherProfile;
