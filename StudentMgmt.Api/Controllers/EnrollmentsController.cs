using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentMgmt.Application.DTOs;
using StudentMgmt.Application.Interfaces;

namespace StudentMgmt.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EnrollmentsController(
    IEnrollmentService enrollmentService,
    ILogger<EnrollmentsController> logger) : ControllerBase
{
    private readonly IEnrollmentService _enrollmentService = enrollmentService;
    private readonly ILogger<EnrollmentsController> _logger = logger;

    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    [ProducesResponseType(typeof(IEnumerable<EnrollmentResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllEnrollments()
    {
        var enrollments = await _enrollmentService.GetAllEnrollmentsAsync();
        return Ok(enrollments);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin,Staff")]
    [ProducesResponseType(typeof(EnrollmentResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetEnrollment(Guid id)
    {
        var enrollment = await _enrollmentService.GetEnrollmentByIdAsync(id);
        
        if (enrollment is null)
        {
            return NotFound(new { message = $"Enrollment with ID {id} not found." });
        }

        return Ok(enrollment);
    }

    [HttpGet("student/{studentId:guid}")]
    [Authorize(Roles = "Admin,Staff")]
    [ProducesResponseType(typeof(IEnumerable<EnrollmentResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStudentEnrollments(Guid studentId)
    {
        var enrollments = await _enrollmentService.GetStudentEnrollmentsAsync(studentId);
        return Ok(enrollments);
    }

    [HttpGet("course/{courseId:guid}")]
    [Authorize(Roles = "Admin,Staff")]
    [ProducesResponseType(typeof(IEnumerable<EnrollmentResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCourseEnrollments(Guid courseId)
    {
        var enrollments = await _enrollmentService.GetCourseEnrollmentsAsync(courseId);
        return Ok(enrollments);
    }

    [HttpGet("my-enrollments")]
    [Authorize(Roles = "Student")]
    [ProducesResponseType(typeof(IEnumerable<EnrollmentResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyEnrollments()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized("Invalid user token.");
        }

        // Get student ID from user
        var enrollments = await _enrollmentService.GetStudentEnrollmentsAsync(userId);
        return Ok(enrollments);
    }

    [HttpGet("my-transcript")]
    [Authorize(Roles = "Student")]
    [ProducesResponseType(typeof(TranscriptDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMyTranscript()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized("Invalid user token.");
        }

        try
        {
            var transcript = await _enrollmentService.GetStudentTranscriptAsync(userId);
            return Ok(transcript);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("transcript/{studentId:guid}")]
    [Authorize(Roles = "Admin,Staff")]
    [ProducesResponseType(typeof(TranscriptDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStudentTranscript(Guid studentId)
    {
        try
        {
            var transcript = await _enrollmentService.GetStudentTranscriptAsync(studentId);
            return Ok(transcript);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Staff")]
    [ProducesResponseType(typeof(EnrollmentResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> EnrollStudent([FromBody] EnrollStudentRequest request)
    {
        try
        {
            var enrollment = await _enrollmentService.EnrollStudentAsync(request);
            
            _logger.LogInformation(
                "Student enrolled: {StudentName} in {CourseCode}",
                enrollment.StudentName,
                enrollment.CourseCode);

            return CreatedAtAction(nameof(GetEnrollment), new { id = enrollment.Id }, enrollment);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}/status")]
    [Authorize(Roles = "Admin,Staff")]
    [ProducesResponseType(typeof(EnrollmentResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateEnrollmentStatus(Guid id, [FromBody] UpdateEnrollmentStatusRequest request)
    {
        try
        {
            var enrollment = await _enrollmentService.UpdateEnrollmentStatusAsync(id, request);
            return Ok(enrollment);
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
    [Authorize(Roles = "Admin,Staff")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> WithdrawEnrollment(Guid id)
    {
        try
        {
            await _enrollmentService.WithdrawEnrollmentAsync(id);
            return NoContent();
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
}
