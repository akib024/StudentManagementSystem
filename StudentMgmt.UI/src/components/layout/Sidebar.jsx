import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  UserCheck,
  GraduationCap,
  X,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../utils/constants';

const Sidebar = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();

  const getNavigationItems = () => {
    const role = currentUser?.role;

    const commonItems = [
      {
        name: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
      },
    ];

    if (role === ROLES.ADMIN) {
      return [
        ...commonItems,
        { name: 'Students', path: '/students', icon: GraduationCap },
        { name: 'Teachers', path: '/teachers', icon: UserCheck },
        { name: 'Courses', path: '/courses', icon: BookOpen },
        { name: 'Enrollments', path: '/enrollments', icon: ClipboardList },
        { name: 'Users', path: '/users', icon: Users },
      ];
    }

    if (role === ROLES.TEACHER) {
      return [
        ...commonItems,
        { name: 'My Courses', path: '/my-courses', icon: BookOpen },
        { name: 'Students', path: '/students', icon: GraduationCap },
        { name: 'Grades', path: '/grades', icon: ClipboardList },
        { name: 'Grade Reports', path: '/reports/grades', icon: BarChart3 },
      ];
    }

    if (role === ROLES.STUDENT) {
      return [
        ...commonItems,
        { name: 'My Courses', path: '/my-courses', icon: BookOpen },
        { name: 'Transcript', path: '/reports/transcript', icon: GraduationCap },
        { name: 'Analytics', path: '/reports/analytics', icon: BarChart3 },
      ];
    }

    return commonItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-blue-400" />
            <span className="text-lg font-semibold">SMS</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded hover:bg-gray-800"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onClose()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 text-center">
            <p>Student Management System</p>
            <p className="mt-1">Version 1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
