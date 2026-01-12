import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Mail, Building2, Hash, BookOpen, Pencil } from 'lucide-react';
import { PageHeader, Button, PageLoader } from '../../components/common';
import { useToast } from '../../contexts/ToastContext';
import teacherService from '../../services/teacherService';

const TeacherDetailPage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTeacher();
  }, [id]);

  const fetchTeacher = async () => {
    try {
      setIsLoading(true);
      const data = await teacherService.getTeacherById(id);
      setTeacher(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load teacher');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <PageLoader text="Loading teacher details..." />;
  }

  if (!teacher) {
    return (
      <div>
        <PageHeader title="Teacher Details" showBackButton backPath="/teachers" />
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4">
          Teacher not found
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`${teacher.firstName} ${teacher.lastName}`}
        subtitle={`Employee ID: ${teacher.employeeId}`}
        showBackButton
        backPath="/teachers"
        actions={
          <Button icon={Pencil} onClick={() => navigate(`/teachers/${id}/edit`)}>
            Edit Teacher
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teacher Information Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold">
                {teacher.firstName?.charAt(0)}
                {teacher.lastName?.charAt(0)}
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                {teacher.firstName} {teacher.lastName}
              </h2>
              <p className="text-gray-500">Teacher</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <Hash className="h-5 w-5 mr-3 text-gray-400" />
                <span>{teacher.employeeId}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Mail className="h-5 w-5 mr-3 text-gray-400" />
                <span>{teacher.email}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Building2 className="h-5 w-5 mr-3 text-gray-400" />
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {teacher.department}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Courses Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
                Assigned Courses
              </h3>
            </div>

            {teacher.courses?.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {teacher.courses.map((course) => (
                  <div key={course.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded mr-2">
                            {course.courseCode}
                          </span>
                          <span className="font-medium text-gray-900">
                            {course.title}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {course.credits} credits
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {course.enrollmentCount || 0} students
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p>No courses assigned yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetailPage;
