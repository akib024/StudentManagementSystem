import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoadingProvider } from './contexts/LoadingContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ToastProvider } from './contexts/ToastContext';
import ToastContainer from './components/common/ToastContainer';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Student Pages
import { 
  StudentsListPage, 
  CreateStudentPage, 
  EditStudentPage, 
  StudentDetailPage 
} from './pages/students';

// Teacher Pages
import { 
  TeachersListPage, 
  CreateTeacherPage, 
  EditTeacherPage, 
  TeacherDetailPage 
} from './pages/teachers';

// Course Pages
import { 
  CoursesListPage, 
  CreateCoursePage, 
  EditCoursePage, 
  CourseDetailPage 
} from './pages/courses';

// Enrollment Pages
import { 
  EnrollmentsListPage, 
  EnrollStudentPage, 
  EnrollmentDetailPage 
} from './pages/enrollments';

// Grade Pages
import TeacherGradesPage from './pages/grades/TeacherGradesPage';
import StudentResultsPage from './pages/grades/StudentResultsPage';
import MyCoursesPage from './pages/MyCoursesPage';

// Report Pages
import StudentTranscriptPage from './pages/reports/StudentTranscriptPage';
import GradeReportPage from './pages/reports/GradeReportPage';
import StudentAnalyticsPage from './pages/reports/StudentAnalyticsPage';

import { ROLES } from './utils/constants';

function App() {
  return (
    <AuthProvider>
      <LoadingProvider>
        <NotificationProvider>
          <ToastProvider>
            <ToastContainer />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<ProfilePage />} />
                
                {/* Student Routes - Admin and Staff */}
                <Route 
                  path="students" 
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER]}>
                      <StudentsListPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="students/new" 
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER]}>
                      <CreateStudentPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="students/:id" 
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER]}>
                      <StudentDetailPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="students/:id/edit" 
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER]}>
                      <EditStudentPage />
                    </ProtectedRoute>
                  } 
                />

                {/* Teacher Routes - Admin only */}
                <Route 
                  path="teachers" 
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                      <TeachersListPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="teachers/new" 
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                      <CreateTeacherPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="teachers/:id" 
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                      <TeacherDetailPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="teachers/:id/edit" 
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                      <EditTeacherPage />
                    </ProtectedRoute>
                  } 
                />

                {/* Course Routes - Admin and Teachers */}
                <Route 
                  path="courses" 
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER]}>
                      <CoursesListPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="courses/new" 
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                      <CreateCoursePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="courses/:id" 
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT]}>
                      <CourseDetailPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="courses/:id/edit" 
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                      <EditCoursePage />
                    </ProtectedRoute>
                  } 
                />

                {/* Placeholder routes - will implement in later phases */}
                <Route 
                  path="enrollments" 
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER]}>
                      <EnrollmentsListPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="enrollments/enroll" 
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                      <EnrollStudentPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="enrollments/:id" 
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER]}>
                      <EnrollmentDetailPage />
                    </ProtectedRoute>
                  } 
                />

                {/* Grades Routes */}
                <Route 
                  path="grades" 
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
                      <TeacherGradesPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="results" 
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                      <StudentResultsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="my-courses" 
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.STUDENT, ROLES.TEACHER]}>
                      <MyCoursesPage />
                    </ProtectedRoute>
                  } 
                />

                {/* Report Routes */}
                <Route 
                  path="reports/transcript" 
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                      <StudentTranscriptPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="reports/transcript/:studentId" 
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.STUDENT, ROLES.TEACHER, ROLES.ADMIN]}>
                      <StudentTranscriptPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="reports/grades" 
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.ADMIN]}>
                      <GradeReportPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="reports/analytics" 
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                      <StudentAnalyticsPage />
                    </ProtectedRoute>
                  } 
                />

                <Route path="users" element={<div className="text-center py-12 text-gray-600">Users page - Coming soon</div>} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
          </ToastProvider>
        </NotificationProvider>
      </LoadingProvider>
    </AuthProvider>
  );
}

export default App;
