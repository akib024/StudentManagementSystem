import { GRADE_POINTS } from './constants';

// Format date to readable string
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format date and time
export const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Calculate GPA from grades
export const calculateGPA = (grades) => {
  if (!grades || grades.length === 0) return 0;
  const totalPoints = grades.reduce(
    (sum, grade) => sum + (GRADE_POINTS[grade] || 0),
    0
  );
  return (totalPoints / grades.length).toFixed(2);
};

// Get grade color for UI
export const getGradeColor = (grade) => {
  const colors = {
    A: 'text-green-600 bg-green-50',
    B: 'text-blue-600 bg-blue-50',
    C: 'text-yellow-600 bg-yellow-50',
    D: 'text-orange-600 bg-orange-50',
    F: 'text-red-600 bg-red-50',
  };
  return colors[grade] || 'text-gray-600 bg-gray-50';
};

// Get status badge color
export const getStatusColor = (status) => {
  const colors = {
    Active: 'text-green-600 bg-green-50',
    Completed: 'text-blue-600 bg-blue-50',
    Withdrawn: 'text-gray-600 bg-gray-50',
    Failed: 'text-red-600 bg-red-50',
  };
  return colors[status] || 'text-gray-600 bg-gray-50';
};

// Truncate text
export const truncateText = (text, length = 50) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

// Format phone number
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

// Check if email is valid
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Convert object to query string
export const objectToQueryString = (obj) => {
  if (!obj || Object.keys(obj).length === 0) return '';
  return (
    '?' +
    Object.keys(obj)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
      .join('&')
  );
};
