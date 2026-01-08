namespace StudentMgmt.Application.DTOs;

public record CreateTeacherRequest(
    string FirstName,
    string LastName,
    string Email,
    string EmployeeId,
    string Department);

public record UpdateTeacherRequest(
    string FirstName,
    string LastName,
    string Email,
    string Department);

public record TeacherResponseDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string EmployeeId,
    string Department);
