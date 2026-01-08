using StudentMgmt.Application.DTOs;

namespace StudentMgmt.Application.Interfaces;

public interface IResultService
{
    Task<ResultResponseDto> SubmitResultAsync(SubmitResultRequest request);
    Task<StudentPerformanceDto> GetStudentPerformanceAsync(Guid studentId);
    Task<PerformanceResponseDto> GetPerformanceAsync(Guid studentId);
}
