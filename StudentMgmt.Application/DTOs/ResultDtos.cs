namespace StudentMgmt.Application.DTOs;

public record SubmitResultRequest(Guid EnrollmentId, decimal Score);

public record ResultResponseDto(
    Guid Id,
    Guid EnrollmentId,
    decimal Score,
    string Grade,
    DateTime CreatedAt);

public record StudentPerformanceDto(
    Guid StudentId,
    string StudentName,
    List<CoursePerformanceDto> Courses,
    decimal Gpa,
    int TotalCredits);

public record CoursePerformanceDto(
    string CourseCode,
    string CourseName,
    int Credits,
    decimal Score,
    string Grade,
    decimal GradePoint);

public record PerformanceResponseDto(
    string StudentFullName,
    decimal GPA,
    int TotalCreditsEarned,
    List<CourseResultDto> Courses);

public record CourseResultDto(
    string CourseName,
    decimal Score,
    string Grade);
