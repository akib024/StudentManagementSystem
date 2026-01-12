import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2, BookOpen, Users } from 'lucide-react';
import { DataTable, PageHeader, Button, ConfirmDialog } from '../../components/common';
import TableSkeleton from '../../components/common/TableSkeleton';
import { useToast } from '../../contexts/ToastContext';
import courseService from '../../services/courseService';

const CoursesListPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, course: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const data = await courseService.getAllCourses();
      setCourses(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses;
    const query = searchQuery.toLowerCase();
    return courses.filter(
      (course) =>
        course.courseCode?.toLowerCase().includes(query) ||
        course.title?.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query)
    );
  }, [courses, searchQuery]);

  const handleDelete = async () => {
    if (!deleteDialog.course) return;

    try {
      setIsDeleting(true);
      await courseService.deleteCourse(deleteDialog.course.id);
      setCourses((prev) => prev.filter((c) => c.id !== deleteDialog.course.id));
      toast.success(`Course "${deleteDialog.course.title}" has been deleted.`);
      setDeleteDialog({ isOpen: false, course: null });
    } catch (err) {
      toast.error(err.message || 'Failed to delete course');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Course Code',
      accessor: 'courseCode',
      render: (row) => (
        <span className="font-mono text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">
          {row.courseCode}
        </span>
      ),
    },
    {
      header: 'Title',
      accessor: 'title',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900 flex items-center">
            <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
            {row.title}
          </div>
          {row.description && (
            <p className="text-sm text-gray-500 mt-1 truncate max-w-md">
              {row.description}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Credits',
      accessor: 'credits',
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {row.credits} credits
        </span>
      ),
    },
    {
      header: 'Enrollments',
      accessor: 'enrollmentCount',
      render: (row) => (
        <div className="flex items-center text-gray-600">
          <Users className="h-4 w-4 mr-2" />
          <span>{row.enrollmentCount || 0} students</span>
        </div>
      ),
    },
  ];

  const actions = (row) => (
    <div className="flex items-center justify-end space-x-2">
      <button
        onClick={() => navigate(`/courses/${row.id}`)}
        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
        title="View"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        onClick={() => navigate(`/courses/${row.id}/edit`)}
        className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
        title="Edit"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={() => setDeleteDialog({ isOpen: true, course: row })}
        className="p-1 text-red-600 hover:bg-red-50 rounded"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Courses"
        subtitle="Manage course catalog and enrollments"
        actions={
          <Button icon={Plus} onClick={() => navigate('/courses/new')}>
            Add Course
          </Button>
        }
      />

      {isLoading ? (
        <TableSkeleton rows={5} columns={6} />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={filteredCourses}
            isLoading={isLoading}
            emptyMessage="No courses found"
            searchable
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search by code, title, or description..."
            actions={actions}
          />

          <ConfirmDialog
            isOpen={deleteDialog.isOpen}
            onClose={() => setDeleteDialog({ isOpen: false, course: null })}
            onConfirm={handleDelete}
            title="Delete Course"
            message={`Are you sure you want to delete "${deleteDialog.course?.title}"? This will also remove all related enrollments. This action cannot be undone.`}
            confirmText="Delete"
            variant="danger"
            isLoading={isDeleting}
          />
        </>
      )}
    </div>
  );
};

export default CoursesListPage;
