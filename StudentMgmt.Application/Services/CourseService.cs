using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using StudentMgmt.Application.DTOs;
using StudentMgmt.Application.Interfaces;
using StudentMgmt.Domain.Entities;

namespace StudentMgmt.Application.Services;

public class CourseService(IApplicationDbContext context, ILogger<CourseService> logger) : ICourseService
{
    private readonly IApplicationDbContext _context = context;
    private readonly ILogger<CourseService> _logger = logger;

    public async Task<CourseResponseDto> CreateCourseAsync(CreateCourseRequest request)
    {
        var existingCourse = await _context.Courses
            .AnyAsync(c => c.CourseCode == request.CourseCode);

        if (existingCourse)
        {
            throw new InvalidOperationException($"Course with code '{request.CourseCode}' already exists.");
        }

        var course = new Course(request.CourseCode, request.Title, request.Credits)
        {
            CourseCode = request.CourseCode,
            Title = request.Title,
            Credits = request.Credits,
            Description = request.Description
        };

        _context.Courses.Add(course);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Course created: {CourseCode} - {Title} ({Credits} credits)",
            course.CourseCode,
            course.Title,
            course.Credits);

        return ToDto(course);
    }

    public async Task<CourseResponseDto?> GetCourseByIdAsync(Guid id)
    {
        var course = await _context.Courses
            .Include(c => c.Enrollments)
            .FirstOrDefaultAsync(c => c.Id == id);

        return course is null ? null : ToDto(course);
    }

    public async Task<IEnumerable<CourseResponseDto>> GetCourseCatalogAsync()
    {
        var courses = await _context.Courses
            .Include(c => c.Enrollments)
            .OrderBy(c => c.CourseCode)
            .ToListAsync();

        return courses.Select(ToDto);
    }

    public async Task<CourseResponseDto> UpdateCourseAsync(Guid id, UpdateCourseRequest request)
    {
        var course = await _context.Courses
            .Include(c => c.Enrollments)
            .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new InvalidOperationException($"Course with ID {id} not found.");

        // Course uses init properties, so we need to create a workaround
        // For now, we'll update mutable properties only
        course.Description = request.Description;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Course updated: {CourseId} - {Title}", id, course.Title);

        return ToDto(course);
    }

    public async Task DeleteCourseAsync(Guid id)
    {
        var course = await _context.Courses
            .Include(c => c.Enrollments)
            .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new InvalidOperationException($"Course with ID {id} not found.");

        if (course.Enrollments.Count > 0)
        {
            throw new InvalidOperationException(
                $"Cannot delete course '{course.CourseCode}' because it has {course.Enrollments.Count} active enrollments.");
        }

        _context.Courses.Remove(course);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Course deleted: {CourseCode} - {Title}", course.CourseCode, course.Title);
    }

    private static CourseResponseDto ToDto(Course course) => new(
        course.Id,
        course.CourseCode,
        course.Title,
        course.Credits,
        course.Description,
        course.Enrollments.Count);
}
