using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using StudentMgmt.Application.DTOs;
using StudentMgmt.Application.Interfaces;
using StudentMgmt.Application.Mappings;
using StudentMgmt.Domain.Entities;

namespace StudentMgmt.Application.Services;

public class StudentService(
    IApplicationDbContext dbContext,
    ILogger<StudentService> logger) : IStudentService
{
    public async Task<StudentResponseDto> GetByIdAsync(Guid id)
    {
        var student = await dbContext.Students
            .Include(s => s.Enrollments)
            .ThenInclude(e => e.Course)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (student is null)
        {
            throw new KeyNotFoundException($"Student with ID '{id}' was not found.");
        }

        return student.ToDto()!;
    }

    public async Task<IEnumerable<StudentResponseDto>> GetAllAsync(StudentFilterDto? filter = null)
    {
        var query = dbContext.Students
            .Include(s => s.Enrollments)
            .ThenInclude(e => e.Course)
            .AsQueryable();

        if (filter is not null)
        {
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var searchTerm = filter.SearchTerm.ToLower();
                query = query.Where(s => s.FirstName.ToLower().Contains(searchTerm) ||
                                        s.LastName.ToLower().Contains(searchTerm));
            }

            if (!string.IsNullOrWhiteSpace(filter.CourseName))
            {
                var courseName = filter.CourseName.ToLower();
                query = query.Where(s => s.Enrollments.Any(e => e.Course.Title.ToLower().Contains(courseName)));
            }

            if (filter.Status.HasValue)
            {
                var status = (EnrollmentStatus)filter.Status.Value;
                query = query.Where(s => s.Enrollments.Any(e => e.Status == status));
            }
        }

        var students = await query.AsNoTracking().ToListAsync();
        return students.Select(s => s.ToDto()!);
    }

    public async Task<StudentResponseDto> RegisterStudentAsync(CreateStudentRequest request)
    {
        var emailExists = await dbContext.Students.AnyAsync(s => s.Email == request.Email);

        if (emailExists)
        {
            throw new ApplicationException("Student with this email already exists.");
        }

        var enrollmentNumber = GenerateEnrollmentNumber();

        var student = new Student(
            request.FirstName,
            request.LastName,
            request.Email,
            request.DateOfBirth,
            enrollmentNumber)
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            DateOfBirth = request.DateOfBirth,
            EnrollmentNumber = enrollmentNumber
        };

        dbContext.Students.Add(student);
        await dbContext.SaveChangesAsync();

        logger.LogInformation(
            "New student registered: {FirstName} {LastName} (ID: {StudentId}, Enrollment: {EnrollmentNumber})",
            student.FirstName,
            student.LastName,
            student.Id,
            student.EnrollmentNumber);

        return student.ToDto()!;
    }

    public async Task<StudentResponseDto> UpdateProfileAsync(Guid id, CreateStudentRequest request)
    {
        var student = await dbContext.Students.FirstOrDefaultAsync(s => s.Id == id);

        if (student is null)
        {
            throw new KeyNotFoundException($"Student with ID '{id}' was not found.");
        }

        // Update tracked entity properties
        student.GetType().GetProperty("FirstName")?.SetValue(student, request.FirstName);
        student.GetType().GetProperty("LastName")?.SetValue(student, request.LastName);
        student.GetType().GetProperty("Email")?.SetValue(student, request.Email);
        student.GetType().GetProperty("DateOfBirth")?.SetValue(student, request.DateOfBirth);

        await dbContext.SaveChangesAsync();

        return student.ToDto()!;
    }

    public async Task DeleteStudentAsync(Guid id)
    {
        var student = await dbContext.Students.FirstOrDefaultAsync(s => s.Id == id);

        if (student is null)
        {
            throw new KeyNotFoundException($"Student with ID '{id}' was not found.");
        }

        student.MarkAsDeleted();
        student.LastModifiedAt = DateTime.UtcNow;

        dbContext.Students.Update(student);
        await dbContext.SaveChangesAsync();

        logger.LogInformation(
            "Student deleted: {FirstName} {LastName} (ID: {StudentId})",
            student.FirstName,
            student.LastName,
            student.Id);
    }

    private static string GenerateEnrollmentNumber() =>
        $"STU-{Random.Shared.Next(100000, 999999)}";
}
