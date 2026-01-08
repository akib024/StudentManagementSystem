using System.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using StudentMgmt.Application.DTOs;
using StudentMgmt.Application.Interfaces;
using StudentMgmt.Domain.Entities;
using BCrypt.Net;

namespace StudentMgmt.Application.Services;

public class UserService(IApplicationDbContext context, ILogger<UserService> logger) : IUserService
{
    private readonly IApplicationDbContext _context = context;
    private readonly ILogger<UserService> _logger = logger;

    public async Task<UserResponseDto> RegisterStudentAsync(RegisterStudentRequest request)
    {
        var usernameExists = await _context.Users
            .AnyAsync(u => u.Username == request.Username);

        if (usernameExists)
        {
            throw new InvalidOperationException($"Username '{request.Username}' is already taken.");
        }

        var emailExists = await _context.Students
            .AnyAsync(s => s.Email == request.Email);

        if (emailExists)
        {
            throw new InvalidOperationException($"Email '{request.Email}' is already registered.");
        }

        var enrollmentNumber = GenerateEnrollmentNumber();
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        await using var transaction = await ((DbContext)_context).Database.BeginTransactionAsync();

        try
        {
            var student = new Student(
                request.FirstName,
                request.LastName,
                request.Email,
                request.DateOfBirth,
                enrollmentNumber)
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                DateOfBirth = request.DateOfBirth,
                EnrollmentNumber = enrollmentNumber
            };

            _context.Students.Add(student);
            await _context.SaveChangesAsync();

            var user = new User
            {
                Username = request.Username,
                PasswordHash = passwordHash,
                Role = "Student",
                StudentId = student.Id
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            _logger.LogInformation(
                "New student registered: Username {Username}, Student {FirstName} {LastName} (ID: {StudentId}, Enrollment: {EnrollmentNumber})",
                user.Username,
                student.FirstName,
                student.LastName,
                student.Id,
                student.EnrollmentNumber);

            return new UserResponseDto(user.Id, user.Username, user.Role, user.StudentId);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Failed to register student with username {Username}", request.Username);
            throw;
        }
    }

    public async Task<(bool IsValid, string? Role, Guid? UserId)> ValidateCredentialsAsync(
        string username, string password)
    {
        var startTime = DateTime.UtcNow;

        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Username == username);

        if (user is null)
        {
            _logger.LogWarning(
                "Failed login attempt - User not found. Username: {Username}, Timestamp: {Timestamp}",
                username,
                startTime);
            return (false, null, null);
        }

        var isPasswordValid = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);

        if (!isPasswordValid)
        {
            _logger.LogWarning(
                "Failed login attempt - Invalid password. Username: {Username}, UserId: {UserId}, Role: {Role}, Timestamp: {Timestamp}",
                username,
                user.Id,
                user.Role,
                startTime);
            return (false, null, null);
        }

        var authDuration = (DateTime.UtcNow - startTime).TotalMilliseconds;

        _logger.LogInformation(
            "Successful authentication. Username: {Username}, UserId: {UserId}, Role: {Role}, StudentId: {StudentId}, Duration: {Duration}ms",
            username,
            user.Id,
            user.Role,
            user.StudentId,
            authDuration);

        return (true, user.Role, user.Id);
    }

    public async Task UpdateProfileAsync(Guid userId, UpdateProfileRequest request)
    {
        var user = await _context.Users
            .Include(u => u.Student)
            .FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new InvalidOperationException($"User with ID {userId} not found.");

        if (user.Student is null)
        {
            throw new InvalidOperationException("This account is not linked to a student profile.");
        }

        // Check if email is already taken by another student
        var emailExists = await _context.Students
            .AnyAsync(s => s.Email == request.Email && s.Id != user.StudentId);

        if (emailExists)
        {
            throw new InvalidOperationException($"Email '{request.Email}' is already in use by another student.");
        }

        user.Student.FirstName = request.FirstName;
        user.Student.LastName = request.LastName;
        user.Student.Email = request.Email;
        user.Student.PhoneNumber = request.PhoneNumber;

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Profile updated for user {UserId}. Student: {FirstName} {LastName}, Email: {Email}",
            userId,
            request.FirstName,
            request.LastName,
            request.Email);
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new InvalidOperationException($"User with ID {userId} not found.");

        if (!BCrypt.Net.BCrypt.Verify(request.OldPassword, user.PasswordHash))
        {
            _logger.LogWarning(
                "Password change failed - incorrect old password. UserId: {UserId}, Timestamp: {Timestamp}",
                userId,
                DateTime.UtcNow);
            throw new SecurityException("The old password is incorrect.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Password changed for user {UserId}", userId);
    }

    private static string GenerateEnrollmentNumber() =>
        $"STU{DateTime.UtcNow:yyyy}{Random.Shared.Next(1000, 9999)}";
}
