// API Configuration
export const API_BASE_URL = 'http://localhost:5154/api';
export const API_TIMEOUT = 30000; // 30 seconds

// User Roles
export const ROLES = {
  ADMIN: 'Admin',
  TEACHER: 'Teacher',
  STUDENT: 'Student',
};

// Enrollment Status
export const ENROLLMENT_STATUS = {
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  DROPPED: 'Dropped',
  WITHDRAWN: 'Withdrawn',
  FAILED: 'Failed',
};

export const ENROLLMENT_STATUS_OPTIONS = [
  { value: 'Active', label: 'Active', color: 'green' },
  { value: 'Completed', label: 'Completed', color: 'blue' },
  { value: 'Dropped', label: 'Dropped', color: 'gray' },
  { value: 'Failed', label: 'Failed', color: 'red' },
  { value: 'Withdrawn', label: 'Withdrawn', color: 'yellow' },
];

// Grade Grades
export const GRADES = {
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
  F: 'F',
};

// Grade Points
export const GRADE_POINTS = {
  A: 4.0,
  B: 3.0,
  C: 2.0,
  D: 1.0,
  F: 0.0,
};

// Grade Options for Dropdown
export const GRADE_OPTIONS = ['A', 'B', 'C', 'D', 'F'];

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// Local Storage Keys
export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  CURRENT_USER: 'current_user',
};
