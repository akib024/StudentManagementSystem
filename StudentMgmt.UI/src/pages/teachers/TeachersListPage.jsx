import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2, Mail, Building2 } from 'lucide-react';
import { DataTable, PageHeader, Button, ConfirmDialog } from '../../components/common';
import TableSkeleton from '../../components/common/TableSkeleton';
import { useToast } from '../../contexts/ToastContext';
import teacherService from '../../services/teacherService';

const TeachersListPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, teacher: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setIsLoading(true);
      const data = await teacherService.getAllTeachers();
      setTeachers(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load teachers');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTeachers = useMemo(() => {
    if (!searchQuery.trim()) return teachers;
    const query = searchQuery.toLowerCase();
    return teachers.filter(
      (teacher) =>
        teacher.firstName?.toLowerCase().includes(query) ||
        teacher.lastName?.toLowerCase().includes(query) ||
        teacher.email?.toLowerCase().includes(query) ||
        teacher.employeeId?.toLowerCase().includes(query) ||
        teacher.department?.toLowerCase().includes(query)
    );
  }, [teachers, searchQuery]);

  const handleDelete = async () => {
    if (!deleteDialog.teacher) return;

    try {
      setIsDeleting(true);
      await teacherService.deleteTeacher(deleteDialog.teacher.id);
      setTeachers((prev) => prev.filter((t) => t.id !== deleteDialog.teacher.id));
      toast.success(`Teacher "${deleteDialog.teacher.firstName} ${deleteDialog.teacher.lastName}" has been deleted.`);
      setDeleteDialog({ isOpen: false, teacher: null });
    } catch (err) {
      toast.error(err.message || 'Failed to delete teacher');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Employee ID',
      accessor: 'employeeId',
      render: (row) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {row.employeeId}
        </span>
      ),
    },
    {
      header: 'Name',
      accessor: 'firstName',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">
            {row.firstName} {row.lastName}
          </div>
        </div>
      ),
    },
    {
      header: 'Email',
      accessor: 'email',
      render: (row) => (
        <div className="flex items-center text-gray-600">
          <Mail className="h-4 w-4 mr-2" />
          {row.email}
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: 'department',
      render: (row) => (
        <div className="flex items-center">
          <Building2 className="h-4 w-4 mr-2 text-gray-400" />
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {row.department}
          </span>
        </div>
      ),
    },
  ];

  const actions = (row) => (
    <div className="flex items-center justify-end space-x-2">
      <button
        onClick={() => navigate(`/teachers/${row.id}`)}
        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
        title="View"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        onClick={() => navigate(`/teachers/${row.id}/edit`)}
        className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
        title="Edit"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={() => setDeleteDialog({ isOpen: true, teacher: row })}
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
        title="Teachers"
        subtitle="Manage teacher records and assignments"
        actions={
          <Button icon={Plus} onClick={() => navigate('/teachers/new')}>
            Add Teacher
          </Button>
        }
      />

      {isLoading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={filteredTeachers}
            isLoading={isLoading}
            emptyMessage="No teachers found"
            searchable
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search by name, email, ID, or department..."
            actions={actions}
          />

          <ConfirmDialog
            isOpen={deleteDialog.isOpen}
            onClose={() => setDeleteDialog({ isOpen: false, teacher: null })}
            onConfirm={handleDelete}
            title="Delete Teacher"
            message={`Are you sure you want to delete "${deleteDialog.teacher?.firstName} ${deleteDialog.teacher?.lastName}"? This action cannot be undone.`}
            confirmText="Delete"
            variant="danger"
            isLoading={isDeleting}
          />
        </>
      )}
    </div>
  );
};

export default TeachersListPage;
