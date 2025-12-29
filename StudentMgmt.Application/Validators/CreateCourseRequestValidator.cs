using FluentValidation;
using StudentMgmt.Application.DTOs;

namespace StudentMgmt.Application.Validators;

public class CreateCourseRequestValidator : AbstractValidator<CreateCourseRequest>
{
    public CreateCourseRequestValidator()
    {
        RuleFor(x => x.CourseCode)
            .NotEmpty()
            .WithMessage("Course code is required.")
            .Matches(@"^[A-Z]{2,3}\d{3,4}$")
            .WithMessage("Course code must follow the pattern (e.g., CS101, MAT1234).");

        RuleFor(x => x.Title)
            .NotEmpty()
            .WithMessage("Course title is required.")
            .MaximumLength(200)
            .WithMessage("Course title cannot exceed 200 characters.");

        RuleFor(x => x.Credits)
            .InclusiveBetween(1, 5)
            .WithMessage("Credits must be between 1 and 5.");
    }
}
