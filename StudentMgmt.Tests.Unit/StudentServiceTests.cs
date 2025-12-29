using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using StudentMgmt.Application.DTOs;
using StudentMgmt.Application.Services;
using StudentMgmt.Domain.Entities;
using StudentMgmt.Infrastructure.Persistence;

namespace StudentMgmt.Tests.Unit;

public class StudentServiceTests
{
    private readonly Mock<ILogger<StudentService>> _loggerMock;

    public StudentServiceTests()
    {
        _loggerMock = new Mock<ILogger<StudentService>>();
    }

    [Fact]
    public async Task RegisterStudentAsync_ShouldThrowException_WhenEmailAlreadyExists()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<StudentDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        await using var context = new StudentDbContext(options);

        var existingStudent = new Student(
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@test.com",
            dateOfBirth: new DateTime(2000, 1, 1),
            enrollmentNumber: "STU-123456")
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john.doe@test.com",
            DateOfBirth = new DateTime(2000, 1, 1),
            EnrollmentNumber = "STU-123456"
        };

        context.Students.Add(existingStudent);
        await context.SaveChangesAsync();

        var service = new StudentService(context, _loggerMock.Object);

        var request = new CreateStudentRequest
        {
            FirstName = "Jane",
            LastName = "Smith",
            Email = "john.doe@test.com",
            DateOfBirth = new DateTime(2001, 5, 15)
        };

        // Act
        var act = async () => await service.RegisterStudentAsync(request);

        // Assert
        await act.Should().ThrowAsync<ApplicationException>()
            .WithMessage("Student with this email already exists.");
    }

    [Fact]
    public async Task RegisterStudentAsync_ShouldCreateStudent_WhenDataIsValid()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<StudentDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        await using var context = new StudentDbContext(options);

        var service = new StudentService(context, _loggerMock.Object);

        var request = new CreateStudentRequest
        {
            FirstName = "Alice",
            LastName = "Johnson",
            Email = "alice.johnson@test.com",
            DateOfBirth = new DateTime(2003, 8, 20)
        };

        // Act
        var result = await service.RegisterStudentAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.FirstName.Should().Be("Alice");
        result.LastName.Should().Be("Johnson");
        result.Email.Should().Be("alice.johnson@test.com");
        result.EnrollmentNumber.Should().StartWith("STU-");
        result.EnrollmentNumber.Should().MatchRegex(@"^STU-\d{6}$");

        var savedStudent = await context.Students.FirstOrDefaultAsync(s => s.Email == "alice.johnson@test.com");
        savedStudent.Should().NotBeNull();
        savedStudent!.FirstName.Should().Be("Alice");
        savedStudent.LastName.Should().Be("Johnson");
    }
}
