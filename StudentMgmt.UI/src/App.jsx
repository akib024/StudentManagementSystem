import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoadingProvider } from './contexts/LoadingContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <LoadingProvider>
        <NotificationProvider>
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
                
                {/* Placeholder routes - will implement in later phases */}
                <Route path="students" element={<div className="text-center py-12 text-gray-600">Students page - Coming soon</div>} />
                <Route path="teachers" element={<div className="text-center py-12 text-gray-600">Teachers page - Coming soon</div>} />
                <Route path="courses" element={<div className="text-center py-12 text-gray-600">Courses page - Coming soon</div>} />
                <Route path="enrollments" element={<div className="text-center py-12 text-gray-600">Enrollments page - Coming soon</div>} />
                <Route path="users" element={<div className="text-center py-12 text-gray-600">Users page - Coming soon</div>} />
                <Route path="my-courses" element={<div className="text-center py-12 text-gray-600">My Courses page - Coming soon</div>} />
                <Route path="grades" element={<div className="text-center py-12 text-gray-600">Grades page - Coming soon</div>} />
                <Route path="transcript" element={<div className="text-center py-12 text-gray-600">Transcript page - Coming soon</div>} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </LoadingProvider>
    </AuthProvider>
  );
}

export default App;
