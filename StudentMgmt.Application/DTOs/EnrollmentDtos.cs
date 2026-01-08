namespace StudentMgmt.Application.DTOs;

public record EnrollStudentRequest(
    Guid StudentId,
    Guid CourseId);

public record UpdateEnrollmentStatusRequest(
    string Status);

public record EnrollmentResponseDto(
    Guid Id,
    Guid StudentId,
    string StudentName,
    string EnrollmentNumber,
    Guid CourseId,
    string CourseCode,
    string CourseTitle,
    int Credits,
    decimal? Grade,
    string Status,
    DateTime EnrolledAt);

public record TranscriptDto(
    Guid StudentId,
    string StudentName,
    string EnrollmentNumber,
    IEnumerable<TranscriptCourseDto> Courses,
    decimal TotalCredits,
    decimal EarnedCredits,
    decimal? GPA);

public record TranscriptCourseDto(
    string CourseCode,
    string CourseTitle,
    int Credits,
    decimal? Grade,
    string? LetterGrade,
    string Status);
