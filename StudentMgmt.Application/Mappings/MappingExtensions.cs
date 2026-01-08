using StudentMgmt.Application.DTOs;
using StudentMgmt.Domain.Entities;

namespace StudentMgmt.Application.Mappings;

public static class MappingExtensions
{
    public static StudentResponseDto? ToDto(this Student? student) =>
        student is null ? null : new()
        {
            Id = student.Id,
            FirstName = student.FirstName,
            LastName = student.LastName,
            Email = student.Email,
            EnrollmentNumber = student.EnrollmentNumber,
            Enrollments = student.Enrollments?.Select(e => new StudentEnrollmentDto
            {
                EnrollmentId = e.Id,
                CourseCode = e.Course?.CourseCode ?? string.Empty,
                CourseTitle = e.Course?.Title ?? string.Empty,
                Credits = e.Course?.Credits ?? 0,
                Status = e.Status.ToString(),
                Grade = e.Grade
            }) ?? []
        };

    public static Student ToEntity(this CreateStudentRequest request) =>
        new(request.FirstName, request.LastName, request.Email, request.DateOfBirth, GenerateEnrollmentNumber())
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            DateOfBirth = request.DateOfBirth,
            EnrollmentNumber = GenerateEnrollmentNumber()
        };

    public static CourseResponseDto? ToDto(this Course? course) =>
        course is null ? null : new(
            course.Id,
            course.CourseCode,
            course.Title,
            course.Credits,
            course.Description,
            course.Enrollments?.Count ?? 0);

    public static Course ToEntity(this CreateCourseRequest request) =>
        new(request.CourseCode, request.Title, request.Credits)
        {
            CourseCode = request.CourseCode,
            Title = request.Title,
            Credits = request.Credits,
            Description = request.Description
        };

    public static EnrollmentResponseDto? ToDto(this Enrollment? enrollment) =>
        enrollment is null ? null : new(
            enrollment.Id,
            enrollment.StudentId,
            $"{enrollment.Student?.FirstName} {enrollment.Student?.LastName}".Trim(),
            enrollment.Student?.EnrollmentNumber ?? string.Empty,
            enrollment.CourseId,
            enrollment.Course?.CourseCode ?? string.Empty,
            enrollment.Course?.Title ?? string.Empty,
            enrollment.Course?.Credits ?? 0,
            enrollment.Grade,
            enrollment.Status.ToString(),
            DateTime.UtcNow);

    private static string GenerateEnrollmentNumber() =>
        $"STU-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpperInvariant()}";
}
