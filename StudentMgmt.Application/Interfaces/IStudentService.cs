using StudentMgmt.Application.DTOs;

namespace StudentMgmt.Application.Interfaces;

public interface IStudentService
{
    Task<StudentResponseDto> GetByIdAsync(Guid id);
    Task<IEnumerable<StudentResponseDto>> GetAllAsync(StudentFilterDto? filter = null);
    Task<StudentResponseDto> RegisterStudentAsync(CreateStudentRequest request);
    Task<StudentResponseDto> UpdateProfileAsync(Guid id, CreateStudentRequest request);
    Task DeleteStudentAsync(Guid id);
    Task<string> GenerateNextEnrollmentNumberAsync();
}
