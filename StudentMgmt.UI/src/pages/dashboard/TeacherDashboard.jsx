import React, { useEffect, useState } from 'react';
import { BookOpen, Users, ClipboardList } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const TeacherDashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    myCourses: 0,
    totalStudents: 0,
    pendingGrades: 0,
  });

  useEffect(() => {
    // TODO: Load teacher-specific stats
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Placeholder - will implement when teacher endpoints are ready
      setStats({
        myCourses: 5,
        totalStudents: 120,
        pendingGrades: 15,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const statCards = [
    {
      title: 'My Courses',
      value: stats.myCourses,
      icon: BookOpen,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'bg-green-500',
      bgLight: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Pending Grades',
      value: stats.pendingGrades,
      icon: ClipboardList,
      color: 'bg-orange-500',
      bgLight: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h2>
        <p className="text-gray-600 mt-1">
          Welcome back, {currentUser?.username}! Here's your teaching overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gray-800">{card.value}</p>
              </div>
              <div className={`${card.bgLight} p-3 rounded-lg`}>
                <card.icon className={`w-8 h-8 ${card.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span className="font-medium text-gray-700">View My Courses</span>
          </button>
          <button className="flex items-center gap-3 p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors">
            <Users className="w-6 h-6 text-green-600" />
            <span className="font-medium text-gray-700">View Students</span>
          </button>
          <button className="flex items-center gap-3 p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
            <ClipboardList className="w-6 h-6 text-orange-600" />
            <span className="font-medium text-gray-700">Submit Grades</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-700">CS101 - Introduction to Programming</p>
              <p className="text-sm text-gray-500">45 students enrolled</p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-700">CS202 - Data Structures</p>
              <p className="text-sm text-gray-500">38 students enrolled</p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
