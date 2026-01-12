import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ClipboardList, Award, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { enrollmentService } from '../../services/enrollmentService';
import { calculateGPA, getGradeColor, formatDate } from '../../utils/helpers';

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    gpa: 0,
  });
  const [enrollments, setEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      setIsLoading(true);
      const myEnrollments = await enrollmentService.getMyEnrollments();

      setEnrollments(myEnrollments || []);
      
      const activeEnrollments = myEnrollments?.filter(e => e.status === 'Active').length || 0;
      const completedEnrollments = myEnrollments?.filter(e => e.status === 'Completed').length || 0;
      
      // Calculate GPA from graded enrollments
      const gradedEnrollments = myEnrollments?.filter(e => e.grade) || [];
      const grades = gradedEnrollments.map(e => e.grade);
      const gpa = grades.length > 0 ? parseFloat(calculateGPA(grades)) : 0;

      setStats({
        enrolledCourses: activeEnrollments,
        completedCourses: completedEnrollments,
        gpa: gpa,
      });
      setHasError(false);
    } catch (error) {
      console.error('Failed to load student data:', error);
      if (error.response?.status === 404 || error.response?.status === 401) {
        setHasError(true);
        toast.error('Unable to load student data. Please log in with a valid student account (e.g., john.doe / password123)');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (hasError) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Student Dashboard</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">Student Data Not Available</h3>
              <p className="text-yellow-800 mb-3">
                Your account doesn't have student data associated with it. Please log in with a valid student account.
              </p>
              <div className="bg-white rounded px-4 py-3 text-sm">
                <p className="text-gray-700 mb-2">Try these credentials:</p>
                <p className="font-mono text-gray-900">
                  Username: <span className="bg-gray-100 px-2 py-1 rounded">john.doe</span>
                </p>
                <p className="font-mono text-gray-900">
                  Password: <span className="bg-gray-100 px-2 py-1 rounded">password123</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/my-courses" className="flex items-center gap-3 p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span className="font-medium text-gray-700">View My Courses</span>
          </Link>
          <Link to="/reports/transcript" className="flex items-center gap-3 p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
            <Award className="w-6 h-6 text-purple-600" />
            <span className="font-medium text-gray-700">View Transcript</span>
          </Link>
        </div>
      </div>

      {/* Current Enrollments */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">My Current Courses</h3>
          <Link to="/my-courses" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All
          </Link>
        </div>
        {enrollments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No active enrollments. Browse courses to get started!
          </p>
        ) : (
          <div className="space-y-3">
            <div className="hidden md:flex px-4 text-sm font-semibold text-gray-600">
              <div className="flex-1">Course</div>
              <div className="w-56">Instructor & Credits</div>
              <div className="w-24 text-center">Grade</div>
              <div className="w-16 text-right">Action</div>
            </div>
            {enrollments.filter(e => e.status === 'Active').slice(0, 5).map((enrollment) => {
              const courseCode = enrollment.course?.code || enrollment.courseCode || '—';
              const courseName = enrollment.course?.name || enrollment.courseTitle || 'Course';
              const credits = enrollment.course?.credits ?? enrollment.credits ?? '—';
              const teacherName = enrollment.teacherName
                || (enrollment.course?.teacher
                  ? `${enrollment.course.teacher.firstName} ${enrollment.course.teacher.lastName}`
                  : 'Instructor TBD');

              return (
                <div
                  key={enrollment.id}
                  className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {courseCode} - {courseName}
                    </p>
                  </div>
                  <div className="w-56">
                    <p className="text-sm text-gray-500">
                      {teacherName} | {credits} Credits
                    </p>
                  </div>
                  <div className="w-24 text-center">
                    {enrollment.grade ? (
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getGradeColor(enrollment.grade)}`}>
                        {enrollment.grade}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Pending</span>
                    )}
                  </div>
                  <div className="w-16 text-right">
                    <Link 
                      to={`/courses/${enrollment.courseId}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
