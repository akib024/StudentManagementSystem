import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { PageHeader, FormInput, FormTextarea, Button } from '../../components/common';
import { useToast } from '../../contexts/ToastContext';
import courseService from '../../services/courseService';

const EditCoursePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const [formData, setFormData] = useState({
    courseCode: '',
    title: '',
    credits: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const course = await courseService.getCourseById(id);
      setFormData({
        courseCode: course.courseCode || '',
        title: course.title || '',
        credits: course.credits?.toString() || '',
        description: course.description || '',
      });
    } catch (err) {
      toast.error(err.message || 'Failed to load course');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

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
      await courseService.updateCourse(id, {
        Title: formData.title,
        Credits: parseInt(formData.credits),
        Description: formData.description || null,
      });
      toast.success('Course updated successfully!');
      navigate('/courses');
    } catch (err) {
      toast.error(err.message || 'Failed to update course');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Edit Course"
        subtitle="Update course information"
        showBackButton
        backPath="/courses"
      />

      <div className="max-w-2xl bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Course Code"
              name="courseCode"
              value={formData.courseCode}
              disabled
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
            />
          </div>

          <FormInput
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            required
          />

          <FormTextarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
            rows={4}
          />

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => navigate('/courses')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCoursePage;
