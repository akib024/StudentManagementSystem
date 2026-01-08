using StudentMgmt.Application.DTOs;

namespace StudentMgmt.Application.Interfaces;

public interface ICourseService
{
    Task<CourseResponseDto> CreateCourseAsync(CreateCourseRequest request);
    Task<CourseResponseDto?> GetCourseByIdAsync(Guid id);
    Task<IEnumerable<CourseResponseDto>> GetCourseCatalogAsync();
    Task<CourseResponseDto> UpdateCourseAsync(Guid id, UpdateCourseRequest request);
    Task DeleteCourseAsync(Guid id);
}
