import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/constants';
import CoursesListPage from './courses/CoursesListPage';
import StudentResultsPage from './grades/StudentResultsPage';

const MyCoursesPage = () => {
  const { currentUser } = useAuth();

  // Teachers see the courses list (their courses to manage)
  if (currentUser?.role === ROLES.TEACHER) {
    return <CoursesListPage />;
  }

  // Students see their results/enrollments
  if (currentUser?.role === ROLES.STUDENT) {
    return <StudentResultsPage />;
  }

  return null;
};

export default MyCoursesPage;
