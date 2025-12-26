using StudentMgmt.Domain.Entities;

namespace StudentMgmt.Application.Interfaces;

public interface IEnrollmentService
{
    Task<Enrollment> EnrollStudentAsync(Guid studentId, Guid courseId);
    Task<Enrollment> UpdateGradeAsync(Guid enrollmentId, decimal grade);
    Task<IEnumerable<Enrollment>> GetStudentTranscriptAsync(Guid studentId);
}
