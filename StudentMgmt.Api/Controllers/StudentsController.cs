using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentMgmt.Application.DTOs;
using StudentMgmt.Application.Interfaces;

namespace StudentMgmt.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StudentsController(IStudentService studentService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<StudentResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] StudentFilterDto? filter)
    {
        var students = await studentService.GetAllAsync(filter);
        return Ok(students);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(StudentResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var student = await studentService.GetByIdAsync(id);
            return Ok(student);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { Message = $"Student with ID '{id}' was not found." });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Staff")]
    [ProducesResponseType(typeof(StudentResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] CreateStudentRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var student = await studentService.RegisterStudentAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = student.Id }, student);
        }
        catch (ApplicationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await studentService.DeleteStudentAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { Message = $"Student with ID '{id}' was not found." });
        }
    }

    [HttpGet("enrollment-number/next")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNextEnrollmentNumber()
    {
        var enrollmentNumber = await studentService.GenerateNextEnrollmentNumberAsync();
        return Ok(new { enrollmentNumber });
    }
}
