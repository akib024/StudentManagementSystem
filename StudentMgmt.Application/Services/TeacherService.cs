using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using StudentMgmt.Application.DTOs;
using StudentMgmt.Application.Interfaces;
using StudentMgmt.Domain.Entities;

namespace StudentMgmt.Application.Services;

public class TeacherService(IApplicationDbContext context, ILogger<TeacherService> logger) : ITeacherService
{
    private readonly IApplicationDbContext _context = context;
    private readonly ILogger<TeacherService> _logger = logger;

    public async Task<TeacherResponseDto> CreateTeacherAsync(CreateTeacherRequest request)
    {
        var employeeIdExists = await _context.Teachers
            .AnyAsync(t => t.EmployeeId == request.EmployeeId);

        if (employeeIdExists)
        {
            throw new InvalidOperationException($"Teacher with Employee ID '{request.EmployeeId}' already exists.");
        }

        var emailExists = await _context.Teachers
            .AnyAsync(t => t.Email == request.Email);

        if (emailExists)
        {
            throw new InvalidOperationException($"Teacher with email '{request.Email}' already exists.");
        }

        var teacher = new Teacher(
            request.FirstName,
            request.LastName,
            request.Email,
            request.EmployeeId,
            request.Department)
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            EmployeeId = request.EmployeeId,
            Department = request.Department
        };

        _context.Teachers.Add(teacher);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Teacher created: {EmployeeId} - {FirstName} {LastName} ({Department})",
            teacher.EmployeeId,
            teacher.FirstName,
            teacher.LastName,
            teacher.Department);

        return ToDto(teacher);
    }

    public async Task<TeacherResponseDto?> GetTeacherByIdAsync(Guid id)
    {
        var teacher = await _context.Teachers.FindAsync(id);
        return teacher is null ? null : ToDto(teacher);
    }

    public async Task<IEnumerable<TeacherResponseDto>> GetAllTeachersAsync()
    {
        var teachers = await _context.Teachers
            .OrderBy(t => t.LastName)
            .ThenBy(t => t.FirstName)
            .ToListAsync();

        return teachers.Select(ToDto);
    }

    public async Task<IEnumerable<TeacherResponseDto>> GetTeachersByDepartmentAsync(string department)
    {
        var teachers = await _context.Teachers
            .Where(t => t.Department == department)
            .OrderBy(t => t.LastName)
            .ThenBy(t => t.FirstName)
            .ToListAsync();

        return teachers.Select(ToDto);
    }

    public async Task<TeacherResponseDto> UpdateTeacherAsync(Guid id, UpdateTeacherRequest request)
    {
        var teacher = await _context.Teachers.FindAsync(id)
            ?? throw new InvalidOperationException($"Teacher with ID {id} not found.");

        // Check if new email is already in use by another teacher
        var emailExists = await _context.Teachers
            .AnyAsync(t => t.Email == request.Email && t.Id != id);

        if (emailExists)
        {
            throw new InvalidOperationException($"Email '{request.Email}' is already in use by another teacher.");
        }

        teacher.FirstName = request.FirstName;
        teacher.LastName = request.LastName;
        teacher.Email = request.Email;
        teacher.Department = request.Department;

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Teacher updated: {EmployeeId} - {FirstName} {LastName}",
            teacher.EmployeeId,
            teacher.FirstName,
            teacher.LastName);

        return ToDto(teacher);
    }

    public async Task DeleteTeacherAsync(Guid id)
    {
        var teacher = await _context.Teachers.FindAsync(id)
            ?? throw new InvalidOperationException($"Teacher with ID {id} not found.");

        _context.Teachers.Remove(teacher);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Teacher deleted: {EmployeeId} - {FirstName} {LastName}",
            teacher.EmployeeId,
            teacher.FirstName,
            teacher.LastName);
    }

    private static TeacherResponseDto ToDto(Teacher teacher) => new(
        teacher.Id,
        teacher.FirstName,
        teacher.LastName,
        teacher.Email,
        teacher.EmployeeId,
        teacher.Department);
}
