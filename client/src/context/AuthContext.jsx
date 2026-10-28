import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('imovies_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('imovies_token');
      const storedUser = localStorage.getItem('imovies_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        try {
          // Verify with backend
          const res = await api.get('/auth/profile');
          if (res.data?.success) {
            setUser(res.data.user);
            localStorage.setItem('imovies_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session verification failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      const { token: newToken, user: userData } = res.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('imovies_token', newToken);
      localStorage.setItem('imovies_user', JSON.stringify(userData));
      return { success: true, user: userData };
    }
    return { success: false, message: res.data?.message || 'Login failed' };
  };

  const register = async (name, email, password, phone, role = 'user') => {
    const res = await api.post('/auth/register', { name, email, password, phone, role });
    if (res.data?.success) {
      const { token: newToken, user: userData } = res.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('imovies_token', newToken);
      localStorage.setItem('imovies_user', JSON.stringify(userData));
      return { success: true, user: userData };
    }
    return { success: false, message: res.data?.message || 'Registration failed' };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('imovies_token');
    localStorage.removeItem('imovies_user');
  };

  const updateProfile = async (updatedData) => {
    const res = await api.put('/auth/profile', updatedData);
    if (res.data?.success) {
      setUser(res.data.user);
      localStorage.setItem('imovies_user', JSON.stringify(res.data.user));
      return { success: true, user: res.data.user };
    }
    return { success: false, message: res.data?.message || 'Update failed' };
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
