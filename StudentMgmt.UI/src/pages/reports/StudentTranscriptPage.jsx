import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportService } from '../../services/reportService';
import { enrollmentService } from '../../services/enrollmentService';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';
import { 
  PageHeader, 
  Card, 
  LoadingSpinner, 
  Button,
  Modal 
} from '../../components/common';
import { Download, BookOpen, Award, TrendingUp } from 'lucide-react';
import { getGradeColor } from '../../utils/helpers';

const StudentTranscriptPage = () => {
  const { studentId: paramStudentId } = useParams();
  const { currentUser } = useAuth();
  const [transcript, setTranscript] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportModal, setExportModal] = useState({ isOpen: false });
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTranscript();
  }, [paramStudentId]);

  const fetchTranscript = async () => {
    try {
      setIsLoading(true);
      let data;
      
      // If viewing own transcript (student) or no studentId param, use my-transcript endpoint
      if (!paramStudentId && currentUser?.role === ROLES.STUDENT) {
        data = await enrollmentService.getMyTranscript();
      } else if (paramStudentId) {
        // Teacher/Admin viewing specific student's transcript
        data = await reportService.getStudentTranscript(paramStudentId);
      } else {
        toast.error('Unable to load transcript');
        navigate('/');
        return;
      }
      
      setTranscript(data);
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error('Transcript not found. Please log in with a valid student account (e.g., john.doe / password123)');
      } else {
        toast.error(err.message || 'Failed to load transcript');
      }
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      setIsExporting(true);
      const studentIdForExport = paramStudentId || transcript.studentId;
      await reportService.downloadTranscriptPdf(studentIdForExport, transcript.studentName);
      toast.success('Transcript exported as PDF');
      setExportModal({ isOpen: false });
    } catch (err) {
      toast.error(err.message || 'Failed to export transcript');
    } finally {
      setIsExporting(false);
    }
  };

  const calculateCreditsEarned = (courses) => {
    return courses
      .filter(c => c.status === 'Completed' && c.letterGrade && c.letterGrade !== 'F')
      .reduce((sum, c) => sum + c.credits, 0);
  };

  const calculateGPA = (courses) => {
    const gradePoints = {
      'A': 4.0,
      'B': 3.0,
      'C': 2.0,
      'D': 1.0,
      'F': 0.0
    };

    const gradedCourses = courses.filter(c => c.letterGrade);
    if (gradedCourses.length === 0) return 0;

    const totalPoints = gradedCourses.reduce((sum, c) => {
      return sum + (gradePoints[c.letterGrade] || 0) * c.credits;
    }, 0);

    const totalCredits = gradedCourses.reduce((sum, c) => sum + c.credits, 0);
    return (totalPoints / totalCredits).toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Student Transcript" 
          subtitle="View your complete academic history"
        />
        <LoadingSpinner />
      </div>
    );
  }

  if (!transcript) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Student Transcript" 
          subtitle="View your complete academic history"
        />
        <Card>
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No transcript found</h3>
          </div>
        </Card>
      </div>
    );
  }

  const creditsEarned = calculateCreditsEarned(transcript.courses);
  const currentGPA = calculateGPA(transcript.courses);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Student Transcript" 
          subtitle={`${transcript.studentName} - ${transcript.enrollmentNumber}`}
        />
        <Button
          onClick={() => setExportModal({ isOpen: true })}
          className="inline-flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Transcript
        </Button>
      </div>

      {/* Student Information */}
      <Card>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Student Name</p>
            <p className="text-lg font-semibold text-gray-900">{transcript.studentName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Enrollment Number</p>
            <p className="text-lg font-semibold text-gray-900">{transcript.enrollmentNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Department</p>
            <p className="text-lg font-semibold text-gray-900">{transcript.department}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Academic Standing</p>
            <p className={`text-lg font-semibold ${
              transcript.academicStanding === 'Good Standing'
                ? 'text-green-600'
                : transcript.academicStanding === 'Warning'
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}>
              {transcript.academicStanding}
            </p>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Credits Attempted</p>
              <p className="text-2xl font-bold text-gray-900">{transcript.totalCreditsAttempted}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Credits Earned</p>
              <p className="text-2xl font-bold text-gray-900">{creditsEarned}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Cumulative GPA</p>
              <p className="text-2xl font-bold text-gray-900">{currentGPA}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-orange-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Courses Completed</p>
              <p className="text-2xl font-bold text-gray-900">{transcript.courses.filter(c => c.status === 'Completed').length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Course Details */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Course Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transcript.courses.map((course, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {course.courseCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.courseTitle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.credits}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {course.letterGrade ? (
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getGradeColor(course.letterGrade)}`}>
                        {course.letterGrade}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      course.status === 'Completed'
                        ? 'bg-blue-100 text-blue-800'
                        : course.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {course.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(course.completedDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Export Modal */}
      <Modal
        isOpen={exportModal.isOpen}
        onClose={() => setExportModal({ isOpen: false })}
        title="Export Transcript"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Choose a format to export your transcript:
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setExportModal({ isOpen: false })}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExportPdf}
              isLoading={isExporting}
              className="inline-flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export as PDF
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentTranscriptPage;
