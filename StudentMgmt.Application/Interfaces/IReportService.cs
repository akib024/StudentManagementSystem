using StudentMgmt.Application.DTOs;

namespace StudentMgmt.Application.Interfaces;

/// <summary>
/// Service for generating reports and analytics
/// </summary>
public interface IReportService
{
    /// <summary>
    /// Generate student transcript
    /// </summary>
    Task<StudentTranscriptDto> GenerateStudentTranscriptAsync(Guid studentId);

    /// <summary>
    /// Generate grade report for a course
    /// </summary>
    Task<GradeReportDto> GenerateGradeReportAsync(Guid courseId);

    /// <summary>
    /// Get student analytics and performance data
    /// </summary>
    Task<StudentAnalyticsDto> GetStudentAnalyticsAsync(Guid studentId);

    /// <summary>
    /// Get department analytics
    /// </summary>
    Task<DepartmentAnalyticsDto> GetDepartmentAnalyticsAsync(Guid departmentId);

    /// <summary>
    /// Get all students' analytics (admin only)
    /// </summary>
    Task<IEnumerable<StudentAnalyticsDto>> GetAllStudentsAnalyticsAsync();

    /// <summary>
    /// Calculate GPA for given grades
    /// </summary>
    Task<decimal?> CalculateGPAAsync(IEnumerable<decimal?> grades);

    /// <summary>
    /// Get academic standing (Good Standing, Probation, etc.)
    /// </summary>
    Task<string> GetAcademicStandingAsync(Guid studentId);

    /// <summary>
    /// Export transcript to PDF
    /// </summary>
    Task<byte[]> ExportTranscriptToPdfAsync(Guid studentId);

    /// <summary>
    /// Export grade report to Excel
    /// </summary>
    Task<byte[]> ExportGradeReportToExcelAsync(Guid courseId);

    /// <summary>
    /// Export grade report to CSV
    /// </summary>
    Task<string> ExportGradeReportToCsvAsync(Guid courseId);
}
