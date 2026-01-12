using StudentMgmt.Application.DTOs;

namespace StudentMgmt.Application.Interfaces;

public interface IDepartmentService
{
    Task<IEnumerable<DepartmentResponseDto>> GetAllDepartmentsAsync();
    Task<DepartmentResponseDto?> GetDepartmentByIdAsync(Guid id);
    Task<DepartmentResponseDto> CreateDepartmentAsync(CreateDepartmentRequest request);
    Task<DepartmentResponseDto> UpdateDepartmentAsync(Guid id, UpdateDepartmentRequest request);
    Task DeleteDepartmentAsync(Guid id);
}
