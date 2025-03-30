/**
 * Centralized error handling utility
 * Provides consistent error handling across the application
 */

const errorHandler = {
    // Process API error response and return user-friendly message
    getErrorMessage: (error) => {
      // If error has a response from the server
      if (error.response) {
        // Use message from response if available
        if (error.response.data && error.response.data.message) {
          return error.response.data.message;
        }
        
        // If multiple errors in response
        if (error.response.data && error.response.data.errors) {
          if (Array.isArray(error.response.data.errors)) {
            return error.response.data.errors.map(err => err.message || err).join(', ');
          } else {
            return Object.values(error.response.data.errors).join(', ');
          }
        }
        
        // Generic messages based on status code
        switch (error.response.status) {
          case 400:
            return 'Invalid request. Please check your input.';
          case 401:
            return 'Authentication required. Please log in again.';
          case 403:
            return 'You do not have permission to perform this action.';
          case 404:
            return 'The requested resource was not found.';
          case 409:
            return 'Conflict with current state of the resource.';
          case 422:
            return 'Validation failed. Please check your input.';
          case 429:
            return 'Too many requests. Please try again later.';
          case 500:
            return 'An unexpected server error occurred. Please try again later.';
          default:
            return `Request failed with status ${error.response.status}`;
        }
      }
      
      // Network errors
      if (error.request && !error.response) {
        return 'Network error. Please check your internet connection.';
      }
      
      // Other errors
      return error.message || 'An unexpected error occurred';
    },
    
    // Log error to console (and potentially to monitoring service)
    logError: (error, context = {}) => {
      const errorInfo = {
        message: error.message || 'Unknown error',
        stack: error.stack,
        context,
        timestamp: new Date().toISOString()
      };
      
      // Add response data if available
      if (error.response) {
        errorInfo.status = error.response.status;
        errorInfo.statusText = error.response.statusText;
        errorInfo.data = error.response.data;
      }
      
      console.error('Application error:', errorInfo);
      
      // In a production app, you would send this to an error monitoring service
      // Example: Sentry.captureException(error, { extra: context });
      
      return errorInfo;
    },
    
    // Handle specific types of errors with custom logic
    handleAuthError: (error) => {
      // Check for authentication errors
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        // If token is expired, redirect to login
        if (error.response.data?.message?.includes('expired')) {
          localStorage.removeItem('token');
          window.location.href = '/login?expired=true';
          return true;
        }
        
        // Other auth errors
        return {
          type: 'auth',
          message: errorHandler.getErrorMessage(error)
        };
      }
      
      return false;
    },
    
    // Format validation errors from backend
    formatValidationErrors: (error) => {
      if (!error.response || !error.response.data) {
        return null;
      }
      
      const { data } = error.response;
      
      // Different backends might format validation errors differently
      // Handle common patterns
      
      // Pattern 1: { errors: { field1: 'message1', field2: 'message2' } }
      if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
        return data.errors;
      }
      
      // Pattern 2: { errors: [{ field: 'field1', message: 'message1' }, ...] }
      if (data.errors && Array.isArray(data.errors)) {
        return data.errors.reduce((acc, err) => {
          if (err.field) {
            acc[err.field] = err.message;
          }
          return acc;
        }, {});
      }
      
      // Pattern 3: { field1: ['error1', 'error2'], field2: ['error3'] }
      const fieldErrors = {};
      let hasFieldErrors = false;
      
      Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          fieldErrors[key] = value.join(', ');
          hasFieldErrors = true;
        }
      });
      
      if (hasFieldErrors) {
        return fieldErrors;
      }
      
      return null;
    },
    
    // Create an error object with standard format
    createError: (message, code = 'ERROR', details = null) => {
      const error = new Error(message);
      error.code = code;
      error.details = details;
      return error;
    }
  };
  
  export default errorHandler;