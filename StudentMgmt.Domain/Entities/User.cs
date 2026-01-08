using System.ComponentModel.DataAnnotations;
using StudentMgmt.Domain.Common;

namespace StudentMgmt.Domain.Entities;

public class User : BaseEntity
{
    [Required(ErrorMessage = "Username is required.")]
    [StringLength(50, ErrorMessage = "Username cannot exceed 50 characters.")]
    public required string Username { get; init; }

    [Required(ErrorMessage = "Password hash is required.")]
    public required string PasswordHash { get; set; }

    [Required(ErrorMessage = "Role is required.")]
    [StringLength(20, ErrorMessage = "Role cannot exceed 20 characters.")]
    public required string Role { get; init; }

    public Guid? StudentId { get; init; }

    public Student? Student { get; set; }
}
