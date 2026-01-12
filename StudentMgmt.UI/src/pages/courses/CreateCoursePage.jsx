import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, FormInput, FormTextarea, Button } from '../../components/common';
import { useToast } from '../../contexts/ToastContext';
import courseService from '../../services/courseService';

const CreateCoursePage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    courseCode: '',
    title: '',
    credits: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.courseCode.trim()) {
      newErrors.courseCode = 'Course code is required';
    } else if (!/^[A-Z]{2,4}[0-9]{3,4}$/.test(formData.courseCode.toUpperCase())) {
      newErrors.courseCode = 'Course code must be 2-4 letters followed by 3-4 digits (e.g., CS101)';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.credits) {
      newErrors.credits = 'Credits are required';
    } else {
      const credits = parseInt(formData.credits);
      if (isNaN(credits) || credits < 1 || credits > 6) {
        newErrors.credits = 'Credits must be between 1 and 6';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await courseService.createCourse({
        CourseCode: formData.courseCode.toUpperCase(),
        Title: formData.title,
        Credits: parseInt(formData.credits),
        Description: formData.description || null,
      });
      toast.success('Course created successfully!');
      navigate('/courses');
    } catch (err) {
      toast.error(err.message || 'Failed to create course');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Add New Course"
        subtitle="Create a new course in the catalog"
        showBackButton
        backPath="/courses"
      />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Course Code"
              name="courseCode"
              value={formData.courseCode}
              onChange={handleChange}
              error={errors.courseCode}
              required
              placeholder="e.g., CS101"
              hint="2-4 letters followed by 3-4 digits"
            />

            <FormInput
              label="Credits"
              name="credits"
              type="number"
              min="1"
              max="6"
              value={formData.credits}
              onChange={handleChange}
              error={errors.credits}
              required
              placeholder="1-6"
            />
          </div>

          <FormInput
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            required
            placeholder="Enter course title"
          />

          <FormTextarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
            placeholder="Enter course description (optional)"
            rows={4}
          />

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => navigate('/courses')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Course
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCoursePage;
