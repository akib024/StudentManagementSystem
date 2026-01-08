using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentMgmt.Application.DTOs;
using StudentMgmt.Application.Interfaces;

namespace StudentMgmt.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ResultsController(IResultService resultService, ILogger<ResultsController> logger) : ControllerBase
{
    private readonly IResultService _resultService = resultService;
    private readonly ILogger<ResultsController> _logger = logger;

    [HttpPost]
    [Authorize(Roles = "Admin,Staff")]
    [ProducesResponseType(typeof(ResultResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SubmitResult([FromBody] SubmitResultRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var result = await _resultService.SubmitResultAsync(request);
            
            _logger.LogInformation(
                "User {Username} submitted result for enrollment {EnrollmentId}: Score {Score}, Grade {Grade}",
                User.Identity?.Name,
                request.EnrollmentId,
                result.Score,
                result.Grade);

            return CreatedAtAction(
                nameof(GetStudentPerformance),
                new { studentId = result.Id },
                result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("my-performance")]
    [Authorize(Roles = "Student")]
    [ProducesResponseType(typeof(StudentPerformanceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMyPerformance()
    {
        var studentIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(studentIdClaim) || !Guid.TryParse(studentIdClaim, out var studentId))
        {
            _logger.LogWarning("Invalid or missing NameIdentifier claim for user {Username}", User.Identity?.Name);
            return Unauthorized(new { Message = "Invalid or missing student identifier in token." });
        }

        try
        {
            var performance = await _resultService.GetStudentPerformanceAsync(studentId);

            _logger.LogInformation(
                "Student {StudentId} retrieved their performance: GPA {Gpa:F2}, Courses {CourseCount}",
                studentId,
                performance.Gpa,
                performance.Courses.Count);

            return Ok(performance);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Message = ex.Message });
        }
    }

    [HttpGet("student/{studentId:guid}")]
    [Authorize(Roles = "Admin,Staff")]
    [ProducesResponseType(typeof(PerformanceResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStudentPerformance(Guid studentId)
    {
        try
        {
            var performance = await _resultService.GetPerformanceAsync(studentId);

            _logger.LogInformation(
                "User {Username} retrieved performance for student {StudentId}: GPA {Gpa:F2}",
                User.Identity?.Name,
                studentId,
                performance.GPA);

            return Ok(performance);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Message = ex.Message });
        }
    }
}
