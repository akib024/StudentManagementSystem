namespace StudentMgmt.Application.DTOs;

public record class StudentResponseDto
{
    public required Guid Id { get; init; }
    public required string FirstName { get; init; }
    public required string LastName { get; init; }
    public required string Email { get; init; }
    public required string EnrollmentNumber { get; init; }
    public IEnumerable<StudentEnrollmentDto> Enrollments { get; init; } = [];
}

public record class StudentEnrollmentDto
{
    public required Guid EnrollmentId { get; init; }
    public required string CourseCode { get; init; }
    public required string CourseTitle { get; init; }
    public required int Credits { get; init; }
    public required string Status { get; init; }
    public decimal? Grade { get; init; }
}
