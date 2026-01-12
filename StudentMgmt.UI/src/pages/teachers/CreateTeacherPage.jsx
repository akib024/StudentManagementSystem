import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, FormInput, FormSelect, Button } from '../../components/common';
import { useToast } from '../../contexts/ToastContext';
import teacherService from '../../services/teacherService';
import departmentService from '../../services/departmentService';

const CreateTeacherPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
  });
  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setIsLoadingDepartments(true);
        const response = await departmentService.getAllDepartments();
        const deptOptions = response.map((dept) => ({
          value: dept.name,
          label: dept.name,
        }));
        setDepartments(deptOptions);
      } catch (err) {
        toast.error(err.message || 'Failed to load departments');
      } finally {
        setIsLoadingDepartments(false);
      }
    };

    loadDepartments();
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

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await teacherService.createTeacher({
        FirstName: formData.firstName,
        LastName: formData.lastName,
        Email: formData.email,
        Department: formData.department,
      });
      toast.success('Teacher created successfully!');
      navigate('/teachers');
    } catch (err) {
      toast.error(err.message || 'Failed to create teacher');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Add New Teacher"
        subtitle="Create a new teacher record"
        showBackButton
        backPath="/teachers"
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

          <FormSelect
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            options={departments}
            error={errors.department}
            required
            placeholder={isLoadingDepartments ? 'Loading departments...' : 'Select department'}
            disabled={isLoadingDepartments}
          />

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => navigate('/teachers')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Teacher
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeacherPage;
