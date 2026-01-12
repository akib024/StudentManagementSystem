import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Book, Calendar, Award, X, Edit2, Save } from 'lucide-react';
import { PageHeader, Button, PageLoader, ConfirmDialog } from '../../components/common';
import { useToast } from '../../contexts/ToastContext';
import enrollmentService from '../../services/enrollmentService';

const STATUS_OPTIONS = ['Active', 'Completed', 'Dropped', 'Pending'];

const STATUS_BADGES = {
  Active: 'bg-green-100 text-green-800',
  Completed: 'bg-blue-100 text-blue-800',
  Dropped: 'bg-red-100 text-red-800',
  Pending: 'bg-yellow-100 text-yellow-800',
};

const GRADE_OPTIONS = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];

const EnrollmentDetailPage = () => {
  const toast = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [withdrawDialog, setWithdrawDialog] = useState(false);
  const [isEditingGrade, setIsEditingGrade] = useState(false);
  const [gradeValue, setGradeValue] = useState('');
  const [isUpdatingGrade, setIsUpdatingGrade] = useState(false);

  useEffect(() => {
    loadEnrollment();
  }, [id]);

  useEffect(() => {
    if (enrollment) {
      setGradeValue(enrollment.grade || '');
    }
  }, [enrollment]);

  const loadEnrollment = async () => {
    try {
      setIsLoading(true);
      const data = await enrollmentService.getEnrollmentById(id);
      setEnrollment(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load enrollment details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setIsUpdatingStatus(true);
      await enrollmentService.updateEnrollmentStatus(id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      loadEnrollment();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      await enrollmentService.withdrawEnrollment(id);
      navigate('/enrollments', { state: { message: 'Enrollment withdrawn successfully' } });
    } catch (err) {
      toast.error(err.message || 'Failed to withdraw enrollment');
      setWithdrawDialog(false);
    }
  };

  const handleUpdateGrade = async () => {
    try {
      setIsUpdatingGrade(true);
      await enrollmentService.updateEnrollmentGrade(id, gradeValue);
      toast.success(`Grade updated to ${gradeValue}`);
      setIsEditingGrade(false);
      loadEnrollment();
    } catch (err) {
      toast.error(err.message || 'Failed to update grade');
    } finally {
      setIsUpdatingGrade(false);
    }
  };

  const handleCancelGradeEdit = () => {
    setGradeValue(enrollment?.grade || '');
    setIsEditingGrade(false);
  };

  if (isLoading) {
    return <PageLoader text="Loading enrollment details..." />;
  }

  if (!enrollment) {
    return (
      <div>
        <PageHeader title="Enrollment Details" showBackButton backPath="/enrollments" />
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4">
          Enrollment not found
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Enrollment Details"
        subtitle={`${enrollment.studentName} - ${enrollment.courseCode}`}
        showBackButton
        backPath="/enrollments"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          {/* Student Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Student Information</h3>
            </div>
            <div className="bg-gray-50 rounded-xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium text-gray-900">{enrollment.studentName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Enrollment Number:</span>
                <span className="font-medium font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">{enrollment.enrollmentNumber}</span>
              </div>
            </div>
          </div>

          {/* Course Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Book className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Course Information</h3>
            </div>
            <div className="bg-gray-50 rounded-xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Course Code:</span>
                <span className="font-medium font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">{enrollment.courseCode}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Course Title:</span>
                <span className="font-medium text-gray-900">{enrollment.courseTitle}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Credits:</span>
                <span className="font-medium text-gray-900">{enrollment.credits}</span>
              </div>
            </div>
          </div>

          {/* Enrollment Details */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Enrollment Details</h3>
            </div>
            <div className="bg-gray-50 rounded-xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${STATUS_BADGES[enrollment.status]}`}>
                  {enrollment.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Enrolled Date:</span>
                <span className="font-medium text-gray-900">{new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
              </div>
              {enrollment.completedAt && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed Date:</span>
                  <span className="font-medium text-gray-900">{new Date(enrollment.completedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Grade Info */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Award className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Grade Information</h3>
              </div>
              {!isEditingGrade && enrollment.status === 'Completed' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditingGrade(true)}
                >
                  <Edit2 className="h-4 w-4" />
                  {enrollment.grade ? 'Edit Grade' : 'Add Grade'}
                </Button>
              )}
            </div>
            <div className="bg-gray-50 rounded-xl p-5">
              {isEditingGrade ? (
                <div className="space-y-4">
                  <select
                    value={gradeValue}
                    onChange={(e) => setGradeValue(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    disabled={isUpdatingGrade}
                  >
                    <option value="">Select Grade</option>
                    {GRADE_OPTIONS.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleUpdateGrade}
                      disabled={!gradeValue || isUpdatingGrade}
                      fullWidth
                    >
                      <Save className="h-4 w-4" />
                      Save Grade
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelGradeEdit}
                      disabled={isUpdatingGrade}
                      fullWidth
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Final Grade:</span>
                  {enrollment.grade ? (
                    <span className="text-2xl font-bold text-blue-600">{enrollment.grade}</span>
                  ) : (
                    <span className="text-gray-400 italic">Not assigned yet</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 h-fit">
          <h3 className="text-lg font-semibold text-gray-900 mb-5">Actions</h3>
          
          <div className="space-y-4">
            {/* Status Update */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Status
              </label>
              <select
                value={enrollment.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdatingStatus}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Withdraw Button */}
            {enrollment.status === 'Active' && (
              <Button
                variant="outline"
                fullWidth
                className="text-red-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50"
                onClick={() => setWithdrawDialog(true)}
              >
                <X className="h-4 w-4" />
                Withdraw Enrollment
              </Button>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={withdrawDialog}
        title="Withdraw Enrollment"
        message="Are you sure you want to withdraw this enrollment? This action cannot be undone."
        confirmText="Withdraw"
        cancelText="Cancel"
        onConfirm={handleWithdraw}
        onClose={() => setWithdrawDialog(false)}
        variant="danger"
      />
    </div>
  );
};

export default EnrollmentDetailPage;
