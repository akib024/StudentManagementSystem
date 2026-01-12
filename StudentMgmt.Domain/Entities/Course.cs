using System.ComponentModel.DataAnnotations;
using StudentMgmt.Domain.Common;

namespace StudentMgmt.Domain.Entities;

public class Course(
    string courseCode,
    string title,
    int credits) : BaseEntity
{
    [Required(ErrorMessage = "Course code is required.")]
    [StringLength(20, ErrorMessage = "Course code must not exceed 20 characters.")]
    public required string CourseCode { get; init; } = courseCode;

    [Required(ErrorMessage = "Title is required.")]
    [StringLength(200, ErrorMessage = "Title must not exceed 200 characters.")]
    public required string Title { get; init; } = title;

    [Required(ErrorMessage = "Credits is required.")]
    [Range(1, 12, ErrorMessage = "Credits must be between 1 and 12.")]
    public required int Credits { get; init; } = credits;

    [StringLength(1000, ErrorMessage = "Description must not exceed 1000 characters.")]
    public string? Description { get; set; }

    public Guid? TeacherId { get; set; }
    public Teacher? Teacher { get; set; }

    public ICollection<Enrollment> Enrollments { get; set; } = [];
}
