import { useState, useEffect } from 'react';
import { enrollmentService } from '../../services/enrollmentService';
import { useToast } from '../../contexts/ToastContext';
import { 
  PageHeader, 
  Card, 
  PageLoader
} from '../../components/common';
import { 
  BookOpen, 
  Award, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { getGradeColor, calculateGPA, formatDate } from '../../utils/helpers';
import { GRADE_POINTS } from '../../utils/constants';

const StudentResultsPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [transcript, setTranscript] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current'); // current or completed
  const toast = useToast();

  useEffect(() => {
    fetchMyResults();
  }, []);

  const fetchMyResults = async () => {
    try {
      setIsLoading(true);
      const [enrollmentsData, transcriptData] = await Promise.all([
        enrollmentService.getMyEnrollments(),
        enrollmentService.getMyTranscript()
      ]);
      setEnrollments(enrollmentsData);
      setTranscript(transcriptData);
    } catch (err) {
      toast.error(err.message || 'Failed to load results');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = () => {
    const active = enrollments.filter((e) => e.status === 'Active').length;
    const completed = enrollments.filter((e) => e.status === 'Completed').length;
    const gradedEnrollments = enrollments.filter((e) => e.grade);
    const grades = gradedEnrollments.map((e) => e.grade);
    const gpa = grades.length > 0 ? calculateGPA(grades) : 0;
    const totalCredits = enrollments
      .filter((e) => e.status === 'Completed' && e.grade)
      .reduce((sum, e) => sum + (e.credits || 0), 0);

    return {
      active,
      completed,
      gpa,
      totalCredits,
      totalCourses: enrollments.length,
    };
  };

  const getFilteredEnrollments = () => {
    if (activeTab === 'current') {
      return enrollments.filter((e) => e.status === 'Active');
    }
    return enrollments.filter((e) => e.status === 'Completed');
  };

  const getSemesterGPA = (semesterEnrollments) => {
    const grades = semesterEnrollments
      .filter((e) => e.grade)
      .map((e) => e.grade);
    return grades.length > 0 ? calculateGPA(grades) : 'N/A';
  };

  const groupBySemester = (enrollmentList) => {
    // Group by enrolledAt date
    const grouped = {};
    enrollmentList.forEach((enrollment) => {
      const date = new Date(enrollment.enrolledAt);
      const semester = `${date.getFullYear()} - Semester ${Math.ceil((date.getMonth() + 1) / 6)}`;
      if (!grouped[semester]) {
        grouped[semester] = [];
      }
      grouped[semester].push(enrollment);
    });
    return grouped;
  };

  if (isLoading) {
    return <PageLoader text="Loading your results..." />;
  }

  const stats = calculateStats();
  const filteredEnrollments = getFilteredEnrollments();
  const semesterGroups = groupBySemester(filteredEnrollments);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Results"
        subtitle="View your academic performance and grades"
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-indigo-500" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Overall GPA</div>
              <div className="text-2xl font-bold text-gray-900">{stats.gpa}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Credits Earned</div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalCredits}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Active Courses</div>
              <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Completed</div>
              <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Grade Summary */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Grade Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(GRADE_POINTS).map(([grade, points]) => {
            const count = enrollments.filter((e) => e.grade === grade).length;
            return (
              <div key={grade} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${getGradeColor(grade)} font-bold text-lg mb-2`}>
                  {grade}
                </div>
                <div className="text-sm text-gray-500">Grade {grade}</div>
                <div className="text-xl font-bold text-gray-900">{count}</div>
                <div className="text-xs text-gray-400">{points} points</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('current')}
            className={`${
              activeTab === 'current'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Current Courses ({stats.active})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`${
              activeTab === 'completed'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Completed Courses ({stats.completed})
          </button>
        </nav>
      </div>

      {/* Results by Semester */}
      {filteredEnrollments.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No {activeTab} courses
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any {activeTab} courses yet.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(semesterGroups).map(([semester, semesterEnrollments]) => {
            const semesterGPA = getSemesterGPA(semesterEnrollments);
            const semesterCredits = semesterEnrollments
              .filter((e) => e.grade)
              .reduce((sum, e) => sum + (e.credits || 0), 0);

            return (
              <Card key={semester}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{semester}</h3>
                    <p className="text-sm text-gray-500">
                      {semesterEnrollments.length} course{semesterEnrollments.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {activeTab === 'completed' && (
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Semester GPA</div>
                      <div className="text-2xl font-bold text-indigo-600">{semesterGPA}</div>
                      <div className="text-xs text-gray-500">{semesterCredits} credits</div>
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Course
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Credits
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Teacher
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Grade
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {semesterEnrollments.map((enrollment) => (
                        <tr key={enrollment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {enrollment.courseCode}
                            </div>
                            <div className="text-sm text-gray-500">
                              {enrollment.courseTitle}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {enrollment.credits}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {enrollment.teacherName || 'Instructor TBD'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {enrollment.grade ? (
                              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getGradeColor(enrollment.grade)}`}>
                                {enrollment.grade}
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-sm text-gray-400">
                                <Clock className="h-4 w-4 mr-1" />
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              enrollment.status === 'Active'
                                ? 'bg-blue-100 text-blue-800'
                                : enrollment.status === 'Completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {enrollment.status === 'Active' && <Clock className="h-3 w-3 mr-1" />}
                              {enrollment.status === 'Completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {enrollment.status === 'Failed' && <XCircle className="h-3 w-3 mr-1" />}
                              {enrollment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentResultsPage;
