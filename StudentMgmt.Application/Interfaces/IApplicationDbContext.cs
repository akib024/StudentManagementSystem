using Microsoft.EntityFrameworkCore;
using StudentMgmt.Domain.Entities;

namespace StudentMgmt.Application.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Student> Students { get; }
    DbSet<Teacher> Teachers { get; }
    DbSet<Course> Courses { get; }
    DbSet<Enrollment> Enrollments { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
