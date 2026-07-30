import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setAuthToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Synchronize token state on change
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      setAuthToken(token);
      fetchUserData();
    } else {
      localStorage.removeItem('token');
      setAuthToken(null);
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  }, [token]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // Fetch user profile based on role (using POST to prevent 404/method errors)
      const res = await api.post('/auth/refresh', { token }).catch(() => null);
      let activeToken = token;
      if (res && res.data.success && res.data.token) {
        activeToken = res.data.token;
        localStorage.setItem('token', activeToken);
        setAuthToken(activeToken);
      }

      // Decode or retrieve current logged in user details
      let role = null;
      let userId = null;
      try {
        const parts = activeToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          role = payload.role;
          userId = payload.id;
        }
      } catch (e) {
        console.warn('Failed to decode token on load:', e.message);
      }

      let profileRes;
      let currentUser = null;

      if (role === 'student') {
        try {
          profileRes = await api.get('/student/profile');
          if (profileRes.data.success) {
            setProfile(profileRes.data.profile);
            currentUser = profileRes.data.profile.user;
          }
        } catch (err) {
          console.error('Error fetching student profile:', err.message);
        }
      } else if (role === 'teacher') {
        try {
          profileRes = await api.get('/teacher/profile');
          if (profileRes.data.success) {
            setProfile(profileRes.data.profile);
            currentUser = profileRes.data.profile.user;
          }
        } catch (err) {
          console.error('Error fetching teacher profile:', err.message);
        }
      } else {
        // Fallback guess logic for older tokens that don't have the role property in payload
        try {
          profileRes = await api.get('/student/profile');
          if (profileRes.data.success) {
            setProfile(profileRes.data.profile);
            currentUser = profileRes.data.profile.user;
            role = 'student';
          }
        } catch (err) {
          try {
            profileRes = await api.get('/teacher/profile');
            if (profileRes.data.success) {
              setProfile(profileRes.data.profile);
              currentUser = profileRes.data.profile.user;
              role = 'teacher';
            }
          } catch (err2) {
            // Admin fallback or empty profiles
          }
        }
      }

      if (currentUser) {
        setUser(currentUser);
      } else if (userId) {
        setUser({ _id: userId, role: role || 'student' });
      } else {
        throw new Error('Invalid session, user not authenticated');
      }
    } catch (err) {
      console.error('Error fetching user data:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password });
      if (res.data.success) {
        const { token: userToken, ...userData } = res.data;
        setUser(userData);
        setToken(userToken);
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please verify credentials.'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (signUpData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', signUpData);
      if (res.data.success) {
        const { token: userToken, ...userData } = res.data;
        setUser(userData);
        setToken(userToken);
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed.'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Backend logout call failed:', err.message);
    } finally {
      setToken(null);
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const endpoint = user.role === 'student' ? '/student/profile' : '/teacher/profile';
      const res = await api.get(endpoint);
      if (res.data.success) {
        setProfile(res.data.profile);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err.message);
    }
  };

  const updateProfile = async (formData, isTeacher) => {
    try {
      const endpoint = isTeacher ? '/teacher/profile' : '/student/profile';
      // Form data could be multipart/form-data for uploads
      const config = {
        headers: {
          'Content-Type': formData instanceof FormData ? 'multipart/form-data' : 'application/json'
        }
      };
      const res = await api.put(endpoint, formData, config);
      if (res.data.success) {
        setProfile(res.data.profile);
        return { success: true, profile: res.data.profile };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update profile.'
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        loading,
        login,
        register,
        logout,
        fetchProfile,
        updateProfile,
        isAuthenticated: !!token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
