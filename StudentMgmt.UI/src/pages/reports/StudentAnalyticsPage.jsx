import { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';
import { 
  PageHeader, 
  Card, 
  LoadingSpinner,
  Button
} from '../../components/common';
import { TrendingUp, Award, BookOpen, Users, AlertCircle, CheckCircle } from 'lucide-react';

const StudentAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser?.role === ROLES.STUDENT) {
      fetchAnalytics();
    } else {
      setIsLoading(false);
      setError('Analytics only available for students');
    }
  }, [currentUser]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await reportService.getMyAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Analytics error:', err);
      if (err.response?.status === 404) {
        // 404 means no data available, don't show toast
        setError('notfound');
      } else if (err.response?.status === 401) {
        setError('unauthorized');
        toast.error('Please log in to view analytics');
      } else if (!err.response) {
        // Network error or backend not responding
        setError('network');
        toast.error('Cannot connect to server. Please ensure the backend is running.');
      } else {
        setError('general');
        toast.error('Failed to load analytics. Please try again later.');
      }
      setAnalytics(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'Improving':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'Declining':
        return <TrendingUp className="h-5 w-5 text-red-500 transform rotate-180" />;
      case 'Stable':
        return <Award className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'Improving':
        return 'text-green-600';
      case 'Declining':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Academic Analytics" 
          subtitle="Track your academic performance and trends"
        />
        <LoadingSpinner />
      </div>
    );
  }

  if (!analytics && !isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Academic Analytics" 
          subtitle="Track your academic performance and trends"
        />
        <Card>
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No Analytics Data Available</h3>
            <p className="mt-1 text-sm text-gray-500">
              {error === 'notfound' 
                ? 'Complete some courses to see your analytics data.'
                : 'Unable to load analytics. Please try again later.'}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const completionPercentage = (analytics.completionRate * 100).toFixed(0);
  const passPercentage = analytics.coursesInProgress > 0 
    ? ((analytics.coursesCompleted / (analytics.coursesCompleted + analytics.coursesInProgress)) * 100).toFixed(0)
    : 100;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Academic Analytics" 
        subtitle={`${analytics.studentName} - ${analytics.enrollmentNumber}`}
      />

      {/* Overall Performance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Current GPA</p>
              <p className="text-3xl font-bold text-gray-900">
                {analytics.currentGPA !== null ? analytics.currentGPA.toFixed(2) : 'N/A'}
              </p>
            </div>
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Courses Completed</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.coursesCompleted}</p>
            </div>
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">In Progress</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.coursesInProgress}</p>
            </div>
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Academic Trend</p>
              <p className={`text-lg font-bold ${getTrendColor(analytics.academicTrend)}`}>
                {analytics.academicTrend}
              </p>
            </div>
            <div className="flex-shrink-0">
              {getTrendIcon(analytics.academicTrend)}
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-6">Performance Metrics</h3>
        <div className="space-y-6">
          {/* Completion Rate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Completion Rate</span>
              <span className="text-sm font-semibold text-gray-900">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Pass Rate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Course Pass Rate</span>
              <span className="text-sm font-semibold text-gray-900">{passPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  passPercentage >= 80 ? 'bg-green-600' : passPercentage >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                }`}
                style={{ width: `${passPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Failed Courses */}
          {analytics.coursesFailed > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    {analytics.coursesFailed} course{analytics.coursesFailed > 1 ? 's' : ''} failed
                  </p>
                  <p className="text-sm text-red-700">Consider seeking academic support.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Semester Statistics */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Semester Statistics</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Semester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Courses Enrolled
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Courses Completed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Semester GPA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credits Earned
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.semesterStats.map((semester, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {semester.semester}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {semester.coursesEnrolled}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {semester.coursesCompleted}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">
                      {semester.semesterGPA !== null ? semester.semesterGPA.toFixed(2) : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {semester.creditsEarned}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* GPA Trend Analysis */}
      {analytics.currentGPA && analytics.previousSemesterGPA && (
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">GPA Trend Analysis</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Current GPA</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.currentGPA.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Previous Semester GPA</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.previousSemesterGPA.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-900">
              Your GPA has {
                analytics.currentGPA > analytics.previousSemesterGPA
                  ? `improved by ${(analytics.currentGPA - analytics.previousSemesterGPA).toFixed(2)} points`
                  : `declined by ${(analytics.previousSemesterGPA - analytics.currentGPA).toFixed(2)} points`
              } compared to the previous semester.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudentAnalyticsPage;
