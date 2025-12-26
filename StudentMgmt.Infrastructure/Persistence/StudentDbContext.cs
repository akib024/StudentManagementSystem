using Microsoft.EntityFrameworkCore;
using StudentMgmt.Application.Interfaces;
using StudentMgmt.Domain.Common;
using StudentMgmt.Domain.Entities;

namespace StudentMgmt.Infrastructure.Persistence;

public class StudentDbContext(DbContextOptions<StudentDbContext> options) : DbContext(options), IApplicationDbContext
{
    public DbSet<Student> Students => Set<Student>();
    public DbSet<Teacher> Teachers => Set<Teacher>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Student entity
        modelBuilder.Entity<Student>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.EnrollmentNumber).IsUnique();
            entity.HasQueryFilter("SoftDeleteFilter", e => !e.IsDeleted);
        });

        // Configure Teacher entity
        modelBuilder.Entity<Teacher>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.EmployeeId).IsUnique();
            entity.HasQueryFilter("SoftDeleteFilter", e => !e.IsDeleted);
        });

        // Configure Course entity
        modelBuilder.Entity<Course>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.CourseCode).IsUnique();
            entity.HasQueryFilter("SoftDeleteFilter", e => !e.IsDeleted);
        });

        // Configure Enrollment entity with composite unique constraint
        modelBuilder.Entity<Enrollment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.StudentId, e.CourseId }).IsUnique();
            entity.HasQueryFilter("SoftDeleteFilter", e => !e.IsDeleted);

            entity.Property(e => e.Grade).HasPrecision(5, 2);

            entity.HasOne(e => e.Student)
                .WithMany()
                .HasForeignKey(e => e.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Course)
                .WithMany(c => c.Enrollments)
                .HasForeignKey(e => e.CourseId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    break;

                case EntityState.Modified:
                    entry.Entity.LastModifiedAt = DateTime.UtcNow;
                    break;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
