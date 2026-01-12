import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, X } from 'lucide-react';
import { PageHeader, DataTable, Button, ConfirmDialog } from '../../components/common';
import TableSkeleton from '../../components/common/TableSkeleton';
import { useToast } from '../../contexts/ToastContext';
import enrollmentService from '../../services/enrollmentService';

const STATUS_BADGES = {
  Active: 'bg-green-100 text-green-800',
  Completed: 'bg-blue-100 text-blue-800',
  Dropped: 'bg-red-100 text-red-800',
  Pending: 'bg-yellow-100 text-yellow-800',
};

const EnrollmentsListPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [enrollments, setEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, enrollmentId: null });

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      setIsLoading(true);
      const data = await enrollmentService.getAllEnrollments();
      setEnrollments(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load enrollments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      await enrollmentService.withdrawEnrollment(deleteDialog.enrollmentId);
      setSuccessMessage('Enrollment withdrawn successfully');
      setDeleteDialog({ isOpen: false, enrollmentId: null });
      loadEnrollments();
    } catch (err) {
      setError(err.message || 'Failed to withdraw enrollment');
      setDeleteDialog({ isOpen: false, enrollmentId: null });
    }
  };

  const columns = [
    {
      header: 'Student',
      accessor: 'studentName',
      sortable: true,
    },
    {
      header: 'Enrollment Number',
      accessor: 'enrollmentNumber',
      sortable: true,
    },
    {
      header: 'Course',
      accessor: (row) => `${row.courseCode} - ${row.courseTitle}`,
      sortable: true,
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      cell: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGES[value] || 'bg-gray-100 text-gray-800'}`}>
          {value}
        </span>
      ),
    },
    {
      header: 'Enrolled Date',
      accessor: 'enrolledAt',
      sortable: true,
      cell: (value) => new Date(value).toLocaleDateString(),
    },
    {
      header: 'Grade',
      accessor: 'grade',
      cell: (value) => value != null ? value.toString() : '-',
    },
  ];

  const renderActions = (row) => (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(`/enrollments/${row.id}`)}
        title="View Details"
      >
        <Eye className="h-4 w-4" />
      </Button>
      {row.status === 'Active' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDeleteDialog({ isOpen: true, enrollmentId: row.id })}
          className="text-red-600 hover:text-red-700 hover:border-red-300"
          title="Withdraw"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Enrollments"
        subtitle="Manage student course enrollments"
        actions={
          <Button onClick={() => navigate('/enrollments/enroll')}>
            <Plus className="h-4 w-4 mr-2" />
            Enroll Student
          </Button>
        }
      />

      {isLoading ? (
        <TableSkeleton rows={5} columns={7} />
      ) : (
        <>
          <div className="bg-white rounded-lg shadow">
            <DataTable
              columns={columns}
              data={enrollments}
              isLoading={isLoading}
              emptyMessage="No enrollments found"
              actions={renderActions}
            />
          </div>

          <ConfirmDialog
            isOpen={deleteDialog.isOpen}
            title="Withdraw Enrollment"
            message="Are you sure you want to withdraw this enrollment? This action cannot be undone."
            confirmText="Withdraw"
            cancelText="Cancel"
            onConfirm={handleWithdraw}
            onClose={() => setDeleteDialog({ isOpen: false, enrollmentId: null })}
            variant="danger"
          />
        </>
      )}
    </div>
  );
};

export default EnrollmentsListPage;
