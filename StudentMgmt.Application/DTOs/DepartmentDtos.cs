using System.ComponentModel.DataAnnotations;

namespace StudentMgmt.Application.DTOs;

public record CreateDepartmentRequest(
    [Required(ErrorMessage = "Department name is required.")]
    [StringLength(100, MinimumLength = 1, ErrorMessage = "Department name must be between 1 and 100 characters.")]
    string Name,
    [StringLength(500, ErrorMessage = "Description must not exceed 500 characters.")]
    string? Description);

public record UpdateDepartmentRequest(
    [Required(ErrorMessage = "Department name is required.")]
    [StringLength(100, MinimumLength = 1, ErrorMessage = "Department name must be between 1 and 100 characters.")]
    string Name,
    [StringLength(500, ErrorMessage = "Description must not exceed 500 characters.")]
    string? Description);

public record DepartmentResponseDto(
    Guid Id,
    string Name,
    string? Description);
