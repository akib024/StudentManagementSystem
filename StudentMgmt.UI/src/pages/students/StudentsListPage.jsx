import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2, Mail } from 'lucide-react';
import { DataTable, PageHeader, Button, ConfirmDialog } from '../../components/common';
import TableSkeleton from '../../components/common/TableSkeleton';
import { useToast } from '../../contexts/ToastContext';
import studentService from '../../services/studentService';

const StudentsListPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, student: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const data = await studentService.getAllStudents();
      setStudents(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const query = searchQuery.toLowerCase();
    return students.filter(
      (student) =>
        student.firstName?.toLowerCase().includes(query) ||
        student.lastName?.toLowerCase().includes(query) ||
        student.email?.toLowerCase().includes(query) ||
        student.enrollmentNumber?.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

  const handleDelete = async () => {
    if (!deleteDialog.student) return;

    try {
      setIsDeleting(true);
      await studentService.deleteStudent(deleteDialog.student.id);
      setStudents((prev) => prev.filter((s) => s.id !== deleteDialog.student.id));
      toast.success(`Student "${deleteDialog.student.firstName} ${deleteDialog.student.lastName}" has been deleted.`);
      setDeleteDialog({ isOpen: false, student: null });
    } catch (err) {
      toast.error(err.message || 'Failed to delete student');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Enrollment #',
      accessor: 'enrollmentNumber',
      cell: (value) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {value}
        </span>
      ),
    },
    {
      header: 'Name',
      accessor: (row) => `${row.firstName} ${row.lastName}`,
      cell: (value) => (
        <div>
          <div className="font-medium text-gray-900">
            {value}
          </div>
        </div>
      ),
    },
    {
      header: 'Email',
      accessor: 'email',
      cell: (value) => (
        <div className="flex items-center text-gray-600">
          <Mail className="h-4 w-4 mr-2" />
          {value}
        </div>
      ),
    },
    {
      header: 'Courses',
      accessor: (row) => row.enrollments?.length || 0,
      cell: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value} enrolled
        </span>
      ),
    },
  ];

  const actions = (row) => (
    <div className="flex items-center justify-end space-x-2">
      <button
        onClick={() => navigate(`/students/${row.id}`)}
        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
        title="View"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        onClick={() => navigate(`/students/${row.id}/edit`)}
        className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
        title="Edit"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={() => setDeleteDialog({ isOpen: true, student: row })}
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
        title="Students"
        subtitle="Manage student records and enrollments"
        actions={
          <Button icon={Plus} onClick={() => navigate('/students/new')}>
            Add Student
          </Button>
        }
      />

      {isLoading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={filteredStudents}
            isLoading={isLoading}
            emptyMessage="No students found"
            searchable
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search by name, email, or enrollment number..."
            actions={actions}
          />

          <ConfirmDialog
            isOpen={deleteDialog.isOpen}
            onClose={() => setDeleteDialog({ isOpen: false, student: null })}
            onConfirm={handleDelete}
            title="Delete Student"
            message={`Are you sure you want to delete "${deleteDialog.student?.firstName} ${deleteDialog.student?.lastName}"? This action cannot be undone.`}
            confirmText="Delete"
            variant="danger"
            isLoading={isDeleting}
          />
        </>
      )}
    </div>
  );
};

export default StudentsListPage;
