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
                .ThenInclude(c => c.Teacher)
            .FirstOrDefaultAsync(e => e.Id == id);

        return enrollment is null ? null : ToDto(enrollment);
    }

    public async Task<IEnumerable<EnrollmentResponseDto>> GetAllEnrollmentsAsync()
    {
        var enrollments = await _context.Enrollments
            .Include(e => e.Student)
            .Include(e => e.Course)
                .ThenInclude(c => c.Teacher)
            .OrderByDescending(e => e.Id)
            .ToListAsync();

        return enrollments.Select(ToDto);
    }

    public async Task<IEnumerable<EnrollmentResponseDto>> GetStudentEnrollmentsAsync(Guid studentId)
    {
        var enrollments = await _context.Enrollments
            .Include(e => e.Student)
            .Include(e => e.Course)
                .ThenInclude(c => c.Teacher)
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
                .ThenInclude(c => c.Teacher)
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

        // Validation: Cannot mark as Completed without a grade
        if (status == EnrollmentStatus.Completed && !enrollment.Grade.HasValue)
        {
            throw new InvalidOperationException(
                "Cannot mark enrollment as Completed without assigning a grade first.");
        }

        // Validation: Cannot mark as Failed with a passing grade
        if (status == EnrollmentStatus.Failed && enrollment.Grade.HasValue && enrollment.Grade.Value >= 60)
        {
            throw new InvalidOperationException(
                "Cannot mark enrollment as Failed when the student has a passing grade.");
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

    public async Task<BatchOperationResult> BatchUpdateEnrollmentStatusAsync(BatchUpdateStatusRequest request)
    {
        if (!Enum.TryParse<EnrollmentStatus>(request.Status, true, out var status))
        {
            throw new InvalidOperationException(
                $"Invalid status '{request.Status}'. Valid values are: {string.Join(", ", Enum.GetNames<EnrollmentStatus>())}");
        }

        var successCount = 0;
        var failureCount = 0;
        var errors = new List<string>();

        foreach (var enrollmentId in request.EnrollmentIds)
        {
            try
            {
                var enrollment = await _context.Enrollments
                    .Include(e => e.Student)
                    .Include(e => e.Course)
                    .FirstOrDefaultAsync(e => e.Id == enrollmentId);

                if (enrollment == null)
                {
                    errors.Add($"Enrollment {enrollmentId}: Not found");
                    failureCount++;
                    continue;
                }

                // Validation: Cannot mark as Completed without a grade
                if (status == EnrollmentStatus.Completed && !enrollment.Grade.HasValue)
                {
                    errors.Add($"Enrollment {enrollmentId} ({enrollment.Student.FirstName} {enrollment.Student.LastName}): Cannot complete without grade");
                    failureCount++;
                    continue;
                }

                // Validation: Cannot mark as Failed with a passing grade
                if (status == EnrollmentStatus.Failed && enrollment.Grade.HasValue && enrollment.Grade.Value >= 60)
                {
                    errors.Add($"Enrollment {enrollmentId} ({enrollment.Student.FirstName} {enrollment.Student.LastName}): Cannot mark as Failed with passing grade");
                    failureCount++;
                    continue;
                }

                enrollment.Status = status;
                successCount++;

                _logger.LogInformation(
                    "Batch enrollment status updated: {StudentName} in {CourseCode} -> {Status}",
                    $"{enrollment.Student.FirstName} {enrollment.Student.LastName}",
                    enrollment.Course.CourseCode,
                    status);
            }
            catch (Exception ex)
            {
                errors.Add($"Enrollment {enrollmentId}: {ex.Message}");
                failureCount++;
            }
        }

        if (successCount > 0)
        {
            await _context.SaveChangesAsync();
        }

        _logger.LogInformation(
            "Batch enrollment status update completed: {SuccessCount} succeeded, {FailureCount} failed",
            successCount,
            failureCount);

        return new BatchOperationResult(successCount, failureCount, errors);
    }

    public async Task<EnrollmentResponseDto> UpdateEnrollmentGradeAsync(Guid id, UpdateEnrollmentGradeRequest request)
    {
        var enrollment = await _context.Enrollments
            .Include(e => e.Student)
            .Include(e => e.Course)
                .ThenInclude(c => c.Teacher)
            .FirstOrDefaultAsync(e => e.Id == id)
            ?? throw new InvalidOperationException($"Enrollment with ID {id} not found.");

        // Validation: Cannot change grade for completed enrollments
        if (enrollment.Status == EnrollmentStatus.Completed)
        {
            throw new InvalidOperationException(
                "Cannot change grade for a completed enrollment. Change status first if modification is needed.");
        }

        // Parse grade string to decimal
        var validGrades = new Dictionary<string, decimal>
        {
            { "A+", 97 }, { "A", 94 }, { "A-", 90 },
            { "B+", 87 }, { "B", 84 }, { "B-", 80 },
            { "C+", 77 }, { "C", 74 }, { "C-", 70 },
            { "D", 65 }, { "F", 50 }
        };

        if (!validGrades.TryGetValue(request.Grade, out var gradeValue))
        {
            throw new InvalidOperationException(
                $"Invalid grade '{request.Grade}'. Valid values are: {string.Join(", ", validGrades.Keys)}");
        }

        enrollment.Grade = gradeValue;
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Enrollment grade updated: {StudentName} in {CourseCode} -> {Grade}",
            $"{enrollment.Student.FirstName} {enrollment.Student.LastName}",
            enrollment.Course.CourseCode,
            request.Grade);

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
        enrollment.Course.Teacher != null ? $"{enrollment.Course.Teacher.FirstName} {enrollment.Course.Teacher.LastName}" : null,
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
