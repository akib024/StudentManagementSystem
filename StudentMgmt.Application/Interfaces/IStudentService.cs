using StudentMgmt.Application.DTOs;

namespace StudentMgmt.Application.Interfaces;

public interface IStudentService
{
    Task<StudentResponseDto> GetByIdAsync(Guid id);
    Task<IEnumerable<StudentResponseDto>> GetAllAsync();
    Task<StudentResponseDto> RegisterStudentAsync(CreateStudentRequest request);
    Task<StudentResponseDto> UpdateProfileAsync(Guid id, CreateStudentRequest request);
}
