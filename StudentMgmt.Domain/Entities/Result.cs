using System.ComponentModel.DataAnnotations;
using StudentMgmt.Domain.Common;

namespace StudentMgmt.Domain.Entities;

public class Result : BaseEntity
{
    [Required(ErrorMessage = "Enrollment ID is required.")]
    public required Guid EnrollmentId { get; init; }

    [Range(0, 100, ErrorMessage = "Score must be between 0 and 100.")]
    public decimal Score
    {
        get => field;
        set => field = value < 0 ? 0 : value;
    }

    [Required(ErrorMessage = "Grade is required.")]
    [RegularExpression("^[A-F]$", ErrorMessage = "Grade must be A, B, C, D, E, or F.")]
    [StringLength(1, ErrorMessage = "Grade must be a single character.")]
    public string Grade { get; set; } = string.Empty;

    // Navigation property to Enrollment
    public Enrollment Enrollment { get; set; } = null!;
}
