namespace StudentMgmt.Application.DTOs;

/// <summary>
/// Student's academic transcript
/// </summary>
public record StudentTranscriptDto(
    Guid StudentId,
    string StudentName,
    string EnrollmentNumber,
    string Department,
    DateTime RegisteredAt,
    IEnumerable<TranscriptCourseDetailsDto> Courses,
    decimal TotalCreditsAttempted,
    decimal TotalCreditsEarned,
    decimal? CumulativeGPA,
    string AcademicStanding,
    DateTime GeneratedAt);

/// <summary>
/// Individual course entry in transcript
/// </summary>
public record TranscriptCourseDetailsDto(
    string CourseCode,
    string CourseTitle,
    int Credits,
    decimal? GradePoint,
    string? LetterGrade,
    string Status,
    DateTime CompletedDate);

/// <summary>
/// Grade report for a course
/// </summary>
public record GradeReportDto(
    Guid CourseId,
    string CourseCode,
    string CourseTitle,
    int Credits,
    Guid TeacherId,
    string TeacherName,
    IEnumerable<GradeReportStudentDto> Students,
    decimal ClassAverage,
    decimal HighestGrade,
    decimal LowestGrade,
    GradeDistributionDto GradeDistribution,
    DateTime GeneratedAt);

/// <summary>
/// Individual student entry in grade report
/// </summary>
public record GradeReportStudentDto(
    Guid StudentId,
    string StudentName,
    string EnrollmentNumber,
    decimal? Grade,
    string? LetterGrade,
    string Status);

/// <summary>
/// Grade distribution statistics
/// </summary>
public record GradeDistributionDto(
    int CountA,
    int CountB,
    int CountC,
    int CountD,
    int CountF,
    int CountIncomplete);

/// <summary>
/// Student analytics data
/// </summary>
public record StudentAnalyticsDto(
    Guid StudentId,
    string StudentName,
    string EnrollmentNumber,
    decimal? CurrentGPA,
    decimal? PreviousSemesterGPA,
    int CoursesCompleted,
    int CoursesInProgress,
    int CoursesFailed,
    decimal CompletionRate,
    string AcademicTrend,
    IEnumerable<SemesterStatsDto> SemesterStats);

/// <summary>
/// Semester-wise statistics
/// </summary>
public record SemesterStatsDto(
    string Semester,
    int CoursesEnrolled,
    int CoursesCompleted,
    decimal? SemesterGPA,
    decimal CreditsEarned);

/// <summary>
/// Department analytics
/// </summary>
public record DepartmentAnalyticsDto(
    Guid DepartmentId,
    string DepartmentName,
    int TotalStudents,
    int TotalCourses,
    decimal AverageDepartmentGPA,
    int StudentsPassed,
    int StudentsFailed,
    decimal PassRate,
    IEnumerable<CourseAnalyticsDto> TopPerformingCourses,
    IEnumerable<CourseAnalyticsDto> ChallengeingCourses);

/// <summary>
/// Course analytics metrics for reports
/// </summary>
public record CourseAnalyticsDto(
    Guid CourseId,
    string CourseCode,
    string CourseTitle,
    int EnrollmentCount,
    decimal AverageCourseGPA,
    int PassCount,
    int FailCount,
    decimal PassRate);

/// <summary>
/// Request for transcript generation
/// </summary>
public record TranscriptRequestDto(
    Guid StudentId,
    bool IncludeGPAHistory = false);

/// <summary>
/// Request for grade report generation
/// </summary>
public record GradeReportRequestDto(
    Guid CourseId);

/// <summary>
/// Request for export
/// </summary>
public record ExportRequestDto(
    string Format, // PDF, Excel, CSV
    string ReportType); // Transcript, GradeReport, Analytics
