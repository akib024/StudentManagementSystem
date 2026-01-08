import React, { useEffect, useState } from 'react';
import { BookOpen, ClipboardList, Award } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import enrollmentService from '../../services/enrollmentService';

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    gpa: 0,
  });
  const [enrollments, setEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      setIsLoading(true);
      const [myEnrollments, transcript] = await Promise.all([
        enrollmentService.getMyEnrollments(),
        enrollmentService.getMyTranscript(),
      ]);

      setEnrollments(myEnrollments || []);
      
      const activeEnrollments = myEnrollments?.filter(e => e.status === 'Active').length || 0;
      const completedEnrollments = myEnrollments?.filter(e => e.status === 'Completed').length || 0;

      setStats({
        enrolledCourses: activeEnrollments,
        completedCourses: completedEnrollments,
        gpa: transcript?.gpa || 0,
      });
    } catch (error) {
      console.error('Failed to load student data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Enrolled Courses',
      value: stats.enrolledCourses,
      icon: BookOpen,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Completed Courses',
      value: stats.completedCourses,
      icon: ClipboardList,
      color: 'bg-green-500',
      bgLight: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Current GPA',
      value: stats.gpa.toFixed(2),
      icon: Award,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Student Dashboard</h2>
        <p className="text-gray-600 mt-1">
          Welcome back, {currentUser?.username}! Track your academic progress here.
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
            <span className="font-medium text-gray-700">Browse Courses</span>
          </button>
          <button className="flex items-center gap-3 p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors">
            <ClipboardList className="w-6 h-6 text-green-600" />
            <span className="font-medium text-gray-700">View Enrollments</span>
          </button>
          <button className="flex items-center gap-3 p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
            <Award className="w-6 h-6 text-purple-600" />
            <span className="font-medium text-gray-700">View Transcript</span>
          </button>
        </div>
      </div>

      {/* Current Enrollments */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">My Current Courses</h3>
        {enrollments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No active enrollments. Browse courses to get started!
          </p>
        ) : (
          <div className="space-y-3">
            {enrollments.slice(0, 5).map((enrollment) => (
              <div
                key={enrollment.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{enrollment.courseName}</p>
                  <p className="text-sm text-gray-500">
                    Status: {enrollment.status} | Grade: {enrollment.grade || 'Pending'}
                  </p>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
