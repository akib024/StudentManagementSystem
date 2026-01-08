using StudentMgmt.Application.DTOs;

namespace StudentMgmt.Application.Interfaces;

public interface ITeacherService
{
    Task<TeacherResponseDto> CreateTeacherAsync(CreateTeacherRequest request);
    Task<TeacherResponseDto?> GetTeacherByIdAsync(Guid id);
    Task<IEnumerable<TeacherResponseDto>> GetAllTeachersAsync();
    Task<IEnumerable<TeacherResponseDto>> GetTeachersByDepartmentAsync(string department);
    Task<TeacherResponseDto> UpdateTeacherAsync(Guid id, UpdateTeacherRequest request);
    Task DeleteTeacherAsync(Guid id);
}
