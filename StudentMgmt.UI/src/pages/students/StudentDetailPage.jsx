import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Mail, Phone, Calendar, Hash, BookOpen, Pencil } from 'lucide-react';
import { PageHeader, Button, PageLoader } from '../../components/common';
import { useToast } from '../../contexts/ToastContext';
import studentService from '../../services/studentService';

const StudentDetailPage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      setIsLoading(true);
      const data = await studentService.getStudentById(id);
      setStudent(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load student');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <PageLoader text="Loading student details..." />;
  }

  if (!student) {
    return (
      <div>
        <PageHeader title="Student Details" showBackButton backPath="/students" />
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4">
          Student not found
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'withdrawn':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <PageHeader
        title={`${student.firstName} ${student.lastName}`}
        subtitle={`Enrollment: ${student.enrollmentNumber}`}
        showBackButton
        backPath="/students"
        actions={
          <Button icon={Pencil} onClick={() => navigate(`/students/${id}/edit`)}>
            Edit Student
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Information Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {student.firstName?.charAt(0)}
                {student.lastName?.charAt(0)}
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                {student.firstName} {student.lastName}
              </h2>
              <p className="text-gray-500 text-sm">Student</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-700 p-3 bg-gray-50 rounded-lg">
                <Hash className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <span className="font-mono text-sm">{student.enrollmentNumber}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <span className="text-sm truncate">{student.email}</span>
              </div>
              {student.phoneNumber && (
                <div className="flex items-center gap-3 text-gray-700 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <span className="text-sm">{student.phoneNumber}</span>
                </div>
              )}
              {student.dateOfBirth && (
                <div className="flex items-center gap-3 text-gray-700 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <span className="text-sm">{new Date(student.dateOfBirth).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enrollments Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Enrolled Courses
              </h3>
            </div>

            {student.enrollments?.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {student.enrollments.map((enrollment) => (
                  <div key={enrollment.enrollmentId} className="p-5 hover:bg-blue-50/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm bg-gray-100 px-2.5 py-1 rounded-md font-medium text-gray-700">
                            {enrollment.courseCode}
                          </span>
                          <span className="font-medium text-gray-900">
                            {enrollment.courseTitle}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1.5">
                          {enrollment.credits} credits
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            enrollment.status
                          )}`}
                        >
                          {enrollment.status}
                        </span>
                        {enrollment.grade !== null && enrollment.grade !== undefined && (
                          <p className="text-sm font-semibold text-gray-900 mt-1.5">
                            Grade: {enrollment.grade}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No course enrollments yet</p>
                <p className="text-gray-400 text-sm mt-1">Enroll this student in courses to see them here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailPage;
