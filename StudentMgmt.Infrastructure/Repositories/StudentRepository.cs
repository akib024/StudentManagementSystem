using Microsoft.EntityFrameworkCore;
using StudentMgmt.Application.Interfaces;
using StudentMgmt.Domain.Entities;
using StudentMgmt.Infrastructure.Persistence;

namespace StudentMgmt.Infrastructure.Repositories;

public class StudentRepository(StudentDbContext dbContext) : IStudentRepository
{
    public async Task<Student?> GetByIdAsync(Guid id) =>
        await dbContext.Students.FirstOrDefaultAsync(s => s.Id == id);

    public async Task<IEnumerable<Student>> GetAllAsync() =>
        await dbContext.Students.ToListAsync();

    public async Task<Student?> GetByEmailAsync(string email) =>
        await dbContext.Students.FirstOrDefaultAsync(s => s.Email == email);

    public async Task<Student> AddAsync(Student student)
    {
        dbContext.Students.Add(student);
        await dbContext.SaveChangesAsync();
        return student;
    }

    public async Task<Student> UpdateAsync(Student student)
    {
        dbContext.Students.Update(student);
        await dbContext.SaveChangesAsync();
        return student;
    }

    public async Task<bool> ExistsAsync(Guid id) =>
        await dbContext.Students.AnyAsync(s => s.Id == id);
}
