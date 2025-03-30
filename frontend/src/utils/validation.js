/**
 * Utility functions for form validation
 */

const validation = {
    // Email validation
    isValidEmail: (email) => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(email);
    },
    
    // Password validation - at least 8 chars, with uppercase, lowercase and number
    isStrongPassword: (password) => {
      if (password.length < 8) return false;
      
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      
      return hasUppercase && hasLowercase && hasNumber;
    },
    
    // Password validation errors
    getPasswordErrors: (password) => {
      const errors = [];
      
      if (!password || password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      }
      
      if (password && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      
      if (password && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
      }
      
      if (password && !/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
      }
      
      return errors;
    },
    
    // Required field validation
    isRequired: (value) => {
      if (value === null || value === undefined) return false;
      
      if (typeof value === 'string') {
        return value.trim() !== '';
      }
      
      return true;
    },
    
    // Minimum length validation
    minLength: (value, length) => {
      if (!value) return false;
      return value.length >= length;
    },
    
    // Maximum length validation
    maxLength: (value, length) => {
      if (!value) return true;
      return value.length <= length;
    },
    
    // URL validation
    isValidUrl: (url) => {
      try {
        new URL(url);
        return true;
      } catch (e) {
        return false;
      }
    },
    
    // Date validation - check if date string is valid
    isValidDate: (dateString) => {
      const date = new Date(dateString);
      return !isNaN(date.getTime());
    },
    
    // Check if end date is after start date
    isEndDateAfterStartDate: (startDate, endDate) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      return end > start;
    },
    
    // Check if a string is a valid MongoDB ObjectID
    isValidObjectId: (id) => {
      return /^[0-9a-fA-F]{24}$/.test(id);
    },
    
    // Number range validation
    isInRange: (value, min, max) => {
      const num = Number(value);
      
      if (isNaN(num)) return false;
      
      if (min !== undefined && num < min) return false;
      if (max !== undefined && num > max) return false;
      
      return true;
    },
    
    // Phone number validation (basic)
    isValidPhone: (phone) => {
      const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
      return phoneRegex.test(phone);
    },
    
    // Check if value is one of the allowed values
    isOneOf: (value, allowedValues) => {
      return allowedValues.includes(value);
    },
    
    // Format validation errors for display
    formatErrors: (errors) => {
      if (!errors) return null;
      
      if (Array.isArray(errors)) {
        return errors.join(', ');
      }
      
      if (typeof errors === 'object') {
        return Object.values(errors).join(', ');
      }
      
      return String(errors);
    },
    
    // Validate form fields using a validation schema
    validateForm: (values, schema) => {
      const errors = {};
      
      Object.keys(schema).forEach(field => {
        const fieldSchema = schema[field];
        const value = values[field];
        
        // Required validation
        if (fieldSchema.required && !validation.isRequired(value)) {
          errors[field] = fieldSchema.requiredMessage || `${fieldSchema.label || field} is required`;
          return;
        }
        
        // Skip other validations if field is empty and not required
        if (!validation.isRequired(value) && !fieldSchema.required) {
          return;
        }
        
        // Min length validation
        if (fieldSchema.minLength && !validation.minLength(value, fieldSchema.minLength)) {
          errors[field] = fieldSchema.minLengthMessage || 
            `${fieldSchema.label || field} must be at least ${fieldSchema.minLength} characters`;
          return;
        }
        
        // Max length validation
        if (fieldSchema.maxLength && !validation.maxLength(value, fieldSchema.maxLength)) {
          errors[field] = fieldSchema.maxLengthMessage || 
            `${fieldSchema.label || field} must be no more than ${fieldSchema.maxLength} characters`;
          return;
        }
        
        // Email validation
        if (fieldSchema.email && !validation.isValidEmail(value)) {
          errors[field] = fieldSchema.emailMessage || 'Please enter a valid email address';
          return;
        }
        
        // Password validation
        if (fieldSchema.password) {
          const passwordErrors = validation.getPasswordErrors(value);
          if (passwordErrors.length > 0) {
            errors[field] = passwordErrors[0];
            return;
          }
        }
        
        // URL validation
        if (fieldSchema.url && !validation.isValidUrl(value)) {
          errors[field] = fieldSchema.urlMessage || 'Please enter a valid URL';
          return;
        }
        
        // Date validation
        if (fieldSchema.date && !validation.isValidDate(value)) {
          errors[field] = fieldSchema.dateMessage || 'Please enter a valid date';
          return;
        }
        
        // Range validation
        if (fieldSchema.min !== undefined || fieldSchema.max !== undefined) {
          if (!validation.isInRange(value, fieldSchema.min, fieldSchema.max)) {
            errors[field] = fieldSchema.rangeMessage || 
              `Please enter a value between ${fieldSchema.min} and ${fieldSchema.max}`;
            return;
          }
        }
        
        // Custom validation
        if (fieldSchema.validate) {
          const customError = fieldSchema.validate(value, values);
          if (customError) {
            errors[field] = customError;
            return;
          }
        }
      });
      
      return {
        isValid: Object.keys(errors).length === 0,
        errors
      };
    }
  };
  
  export default validation;