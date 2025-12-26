using System.ComponentModel.DataAnnotations;

namespace StudentMgmt.Application.DTOs;

public record class EnrollStudentRequest
{
    [Required(ErrorMessage = "Student ID is required.")]
    public required Guid StudentId { get; init; }

    [Required(ErrorMessage = "Course ID is required.")]
    public required Guid CourseId { get; init; }
}
