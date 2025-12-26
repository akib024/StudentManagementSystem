namespace StudentMgmt.Application.DTOs;

public record class EnrollmentResponseDto
{
    public required Guid Id { get; init; }
    public required string StudentName { get; init; }
    public required string CourseTitle { get; init; }
    public decimal? Grade { get; init; }
    public required string Status { get; init; }
}
