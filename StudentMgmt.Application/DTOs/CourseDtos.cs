namespace StudentMgmt.Application.DTOs;

public record CreateCourseRequest(
    string CourseCode,
    string Title,
    int Credits,
    string? Description);

public record UpdateCourseRequest(
    string Title,
    int Credits,
    string? Description);

public record CourseResponseDto(
    Guid Id,
    string CourseCode,
    string Title,
    int Credits,
    string? Description,
    int EnrollmentCount);

public record AssignTeacherRequest(
    Guid TeacherId,
    Guid CourseId);
