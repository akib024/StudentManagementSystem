import { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { courseService } from '../../services/courseService';
import { useToast } from '../../contexts/ToastContext';
import { 
  PageHeader, 
  Card, 
  LoadingSpinner, 
  Button,
  Modal
} from '../../components/common';
import { Download, Users, Award, TrendingUp, FileText } from 'lucide-react';
import { getGradeColor } from '../../utils/helpers';

const GradeReportPage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportModal, setExportModal] = useState({ isOpen: false, format: '' });
  const toast = useToast();

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setIsLoading(true);
      const data = await courseService.getMyCourses();
      setCourses(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseChange = async (courseId) => {
    if (!courseId) {
      setSelectedCourse(null);
      setReport(null);
      return;
    }

    const course = courses.find((c) => c.id === courseId);
    setSelectedCourse(course);
    
    try {
      setIsLoadingReport(true);
      const reportData = await reportService.getGradeReport(courseId);
      setReport(reportData);
    } catch (err) {
      toast.error(err.message || 'Failed to load grade report');
      setReport(null);
    } finally {
      setIsLoadingReport(false);
    }
  };

  const handleExport = async (format) => {
    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }

    try {
      setIsExporting(true);
      if (format === 'excel') {
        await reportService.downloadGradeReportExcel(selectedCourse.id, selectedCourse.courseCode);
        toast.success('Grade report exported as Excel');
      } else if (format === 'csv') {
        await reportService.downloadGradeReportCsv(selectedCourse.id, selectedCourse.courseCode);
        toast.success('Grade report exported as CSV');
      }
      setExportModal({ isOpen: false, format: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Grade Reports" 
          subtitle="View and export course grade reports"
        />
        <LoadingSpinner />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Grade Reports" 
          subtitle="View and export course grade reports"
        />
        <Card>
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No courses assigned</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any courses to generate reports for.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Grade Reports" 
        subtitle="View and export course grade reports"
      />

      {/* Course Selection */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Course
            </label>
            <select
              value={selectedCourse?.id || ''}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">– Select a course –</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.courseCode} - {course.title}
                </option>
              ))}
            </select>
          </div>
          {selectedCourse && (
            <Button
              onClick={() => setExportModal({ isOpen: true, format: '' })}
              className="inline-flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          )}
        </div>
      </Card>

      {/* Report Content */}
      {isLoadingReport ? (
        <LoadingSpinner />
      ) : report ? (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{report.students.length}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Award className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Class Average</p>
                  <p className="text-2xl font-bold text-gray-900">{report.classAverage.toFixed(2)}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Highest Grade</p>
                  <p className="text-2xl font-bold text-gray-900">{report.highestGrade.toFixed(2)}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-orange-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Lowest Grade</p>
                  <p className="text-2xl font-bold text-gray-900">{report.lowestGrade.toFixed(2)}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Grade Distribution */}
          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Grade Distribution</h3>
            <div className="grid grid-cols-5 gap-4">
              {[
                { grade: 'A', count: report.gradeDistribution.countA },
                { grade: 'B', count: report.gradeDistribution.countB },
                { grade: 'C', count: report.gradeDistribution.countC },
                { grade: 'D', count: report.gradeDistribution.countD },
                { grade: 'F', count: report.gradeDistribution.countF },
              ].map(({ grade, count }) => (
                <div key={grade} className="text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${getGradeColor(grade)} font-bold text-lg mb-2`}>
                    {grade}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-500">
                    {report.students.length > 0 ? Math.round((count / report.students.length) * 100) : 0}%
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Student Grades Table */}
          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Student Grades</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrollment Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade Point
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Letter Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.students.map((student, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.studentName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.enrollmentNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.grade !== null ? student.grade.toFixed(2) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {student.letterGrade ? (
                          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getGradeColor(student.letterGrade)}`}>
                            {student.letterGrade}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Not graded</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          student.status === 'Completed'
                            ? 'bg-blue-100 text-blue-800'
                            : student.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : selectedCourse ? (
        <Card>
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No report data</h3>
            <p className="mt-1 text-sm text-gray-500">
              Unable to generate report for this course.
            </p>
          </div>
        </Card>
      ) : null}

      {/* Export Modal */}
      <Modal
        isOpen={exportModal.isOpen}
        onClose={() => setExportModal({ isOpen: false, format: '' })}
        title="Export Grade Report"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Choose a format to export the grade report:
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setExportModal({ isOpen: false, format: '' })}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleExport('csv')}
              isLoading={isExporting && exportModal.format === 'csv'}
              disabled={isExporting && exportModal.format !== 'csv'}
              variant="secondary"
            >
              Export as CSV
            </Button>
            <Button
              onClick={() => handleExport('excel')}
              isLoading={isExporting && exportModal.format === 'excel'}
              disabled={isExporting && exportModal.format !== 'excel'}
            >
              Export as Excel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GradeReportPage;
