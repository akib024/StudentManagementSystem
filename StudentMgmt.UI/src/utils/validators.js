// Validation rules
export const validators = {
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return 'Email is required';
    if (!emailRegex.test(value)) return 'Invalid email format';
    return '';
  },

  password: (value) => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return '';
  },

  username: (value) => {
    if (!value) return 'Username is required';
    if (value.length < 3) return 'Username must be at least 3 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return '';
  },

  fullName: (value) => {
    if (!value) return 'Full name is required';
    if (value.length < 2) return 'Name must be at least 2 characters';
    if (!/^[a-zA-Z\s]+$/.test(value)) {
      return 'Name can only contain letters and spaces';
    }
    return '';
  },

  phoneNumber: (value) => {
    if (!value) return 'Phone number is required';
    const phoneRegex = /^[0-9\s\-\(\)\+]+$/;
    if (!phoneRegex.test(value)) return 'Invalid phone number format';
    return '';
  },

  studentId: (value) => {
    if (!value) return 'Student ID is required';
    if (value.length < 3) return 'Student ID must be at least 3 characters';
    return '';
  },

  courseName: (value) => {
    if (!value) return 'Course name is required';
    if (value.length < 3) return 'Course name must be at least 3 characters';
    return '';
  },

  courseCode: (value) => {
    if (!value) return 'Course code is required';
    if (!/^[A-Z]{2,4}\d{3,4}$/.test(value)) {
      return 'Course code format: ABC123 or ABC1234';
    }
    return '';
  },

  credits: (value) => {
    if (!value) return 'Credits are required';
    const num = Number(value);
    if (isNaN(num) || num <= 0) return 'Credits must be a positive number';
    if (num > 12) return 'Credits cannot exceed 12';
    return '';
  },

  grade: (value) => {
    const validGrades = ['A', 'B', 'C', 'D', 'F'];
    if (!value) return 'Grade is required';
    if (!validGrades.includes(value)) return 'Invalid grade';
    return '';
  },

  date: (value) => {
    if (!value) return 'Date is required';
    const date = new Date(value);
    if (isNaN(date.getTime())) return 'Invalid date format';
    return '';
  },

  required: (value, fieldName = 'This field') => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} is required`;
    }
    return '';
  },

  minLength: (value, minLength, fieldName = 'This field') => {
    if (!value) return '';
    if (value.length < minLength) {
      return `${fieldName} must be at least ${minLength} characters`;
    }
    return '';
  },

  maxLength: (value, maxLength, fieldName = 'This field') => {
    if (!value) return '';
    if (value.length > maxLength) {
      return `${fieldName} must not exceed ${maxLength} characters`;
    }
    return '';
  },

  match: (value, pattern, message = 'Invalid format') => {
    if (!value) return '';
    if (!pattern.test(value)) return message;
    return '';
  },
};

// Validate form data
export const validateForm = (formData, rules) => {
  const errors = {};
  Object.keys(rules).forEach((field) => {
    const rule = rules[field];
    const value = formData[field];
    if (typeof rule === 'function') {
      const error = rule(value);
      if (error) errors[field] = error;
    }
  });
  return errors;
};

// Check if form has errors
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};
