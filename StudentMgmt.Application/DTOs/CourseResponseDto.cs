namespace StudentMgmt.Application.DTOs;

public record class CourseResponseDto
{
    public required Guid Id { get; init; }
    public required string CourseCode { get; init; }
    public required string Title { get; init; }
    public required int Credits { get; init; }
}
