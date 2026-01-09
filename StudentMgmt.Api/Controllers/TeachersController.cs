using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentMgmt.Application.DTOs;
using StudentMgmt.Application.Interfaces;

namespace StudentMgmt.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TeachersController(
    ITeacherService teacherService,
    ILogger<TeachersController> logger) : ControllerBase
{
    private readonly ITeacherService _teacherService = teacherService;
    private readonly ILogger<TeachersController> _logger = logger;

    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<TeacherResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllTeachers()
    {
        var teachers = await _teacherService.GetAllTeachersAsync();
        return Ok(teachers);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(TeacherResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTeacher(Guid id)
    {
        var teacher = await _teacherService.GetTeacherByIdAsync(id);
        
        if (teacher is null)
        {
            return NotFound(new { message = $"Teacher with ID {id} not found." });
        }

        return Ok(teacher);
    }

    [HttpGet("department/{department}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<TeacherResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTeachersByDepartment(string department)
    {
        var teachers = await _teacherService.GetTeachersByDepartmentAsync(department);
        return Ok(teachers);
    }

    [HttpGet("employee-id/next")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNextEmployeeId()
    {
        var employeeId = await _teacherService.GenerateNextEmployeeIdAsync();
        return Ok(new { employeeId });
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(TeacherResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateTeacher([FromBody] CreateTeacherRequest request)
    {
        try
        {
            var teacher = await _teacherService.CreateTeacherAsync(request);
            
            _logger.LogInformation(
                "Teacher created: {EmployeeId} - {FirstName} {LastName}",
                teacher.EmployeeId,
                teacher.FirstName,
                teacher.LastName);

            return CreatedAtAction(nameof(GetTeacher), new { id = teacher.Id }, teacher);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(TeacherResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTeacher(Guid id, [FromBody] UpdateTeacherRequest request)
    {
        try
        {
            var teacher = await _teacherService.UpdateTeacherAsync(id, request);
            return Ok(teacher);
        }
        catch (InvalidOperationException ex)
        {
            if (ex.Message.Contains("not found"))
            {
                return NotFound(new { message = ex.Message });
            }
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTeacher(Guid id)
    {
        try
        {
            await _teacherService.DeleteTeacherAsync(id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
