using FluentValidation;
using StudentMgmt.Application.DTOs;

namespace StudentMgmt.Application.Validators;

public class SubmitResultRequestValidator : AbstractValidator<SubmitResultRequest>
{
    public SubmitResultRequestValidator()
    {
        RuleFor(x => x.EnrollmentId)
            .NotEmpty()
            .WithMessage("Enrollment ID is required.");

        RuleFor(x => x.Score)
            .InclusiveBetween(0, 100)
            .WithMessage("Score must be between 0 and 100.")
            .PrecisionScale(5, 2, true)
            .WithMessage("Score cannot have more than 2 decimal places.");
    }
}
