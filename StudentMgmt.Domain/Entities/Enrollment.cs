using System.ComponentModel.DataAnnotations;
using StudentMgmt.Domain.Common;

namespace StudentMgmt.Domain.Entities;

public class Enrollment(
    Guid studentId,
    Guid courseId) : BaseEntity
{
    [Required(ErrorMessage = "Student ID is required.")]
    public required Guid StudentId { get; init; } = studentId;

    [Required(ErrorMessage = "Course ID is required.")]
    public required Guid CourseId { get; init; } = courseId;

    [Range(0, 100, ErrorMessage = "Grade must be between 0 and 100.")]
    public decimal? Grade { get; set; }

    [Required(ErrorMessage = "Status is required.")]
    public EnrollmentStatus Status { get; set; } = EnrollmentStatus.Active;

    public Student Student { get; set; } = null!;

    public Course Course { get; set; } = null!;

    public Result? ExamResult { get; set; }
}
