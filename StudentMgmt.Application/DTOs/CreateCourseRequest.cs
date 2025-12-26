using System.ComponentModel.DataAnnotations;

namespace StudentMgmt.Application.DTOs;

public record class CreateCourseRequest
{
    [Required(ErrorMessage = "Course code is required.")]
    [StringLength(20, ErrorMessage = "Course code must not exceed 20 characters.")]
    public required string CourseCode { get; init; }

    [Required(ErrorMessage = "Title is required.")]
    [StringLength(200, ErrorMessage = "Title must not exceed 200 characters.")]
    public required string Title { get; init; }

    [Required(ErrorMessage = "Credits is required.")]
    [Range(1, 5, ErrorMessage = "Credits must be between 1 and 5.")]
    public required int Credits { get; init; }

    [StringLength(1000, ErrorMessage = "Description must not exceed 1000 characters.")]
    public string? Description { get; init; }
}
