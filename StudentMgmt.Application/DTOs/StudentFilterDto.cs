namespace StudentMgmt.Application.DTOs;

public record StudentFilterDto(
    string? SearchTerm = null,
    string? CourseName = null,
    int? Status = null);
