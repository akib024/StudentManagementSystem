using StudentMgmt.Domain.Entities;

namespace StudentMgmt.Application.Interfaces;

public interface ICourseService
{
    Task<Course> CreateCourseAsync(Course course);
    Task<IEnumerable<Course>> GetCourseCatalogAsync();
    Task AssignTeacherToCourseAsync(Guid teacherId, Guid courseId);
}
