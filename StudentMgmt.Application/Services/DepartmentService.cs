using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using StudentMgmt.Application.DTOs;
using StudentMgmt.Application.Interfaces;
using StudentMgmt.Domain.Entities;

namespace StudentMgmt.Application.Services;

public class DepartmentService(IApplicationDbContext context, ILogger<DepartmentService> logger) : IDepartmentService
{
    private readonly IApplicationDbContext _context = context;
    private readonly ILogger<DepartmentService> _logger = logger;

    public async Task<IEnumerable<DepartmentResponseDto>> GetAllDepartmentsAsync()
    {
        var departments = await _context.Departments
            .OrderBy(d => d.Name)
            .ToListAsync();

        return departments.Select(d => new DepartmentResponseDto(d.Id, d.Name, d.Description));
    }

    public async Task<DepartmentResponseDto?> GetDepartmentByIdAsync(Guid id)
    {
        var department = await _context.Departments.FindAsync(id);
        
        if (department is null)
            return null;

        return new DepartmentResponseDto(department.Id, department.Name, department.Description);
    }

    public async Task<DepartmentResponseDto> CreateDepartmentAsync(CreateDepartmentRequest request)
    {
        var nameExists = await _context.Departments
            .AnyAsync(d => d.Name == request.Name);

        if (nameExists)
        {
            throw new InvalidOperationException($"Department '{request.Name}' already exists.");
        }

        var department = new Department(request.Name)
        {
            Name = request.Name,
            Description = request.Description
        };

        _context.Departments.Add(department);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Department created: {Name}", department.Name);

        return new DepartmentResponseDto(department.Id, department.Name, department.Description);
    }

    public async Task<DepartmentResponseDto> UpdateDepartmentAsync(Guid id, UpdateDepartmentRequest request)
    {
        var department = await _context.Departments.FindAsync(id)
            ?? throw new InvalidOperationException($"Department with ID {id} not found.");

        // Check if new name is already in use by another department
        var nameExists = await _context.Departments
            .AnyAsync(d => d.Name == request.Name && d.Id != id);

        if (nameExists)
        {
            throw new InvalidOperationException($"Department '{request.Name}' already exists.");
        }

        department.Name = request.Name;
        department.Description = request.Description;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Department updated: {Name}", department.Name);

        return new DepartmentResponseDto(department.Id, department.Name, department.Description);
    }

    public async Task DeleteDepartmentAsync(Guid id)
    {
        var department = await _context.Departments.FindAsync(id)
            ?? throw new InvalidOperationException($"Department with ID {id} not found.");

        // Check if any teachers are assigned to this department
        var teacherCount = await _context.Teachers
            .Where(t => t.DepartmentId == id)
            .CountAsync();

        if (teacherCount > 0)
        {
            throw new InvalidOperationException($"Cannot delete department. {teacherCount} teacher(s) are assigned to this department.");
        }

        _context.Departments.Remove(department);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Department deleted: {Name}", department.Name);
    }
}
