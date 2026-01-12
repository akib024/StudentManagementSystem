using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using StudentMgmt.Application.DTOs;
using StudentMgmt.Application.Interfaces;
using StudentMgmt.Domain.Entities;

namespace StudentMgmt.Application.Services;

/// <summary>
/// Service for generating reports and analytics
/// </summary>
public class ReportService(IApplicationDbContext context, ILogger<ReportService> logger) : IReportService
{
    private readonly IApplicationDbContext _context = context;
    private readonly ILogger<ReportService> _logger = logger;

    private const decimal GPA_SCALE = 4.0m;
    private readonly Dictionary<string, decimal> _gradePointMap = new()
    {
        { "A", 4.0m },
        { "B", 3.0m },
        { "C", 2.0m },
        { "D", 1.0m },
        { "F", 0.0m }
    };

    public async Task<StudentTranscriptDto> GenerateStudentTranscriptAsync(Guid studentId)
    {
        _logger.LogInformation("Generating transcript for student: {StudentId}", studentId);

        var student = await _context.Students
            .FirstOrDefaultAsync(s => s.Id == studentId)
            ?? throw new InvalidOperationException($"Student with ID {studentId} not found.");

        var enrollments = await _context.Enrollments
            .Where(e => e.StudentId == studentId && e.Status == EnrollmentStatus.Completed)
            .Include(e => e.Course)
            .ToListAsync();

        var transcriptCourses = enrollments.Select(e => new TranscriptCourseDetailsDto(
            CourseCode: e.Course.CourseCode,
            CourseTitle: e.Course.Title,
            Credits: e.Course.Credits,
            GradePoint: e.Grade.HasValue ? _gradePointMap.GetValueOrDefault(ConvertScoreToLetter((decimal)e.Grade), 0) : null,
            LetterGrade: e.Grade.HasValue ? ConvertScoreToLetter((decimal)e.Grade) : null,
            Status: e.Status.ToString(),
            CompletedDate: e.CreatedAt
        )).ToList();

        var totalCredits = enrollments.Sum(e => e.Course.Credits);
        var completedCredits = enrollments
            .Where(e => e.Grade.HasValue && e.Grade >= 60)
            .Sum(e => e.Course.Credits);

        var grades = enrollments
            .Where(e => e.Grade.HasValue)
            .Select(e => _gradePointMap.GetValueOrDefault(ConvertScoreToLetter((decimal)e.Grade), 0))
            .ToList();

        var gpa = grades.Any() ? (decimal?)Math.Round(grades.Average(), 2) : null;
        var academicStanding = await GetAcademicStandingAsync(studentId);

        return new StudentTranscriptDto(
            StudentId: studentId,
            StudentName: $"{student.FirstName} {student.LastName}",
            EnrollmentNumber: student.EnrollmentNumber,
            Department: "Not Assigned",
            RegisteredAt: student.CreatedAt,
            Courses: transcriptCourses,
            TotalCreditsAttempted: totalCredits,
            TotalCreditsEarned: completedCredits,
            CumulativeGPA: gpa,
            AcademicStanding: academicStanding,
            GeneratedAt: DateTime.UtcNow
        );
    }

    public async Task<GradeReportDto> GenerateGradeReportAsync(Guid courseId)
    {
        _logger.LogInformation("Generating grade report for course: {CourseId}", courseId);

        var course = await _context.Courses
            .FirstOrDefaultAsync(c => c.Id == courseId)
            ?? throw new InvalidOperationException($"Course with ID {courseId} not found.");

        var enrollments = await _context.Enrollments
            .Where(e => e.CourseId == courseId && (e.Status == EnrollmentStatus.Completed || e.Status == EnrollmentStatus.Active))
            .Include(e => e.Student)
            .ToListAsync();

        var gradedEnrollments = enrollments.Where(e => e.Grade.HasValue).ToList();

        var reportStudents = enrollments.Select(e => new GradeReportStudentDto(
            StudentId: e.StudentId,
            StudentName: $"{e.Student.FirstName} {e.Student.LastName}",
            EnrollmentNumber: e.Student.EnrollmentNumber,
            Grade: e.Grade,
            LetterGrade: e.Grade.HasValue ? ConvertScoreToLetter((decimal)e.Grade) : null,
            Status: e.Status.ToString()
        )).ToList();

        var classAverage = gradedEnrollments.Any()
            ? Math.Round((decimal)gradedEnrollments.Average(e => e.Grade ?? 0), 2)
            : 0;

        var gradeDistribution = CalculateGradeDistribution(enrollments);

        return new GradeReportDto(
            CourseId: courseId,
            CourseCode: course.CourseCode,
            CourseTitle: course.Title,
            Credits: course.Credits,
            TeacherId: Guid.Empty,
            TeacherName: "Not Assigned",
            Students: reportStudents,
            ClassAverage: classAverage,
            HighestGrade: gradedEnrollments.Any() ? (decimal)gradedEnrollments.Max(e => e.Grade ?? 0) : 0,
            LowestGrade: gradedEnrollments.Any() ? (decimal)gradedEnrollments.Min(e => e.Grade ?? 0) : 0,
            GradeDistribution: gradeDistribution,
            GeneratedAt: DateTime.UtcNow
        );
    }

    public async Task<StudentAnalyticsDto> GetStudentAnalyticsAsync(Guid studentId)
    {
        _logger.LogInformation("Getting analytics for student: {StudentId}", studentId);

        var student = await _context.Students
            .FirstOrDefaultAsync(s => s.Id == studentId)
            ?? throw new InvalidOperationException($"Student with ID {studentId} not found.");

        var allEnrollments = await _context.Enrollments
            .Where(e => e.StudentId == studentId)
            .Include(e => e.Course)
            .ToListAsync();

        var completedEnrollments = allEnrollments.Where(e => e.Status == EnrollmentStatus.Completed).ToList();
        var inProgressEnrollments = allEnrollments.Where(e => e.Status == EnrollmentStatus.Active).ToList();
        var failedEnrollments = allEnrollments.Where(e => e.Status == EnrollmentStatus.Failed).ToList();

        var completedGrades = completedEnrollments
            .Where(e => e.Grade.HasValue)
            .Select(e => _gradePointMap.GetValueOrDefault(ConvertScoreToLetter((decimal)e.Grade), 0))
            .ToList();

        var currentGPA = completedGrades.Any() ? (decimal?)Math.Round(completedGrades.Average(), 2) : null;

        var completionRate = allEnrollments.Any()
            ? (decimal)completedEnrollments.Count / allEnrollments.Count
            : 0;

        var semesterStats = new List<SemesterStatsDto>();
        var groupedByYear = completedEnrollments.GroupBy(e => e.CreatedAt.Year);
        foreach (var yearGroup in groupedByYear)
        {
            var yearEnrollments = yearGroup.ToList();
            var yearGrades = yearEnrollments
                .Where(e => e.Grade.HasValue)
                .Select(e => _gradePointMap.GetValueOrDefault(ConvertScoreToLetter((decimal)e.Grade), 0))
                .ToList();

            var yearGPA = yearGrades.Any() ? (decimal?)Math.Round(yearGrades.Average(), 2) : null;

            semesterStats.Add(new SemesterStatsDto(
                Semester: $"{yearGroup.Key}",
                CoursesEnrolled: yearEnrollments.Count,
                CoursesCompleted: yearEnrollments.Count(e => e.Status == EnrollmentStatus.Completed),
                SemesterGPA: yearGPA,
                CreditsEarned: yearEnrollments.Where(e => e.Grade.HasValue && e.Grade >= 60).Sum(e => e.Course.Credits)
            ));
        }

        var academicTrend = DetermineAcademicTrend(semesterStats);

        return new StudentAnalyticsDto(
            StudentId: studentId,
            StudentName: $"{student.FirstName} {student.LastName}",
            EnrollmentNumber: student.EnrollmentNumber,
            CurrentGPA: currentGPA,
            PreviousSemesterGPA: semesterStats.Count > 1 ? semesterStats[^2].SemesterGPA : null,
            CoursesCompleted: completedEnrollments.Count,
            CoursesInProgress: inProgressEnrollments.Count,
            CoursesFailed: failedEnrollments.Count,
            CompletionRate: completionRate,
            AcademicTrend: academicTrend,
            SemesterStats: semesterStats
        );
    }

    public async Task<DepartmentAnalyticsDto> GetDepartmentAnalyticsAsync(Guid departmentId)
    {
        _logger.LogInformation("Getting analytics for department: {DepartmentId}", departmentId);

        // For now, returning mock department analytics since department structure needs review
        return new DepartmentAnalyticsDto(
            DepartmentId: departmentId,
            DepartmentName: "Department",
            TotalStudents: 0,
            TotalCourses: 0,
            AverageDepartmentGPA: 0,
            StudentsPassed: 0,
            StudentsFailed: 0,
            PassRate: 0,
            TopPerformingCourses: [],
            ChallengeingCourses: []
        );
    }

    public async Task<IEnumerable<StudentAnalyticsDto>> GetAllStudentsAnalyticsAsync()
    {
        _logger.LogInformation("Getting analytics for all students");

        var students = await _context.Students.ToListAsync();
        var analytics = new List<StudentAnalyticsDto>();

        foreach (var student in students)
        {
            try
            {
                var studentAnalytics = await GetStudentAnalyticsAsync(student.Id);
                analytics.Add(studentAnalytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting analytics for student {StudentId}", student.Id);
            }
        }

        return analytics;
    }

    public async Task<decimal?> CalculateGPAAsync(IEnumerable<decimal?> grades)
    {
        var gradesList = grades.Where(g => g.HasValue).Select(g => g.Value).ToList();

        if (!gradesList.Any())
            return null;

        return Math.Round(gradesList.Average(), 2);
    }

    public async Task<string> GetAcademicStandingAsync(Guid studentId)
    {
        var enrollments = await _context.Enrollments
            .Where(e => e.StudentId == studentId)
            .ToListAsync();

        if (enrollments.Count == 0)
            return "Good Standing";

        var failedCount = enrollments.Count(e => e.Status == EnrollmentStatus.Failed);
        var totalEnrolled = enrollments.Count;

        var failureRate = (decimal)failedCount / totalEnrolled;

        return failureRate switch
        {
            >= 0.3m => "Academic Probation",
            >= 0.15m => "Warning",
            _ => "Good Standing"
        };
    }

    public async Task<byte[]> ExportTranscriptToPdfAsync(Guid studentId)
    {
        var transcript = await GenerateStudentTranscriptAsync(studentId);
        _logger.LogInformation("PDF export requested for student: {StudentId}", studentId);
        return Array.Empty<byte>();
    }

    public async Task<byte[]> ExportGradeReportToExcelAsync(Guid courseId)
    {
        var report = await GenerateGradeReportAsync(courseId);
        _logger.LogInformation("Excel export requested for course: {CourseId}", courseId);
        return Array.Empty<byte>();
    }

    public async Task<string> ExportGradeReportToCsvAsync(Guid courseId)
    {
        var report = await GenerateGradeReportAsync(courseId);

        var csv = new System.Text.StringBuilder();
        csv.AppendLine($"Grade Report - {report.CourseCode}: {report.CourseTitle}");
        csv.AppendLine($"Generated: {report.GeneratedAt:yyyy-MM-dd HH:mm:ss}");
        csv.AppendLine($"Teacher: {report.TeacherName}");
        csv.AppendLine($"Class Average: {report.ClassAverage:F2}");
        csv.AppendLine();
        csv.AppendLine("Student Name,Enrollment Number,Grade,Letter Grade,Status");

        foreach (var student in report.Students)
        {
            var gradeStr = student.Grade.HasValue ? student.Grade.Value.ToString("F2") : "-";
            csv.AppendLine($"\"{student.StudentName}\",{student.EnrollmentNumber},{gradeStr},{student.LetterGrade},{student.Status}");
        }

        _logger.LogInformation("CSV export generated for course: {CourseId}", courseId);
        return csv.ToString();
    }

    private GradeDistributionDto CalculateGradeDistribution(List<Enrollment> enrollments)
    {
        int countA = 0, countB = 0, countC = 0, countD = 0, countF = 0;

        foreach (var enrollment in enrollments)
        {
            if (enrollment.Grade.HasValue)
            {
                var letter = ConvertScoreToLetter((decimal)enrollment.Grade);
                switch (letter)
                {
                    case "A": countA++; break;
                    case "B": countB++; break;
                    case "C": countC++; break;
                    case "D": countD++; break;
                    case "F": countF++; break;
                }
            }
        }

        return new GradeDistributionDto(
            CountA: countA,
            CountB: countB,
            CountC: countC,
            CountD: countD,
            CountF: countF,
            CountIncomplete: enrollments.Count(e => !e.Grade.HasValue)
        );
    }

    private string DetermineAcademicTrend(List<SemesterStatsDto> semesterStats)
    {
        if (semesterStats.Count < 2)
            return "Insufficient Data";

        var latestGPA = semesterStats.Last().SemesterGPA ?? 0;
        var previousGPA = semesterStats[^2].SemesterGPA ?? 0;

        var difference = latestGPA - previousGPA;

        return difference switch
        {
            > 0.3m => "Improving",
            < -0.3m => "Declining",
            _ => "Stable"
        };
    }

    private string ConvertScoreToLetter(decimal score)
    {
        return score switch
        {
            >= 90 => "A",
            >= 80 => "B",
            >= 70 => "C",
            >= 60 => "D",
            _ => "F"
        };
    }
}
