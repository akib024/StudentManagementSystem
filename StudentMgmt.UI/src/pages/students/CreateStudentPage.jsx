import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { PageHeader, FormInput, Button } from '../../components/common';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import studentService from '../../services/studentService';

const CreateStudentPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    enrollmentNumber: '',
    phoneNumber: '',
    dateOfBirth: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoadingEnrollmentNumber, setIsLoadingEnrollmentNumber] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    generateEnrollmentNumber();
  }, []);

  const generateEnrollmentNumber = async () => {
    try {
      setIsLoadingEnrollmentNumber(true);
      const response = await studentService.getNextEnrollmentNumber();
      setFormData((prev) => ({
        ...prev,
        enrollmentNumber: response.enrollmentNumber,
      }));
    } catch (err) {
      toast.error(err.message || 'Failed to generate enrollment number');
    } finally {
      setIsLoadingEnrollmentNumber(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      // Send with PascalCase for .NET backend
      await studentService.createStudent({
        FirstName: formData.firstName,
        LastName: formData.lastName,
        Email: formData.email,
        EnrollmentNumber: formData.enrollmentNumber,
        PhoneNumber: formData.phoneNumber || null,
        DateOfBirth: formData.dateOfBirth || null,
      });
      toast.success('Student created successfully!');
      navigate('/students');
    } catch (err) {
      toast.error(err.message || 'Failed to create student');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Add New Student"
        subtitle="Create a new student record"
        showBackButton
        backPath="/students"
      />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              required
              placeholder="Enter first name"
            />

            <FormInput
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
              required
              placeholder="Enter last name"
            />
          </div>

          <FormInput
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
            placeholder="Enter email address"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Enrollment Number
                <span className="text-blue-600 ml-1.5 text-xs font-normal">(Auto-generated)</span>
              </label>
              <div className="flex items-center gap-3">
                {isLoadingEnrollmentNumber ? (
                  <div className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2 text-blue-600" />
                    <span className="text-gray-500 text-sm">Generating...</span>
                  </div>
                ) : (
                  <div className="flex-1 px-4 py-2.5 border border-blue-300 rounded-lg bg-blue-50">
                    <span className="font-mono font-semibold text-blue-900">
                      {formData.enrollmentNumber}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={generateEnrollmentNumber}
                  disabled={isLoadingEnrollmentNumber || isSubmitting}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Regenerate
                </button>
              </div>
            </div>

            <FormInput
              label="Phone Number"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              error={errors.phoneNumber}
              placeholder="Enter phone number"
            />
          </div>

          <FormInput
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
            error={errors.dateOfBirth}
          />

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => navigate('/students')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Student
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStudentPage;
