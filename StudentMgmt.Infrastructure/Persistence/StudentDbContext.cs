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
    public DbSet<Result> Results => Set<Result>();
    public DbSet<User> Users => Set<User>();

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
                .WithMany(s => s.Enrollments)
                .HasForeignKey(e => e.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Course)
                .WithMany(c => c.Enrollments)
                .HasForeignKey(e => e.CourseId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure Result entity with one-to-one relationship
        modelBuilder.Entity<Result>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.EnrollmentId).IsUnique();
            entity.HasQueryFilter("SoftDeleteFilter", e => !e.IsDeleted);

            entity.Property(e => e.Score).HasPrecision(5, 2);
            entity.ToTable(t => t.HasCheckConstraint("CK_Results_Score", "[Score] >= 0 AND [Score] <= 100"));

            entity.HasOne(e => e.Enrollment)
                .WithOne(e => e.ExamResult)
                .HasForeignKey<Result>(e => e.EnrollmentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure User entity
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasQueryFilter("SoftDeleteFilter", e => !e.IsDeleted);

            entity.Property(e => e.Username).HasMaxLength(50).IsRequired();
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.Role).HasMaxLength(20).IsRequired();

            entity.HasOne(e => e.Student)
                .WithOne()
                .HasForeignKey<User>(e => e.StudentId)
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
