import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';
import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';

const DashboardPage = () => {
  const { currentUser } = useAuth();

  const renderDashboard = () => {
    switch (currentUser?.role) {
      case ROLES.ADMIN:
        return <AdminDashboard />;
      case ROLES.TEACHER:
        return <TeacherDashboard />;
      case ROLES.STUDENT:
        return <StudentDashboard />;
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-600">Invalid user role. Please contact support.</p>
          </div>
        );
    }
  };

  return <div>{renderDashboard()}</div>;
};

export default DashboardPage;
