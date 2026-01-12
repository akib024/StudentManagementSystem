using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentMgmt.Application.DTOs;
using StudentMgmt.Application.Interfaces;

namespace StudentMgmt.Api.Controllers;

/// <summary>
/// Reports and Analytics Controller
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController(IReportService reportService, IUserService userService) : ControllerBase
{
    private readonly IReportService _reportService = reportService;
    private readonly IUserService _userService = userService;

    /// <summary>
    /// Get student transcript
    /// </summary>
    [HttpGet("transcripts/{studentId}")]
    [Authorize(Roles = "Student, Teacher, Admin")]
    public async Task<ActionResult<StudentTranscriptDto>> GetStudentTranscript(Guid studentId)
    {
        try
        {
            var transcript = await _reportService.GenerateStudentTranscriptAsync(studentId);
            return Ok(transcript);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error generating transcript", error = ex.Message });
        }
    }

    /// <summary>
    /// Get grade report for a course
    /// </summary>
    [HttpGet("grades/{courseId}")]
    [Authorize(Roles = "Teacher, Admin")]
    public async Task<ActionResult<GradeReportDto>> GetGradeReport(Guid courseId)
    {
        try
        {
            var report = await _reportService.GenerateGradeReportAsync(courseId);
            return Ok(report);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error generating grade report", error = ex.Message });
        }
    }

    /// <summary>
    /// Get my analytics (for current logged-in student)
    /// </summary>
    [HttpGet("analytics/my-analytics")]
    [Authorize(Roles = "Student")]
    public async Task<ActionResult<StudentAnalyticsDto>> GetMyAnalytics()
    {
        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid user token" });
            }

            // Get user to retrieve StudentId
            var user = await _userService.GetUserByIdAsync(userId);
        
            if (user?.StudentId is null)
            {
                return NotFound(new { message = "Student information not found for this user" });
            }

            var analytics = await _reportService.GetStudentAnalyticsAsync(user.StudentId.Value);
            return Ok(analytics);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error getting analytics", error = ex.Message });
        }
    }

    /// <summary>
    /// Get student analytics
    /// </summary>
    [HttpGet("analytics/students/{studentId}")]
    [Authorize(Roles = "Student, Teacher, Admin")]
    public async Task<ActionResult<StudentAnalyticsDto>> GetStudentAnalytics(Guid studentId)
    {
        try
        {
            var analytics = await _reportService.GetStudentAnalyticsAsync(studentId);
            return Ok(analytics);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error getting student analytics", error = ex.Message });
        }
    }

    /// <summary>
    /// Get department analytics
    /// </summary>
    [HttpGet("analytics/departments/{departmentId}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<DepartmentAnalyticsDto>> GetDepartmentAnalytics(Guid departmentId)
    {
        try
        {
            var analytics = await _reportService.GetDepartmentAnalyticsAsync(departmentId);
            return Ok(analytics);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error getting department analytics", error = ex.Message });
        }
    }

    /// <summary>
    /// Get all students analytics (Admin only)
    /// </summary>
    [HttpGet("analytics/all-students")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<StudentAnalyticsDto>>> GetAllStudentsAnalytics()
    {
        try
        {
            var analytics = await _reportService.GetAllStudentsAnalyticsAsync();
            return Ok(analytics);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error getting all students analytics", error = ex.Message });
        }
    }

    /// <summary>
    /// Export transcript as PDF
    /// </summary>
    [HttpGet("transcripts/{studentId}/export/pdf")]
    [Authorize(Roles = "Student, Teacher, Admin")]
    public async Task<IActionResult> ExportTranscriptPdf(Guid studentId)
    {
        try
        {
            var pdf = await _reportService.ExportTranscriptToPdfAsync(studentId);
            return File(pdf, "application/pdf", $"Transcript_{studentId:N}.pdf");
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error exporting transcript", error = ex.Message });
        }
    }

    /// <summary>
    /// Export grade report as Excel
    /// </summary>
    [HttpGet("grades/{courseId}/export/excel")]
    [Authorize(Roles = "Teacher, Admin")]
    public async Task<IActionResult> ExportGradeReportExcel(Guid courseId)
    {
        try
        {
            var excel = await _reportService.ExportGradeReportToExcelAsync(courseId);
            return File(excel, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"GradeReport_{courseId:N}.xlsx");
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error exporting grade report", error = ex.Message });
        }
    }

    /// <summary>
    /// Export grade report as CSV
    /// </summary>
    [HttpGet("grades/{courseId}/export/csv")]
    [Authorize(Roles = "Teacher, Admin")]
    public async Task<IActionResult> ExportGradeReportCsv(Guid courseId)
    {
        try
        {
            var csv = await _reportService.ExportGradeReportToCsvAsync(courseId);
            var bytes = System.Text.Encoding.UTF8.GetBytes(csv);
            return File(bytes, "text/csv", $"GradeReport_{courseId:N}.csv");
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error exporting grade report", error = ex.Message });
        }
    }
}
