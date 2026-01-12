namespace StudentMgmt.Application.DTOs;

public record RegisterStudentRequest(
    string Username,
    string Password,
    string FirstName,
    string LastName,
    string Email,
    DateTime DateOfBirth);

public record UserResponseDto(
    Guid Id,
    string Username,
    string Role,
    Guid? StudentId,
    Guid? TeacherId);

public record UpdateProfileRequest(
    string FirstName,
    string LastName,
    string Email,
    string? PhoneNumber);

public record ChangePasswordRequest(
    string OldPassword,
    string NewPassword);
