import api from './api';

const authService = {
  // Login user
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Logout user
  logout: async () => {
    try {
      await api.get('/auth/logout');
      localStorage.removeItem('token');
      return true;
    } catch (error) {
      localStorage.removeItem('token');
      throw error;
    }
  },
  
  // Get current user info
  getCurrentUser: async () => {
    try {
      if (!localStorage.getItem('token')) {
        return null;
      }
      
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        return null;
      }
      throw error;
    }
  },
  
  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/update-details', profileData);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Update user password
  updatePassword: async (passwordData) => {
    try {
      const response = await api.put('/auth/update-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Update alert preferences
  updateAlertPreferences: async (preferences) => {
    try {
      const response = await api.put('/auth/alert-preferences', {
        alertPreferences: preferences
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Request password reset
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', {
        email
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Reset password with token
  resetPassword: async (token, password) => {
    try {
      const response = await api.put(`/auth/reset-password/${token}`, {
        password
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default authService;