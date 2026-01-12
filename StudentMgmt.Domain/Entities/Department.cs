using System.ComponentModel.DataAnnotations;
using StudentMgmt.Domain.Common;

namespace StudentMgmt.Domain.Entities;

public class Department(string name) : BaseEntity
{
    [Required(ErrorMessage = "Department name is required.")]
    [StringLength(100, MinimumLength = 1, ErrorMessage = "Department name must be between 1 and 100 characters.")]
    public required string Name { get; set; } = name;

    [StringLength(500, ErrorMessage = "Description must not exceed 500 characters.")]
    public string? Description { get; set; }

    public ICollection<Teacher> Teachers { get; set; } = new List<Teacher>();

    public override string ToString() => Name;
}
