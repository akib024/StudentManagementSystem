using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using StudentMgmt.Application.DTOs;
using StudentMgmt.Application.Interfaces;
using StudentMgmt.Domain.Entities;

namespace StudentMgmt.Application.Services;

public class EnrollmentService(IApplicationDbContext context, ILogger<EnrollmentService> logger) : IEnrollmentService
{
    private readonly IApplicationDbContext _context = context;
    private readonly ILogger<EnrollmentService> _logger = logger;

    public async Task<EnrollmentResponseDto> EnrollStudentAsync(EnrollStudentRequest request)
    {
        var student = await _context.Students.FindAsync(request.StudentId)
            ?? throw new InvalidOperationException($"Student with ID {request.StudentId} not found.");

        var course = await _context.Courses.FindAsync(request.CourseId)
            ?? throw new InvalidOperationException($"Course with ID {request.CourseId} not found.");

        var existingEnrollment = await _context.Enrollments
            .AnyAsync(e => e.StudentId == request.StudentId && 
                          e.CourseId == request.CourseId &&
                          e.Status != EnrollmentStatus.Withdrawn);

        if (existingEnrollment)
        {
            throw new InvalidOperationException(
                $"Student '{student.FirstName} {student.LastName}' is already enrolled in '{course.Title}'.");
        }

        var enrollment = new Enrollment(request.StudentId, request.CourseId)
        {
            StudentId = request.StudentId,
            CourseId = request.CourseId,
            Status = EnrollmentStatus.Active
        };

        _context.Enrollments.Add(enrollment);
        await _context.SaveChangesAsync();

        // Reload with navigation properties
        var savedEnrollment = await _context.Enrollments
            .Include(e => e.Student)
            .Include(e => e.Course)
            .FirstAsync(e => e.Id == enrollment.Id);

        _logger.LogInformation(
            "Student enrolled: {StudentName} in {CourseCode} - {CourseTitle}",
            $"{student.FirstName} {student.LastName}",
            course.CourseCode,
            course.Title);

        return ToDto(savedEnrollment);
    }

    public async Task<EnrollmentResponseDto?> GetEnrollmentByIdAsync(Guid id)
    {
        var enrollment = await _context.Enrollments
            .Include(e => e.Student)
            .Include(e => e.Course)
            .FirstOrDefaultAsync(e => e.Id == id);

        return enrollment is null ? null : ToDto(enrollment);
    }

    public async Task<IEnumerable<EnrollmentResponseDto>> GetAllEnrollmentsAsync()
    {
        var enrollments = await _context.Enrollments
            .Include(e => e.Student)
            .Include(e => e.Course)
            .OrderByDescending(e => e.Id)
            .ToListAsync();

        return enrollments.Select(ToDto);
    }

    public async Task<IEnumerable<EnrollmentResponseDto>> GetStudentEnrollmentsAsync(Guid studentId)
    {
        var enrollments = await _context.Enrollments
            .Include(e => e.Student)
            .Include(e => e.Course)
            .Where(e => e.StudentId == studentId)
            .OrderBy(e => e.Course.CourseCode)
            .ToListAsync();

        return enrollments.Select(ToDto);
    }

    public async Task<IEnumerable<EnrollmentResponseDto>> GetCourseEnrollmentsAsync(Guid courseId)
    {
        var enrollments = await _context.Enrollments
            .Include(e => e.Student)
            .Include(e => e.Course)
            .Where(e => e.CourseId == courseId)
            .OrderBy(e => e.Student.LastName)
            .ThenBy(e => e.Student.FirstName)
            .ToListAsync();

        return enrollments.Select(ToDto);
    }

    public async Task<EnrollmentResponseDto> UpdateEnrollmentStatusAsync(Guid id, UpdateEnrollmentStatusRequest request)
    {
        var enrollment = await _context.Enrollments
            .Include(e => e.Student)
            .Include(e => e.Course)
            .FirstOrDefaultAsync(e => e.Id == id)
            ?? throw new InvalidOperationException($"Enrollment with ID {id} not found.");

        if (!Enum.TryParse<EnrollmentStatus>(request.Status, true, out var status))
        {
            throw new InvalidOperationException(
                $"Invalid status '{request.Status}'. Valid values are: {string.Join(", ", Enum.GetNames<EnrollmentStatus>())}");
        }

        enrollment.Status = status;
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Enrollment status updated: {StudentName} in {CourseCode} -> {Status}",
            $"{enrollment.Student.FirstName} {enrollment.Student.LastName}",
            enrollment.Course.CourseCode,
            status);

        return ToDto(enrollment);
    }

    public async Task<TranscriptDto> GetStudentTranscriptAsync(Guid studentId)
    {
        var student = await _context.Students.FindAsync(studentId)
            ?? throw new InvalidOperationException($"Student with ID {studentId} not found.");

        var enrollments = await _context.Enrollments
            .Include(e => e.Course)
            .Where(e => e.StudentId == studentId)
            .OrderBy(e => e.Course.CourseCode)
            .ToListAsync();

        var courses = enrollments.Select(e => new TranscriptCourseDto(
            e.Course.CourseCode,
            e.Course.Title,
            e.Course.Credits,
            e.Grade,
            e.Grade.HasValue ? CalculateLetterGrade(e.Grade.Value) : null,
            e.Status.ToString()
        ));

        var totalCredits = enrollments.Sum(e => e.Course.Credits);
        var completedEnrollments = enrollments.Where(e => e.Status == EnrollmentStatus.Completed && e.Grade.HasValue).ToList();
        var earnedCredits = completedEnrollments.Sum(e => e.Course.Credits);
        
        decimal? gpa = null;
        if (completedEnrollments.Count > 0)
        {
            var totalGradePoints = completedEnrollments.Sum(e => CalculateGradePoints(e.Grade!.Value) * e.Course.Credits);
            gpa = Math.Round(totalGradePoints / earnedCredits, 2);
        }

        return new TranscriptDto(
            student.Id,
            $"{student.FirstName} {student.LastName}",
            student.EnrollmentNumber,
            courses,
            totalCredits,
            earnedCredits,
            gpa);
    }

    public async Task WithdrawEnrollmentAsync(Guid id)
    {
        var enrollment = await _context.Enrollments
            .Include(e => e.Student)
            .Include(e => e.Course)
            .FirstOrDefaultAsync(e => e.Id == id)
            ?? throw new InvalidOperationException($"Enrollment with ID {id} not found.");

        if (enrollment.Status == EnrollmentStatus.Withdrawn)
        {
            throw new InvalidOperationException("This enrollment has already been withdrawn.");
        }

        if (enrollment.Status == EnrollmentStatus.Completed)
        {
            throw new InvalidOperationException("Cannot withdraw from a completed course.");
        }

        enrollment.Status = EnrollmentStatus.Withdrawn;
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Student withdrawn: {StudentName} from {CourseCode}",
            $"{enrollment.Student.FirstName} {enrollment.Student.LastName}",
            enrollment.Course.CourseCode);
    }

    private static EnrollmentResponseDto ToDto(Enrollment enrollment) => new(
        enrollment.Id,
        enrollment.StudentId,
        $"{enrollment.Student.FirstName} {enrollment.Student.LastName}",
        enrollment.Student.EnrollmentNumber,
        enrollment.CourseId,
        enrollment.Course.CourseCode,
        enrollment.Course.Title,
        enrollment.Course.Credits,
        enrollment.Grade,
        enrollment.Status.ToString(),
        enrollment.Id != Guid.Empty ? DateTime.UtcNow : DateTime.UtcNow // Placeholder for created date
    );

    private static string CalculateLetterGrade(decimal grade) => grade switch
    {
        >= 90 => "A",
        >= 80 => "B",
        >= 70 => "C",
        >= 60 => "D",
        _ => "F"
    };

    private static decimal CalculateGradePoints(decimal grade) => grade switch
    {
        >= 90 => 4.0m,
        >= 80 => 3.0m,
        >= 70 => 2.0m,
        >= 60 => 1.0m,
        _ => 0.0m
    };
}
