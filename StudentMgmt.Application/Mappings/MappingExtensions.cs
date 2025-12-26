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
            EnrollmentNumber = student.EnrollmentNumber
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
        course is null ? null : new()
        {
            Id = course.Id,
            CourseCode = course.CourseCode,
            Title = course.Title,
            Credits = course.Credits
        };

    public static Course ToEntity(this CreateCourseRequest request) =>
        new(request.CourseCode, request.Title, request.Credits)
        {
            CourseCode = request.CourseCode,
            Title = request.Title,
            Credits = request.Credits,
            Description = request.Description
        };

    public static EnrollmentResponseDto? ToDto(this Enrollment? enrollment) =>
        enrollment is null ? null : new()
        {
            Id = enrollment.Id,
            StudentName = $"{enrollment.Student?.FirstName} {enrollment.Student?.LastName}".Trim(),
            CourseTitle = enrollment.Course?.Title ?? string.Empty,
            Grade = enrollment.Grade,
            Status = enrollment.Status.ToString()
        };

    private static string GenerateEnrollmentNumber() =>
        $"STU-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpperInvariant()}";
}
