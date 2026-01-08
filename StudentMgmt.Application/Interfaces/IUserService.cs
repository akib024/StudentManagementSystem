using StudentMgmt.Application.DTOs;

namespace StudentMgmt.Application.Interfaces;

public interface IUserService
{
    Task<UserResponseDto> RegisterStudentAsync(RegisterStudentRequest request);
    Task<(bool IsValid, string? Role, Guid? UserId)> ValidateCredentialsAsync(string username, string password);
    Task UpdateProfileAsync(Guid userId, UpdateProfileRequest request);
    Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request);
}
