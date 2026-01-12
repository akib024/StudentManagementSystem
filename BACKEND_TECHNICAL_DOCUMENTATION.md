# Student Management System - Backend Technical Documentation
## ASP.NET Core 10.0 Implementation Guide

*Prepared for: Developer Audience*  
*Date: January 12, 2026*  
*Framework: ASP.NET Core 10.0 (.NET 10)*  
*Architecture: Clean Architecture with DDD Principles*

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Clean Architecture Layers](#clean-architecture-layers)
5. [ASP.NET Core Features Demonstrated](#aspnet-core-features-demonstrated)
6. [Entity Framework Core](#entity-framework-core)
7. [Authentication & Authorization](#authentication--authorization)
8. [Dependency Injection](#dependency-injection)
9. [API Design & Controllers](#api-design--controllers)
10. [Middleware & Pipeline](#middleware--pipeline)
11. [Configuration Management](#configuration-management)
12. [Logging & Monitoring](#logging--monitoring)
13. [Validation](#validation)
14. [Error Handling](#error-handling)
15. [Database Design](#database-design)
16. [Code Examples](#code-examples)
17. [Best Practices Implemented](#best-practices-implemented)

---

## Architecture Overview

### Clean Architecture Implementation

```
┌──────────────────────────────────────────────────────┐
│                    Presentation Layer                 │
│              (StudentMgmt.Api - API Layer)           │
│  • Controllers                                        │
│  • Middleware Configuration                           │
│  • Startup/Program Configuration                      │
└────────────────────┬─────────────────────────────────┘
                     │ Depends On
┌────────────────────▼─────────────────────────────────┐
│                  Application Layer                    │
│         (StudentMgmt.Application - Business)         │
│  • Services (Business Logic)                          │
│  • DTOs (Data Transfer Objects)                       │
│  • Interfaces (Contracts)                             │
│  • Validators (FluentValidation)                      │
│  • Mappings (Manual Mapping Extensions)               │
└────────────────────┬─────────────────────────────────┘
                     │ Depends On
┌────────────────────▼─────────────────────────────────┐
│                    Domain Layer                       │
│           (StudentMgmt.Domain - Entities)            │
│  • Entities (Core Business Models)                    │
│  • Enums                                              │
│  • Value Objects                                      │
│  • Domain Events (Future)                             │
│  • No Dependencies - Pure C# Classes                  │
└───────────────────────────────────────────────────────┘
                     ▲
                     │ Implements
┌────────────────────┴─────────────────────────────────┐
│               Infrastructure Layer                    │
│        (StudentMgmt.Infrastructure - Data)           │
│  • DbContext (EF Core)                                │
│  • Repositories (Data Access)                         │
│  • Migrations                                         │
│  • Data Seeding                                       │
│  • External Services Integration                      │
└───────────────────────────────────────────────────────┘
```

### Dependency Flow
- **Presentation** → Application → Domain
- **Application** → Domain
- **Infrastructure** → Application & Domain
- **Domain** → No dependencies (Core)

---

## Technology Stack

### Core Framework
```xml
<TargetFramework>net10.0</TargetFramework>
<LangVersion>14</LangVersion>
<Nullable>enable</Nullable>
<ImplicitUsings>enable</ImplicitUsings>
```

### NuGet Packages

#### API Layer (StudentMgmt.Api.csproj)
```xml
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="10.0.1" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="10.0.0-*" />
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="10.0.0-*" />
<PackageReference Include="Serilog.AspNetCore" Version="10.0.0" />
<PackageReference Include="Serilog.Enrichers.Environment" Version="3.0.1" />
<PackageReference Include="Serilog.Enrichers.Thread" Version="4.0.0" />
<PackageReference Include="Serilog.Sinks.Console" Version="6.1.1" />
<PackageReference Include="Serilog.Sinks.Seq" Version="9.0.0" />
<PackageReference Include="Swashbuckle.AspNetCore" Version="7.3.1" />
```

#### Application Layer (StudentMgmt.Application.csproj)
```xml
<PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />
<PackageReference Include="FluentValidation.AspNetCore" Version="11.3.1" />
<PackageReference Include="FluentValidation.DependencyInjectionExtensions" Version="12.1.1" />
<PackageReference Include="Microsoft.EntityFrameworkCore" Version="10.0.0-*" />
<PackageReference Include="Microsoft.Extensions.Logging.Abstractions" Version="10.0.1" />
```

#### Infrastructure Layer (StudentMgmt.Infrastructure.csproj)
```xml
<PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />
<PackageReference Include="Microsoft.EntityFrameworkCore" Version="10.0.0-*" />
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="10.0.0-*" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="10.0.0-*" />
```

---

## Project Structure

### StudentMgmt.Api (Presentation Layer)
```
StudentMgmt.Api/
├── Controllers/
│   ├── AccountController.cs
│   ├── AuthController.cs
│   ├── CoursesController.cs
│   ├── DepartmentsController.cs
│   ├── EnrollmentsController.cs
│   ├── ReportsController.cs
│   ├── ResultsController.cs
│   ├── StudentsController.cs
│   ├── TeachersController.cs
│   └── WeatherForecastController.cs
├── Configuration/
│   └── JwtSettings.cs
├── Properties/
│   └── launchSettings.json
├── appsettings.json
├── appsettings.Development.json
├── Program.cs
└── StudentMgmt.Api.csproj
```

### StudentMgmt.Application (Business Layer)
```
StudentMgmt.Application/
├── DTOs/
│   ├── Authentication/
│   ├── Course/
│   ├── Department/
│   ├── Enrollment/
│   ├── Report/
│   ├── Result/
│   ├── Student/
│   ├── Teacher/
│   └── User/
├── Interfaces/
│   ├── IApplicationDbContext.cs
│   ├── IAuthService.cs
│   ├── ICourseService.cs
│   ├── IDepartmentService.cs
│   ├── IEnrollmentService.cs
│   ├── IReportService.cs
│   ├── IResultService.cs
│   ├── IStudentService.cs
│   ├── ITeacherService.cs
│   └── IUserService.cs
├── Mappings/
│   └── EntityExtensions.cs
├── Services/
│   ├── AuthService.cs
│   ├── CourseService.cs
│   ├── DepartmentService.cs
│   ├── EnrollmentService.cs
│   ├── ReportService.cs
│   ├── ResultService.cs
│   ├── StudentService.cs
│   ├── TeacherService.cs
│   └── UserService.cs
├── Validators/
│   ├── CreateCourseRequestValidator.cs
│   ├── CreateStudentRequestValidator.cs
│   ├── CreateTeacherRequestValidator.cs
│   ├── LoginRequestValidator.cs
│   └── RegisterRequestValidator.cs
└── StudentMgmt.Application.csproj
```

### StudentMgmt.Domain (Core Layer)
```
StudentMgmt.Domain/
├── Common/
│   └── BaseEntity.cs
├── Entities/
│   ├── Course.cs
│   ├── Department.cs
│   ├── Enrollment.cs
│   ├── EnrollmentStatus.cs
│   ├── Result.cs
│   ├── Student.cs
│   ├── Teacher.cs
│   └── User.cs
└── StudentMgmt.Domain.csproj
```

### StudentMgmt.Infrastructure (Data Layer)
```
StudentMgmt.Infrastructure/
├── Migrations/
│   └── [EF Core Migration Files]
├── Persistence/
│   ├── DbInitializer.cs
│   └── StudentDbContext.cs
├── Repositories/
│   └── [Repository Implementations]
└── StudentMgmt.Infrastructure.csproj
```

---

## Clean Architecture Layers

### 1. Domain Layer (StudentMgmt.Domain)
**Purpose**: Contains enterprise business logic and entities  
**Dependencies**: None (pure C#)

#### Key Concepts:
```csharp
// BaseEntity.cs - Common base class for all entities
namespace StudentMgmt.Domain.Common;

public abstract class BaseEntity
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; } = false;
}
```

#### Entity Example - Student.cs:
```csharp
using System.ComponentModel.DataAnnotations;
using StudentMgmt.Domain.Common;

namespace StudentMgmt.Domain.Entities;

public class Student(
    string firstName,
    string lastName,
    string email,
    DateTime dateOfBirth,
    string enrollmentNumber) : BaseEntity
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public required string FirstName { get; set; } = firstName;

    [Required]
    [StringLength(100, MinimumLength = 1)]
    public required string LastName { get; set; } = lastName;

    [Required]
    [EmailAddress]
    [StringLength(255)]
    public required string Email { get; set; } = email;

    [Phone]
    [StringLength(20)]
    public string? PhoneNumber { get; set; }

    [Required]
    [DataType(DataType.Date)]
    public required DateTime DateOfBirth { get; init; } = dateOfBirth;

    [Required]
    [StringLength(50)]
    public required string EnrollmentNumber { get; init; } = enrollmentNumber;

    // Navigation Properties
    public ICollection<Enrollment> Enrollments { get; set; } = [];
}
```

**Features Demonstrated**:
- Primary Constructor (C# 12)
- Required Members
- Init-only setters
- Collection expressions `[]`
- Data Annotations
- Navigation Properties

---

### 2. Application Layer (StudentMgmt.Application)
**Purpose**: Contains business logic and orchestration  
**Dependencies**: Domain Layer

#### Service Interface Pattern:
```csharp
// IStudentService.cs
namespace StudentMgmt.Application.Interfaces;

public interface IStudentService
{
    Task<StudentResponseDto> GetByIdAsync(Guid id);
    Task<IEnumerable<StudentResponseDto>> GetAllAsync(StudentFilterDto? filter = null);
    Task<StudentResponseDto> RegisterStudentAsync(CreateStudentRequest request);
    Task<StudentResponseDto> UpdateStudentAsync(Guid id, UpdateStudentRequest request);
    Task DeleteStudentAsync(Guid id);
}
```

#### Service Implementation:
```csharp
// StudentService.cs
public class StudentService(
    IApplicationDbContext dbContext,
    ILogger<StudentService> logger) : IStudentService
{
    public async Task<StudentResponseDto> GetByIdAsync(Guid id)
    {
        var student = await dbContext.Students
            .Include(s => s.Enrollments)
            .ThenInclude(e => e.Course)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (student is null)
        {
            throw new KeyNotFoundException($"Student with ID '{id}' was not found.");
        }

        return student.ToDto()!;
    }

    public async Task<IEnumerable<StudentResponseDto>> GetAllAsync(
        StudentFilterDto? filter = null)
    {
        var query = dbContext.Students
            .Include(s => s.Enrollments)
            .ThenInclude(e => e.Course)
            .AsQueryable();

        // Apply filters
        if (filter is not null)
        {
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var searchTerm = filter.SearchTerm.ToLower();
                query = query.Where(s => 
                    s.FirstName.ToLower().Contains(searchTerm) ||
                    s.LastName.ToLower().Contains(searchTerm));
            }
        }

        var students = await query.AsNoTracking().ToListAsync();
        return students.Select(s => s.ToDto()!);
    }
}
```

**Features Demonstrated**:
- Primary Constructor DI
- Async/Await patterns
- LINQ queries
- Include/ThenInclude (Eager Loading)
- AsNoTracking (Performance)
- Extension methods for mapping

---

### 3. Infrastructure Layer (StudentMgmt.Infrastructure)
**Purpose**: Data access and external concerns  
**Dependencies**: Application + Domain

#### DbContext Configuration:
```csharp
// StudentDbContext.cs
public class StudentDbContext(DbContextOptions<StudentDbContext> options) 
    : DbContext(options), IApplicationDbContext
{
    public DbSet<Student> Students => Set<Student>();
    public DbSet<Teacher> Teachers => Set<Teacher>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();
    public DbSet<Result> Results => Set<Result>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Department> Departments => Set<Department>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Student entity
        modelBuilder.Entity<Student>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.EnrollmentNumber).IsUnique();
            entity.HasQueryFilter("SoftDeleteFilter", e => !e.IsDeleted);
        });

        // Configure Enrollment with relationships
        modelBuilder.Entity<Enrollment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.StudentId, e.CourseId }).IsUnique();
            entity.HasQueryFilter("SoftDeleteFilter", e => !e.IsDeleted);

            entity.Property(e => e.Grade).HasPrecision(5, 2);

            entity.HasOne(e => e.Student)
                .WithMany(s => s.Enrollments)
                .HasForeignKey(e => e.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Course)
                .WithMany(c => c.Enrollments)
                .HasForeignKey(e => e.CourseId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
```

**Features Demonstrated**:
- DbContext configuration
- Fluent API
- Unique indexes
- Composite indexes
- Global query filters (Soft Delete)
- Precision configuration
- Relationship configuration
- Delete behavior configuration

---

### 4. Presentation Layer (StudentMgmt.Api)
**Purpose**: HTTP API endpoints  
**Dependencies**: Application + Infrastructure

#### Controller Example:
```csharp
// StudentsController.cs
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StudentsController(
    IStudentService studentService,
    ILogger<StudentsController> logger) : ControllerBase
{
    private readonly IStudentService _studentService = studentService;
    private readonly ILogger<StudentsController> _logger = logger;

    [HttpGet]
    [Authorize(Roles = "Admin,Teacher")]
    [ProducesResponseType(typeof(IEnumerable<StudentResponseDto>), 
        StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllStudents(
        [FromQuery] StudentFilterDto? filter = null)
    {
        var students = await _studentService.GetAllAsync(filter);
        return Ok(students);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin,Teacher")]
    [ProducesResponseType(typeof(StudentResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStudent(Guid id)
    {
        try
        {
            var student = await _studentService.GetByIdAsync(id);
            return Ok(student);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Message = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(StudentResponseDto), 
        StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RegisterStudent(
        [FromBody] CreateStudentRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var student = await _studentService.RegisterStudentAsync(request);
            
            _logger.LogInformation(
                "Student {EnrollmentNumber} registered successfully by {User}",
                student.EnrollmentNumber,
                User.Identity?.Name);

            return CreatedAtAction(
                nameof(GetStudent),
                new { id = student.Id },
                student);
        }
        catch (ApplicationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }
}
```

**Features Demonstrated**:
- API Controller attributes
- Primary Constructor DI
- Route templates
- HTTP verb attributes
- Role-based authorization
- ProducesResponseType (OpenAPI)
- Route constraints (`:guid`)
- Model binding (`[FromQuery]`, `[FromBody]`)
- Structured logging
- CreatedAtAction pattern

---

## ASP.NET Core Features Demonstrated

### 1. Minimal APIs & Modern C# Features

#### Program.cs - Top-Level Statements:
```csharp
using System.Diagnostics;
using System.Text;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using StudentMgmt.Api.Configuration;
using StudentMgmt.Application.Interfaces;
using StudentMgmt.Application.Services;
using StudentMgmt.Application.Validators;
using StudentMgmt.Infrastructure.Persistence;

// Initialize Serilog at the very top
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

Log.Information("Starting Student Management API...");

try
{
    var builder = WebApplication.CreateBuilder(args);

    // Configure Serilog from appsettings.json
    builder.Host.UseSerilog((context, services, configuration) => configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .Enrich.WithMachineName()
        .Enrich.WithThreadId());

    // Add services to the container
    builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.PropertyNamingPolicy = 
                System.Text.Json.JsonNamingPolicy.CamelCase;
        });

    // Configure CORS
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowReactApp", policy =>
        {
            policy.WithOrigins("http://localhost:5173", "http://localhost:5174")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        });
    });

    // Register FluentValidation
    builder.Services.AddFluentValidationAutoValidation();
    builder.Services.AddValidatorsFromAssemblyContaining
        <CreateStudentRequestValidator>();

    // Configure JWT Settings using Options Pattern
    builder.Services.Configure<JwtSettings>(
        builder.Configuration.GetSection(JwtSettings.SectionName));

    var jwtSettings = builder.Configuration
        .GetSection(JwtSettings.SectionName)
        .Get<JwtSettings>()!;

    // Configure JWT Authentication
    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings.Key))
        };
    });

    builder.Services.AddAuthorization();

    // Configure Swagger with JWT Bearer Authentication
    builder.Services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "Student Management API",
            Version = "v1",
            Description = "A Clean Architecture API for managing students."
        });

        options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Enter your JWT token"
        });

        options.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });
    });

    // Configure DbContext
    builder.Services.AddDbContext<StudentDbContext>(options =>
        options.UseSqlServer(
            builder.Configuration.GetConnectionString("DefaultConnection"),
            b => b.MigrationsAssembly("StudentMgmt.Infrastructure")));

    // Register Application Services
    builder.Services.AddScoped<IApplicationDbContext, StudentDbContext>();
    builder.Services.AddScoped<IAuthService, AuthService>();
    builder.Services.AddScoped<IUserService, UserService>();
    builder.Services.AddScoped<IStudentService, StudentService>();
    builder.Services.AddScoped<ICourseService, CourseService>();
    builder.Services.AddScoped<IEnrollmentService, EnrollmentService>();
    builder.Services.AddScoped<ITeacherService, TeacherService>();
    builder.Services.AddScoped<IDepartmentService, DepartmentService>();
    builder.Services.AddScoped<IReportService, ReportService>();

    var app = builder.Build();

    // Seed database in Development environment
    if (app.Environment.IsDevelopment())
    {
        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider
            .GetRequiredService<StudentDbContext>();
        await DbInitializer.SeedAsync(dbContext);
    }

    // Global Exception Handling Middleware
    app.UseExceptionHandler(errorApp =>
    {
        errorApp.Run(async context =>
        {
            context.Response.StatusCode = 
                StatusCodes.Status500InternalServerError;
            context.Response.ContentType = "application/json";

            var exceptionHandlerFeature = context.Features
                .Get<IExceptionHandlerFeature>();
            var logger = context.RequestServices
                .GetRequiredService<ILogger<Program>>();
            var traceId = Activity.Current?.Id ?? context.TraceIdentifier;

            if (exceptionHandlerFeature?.Error is not null)
            {
                logger.LogError(
                    exceptionHandlerFeature.Error,
                    "Unhandled exception occurred. TraceId: {TraceId}",
                    traceId);
            }

            var errorResponse = new
            {
                Type = "https://tools.ietf.org/html/rfc7231#section-6.6.1",
                Title = "An unexpected error occurred.",
                Status = context.Response.StatusCode,
                TraceId = traceId
            };

            await context.Response.WriteAsJsonAsync(errorResponse);
        });
    });

    // Configure the HTTP request pipeline
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint(
                "/swagger/v1/swagger.json", 
                "Student Management API v1");
            options.RoutePrefix = string.Empty;
        });
    }

    // Only use HTTPS redirection in production
    if (!app.Environment.IsDevelopment())
    {
        app.UseHttpsRedirection();
    }

    // Enable CORS
    app.UseCors("AllowReactApp");

    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();

    Log.Information("Student Management API started successfully");

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application startup failed");
    throw;
}
finally
{
    Log.Information("Shutting down Student Management API...");
    await Log.CloseAndFlushAsync();
}
```

**Features Demonstrated**:
- Top-level statements (C# 10)
- Global using directives
- Serilog integration
- Options pattern
- CORS configuration
- FluentValidation integration
- JWT authentication
- Swagger/OpenAPI
- EF Core configuration
- Scoped service registration
- Exception handling middleware
- Environment-based configuration
- Database seeding
- Structured logging

---

### 2. Options Pattern

#### Configuration Class:
```csharp
// JwtSettings.cs
namespace StudentMgmt.Api.Configuration;

public class JwtSettings
{
    public const string SectionName = "Jwt";
    public required string Key { get; init; }
    public required string Issuer { get; init; }
    public required string Audience { get; init; }
    public int ExpirationMinutes { get; init; } = 60;
}
```

#### appsettings.json:
```json
{
  "Jwt": {
    "Key": "YourSuperSecretKeyThatIsAtLeast32CharactersLong!",
    "Issuer": "StudentManagementAPI",
    "Audience": "StudentManagementClient",
    "ExpirationMinutes": 60
  }
}
```

#### Usage in Service:
```csharp
public class AuthService(
    IOptions<JwtSettings> jwtOptions,
    IApplicationDbContext dbContext) : IAuthService
{
    private readonly JwtSettings _jwtSettings = jwtOptions.Value;
    
    private string GenerateJwtToken(User user)
    {
        var securityKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_jwtSettings.Key));
        var credentials = new SigningCredentials(
            securityKey, 
            SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(
                _jwtSettings.ExpirationMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
```

---

## Entity Framework Core

### 1. Code-First Migrations

#### Creating Migration:
```powershell
# From Infrastructure project directory
dotnet ef migrations add InitialCreate --startup-project ../StudentMgmt.Api

# Update database
dotnet ef database update --startup-project ../StudentMgmt.Api
```

#### Migration Features Used:
- Automatic schema generation
- Fluent API configuration
- Data seeding
- Unique indexes
- Foreign key relationships
- Precision configuration

### 2. DbContext Features

#### Query Filters (Soft Delete):
```csharp
modelBuilder.Entity<Student>(entity =>
{
    entity.HasQueryFilter("SoftDeleteFilter", e => !e.IsDeleted);
});
```

#### Relationships:
```csharp
// One-to-Many
entity.HasOne(e => e.Student)
    .WithMany(s => s.Enrollments)
    .HasForeignKey(e => e.StudentId)
    .OnDelete(DeleteBehavior.Restrict);

// One-to-One
entity.HasOne(e => e.Enrollment)
    .WithOne(e => e.ExamResult)
    .HasForeignKey<Result>(e => e.EnrollmentId)
    .OnDelete(DeleteBehavior.Cascade);
```

#### Check Constraints:
```csharp
entity.ToTable(t => t.HasCheckConstraint(
    "CK_Results_Score", 
    "[Score] >= 0 AND [Score] <= 100"));
```

### 3. LINQ Queries

#### Eager Loading:
```csharp
var enrollments = await _dbContext.Enrollments
    .Include(e => e.Student)
    .Include(e => e.Course)
        .ThenInclude(c => c.Teacher)
    .Where(e => e.Status == EnrollmentStatus.Active)
    .AsNoTracking()
    .ToListAsync();
```

#### Projection:
```csharp
var studentSummaries = await _dbContext.Students
    .Select(s => new StudentSummaryDto
    {
        Id = s.Id,
        FullName = $"{s.FirstName} {s.LastName}",
        TotalCourses = s.Enrollments.Count,
        AverageGrade = s.Enrollments.Average(e => e.Grade)
    })
    .ToListAsync();
```

#### Grouping:
```csharp
var courseStats = await _dbContext.Enrollments
    .GroupBy(e => e.CourseId)
    .Select(g => new
    {
        CourseId = g.Key,
        TotalStudents = g.Count(),
        AverageGrade = g.Average(e => e.Grade),
        PassRate = g.Count(e => e.Grade >= 50) * 100.0 / g.Count()
    })
    .ToListAsync();
```

### 4. Database Seeding

#### DbInitializer.cs:
```csharp
public static class DbInitializer
{
    public static async Task SeedAsync(StudentDbContext context)
    {
        // Ensure database is created
        await context.Database.EnsureCreatedAsync();

        // Check if already seeded
        if (await context.Students.AnyAsync())
        {
            return; // Database has been seeded
        }

        // Create Teachers first
        var teacher1 = new Teacher("Sarah", "Johnson", 
            "sarah.johnson@school.edu", "EMP001");
        var teacher2 = new Teacher("Michael", "Chen", 
            "michael.chen@school.edu", "EMP002");

        await context.Teachers.AddRangeAsync(teacher1, teacher2);
        await context.SaveChangesAsync();

        // Create Courses with Teacher assignments
        var course1 = new Course("CS101", "Introduction to Programming", 
            "Learn programming basics", 4);
        course1.TeacherId = teacher1.Id;

        await context.Courses.AddAsync(course1);
        await context.SaveChangesAsync();

        // Create Students
        var student1 = new Student("John", "Doe", 
            "john.doe@student.edu", 
            new DateTime(2000, 5, 15), "STU2024001");

        await context.Students.AddAsync(student1);
        await context.SaveChangesAsync();

        // Create Enrollments
        var enrollment1 = new Enrollment(student1.Id, course1.Id)
        {
            Status = EnrollmentStatus.Active,
            Grade = 85.5m
        };

        await context.Enrollments.AddAsync(enrollment1);
        await context.SaveChangesAsync();
    }
}
```

---

## Authentication & Authorization

### 1. JWT Authentication

#### Token Generation:
```csharp
private string GenerateJwtToken(User user)
{
    var securityKey = new SymmetricSecurityKey(
        Encoding.UTF8.GetBytes(_jwtSettings.Key));
    
    var credentials = new SigningCredentials(
        securityKey, SecurityAlgorithms.HmacSha256);

    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Name, user.Username),
        new Claim(ClaimTypes.Role, user.Role),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
    };

    var token = new JwtSecurityToken(
        issuer: _jwtSettings.Issuer,
        audience: _jwtSettings.Audience,
        claims: claims,
        expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes),
        signingCredentials: credentials);

    return new JwtSecurityTokenHandler().WriteToken(token);
}
```

#### Password Hashing:
```csharp
// Hash password
string hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

// Verify password
bool isValid = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
```

### 2. Role-Based Authorization

#### Controller Level:
```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize] // All actions require authentication
public class StudentsController : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Admin,Teacher")] // Specific roles
    public async Task<IActionResult> GetAllStudents()
    {
        // ...
    }

    [HttpPost]
    [Authorize(Roles = "Admin")] // Admin only
    public async Task<IActionResult> CreateStudent()
    {
        // ...
    }
}
```

#### Accessing User Claims:
```csharp
// In controller
var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
var username = User.FindFirstValue(ClaimTypes.Name);
var role = User.FindFirstValue(ClaimTypes.Role);

// Check if user is in role
if (User.IsInRole("Admin"))
{
    // Admin-specific logic
}
```

---

## Dependency Injection

### 1. Service Lifetimes

#### Scoped (per request):
```csharp
builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddScoped<IApplicationDbContext, StudentDbContext>();
```

#### Singleton (application lifetime):
```csharp
builder.Services.AddSingleton<IConfiguration>(
    builder.Configuration);
```

#### Transient (per usage):
```csharp
builder.Services.AddTransient<IEmailService, EmailService>();
```

### 2. Constructor Injection

#### Primary Constructor (C# 12):
```csharp
public class StudentService(
    IApplicationDbContext dbContext,
    ILogger<StudentService> logger) : IStudentService
{
    // dbContext and logger are automatically fields
    
    public async Task<StudentResponseDto> GetByIdAsync(Guid id)
    {
        logger.LogInformation("Fetching student with ID {Id}", id);
        var student = await dbContext.Students.FindAsync(id);
        return student.ToDto();
    }
}
```

#### Traditional Constructor:
```csharp
public class StudentService : IStudentService
{
    private readonly IApplicationDbContext _dbContext;
    private readonly ILogger<StudentService> _logger;

    public StudentService(
        IApplicationDbContext dbContext,
        ILogger<StudentService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }
}
```

---

## API Design & Controllers

### 1. RESTful API Conventions

#### Standard CRUD Operations:
```csharp
[HttpGet]                           // GET /api/students
[HttpGet("{id:guid}")]             // GET /api/students/{id}
[HttpPost]                          // POST /api/students
[HttpPut("{id:guid}")]             // PUT /api/students/{id}
[HttpDelete("{id:guid}")]          // DELETE /api/students/{id}
```

#### Custom Actions:
```csharp
[HttpGet("my-enrollments")]        // GET /api/enrollments/my-enrollments
[HttpPost("{id:guid}/withdraw")]   // POST /api/enrollments/{id}/withdraw
[HttpPut("batch/status")]          // PUT /api/enrollments/batch/status
```

### 2. Model Binding

#### From Query:
```csharp
[HttpGet]
public async Task<IActionResult> GetStudents(
    [FromQuery] string? searchTerm,
    [FromQuery] int? status,
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 10)
{
    // Query parameters: ?searchTerm=john&status=1&page=1&pageSize=10
}
```

#### From Body:
```csharp
[HttpPost]
public async Task<IActionResult> CreateStudent(
    [FromBody] CreateStudentRequest request)
{
    // JSON body automatically deserialized
}
```

#### From Route:
```csharp
[HttpGet("{id:guid}")]
public async Task<IActionResult> GetStudent(
    [FromRoute] Guid id)
{
    // Route parameter
}
```

### 3. Response Types

#### ProducesResponseType:
```csharp
[HttpGet("{id:guid}")]
[ProducesResponseType(typeof(StudentResponseDto), StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
public async Task<IActionResult> GetStudent(Guid id)
{
    // Swagger documentation generated from attributes
}
```

#### Action Results:
```csharp
return Ok(data);                    // 200 OK
return Created(uri, data);          // 201 Created
return CreatedAtAction(...);        // 201 with Location header
return NoContent();                 // 204 No Content
return BadRequest(errors);          // 400 Bad Request
return Unauthorized();              // 401 Unauthorized
return Forbid();                    // 403 Forbidden
return NotFound(message);           // 404 Not Found
return StatusCode(500, error);      // 500 Internal Server Error
```

---

## Middleware & Pipeline

### 1. Request Pipeline Order

```csharp
// Exception handling (first)
app.UseExceptionHandler(...);

// HTTPS redirection
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// Static files (if any)
app.UseStaticFiles();

// Routing
app.UseRouting();

// CORS (before authentication)
app.UseCors("AllowReactApp");

// Authentication (before authorization)
app.UseAuthentication();

// Authorization
app.UseAuthorization();

// Endpoints (last)
app.MapControllers();
```

### 2. Global Exception Handling

```csharp
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";

        var exceptionFeature = context.Features
            .Get<IExceptionHandlerFeature>();
        
        var logger = context.RequestServices
            .GetRequiredService<ILogger<Program>>();
        
        var traceId = Activity.Current?.Id ?? context.TraceIdentifier;

        if (exceptionFeature?.Error is not null)
        {
            logger.LogError(
                exceptionFeature.Error,
                "Unhandled exception. TraceId: {TraceId}",
                traceId);
        }

        await context.Response.WriteAsJsonAsync(new
        {
            Title = "An unexpected error occurred.",
            Status = 500,
            TraceId = traceId
        });
    });
});
```

---

## Configuration Management

### 1. appsettings.json

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Information"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Server=.\\SQLEXPRESS;Database=StudentMgmtDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
  },
  "Jwt": {
    "Key": "YourSuperSecretKeyThatIsAtLeast32CharactersLong!",
    "Issuer": "StudentManagementAPI",
    "Audience": "StudentManagementClient",
    "ExpirationMinutes": 60
  },
  "Serilog": {
    "Using": [ "Serilog.Sinks.Console", "Serilog.Sinks.Seq" ],
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "System": "Warning"
      }
    },
    "WriteTo": [
      { "Name": "Console" },
      {
        "Name": "Seq",
        "Args": { "serverUrl": "http://localhost:5341" }
      }
    ],
    "Enrich": [ "FromLogContext", "WithMachineName", "WithThreadId" ]
  }
}
```

### 2. Environment-Specific Configuration

```json
// appsettings.Development.json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.EntityFrameworkCore": "Information"
    }
  }
}
```

### 3. Accessing Configuration

```csharp
// In Program.cs
var connectionString = builder.Configuration
    .GetConnectionString("DefaultConnection");

// Using IConfiguration
public class SomeService(IConfiguration configuration)
{
    private readonly string _apiKey = configuration["ApiKey"];
    private readonly int _maxRetries = configuration
        .GetValue<int>("MaxRetries", 3);
}
```

---

## Logging & Monitoring

### 1. Serilog Configuration

```csharp
// Bootstrap logger
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

// Full configuration
builder.Host.UseSerilog((context, services, configuration) => configuration
    .ReadFrom.Configuration(context.Configuration)
    .ReadFrom.Services(services)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .Enrich.WithThreadId());
```

### 2. Structured Logging

```csharp
// String interpolation (parsed at runtime)
logger.LogInformation(
    "Student {EnrollmentNumber} registered by {User}",
    student.EnrollmentNumber,
    User.Identity?.Name);

// Different log levels
logger.LogTrace("Detailed trace information");
logger.LogDebug("Debugging information");
logger.LogInformation("General information");
logger.LogWarning("Warning message");
logger.LogError(exception, "Error occurred");
logger.LogCritical(exception, "Critical error");
```

### 3. Log Context

```csharp
using (logger.BeginScope("Processing student {StudentId}", studentId))
{
    logger.LogInformation("Starting enrollment process");
    // All logs within scope include StudentId
    logger.LogInformation("Enrollment complete");
}
```

---

## Validation

### 1. FluentValidation

#### Validator Class:
```csharp
// CreateStudentRequestValidator.cs
public class CreateStudentRequestValidator 
    : AbstractValidator<CreateStudentRequest>
{
    public CreateStudentRequestValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required")
            .MaximumLength(100).WithMessage("First name too long");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required")
            .MaximumLength(100).WithMessage("Last name too long");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Invalid email format")
            .MaximumLength(255).WithMessage("Email too long");

        RuleFor(x => x.DateOfBirth)
            .NotEmpty().WithMessage("Date of birth is required")
            .LessThan(DateTime.Today).WithMessage("Invalid date of birth")
            .Must(BeAtLeast18YearsOld).WithMessage("Must be at least 18");

        RuleFor(x => x.PhoneNumber)
            .Matches(@"^\+?[1-9]\d{1,14}$")
            .When(x => !string.IsNullOrEmpty(x.PhoneNumber))
            .WithMessage("Invalid phone number format");
    }

    private bool BeAtLeast18YearsOld(DateTime dateOfBirth)
    {
        var age = DateTime.Today.Year - dateOfBirth.Year;
        if (dateOfBirth.Date > DateTime.Today.AddYears(-age)) age--;
        return age >= 18;
    }
}
```

#### Registration:
```csharp
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining
    <CreateStudentRequestValidator>();
```

### 2. Data Annotations

```csharp
public class CreateStudentRequest
{
    [Required(ErrorMessage = "First name is required")]
    [StringLength(100, MinimumLength = 1)]
    public required string FirstName { get; set; }

    [Required]
    [EmailAddress]
    [StringLength(255)]
    public required string Email { get; set; }

    [Phone]
    public string? PhoneNumber { get; set; }

    [DataType(DataType.Date)]
    [Required]
    public required DateTime DateOfBirth { get; set; }
}
```

---

## Error Handling

### 1. Try-Catch Pattern

```csharp
[HttpPost]
public async Task<IActionResult> CreateStudent(
    [FromBody] CreateStudentRequest request)
{
    try
    {
        var student = await _studentService.RegisterStudentAsync(request);
        return CreatedAtAction(nameof(GetStudent), 
            new { id = student.Id }, student);
    }
    catch (ApplicationException ex)
    {
        _logger.LogWarning(ex, "Business rule violation");
        return BadRequest(new { Message = ex.Message });
    }
    catch (KeyNotFoundException ex)
    {
        _logger.LogWarning(ex, "Resource not found");
        return NotFound(new { Message = ex.Message });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Unexpected error creating student");
        return StatusCode(500, new 
        { 
            Message = "An error occurred processing your request" 
        });
    }
}
```

### 2. Custom Exceptions

```csharp
// Custom exception class
public class StudentNotFoundException : Exception
{
    public Guid StudentId { get; }

    public StudentNotFoundException(Guid studentId)
        : base($"Student with ID '{studentId}' was not found")
    {
        StudentId = studentId;
    }
}

// Usage
if (student is null)
{
    throw new StudentNotFoundException(id);
}
```

---

## Database Design

### Entity Relationship Diagram

```
┌──────────────┐         ┌──────────────┐
│   Student    │         │   Teacher    │
├──────────────┤         ├──────────────┤
│ Id (PK)      │         │ Id (PK)      │
│ FirstName    │         │ FirstName    │
│ LastName     │         │ LastName     │
│ Email (UQ)   │         │ Email (UQ)   │
│ PhoneNumber  │         │ PhoneNumber  │
│ DateOfBirth  │         │ EmployeeId   │
│ EnrollmentNo │         │ Department   │
└──────┬───────┘         └──────┬───────┘
       │                        │
       │ 1:N                    │ 1:N
       │                        │
       ▼                        ▼
┌──────────────┐         ┌──────────────┐
│  Enrollment  │ N:1     │    Course    │
├──────────────┤─────────├──────────────┤
│ Id (PK)      │         │ Id (PK)      │
│ StudentId FK │         │ CourseCode   │
│ CourseId FK  │         │ Title        │
│ EnrolledAt   │         │ Description  │
│ Status       │         │ Credits      │
│ Grade        │         │ TeacherId FK │
│ Semester     │         │ DepartmentId │
└──────┬───────┘         └──────────────┘
       │
       │ 1:1
       ▼
┌──────────────┐
│    Result    │
├──────────────┤
│ Id (PK)      │
│ EnrollmentFK │
│ Score        │
│ Grade        │
│ ExamDate     │
│ Remarks      │
└──────────────┘
```

### Key Features:
- **Primary Keys**: All Guid-based
- **Unique Indexes**: Email, EnrollmentNumber, CourseCode
- **Composite Unique**: (StudentId, CourseId) in Enrollment
- **Soft Delete**: IsDeleted flag with query filters
- **Timestamps**: CreatedAt, UpdatedAt
- **Foreign Keys**: Restrict delete behavior
- **Precision**: Decimal(5,2) for grades/scores
- **Check Constraints**: Score validation (0-100)

---

## Code Examples

### 1. Complete CRUD Service

```csharp
public class CourseService(
    IApplicationDbContext dbContext,
    ILogger<CourseService> logger) : ICourseService
{
    // CREATE
    public async Task<CourseResponseDto> CreateCourseAsync(
        CreateCourseRequest request)
    {
        var exists = await dbContext.Courses
            .AnyAsync(c => c.CourseCode == request.CourseCode);

        if (exists)
        {
            throw new ApplicationException(
                $"Course with code '{request.CourseCode}' already exists");
        }

        var course = new Course(
            request.CourseCode,
            request.Title,
            request.Description,
            request.Credits);

        dbContext.Courses.Add(course);
        await dbContext.SaveChangesAsync();

        logger.LogInformation(
            "Course {CourseCode} created successfully",
            course.CourseCode);

        return course.ToDto()!;
    }

    // READ (Single)
    public async Task<CourseResponseDto> GetByIdAsync(Guid id)
    {
        var course = await dbContext.Courses
            .Include(c => c.Teacher)
            .Include(c => c.Enrollments)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (course is null)
        {
            throw new KeyNotFoundException(
                $"Course with ID '{id}' was not found");
        }

        return course.ToDto()!;
    }

    // READ (List)
    public async Task<IEnumerable<CourseResponseDto>> GetAllAsync(
        CourseFilterDto? filter = null)
    {
        var query = dbContext.Courses
            .Include(c => c.Teacher)
            .AsQueryable();

        if (filter is not null)
        {
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var term = filter.SearchTerm.ToLower();
                query = query.Where(c =>
                    c.CourseCode.ToLower().Contains(term) ||
                    c.Title.ToLower().Contains(term));
            }

            if (filter.MinCredits.HasValue)
            {
                query = query.Where(c => c.Credits >= filter.MinCredits);
            }

            if (filter.MaxCredits.HasValue)
            {
                query = query.Where(c => c.Credits <= filter.MaxCredits);
            }
        }

        var courses = await query.AsNoTracking().ToListAsync();
        return courses.Select(c => c.ToDto()!);
    }

    // UPDATE
    public async Task<CourseResponseDto> UpdateCourseAsync(
        Guid id,
        UpdateCourseRequest request)
    {
        var course = await dbContext.Courses.FindAsync(id);

        if (course is null)
        {
            throw new KeyNotFoundException(
                $"Course with ID '{id}' was not found");
        }

        course.Title = request.Title;
        course.Description = request.Description;
        course.Credits = request.Credits;
        course.UpdatedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync();

        logger.LogInformation(
            "Course {CourseCode} updated successfully",
            course.CourseCode);

        return course.ToDto()!;
    }

    // DELETE (Soft)
    public async Task DeleteCourseAsync(Guid id)
    {
        var course = await dbContext.Courses.FindAsync(id);

        if (course is null)
        {
            throw new KeyNotFoundException(
                $"Course with ID '{id}' was not found");
        }

        course.IsDeleted = true;
        course.UpdatedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync();

        logger.LogInformation(
            "Course {CourseCode} deleted successfully",
            course.CourseCode);
    }
}
```

### 2. Extension Methods for Mapping

```csharp
// EntityExtensions.cs
public static class EntityExtensions
{
    public static StudentResponseDto? ToDto(this Student? student)
    {
        if (student is null) return null;

        return new StudentResponseDto
        {
            Id = student.Id,
            FirstName = student.FirstName,
            LastName = student.LastName,
            FullName = $"{student.FirstName} {student.LastName}",
            Email = student.Email,
            PhoneNumber = student.PhoneNumber,
            DateOfBirth = student.DateOfBirth,
            EnrollmentNumber = student.EnrollmentNumber,
            TotalEnrollments = student.Enrollments?.Count ?? 0,
            CreatedAt = student.CreatedAt,
            UpdatedAt = student.UpdatedAt
        };
    }

    public static CourseResponseDto? ToDto(this Course? course)
    {
        if (course is null) return null;

        return new CourseResponseDto
        {
            Id = course.Id,
            CourseCode = course.CourseCode,
            Title = course.Title,
            Description = course.Description,
            Credits = course.Credits,
            TeacherId = course.TeacherId,
            TeacherName = course.Teacher != null
                ? $"{course.Teacher.FirstName} {course.Teacher.LastName}"
                : "TBD",
            TotalEnrollments = course.Enrollments?.Count ?? 0,
            CreatedAt = course.CreatedAt,
            UpdatedAt = course.UpdatedAt
        };
    }
}
```

---

## Best Practices Implemented

### 1. Clean Architecture
✅ Separation of concerns  
✅ Dependency inversion  
✅ Independent layers  
✅ Testable code

### 2. SOLID Principles
✅ **S**ingle Responsibility  
✅ **O**pen/Closed  
✅ **L**iskov Substitution  
✅ **I**nterface Segregation  
✅ **D**ependency Inversion

### 3. Modern C# Features
✅ Primary constructors (C# 12)  
✅ Required members  
✅ Init-only setters  
✅ Collection expressions  
✅ Pattern matching  
✅ Nullable reference types  
✅ Top-level statements  
✅ Global using directives

### 4. ASP.NET Core Best Practices
✅ Options pattern for configuration  
✅ Dependency injection  
✅ Middleware pipeline  
✅ Global exception handling  
✅ Structured logging  
✅ API versioning ready  
✅ OpenAPI/Swagger documentation

### 5. Entity Framework Core
✅ Code-first migrations  
✅ Fluent API configuration  
✅ Query filters (soft delete)  
✅ AsNoTracking for read-only  
✅ Include/ThenInclude for eager loading  
✅ Database seeding

### 6. Security
✅ JWT authentication  
✅ Role-based authorization  
✅ Password hashing (BCrypt)  
✅ CORS configuration  
✅ HTTPS redirection (production)  
✅ No sensitive data in logs

### 7. API Design
✅ RESTful conventions  
✅ HTTP status codes  
✅ Consistent response format  
✅ ProducesResponseType  
✅ Model validation  
✅ Route constraints

### 8. Code Quality
✅ Consistent naming  
✅ XML documentation ready  
✅ Async/await throughout  
✅ Proper exception handling  
✅ Structured logging  
✅ Extension methods for reuse

---

## Demonstration Talking Points

### For Beginners:
1. **Project Structure**: Show how Clean Architecture organizes code
2. **Entity Framework**: Demonstrate Code-First approach
3. **Dependency Injection**: Show how services are injected
4. **Controllers**: Basic CRUD operations
5. **Authentication**: JWT token generation and validation

### For Intermediate:
1. **Clean Architecture**: Explain layer dependencies
2. **EF Core Advanced**: Relationships, query filters, migrations
3. **Middleware Pipeline**: Request/response flow
4. **Validation**: FluentValidation vs Data Annotations
5. **Logging**: Structured logging with Serilog

### For Advanced:
1. **Architecture Patterns**: DDD, CQRS-ready structure
2. **Performance**: AsNoTracking, query optimization
3. **Security**: JWT, BCrypt, CORS, authorization policies
4. **Modern C#**: Primary constructors, required members, etc.
5. **Extensibility**: Adding new features, plugins, etc.

---

## Summary

This Student Management System backend demonstrates a **production-ready ASP.NET Core 10.0 application** with:

- ✅ **Clean Architecture** with clear separation of concerns
- ✅ **Modern C# 12/14** features throughout
- ✅ **Entity Framework Core 10** with advanced features
- ✅ **JWT Authentication** and role-based authorization
- ✅ **Comprehensive logging** with Serilog
- ✅ **FluentValidation** for request validation
- ✅ **RESTful API** design principles
- ✅ **Swagger/OpenAPI** documentation
- ✅ **Dependency Injection** everywhere
- ✅ **Best practices** and industry standards

The codebase serves as an **excellent teaching resource** for demonstrating ASP.NET Core capabilities to audiences at all skill levels.

---

*For questions or detailed explanation of specific features, refer to the inline code documentation and XML comments throughout the solution.*
