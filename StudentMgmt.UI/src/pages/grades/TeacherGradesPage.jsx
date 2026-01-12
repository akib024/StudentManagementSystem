import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService } from '../../services/courseService';
import { enrollmentService } from '../../services/enrollmentService';
import { useToast } from '../../contexts/ToastContext';
import { 
  PageHeader, 
  Card, 
  LoadingSpinner, 
  TableSkeleton,
  Modal,
  FormSelect,
  Button
} from '../../components/common';
import { BookOpen, Users, Award, TrendingUp, Edit, CheckCircle } from 'lucide-react';
import { getGradeColor, calculateGPA } from '../../utils/helpers';
import { ENROLLMENT_STATUS, ENROLLMENT_STATUS_OPTIONS, GRADE_OPTIONS } from '../../utils/constants';

const TeacherGradesPage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(false);
  const [gradeModal, setGradeModal] = useState({ isOpen: false, enrollment: null });
  const [statusModal, setStatusModal] = useState({ isOpen: false, enrollment: null });
  const [batchStatusModal, setBatchStatusModal] = useState({ isOpen: false });
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedEnrollments, setSelectedEnrollments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setIsLoading(true);
      const data = await courseService.getMyCourses();
      setCourses(data);
      // Don't auto-select the first course - let teacher choose
    } catch (err) {
      toast.error(err.message || 'Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourseEnrollments = async (courseId) => {
    try {
      setIsLoadingEnrollments(true);
      const data = await enrollmentService.getCourseEnrollments(courseId);
      setEnrollments(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load enrollments');
    } finally {
      setIsLoadingEnrollments(false);
    }
  };

  const handleCourseChange = (courseId) => {
    if (!courseId) {
      setSelectedCourse(null);
      setEnrollments([]);
      return;
    }
    const course = courses.find((c) => c.id === courseId);
    setSelectedCourse(course);
    fetchCourseEnrollments(courseId);
  };

  const handleUpdateGrade = (enrollment) => {
    setGradeModal({ isOpen: true, enrollment });
    setSelectedGrade(enrollment.grade || '');
  };

  const handleGradeSubmit = async () => {
    if (!selectedGrade) {
      toast.error('Please select a grade');
      return;
    }

    try {
      setIsSubmitting(true);
      await enrollmentService.updateEnrollmentGrade(
        gradeModal.enrollment.id,
        selectedGrade
      );
      toast.success('Grade updated successfully');
      setGradeModal({ isOpen: false, enrollment: null });
      fetchCourseEnrollments(selectedCourse.id);
    } catch (err) {
      toast.error(err.message || 'Failed to update grade');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = (enrollment) => {
    setStatusModal({ isOpen: true, enrollment });
    setSelectedStatus(enrollment.status || '');
  };

  const handleStatusSubmit = async () => {
    if (!selectedStatus) {
      toast.error('Please select a status');
      return;
    }

    try {
      setIsSubmitting(true);
      await enrollmentService.updateEnrollmentStatus(
        statusModal.enrollment.id,
        selectedStatus
      );
      toast.success('Status updated successfully');
      setStatusModal({ isOpen: false, enrollment: null });
      fetchCourseEnrollments(selectedCourse.id);
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBatchStatusUpdate = () => {
    if (selectedEnrollments.length === 0) {
      toast.error('Please select enrollments to update');
      return;
    }
    setBatchStatusModal({ isOpen: true });
    setSelectedStatus('Completed');
  };

  const handleBatchStatusSubmit = async () => {
    if (!selectedStatus) {
      toast.error('Please select a status');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await enrollmentService.batchUpdateEnrollmentStatus(
        selectedEnrollments,
        selectedStatus
      );
      
      if (result.failureCount > 0) {
        toast.warning(`Updated ${result.successCount} enrollments. ${result.failureCount} failed.`);
      } else {
        toast.success(`Successfully updated ${result.successCount} enrollments`);
      }
      
      setBatchStatusModal({ isOpen: false });
      setSelectedEnrollments([]);
      fetchCourseEnrollments(selectedCourse.id);
    } catch (err) {
      toast.error(err.message || 'Failed to batch update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleEnrollmentSelection = (enrollmentId) => {
    setSelectedEnrollments(prev =>
      prev.includes(enrollmentId)
        ? prev.filter(id => id !== enrollmentId)
        : [...prev, enrollmentId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedEnrollments.length === enrollments.length) {
      setSelectedEnrollments([]);
    } else {
      setSelectedEnrollments(enrollments.map(e => e.id));
    }
  };

  const calculateCourseStats = () => {
    if (!enrollments.length) return { total: 0, graded: 0, avgGPA: 0 };

    const gradedEnrollments = enrollments.filter((e) => e.grade);
    const grades = gradedEnrollments.map((e) => e.grade);
    const avgGPA = grades.length > 0 ? calculateGPA(grades) : 0;

    return {
      total: enrollments.length,
      graded: gradedEnrollments.length,
      avgGPA,
    };
  };

  const getGradeDistribution = () => {
    const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    enrollments.forEach((e) => {
      if (e.grade && distribution.hasOwnProperty(e.grade)) {
        distribution[e.grade]++;
      }
    });
    return distribution;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Grades Management" subtitle="Manage student grades for your courses" />
        <TableSkeleton rows={5} columns={5} />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Grades Management" subtitle="Manage student grades for your courses" />
        <Card>
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No courses assigned</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any courses assigned yet.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const stats = calculateCourseStats();
  const gradeDistribution = getGradeDistribution();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grades Management"
        subtitle="Manage student grades for your courses"
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
          <div className="text-right">
            <div className="text-sm text-gray-500">Total Credits</div>
            <div className="text-2xl font-bold text-gray-900">
              {selectedCourse?.credits || 0}
            </div>
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Total Students</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Graded</div>
              <div className="text-2xl font-bold text-gray-900">{stats.graded}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Average GPA</div>
              <div className="text-2xl font-bold text-gray-900">{stats.avgGPA}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-orange-500" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Pending</div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.total - stats.graded}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Grade Distribution */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Grade Distribution</h3>
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(gradeDistribution).map(([grade, count]) => (
            <div key={grade} className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${getGradeColor(grade)} font-bold text-lg mb-2`}>
                {grade}
              </div>
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-500">
                {stats.total > 0 ? Math.round((count / stats.total) * 100) : 0}%
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Student Enrollments Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Enrolled Students</h3>
          {selectedEnrollments.length > 0 && (
            <Button
              onClick={handleBatchStatusUpdate}
              className="inline-flex items-center"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Update Status ({selectedEnrollments.length})
            </Button>
          )}
        </div>
        
        {isLoadingEnrollments ? (
          <TableSkeleton rows={5} columns={6} />
        ) : enrollments.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No enrollments</h3>
            <p className="mt-1 text-sm text-gray-500">
              No students are enrolled in this course yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedEnrollments.length === enrollments.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrollment Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedEnrollments.includes(enrollment.id)}
                        onChange={() => toggleEnrollmentSelection(enrollment.id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {enrollment.studentName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {enrollment.enrollmentNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        enrollment.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : enrollment.status === 'Completed'
                          ? 'bg-blue-100 text-blue-800'
                          : enrollment.status === 'Failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {enrollment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {enrollment.grade ? (
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getGradeColor(enrollment.grade)}`}>
                          {enrollment.grade}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Not graded</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleUpdateGrade(enrollment)}
                          className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
                          disabled={enrollment.status === 'Completed'}
                          title={enrollment.status === 'Completed' ? 'Cannot edit grade for completed enrollment' : ''}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          {enrollment.grade ? 'Grade' : 'Add Grade'}
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(enrollment)}
                          className="inline-flex items-center text-green-600 hover:text-green-900"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Status
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Grade Update Modal */}
      <Modal
        isOpen={gradeModal.isOpen}
        onClose={() => setGradeModal({ isOpen: false, enrollment: null })}
        title="Update Grade"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Updating grade for{' '}
              <span className="font-semibold">
                {gradeModal.enrollment?.studentName}
              </span>
            </p>
            <FormSelect
              label="Grade"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              options={[
                { value: '', label: 'Select Grade' },
                ...GRADE_OPTIONS.map((grade) => ({
                  value: grade,
                  label: grade,
                })),
              ]}
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setGradeModal({ isOpen: false, enrollment: null })}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGradeSubmit}
              isLoading={isSubmitting}
              disabled={!selectedGrade}
            >
              Update Grade
            </Button>
          </div>
        </div>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, enrollment: null })}
        title="Update Enrollment Status"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Updating status for{' '}
              <span className="font-semibold">
                {statusModal.enrollment?.studentName}
              </span>
            </p>
            <FormSelect
              label="Status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={[
                { value: '', label: 'Select Status' },
                ...ENROLLMENT_STATUS_OPTIONS.map((status) => ({
                  value: status.value,
                  label: status.label,
                })),
              ]}
              required
            />
            {selectedStatus === 'Completed' && !statusModal.enrollment?.grade && (
              <p className="mt-2 text-sm text-amber-600">
                ⚠️ Cannot mark as completed without assigning a grade first.
              </p>
            )}
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setStatusModal({ isOpen: false, enrollment: null })}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusSubmit}
              isLoading={isSubmitting}
              disabled={!selectedStatus}
            >
              Update Status
            </Button>
          </div>
        </div>
      </Modal>

      {/* Batch Status Update Modal */}
      <Modal
        isOpen={batchStatusModal.isOpen}
        onClose={() => setBatchStatusModal({ isOpen: false })}
        title="Batch Update Status"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Update status for <span className="font-semibold">{selectedEnrollments.length}</span> selected enrollment(s)
            </p>
            <FormSelect
              label="Status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={[
                { value: '', label: 'Select Status' },
                ...ENROLLMENT_STATUS_OPTIONS.map((status) => ({
                  value: status.value,
                  label: status.label,
                })),
              ]}
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              Note: Enrollments without grades cannot be marked as completed.
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setBatchStatusModal({ isOpen: false })}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBatchStatusSubmit}
              isLoading={isSubmitting}
              disabled={!selectedStatus}
            >
              Update Status
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TeacherGradesPage;
