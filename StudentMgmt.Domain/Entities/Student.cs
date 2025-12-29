using System.ComponentModel.DataAnnotations;
using StudentMgmt.Domain.Common;

namespace StudentMgmt.Domain.Entities;

public class Student(
    string firstName,
    string lastName,
    string email,
    DateTime dateOfBirth,
    string enrollmentNumber) : BaseEntity
{
    [Required(ErrorMessage = "First name is required.")]
    [StringLength(100, MinimumLength = 1, ErrorMessage = "First name must be between 1 and 100 characters.")]
    public required string FirstName { get; init; } = firstName;

    [Required(ErrorMessage = "Last name is required.")]
    [StringLength(100, MinimumLength = 1, ErrorMessage = "Last name must be between 1 and 100 characters.")]
    public required string LastName { get; init; } = lastName;

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Invalid email format.")]
    [StringLength(255, ErrorMessage = "Email must not exceed 255 characters.")]
    public required string Email { get; init; } = email;

    [Required(ErrorMessage = "Date of birth is required.")]
    [DataType(DataType.Date)]
    public required DateTime DateOfBirth { get; init; } = dateOfBirth;

    [Required(ErrorMessage = "Enrollment number is required.")]
    [StringLength(50, ErrorMessage = "Enrollment number must not exceed 50 characters.")]
    public required string EnrollmentNumber { get; init; } = enrollmentNumber;

    public ICollection<Enrollment> Enrollments { get; set; } = [];
}
