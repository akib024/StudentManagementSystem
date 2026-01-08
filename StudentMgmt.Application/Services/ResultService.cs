using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using StudentMgmt.Application.DTOs;
using StudentMgmt.Application.Interfaces;
using StudentMgmt.Domain.Entities;

namespace StudentMgmt.Application.Services;

public class ResultService(IApplicationDbContext context, ILogger<ResultService> logger) : IResultService
{
    private readonly IApplicationDbContext _context = context;
    private readonly ILogger<ResultService> _logger = logger;

    public async Task<ResultResponseDto> SubmitResultAsync(SubmitResultRequest request)
    {
        // Verify enrollment exists
        var enrollment = await _context.Enrollments
            .Include(e => e.Student)
            .Include(e => e.Course)
            .Include(e => e.ExamResult)
            .FirstOrDefaultAsync(e => e.Id == request.EnrollmentId)
            ?? throw new KeyNotFoundException($"Enrollment with ID '{request.EnrollmentId}' not found.");

        // Check if result already exists
        if (enrollment.ExamResult is not null)
        {
            throw new InvalidOperationException($"Result already exists for this enrollment. Result ID: {enrollment.ExamResult.Id}");
        }

        // Calculate grade based on score
        var grade = CalculateGrade(request.Score);

        // Create result entity
        var result = new Result
        {
            EnrollmentId = request.EnrollmentId,
            Score = request.Score,
            Grade = grade
        };

        _context.Results.Add(result);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Result submitted for enrollment {EnrollmentId}: Student {StudentName}, Course {CourseCode}, Score {Score}, Grade {Grade}",
            request.EnrollmentId,
            $"{enrollment.Student.FirstName} {enrollment.Student.LastName}",
            enrollment.Course.CourseCode,
            request.Score,
            grade);

        return new ResultResponseDto(
            result.Id,
            result.EnrollmentId,
            result.Score,
            result.Grade,
            result.CreatedAt);
    }

    public async Task<StudentPerformanceDto> GetStudentPerformanceAsync(Guid studentId)
    {
        // Verify student exists
        var student = await _context.Students
            .FirstOrDefaultAsync(s => s.Id == studentId)
            ?? throw new KeyNotFoundException($"Student with ID '{studentId}' not found.");

        // Get all enrollments with results
        var enrollmentsWithResults = await _context.Enrollments
            .Include(e => e.Course)
            .Include(e => e.ExamResult)
            .Where(e => e.StudentId == studentId && e.ExamResult != null)
            .ToListAsync();

        if (enrollmentsWithResults.Count == 0)
        {
            return new StudentPerformanceDto(
                studentId,
                $"{student.FirstName} {student.LastName}",
                new List<CoursePerformanceDto>(),
                0.0m,
                0);
        }

        // Map to DTOs with grade points
        var coursePerformances = enrollmentsWithResults
            .Select(e => new CoursePerformanceDto(
                e.Course.CourseCode,
                e.Course.Title,
                e.Course.Credits,
                e.ExamResult!.Score,
                e.ExamResult.Grade,
                CalculateGradePoint(e.ExamResult.Grade)))
            .ToList();

        // Calculate GPA using weighted average (credit hours * grade points)
        var totalGradePoints = coursePerformances.Sum(c => c.Credits * c.GradePoint);
        var totalCredits = coursePerformances.Sum(c => c.Credits);
        var gpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0.0m;

        _logger.LogInformation(
            "Performance retrieved for student {StudentId}: {CourseCount} courses, GPA {Gpa:F2}, Credits {Credits}",
            studentId,
            coursePerformances.Count,
            gpa,
            totalCredits);

        return new StudentPerformanceDto(
            studentId,
            $"{student.FirstName} {student.LastName}",
            coursePerformances,
            Math.Round(gpa, 2),
            totalCredits);
    }

    public async Task<PerformanceResponseDto> GetPerformanceAsync(Guid studentId)
    {
        var student = await _context.Students
            .FirstOrDefaultAsync(s => s.Id == studentId)
            ?? throw new KeyNotFoundException($"Student with ID '{studentId}' not found.");

        var enrollmentsWithResults = await _context.Enrollments
            .Include(e => e.Course)
            .Include(e => e.ExamResult)
            .Where(e => e.StudentId == studentId && e.ExamResult != null)
            .ToListAsync();

        if (enrollmentsWithResults.Count == 0)
        {
            return new PerformanceResponseDto(
                $"{student.FirstName} {student.LastName}",
                0.0m,
                0,
                new List<CourseResultDto>());
        }

        var courseResults = enrollmentsWithResults
            .Select(e => new CourseResultDto(
                e.Course.Title,
                e.ExamResult!.Score,
                e.ExamResult.Grade))
            .ToList();

        var totalGradePoints = enrollmentsWithResults.Sum(e => 
            e.Course.Credits * CalculateGradePoint(e.ExamResult!.Grade));
        var totalCredits = enrollmentsWithResults.Sum(e => e.Course.Credits);
        var gpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0.0m;

        _logger.LogInformation(
            "Performance retrieved for student {StudentId}: {CourseCount} courses, GPA {Gpa:F2}, Credits {Credits}",
            studentId,
            courseResults.Count,
            gpa,
            totalCredits);

        return new PerformanceResponseDto(
            $"{student.FirstName} {student.LastName}",
            Math.Round(gpa, 2),
            totalCredits,
            courseResults);
    }

    private static string CalculateGrade(decimal score) => score switch
    {
        >= 90 => "A",
        >= 80 => "B",
        >= 70 => "C",
        >= 60 => "D",
        _ => "F"
    };

    private static decimal CalculateGradePoint(string grade) => grade switch
    {
        "A" => 4.0m,
        "B" => 3.0m,
        "C" => 2.0m,
        "D" => 1.0m,
        "F" => 0.0m,
        _ => 0.0m
    };
}
