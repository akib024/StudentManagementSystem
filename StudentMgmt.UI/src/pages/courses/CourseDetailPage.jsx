import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, BookOpen, Hash, Award, FileText, Users, Pencil, Calendar, Clock, CheckCircle } from 'lucide-react';
import { PageHeader, Button, PageLoader } from '../../components/common';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import courseService from '../../services/courseService';
import { enrollmentService } from '../../services/enrollmentService';
import { ROLES } from '../../utils/constants';
import { formatDate, getGradeColor } from '../../utils/helpers';

const CourseDetailPage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const data = await courseService.getCourseById(id);
      setCourse(data);

      // If student, fetch their enrollment for this course
      if (currentUser?.role === ROLES.STUDENT) {
        try {
          const enrollments = await enrollmentService.getMyEnrollments();
          const myEnrollment = enrollments.find(e => e.courseId === id);
          setEnrollment(myEnrollment);
        } catch (err) {
          console.log('No enrollment found for this course');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load course');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <PageLoader text="Loading course details..." />;
  }

  if (!course) {
    return (
      <div>
        <PageHeader title="Course Details" showBackButton backPath="/courses" />
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4">
          Course not found
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={course.title}
        subtitle={`Course Code: ${course.courseCode}`}
        showBackButton
        backPath={currentUser?.role === ROLES.STUDENT ? "/my-courses" : "/courses"}
        actions={
          currentUser?.role !== ROLES.STUDENT && (
            <Button icon={Pencil} onClick={() => navigate(`/courses/${id}/edit`)}>
              Edit Course
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Information Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full mx-auto flex items-center justify-center text-white">
                <BookOpen className="h-12 w-12" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                {course.title}
              </h2>
              <p className="text-gray-500">Course</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <Hash className="h-5 w-5 mr-3 text-gray-400" />
                <span className="font-mono">{course.courseCode}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Award className="h-5 w-5 mr-3 text-gray-400" />
                <span>{course.credits} Credits</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="h-5 w-5 mr-3 text-gray-400" />
                <span>{course.enrollmentCount || 0} Enrolled Students</span>
              </div>
            </div>
          </div>
        </div>

        {/* Course Details Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Course Description
              </h3>
            </div>

            <div className="p-6">
              {course.description ? (
                <p className="text-gray-700 whitespace-pre-wrap">{course.description}</p>
              ) : (
                <p className="text-gray-500 italic">No description provided</p>
              )}
            </div>
          </div>

          {/* Student Enrollment Information */}
          {currentUser?.role === ROLES.STUDENT && enrollment && (
            <div className="bg-white rounded-lg shadow mt-6">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-indigo-600" />
                  My Enrollment
                </h3>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-xs text-gray-500">Status</div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        enrollment.status === 'Active'
                          ? 'bg-blue-100 text-blue-800'
                          : enrollment.status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {enrollment.status === 'Active' && <Clock className="h-3 w-3 mr-1" />}
                        {enrollment.status === 'Completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {enrollment.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Award className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="text-xs text-gray-500">Grade</div>
                      <div className="font-semibold text-gray-900">
                        {enrollment.grade ? (
                          <span className={`inline-flex px-3 py-1 text-sm rounded-full ${getGradeColor(enrollment.grade)}`}>
                            {enrollment.grade}
                          </span>
                        ) : (
                          <span className="text-gray-500">Pending</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="text-xs text-gray-500">Enrolled</div>
                      <div className="font-semibold text-gray-900">
                        {formatDate(enrollment.enrolledAt)}
                      </div>
                    </div>
                  </div>
                </div>
                {enrollment.teacherName && (
                  <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                    <div className="text-sm text-gray-600">Instructor</div>
                    <div className="text-lg font-semibold text-gray-900">{enrollment.teacherName}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enrolled Students Preview - Only for Admin/Teacher */}
          {currentUser?.role !== ROLES.STUDENT && (
            <div className="bg-white rounded-lg shadow mt-6">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-600" />
                  Enrolled Students
                </h3>
              </div>

              <div className="p-6">
                {course.enrollmentCount > 0 ? (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      This course has {course.enrollmentCount} enrolled student(s).
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/enrollments?courseId=${id}`)}
                    >
                      View All Enrollments
                    </Button>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p>No students enrolled in this course yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
