using System.ComponentModel.DataAnnotations;
using StudentMgmt.Domain.Common;

namespace StudentMgmt.Domain.Entities;

public class Teacher(
    string firstName,
    string lastName,
    string email,
    string employeeId,
    string department) : BaseEntity
{
    [Required(ErrorMessage = "First name is required.")]
    [StringLength(100, MinimumLength = 1, ErrorMessage = "First name must be between 1 and 100 characters.")]
    public required string FirstName { get; set; } = firstName;

    [Required(ErrorMessage = "Last name is required.")]
    [StringLength(100, MinimumLength = 1, ErrorMessage = "Last name must be between 1 and 100 characters.")]
    public required string LastName { get; set; } = lastName;

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Invalid email format.")]
    [StringLength(255, ErrorMessage = "Email must not exceed 255 characters.")]
    public required string Email { get; set; } = email;

    [Required(ErrorMessage = "Employee ID is required.")]
    [StringLength(50, ErrorMessage = "Employee ID must not exceed 50 characters.")]
    public required string EmployeeId { get; init; } = employeeId;

    [Required(ErrorMessage = "Department is required.")]
    [StringLength(100, ErrorMessage = "Department must not exceed 100 characters.")]
    public required string Department { get; set; } = department;
}
