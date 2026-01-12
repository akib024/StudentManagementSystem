import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, FormSelect, Button } from '../../components/common';
import { useToast } from '../../contexts/ToastContext';
import enrollmentService from '../../services/enrollmentService';
import studentService from '../../services/studentService';
import courseService from '../../services/courseService';

const EnrollStudentPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
  });
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true);
        const [studentsData, coursesData] = await Promise.all([
          studentService.getAllStudents(),
          courseService.getAllCourses(),
        ]);

        const studentOptions = studentsData.map((student) => ({
          value: student.id,
          label: `${student.firstName} ${student.lastName} (${student.enrollmentNumber})`,
        }));

        const courseOptions = coursesData.map((course) => ({
          value: course.id,
          label: `${course.courseCode} - ${course.title} (${course.credits} credits)`,
        }));

        setStudents(studentOptions);
        setCourses(courseOptions);
      } catch (err) {
        toast.error(err.message || 'Failed to load data');
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.studentId) {
      newErrors.studentId = 'Please select a student';
    }

    if (!formData.courseId) {
      newErrors.courseId = 'Please select a course';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await enrollmentService.enrollStudent(formData.studentId, formData.courseId);
      toast.success('Student enrolled successfully!');
      navigate('/enrollments');
    } catch (err) {
      toast.error(err.message || 'Failed to enroll student');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Enroll Student"
        subtitle="Enroll a student in a course"
        showBackButton
        backPath="/enrollments"
      />

      <div className="max-w-2xl bg-white rounded-lg shadow p-6">
        {isLoadingData ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormSelect
              label="Student"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              options={students}
              error={errors.studentId}
              required
              placeholder="Select a student"
            />

            <FormSelect
              label="Course"
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              options={courses}
              error={errors.courseId}
              required
              placeholder="Select a course"
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The student will be enrolled with an "Active" status. 
                The enrollment can be withdrawn or updated later if needed.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => navigate('/enrollments')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Enroll Student
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EnrollStudentPage;
