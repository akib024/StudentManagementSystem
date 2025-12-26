namespace StudentMgmt.Application.DTOs;

public record class StudentResponseDto
{
    public required Guid Id { get; init; }
    public required string FirstName { get; init; }
    public required string LastName { get; init; }
    public required string Email { get; init; }
    public required string EnrollmentNumber { get; init; }
}
