using StudentMgmt.Application.DTOs;

namespace StudentMgmt.Application.Interfaces;

public interface IEnrollmentService
{
    Task<EnrollmentResponseDto> EnrollStudentAsync(EnrollStudentRequest request);
    Task<EnrollmentResponseDto?> GetEnrollmentByIdAsync(Guid id);
    Task<IEnumerable<EnrollmentResponseDto>> GetAllEnrollmentsAsync();
    Task<IEnumerable<EnrollmentResponseDto>> GetStudentEnrollmentsAsync(Guid studentId);
    Task<IEnumerable<EnrollmentResponseDto>> GetCourseEnrollmentsAsync(Guid courseId);
    Task<EnrollmentResponseDto> UpdateEnrollmentStatusAsync(Guid id, UpdateEnrollmentStatusRequest request);
    Task<BatchOperationResult> BatchUpdateEnrollmentStatusAsync(BatchUpdateStatusRequest request);
    Task<EnrollmentResponseDto> UpdateEnrollmentGradeAsync(Guid id, UpdateEnrollmentGradeRequest request);
    Task<TranscriptDto> GetStudentTranscriptAsync(Guid studentId);
    Task WithdrawEnrollmentAsync(Guid id);
}
