import React, { useEffect, useState } from 'react';
import { Users, BookOpen, ClipboardList, UserCheck } from 'lucide-react';
import studentService from '../../services/studentService';
import courseService from '../../services/courseService';
import enrollmentService from '../../services/enrollmentService';
import teacherService from '../../services/teacherService';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const [students, teachers, courses, enrollments] = await Promise.all([
        studentService.getAllStudents(),
        teacherService.getAllTeachers(),
        courseService.getAllCourses(),
        enrollmentService.getAllEnrollments(),
      ]);

      setStats({
        totalStudents: students?.length || 0,
        totalTeachers: teachers?.length || 0,
        totalCourses: courses?.length || 0,
        totalEnrollments: enrollments?.length || 0,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Teachers',
      value: stats.totalTeachers,
      icon: UserCheck,
      color: 'bg-green-500',
      bgLight: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Total Courses',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Total Enrollments',
      value: stats.totalEnrollments,
      icon: ClipboardList,
      color: 'bg-orange-500',
      bgLight: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h2>
        <p className="text-gray-600 mt-1">Welcome back! Here's your system overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`${card.bgLight} p-3.5 rounded-xl`}>
                <card.icon className={`w-7 h-7 ${card.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-5">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 group">
            <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow transition-shadow">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className="font-medium text-gray-700">Add Student</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 hover:border-green-300 transition-all duration-200 group">
            <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow transition-shadow">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <span className="font-medium text-gray-700">Add Teacher</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 hover:border-purple-300 transition-all duration-200 group">
            <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow transition-shadow">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <span className="font-medium text-gray-700">Add Course</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 hover:border-orange-300 transition-all duration-200 group">
            <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow transition-shadow">
              <ClipboardList className="w-5 h-5 text-orange-600" />
            </div>
            <span className="font-medium text-gray-700">Manage Enrollments</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
