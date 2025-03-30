import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  // Check if user is already logged in when the app loads
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const userData = await authService.getCurrentUser();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Authentication check failed:', err);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.login(email, password);
      setUser(response.data);
      setIsAuthenticated(true);
      localStorage.setItem('token', response.token);
      navigate('/dashboard');
      return response;
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.register(userData);
      setUser(response.data);
      setIsAuthenticated(true);
      localStorage.setItem('token', response.token);
      navigate('/dashboard');
      return response;
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      // Even if logout API fails, clear local state
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.updateProfile(profileData);
      setUser(response.data);
      return response;
    } catch (err) {
      console.error('Profile update failed:', err);
      setError(err.response?.data?.message || 'Profile update failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update alert preferences
  const updateAlertPreferences = async (preferences) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.updateAlertPreferences(preferences);
      
      // Update only the alert preferences in the user object
      setUser(prevUser => ({
        ...prevUser,
        alertPreferences: response.data
      }));
      
      return response;
    } catch (err) {
      console.error('Alert preferences update failed:', err);
      setError(err.response?.data?.message || 'Alert preferences update failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has admin role
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  // Check if user has organizer role
  const isOrganizer = () => {
    return user?.role === 'organizer' || user?.role === 'admin';
  };

  // Check if user is owner of an event
  const isEventOwner = (eventOwnerId) => {
    return user?.id === eventOwnerId || user?.role === 'admin';
  };

  // Check if user is organizer of an event
  const isEventOrganizer = (event) => {
    if (user?.role === 'admin') return true;
    if (user?.id === event.owner) return true;
    return event.organizers?.includes(user?.id);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    updateAlertPreferences,
    isAdmin,
    isOrganizer,
    isEventOwner,
    isEventOrganizer
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;