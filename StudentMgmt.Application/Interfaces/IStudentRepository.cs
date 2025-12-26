using StudentMgmt.Domain.Entities;

namespace StudentMgmt.Application.Interfaces;

public interface IStudentRepository
{
    Task<Student?> GetByIdAsync(Guid id);
    Task<IEnumerable<Student>> GetAllAsync();
    Task<Student?> GetByEmailAsync(string email);
    Task<Student> AddAsync(Student student);
    Task<Student> UpdateAsync(Student student);
    Task<bool> ExistsAsync(Guid id);
}
