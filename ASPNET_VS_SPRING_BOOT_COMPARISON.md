# ASP.NET Core vs Spring Boot - Framework Comparison
## Student Management System Implementation

*Date: January 12, 2026*  
*Project: Student Management System*  
*Frameworks: ASP.NET Core 10.0 (.NET 10) vs Spring Boot 3.x (Java 17+)*

---

## Table of Contents

1. [Framework Overview](#framework-overview)
2. [Project Structure](#project-structure)
3. [Dependency Injection](#dependency-injection)
4. [Application Startup](#application-startup)
5. [Controllers & REST APIs](#controllers--rest-apis)
6. [Entity & ORM](#entity--orm)
7. [Database Configuration](#database-configuration)
8. [Authentication & Security](#authentication--security)
9. [Configuration Management](#configuration-management)
10. [Validation](#validation)
11. [Middleware vs Filters](#middleware-vs-filters)
12. [Exception Handling](#exception-handling)
13. [Logging](#logging)
14. [Data Transfer Objects](#data-transfer-objects)
15. [Service Layer](#service-layer)
16. [Repository Pattern](#repository-pattern)
17. [API Documentation](#api-documentation)
18. [Testing](#testing)
19. [Deployment](#deployment)
20. [Feature Comparison Matrix](#feature-comparison-matrix)

---

## Framework Overview

### ASP.NET Core
```
Language: C# 12/14
Runtime: .NET 10
Framework: ASP.NET Core 10.0
Philosophy: Convention over configuration (but configurable)
Ecosystem: NuGet packages
IDE: Visual Studio, VS Code, Rider
```

### Spring Boot
```
Language: Java 17+
Runtime: JVM
Framework: Spring Boot 3.x
Philosophy: Convention over configuration
Ecosystem: Maven/Gradle dependencies
IDE: IntelliJ IDEA, Eclipse, VS Code
```

---

## Project Structure

### ASP.NET Core (Clean Architecture)

```
StudentManagementSystem/
├── StudentMgmt.Domain/              # Core entities (no dependencies)
│   ├── Entities/
│   │   ├── Student.cs
│   │   ├── Course.cs
│   │   └── Enrollment.cs
│   └── Common/
│       └── BaseEntity.cs
│
├── StudentMgmt.Application/         # Business logic
│   ├── Services/
│   │   └── StudentService.cs
│   ├── Interfaces/
│   │   └── IStudentService.cs
│   ├── DTOs/
│   │   └── StudentResponseDto.cs
│   └── Validators/
│       └── CreateStudentRequestValidator.cs
│
├── StudentMgmt.Infrastructure/      # Data access
│   ├── Persistence/
│   │   ├── StudentDbContext.cs
│   │   └── DbInitializer.cs
│   └── Repositories/
│
└── StudentMgmt.Api/                 # Presentation
    ├── Controllers/
    │   └── StudentsController.cs
    ├── Configuration/
    │   └── JwtSettings.cs
    └── Program.cs
```

### Spring Boot Equivalent

```
student-management-system/
├── domain/                          # Core entities
│   ├── model/
│   │   ├── Student.java
│   │   ├── Course.java
│   │   └── Enrollment.java
│   └── common/
│       └── BaseEntity.java
│
├── application/                     # Business logic (Use Cases)
│   ├── service/
│   │   ├── StudentService.java
│   │   └── StudentServiceImpl.java
│   └── dto/
│       ├── StudentResponseDto.java
│       └── CreateStudentRequest.java
│
├── infrastructure/                  # Data access
│   ├── persistence/
│   │   └── StudentRepository.java
│   └── config/
│       └── DatabaseConfig.java
│
└── web/                            # Presentation
    ├── controller/
    │   └── StudentController.java
    ├── config/
    │   ├── SecurityConfig.java
    │   └── JwtConfig.java
    └── Application.java
```

**Note**: Spring Boot typically uses a **package-by-layer** structure, while ASP.NET Core projects often use **project-by-layer** (separate DLLs).

---

## Dependency Injection

### ASP.NET Core

#### Registration (Program.cs):
```csharp
// Service registration
builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddScoped<IApplicationDbContext, StudentDbContext>();
builder.Services.AddSingleton<IConfiguration>(builder.Configuration);
builder.Services.AddTransient<IEmailService, EmailService>();

// Configure options
builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection(JwtSettings.SectionName));
```

#### Injection (Primary Constructor):
```csharp
// C# 12 Primary Constructor
public class StudentService(
    IApplicationDbContext dbContext,
    ILogger<StudentService> logger) : IStudentService
{
    // Parameters automatically become fields
    
    public async Task<StudentResponseDto> GetByIdAsync(Guid id)
    {
        logger.LogInformation("Fetching student {Id}", id);
        var student = await dbContext.Students.FindAsync(id);
        return student.ToDto();
    }
}
```

#### Injection (Traditional Constructor):
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

### Spring Boot Equivalent

#### Registration (Auto-configuration):
```java
// Spring Boot auto-detects @Component, @Service, @Repository
// Manual registration in @Configuration class:

@Configuration
public class AppConfig {
    
    @Bean
    @Scope("prototype")  // Transient
    public EmailService emailService() {
        return new EmailService();
    }
    
    @Bean
    public JwtSettings jwtSettings(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.issuer}") String issuer) {
        return new JwtSettings(secret, issuer);
    }
}
```

#### Injection (Constructor - Recommended):
```java
@Service
public class StudentService {
    
    private final StudentRepository studentRepository;
    private final Logger logger = LoggerFactory.getLogger(StudentService.class);
    
    // Constructor injection (no @Autowired needed in Spring 4.3+)
    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }
    
    public StudentResponseDto getById(UUID id) {
        logger.info("Fetching student {}", id);
        Student student = studentRepository.findById(id)
            .orElseThrow(() -> new StudentNotFoundException(id));
        return StudentMapper.toDto(student);
    }
}
```

#### Injection (Field - Not Recommended):
```java
@Service
public class StudentService {
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private Logger logger;
}
```

#### Injection (Lombok - Modern Approach):
```java
@Service
@RequiredArgsConstructor  // Lombok generates constructor
public class StudentService {
    
    private final StudentRepository studentRepository;
    private final Logger logger = LoggerFactory.getLogger(StudentService.class);
    
    // Constructor auto-generated by Lombok
}
```

**Scopes Comparison**:
| ASP.NET Core | Spring Boot | Description |
|--------------|-------------|-------------|
| `AddScoped` | `@Scope("request")` | Per HTTP request |
| `AddTransient` | `@Scope("prototype")` | New instance each time |
| `AddSingleton` | `@Scope("singleton")` (default) | Single instance |

---

## Application Startup

### ASP.NET Core (Program.cs)

```csharp
using Microsoft.EntityFrameworkCore;
using StudentMgmt.Infrastructure.Persistence;
using Serilog;

// Top-level statements (C# 10+)
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    // Configure services
    builder.Host.UseSerilog((context, services, configuration) => 
        configuration
            .ReadFrom.Configuration(context.Configuration)
            .Enrich.FromLogContext());

    builder.Services.AddControllers();
    builder.Services.AddDbContext<StudentDbContext>(options =>
        options.UseSqlServer(
            builder.Configuration.GetConnectionString("DefaultConnection")));
    
    builder.Services.AddAuthentication(/* JWT config */);
    builder.Services.AddCors(/* CORS config */);
    
    // Register services
    builder.Services.AddScoped<IStudentService, StudentService>();

    var app = builder.Build();

    // Configure middleware pipeline
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseCors("AllowReactApp");
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application startup failed");
}
finally
{
    Log.CloseAndFlush();
}
```

### Spring Boot Equivalent

```java
@SpringBootApplication
@EnableJpaAuditing
public class StudentManagementApplication {

    private static final Logger logger = 
        LoggerFactory.getLogger(StudentManagementApplication.class);

    public static void main(String[] args) {
        try {
            SpringApplication.run(StudentManagementApplication.class, args);
            logger.info("Student Management API started successfully");
        } catch (Exception ex) {
            logger.error("Application startup failed", ex);
            System.exit(1);
        }
    }

    @Bean
    public CommandLineRunner initDatabase(StudentRepository repository) {
        return args -> {
            // Database seeding
            if (repository.count() == 0) {
                logger.info("Seeding database...");
                // Seed data
            }
        };
    }
}
```

**Configuration Classes**:
```java
@Configuration
public class DatabaseConfig {
    
    @Bean
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(
            DataSource dataSource) {
        // JPA configuration
        return factory;
    }
}

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        http
            .cors().and()
            .csrf().disable()
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated())
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        return http.build();
    }
}
```

---

## Controllers & REST APIs

### ASP.NET Core Controller

```csharp
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
    public async Task<IActionResult> CreateStudent(
        [FromBody] CreateStudentRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var student = await _studentService.RegisterStudentAsync(request);
        
        _logger.LogInformation(
            "Student {EnrollmentNumber} created by {User}",
            student.EnrollmentNumber,
            User.Identity?.Name);

        return CreatedAtAction(
            nameof(GetStudent),
            new { id = student.Id },
            student);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStudent(
        Guid id,
        [FromBody] UpdateStudentRequest request)
    {
        var student = await _studentService.UpdateStudentAsync(id, request);
        return Ok(student);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteStudent(Guid id)
    {
        await _studentService.DeleteStudentAsync(id);
        return NoContent();
    }
}
```

### Spring Boot Controller

```java
@RestController
@RequestMapping("/api/students")
@Validated
public class StudentController {
    
    private final StudentService studentService;
    private final Logger logger = LoggerFactory.getLogger(StudentController.class);
    
    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Get all students")
    @ApiResponse(responseCode = "200", description = "Success")
    public ResponseEntity<List<StudentResponseDto>> getAllStudents(
            @ModelAttribute StudentFilterDto filter) {
        List<StudentResponseDto> students = studentService.getAll(filter);
        return ResponseEntity.ok(students);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get student by ID")
    @ApiResponse(responseCode = "200", description = "Found")
    @ApiResponse(responseCode = "404", description = "Not found")
    public ResponseEntity<StudentResponseDto> getStudent(
            @PathVariable UUID id) {
        try {
            StudentResponseDto student = studentService.getById(id);
            return ResponseEntity.ok(student);
        } catch (StudentNotFoundException ex) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, 
                ex.getMessage());
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create new student")
    @ApiResponse(responseCode = "201", description = "Created")
    @ApiResponse(responseCode = "400", description = "Invalid input")
    public ResponseEntity<StudentResponseDto> createStudent(
            @Valid @RequestBody CreateStudentRequest request,
            Authentication authentication) {
        
        StudentResponseDto student = studentService.register(request);
        
        logger.info("Student {} created by {}",
            student.getEnrollmentNumber(),
            authentication.getName());
        
        URI location = ServletUriComponentsBuilder
            .fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(student.getId())
            .toUri();
        
        return ResponseEntity.created(location).body(student);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StudentResponseDto> updateStudent(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateStudentRequest request) {
        StudentResponseDto student = studentService.update(id, request);
        return ResponseEntity.ok(student);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deleteStudent(@PathVariable UUID id) {
        studentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

**Key Differences**:
| Feature | ASP.NET Core | Spring Boot |
|---------|--------------|-------------|
| Base Class | `ControllerBase` (API) or `Controller` (MVC) | None required |
| Class Attribute | `[ApiController]` | `@RestController` |
| Routing | `[Route("api/[controller]")]` | `@RequestMapping("/api/students")` |
| HTTP Verbs | `[HttpGet]`, `[HttpPost]`, etc. | `@GetMapping`, `@PostMapping`, etc. |
| Path Variables | `{id:guid}` | `@PathVariable` |
| Query Params | `[FromQuery]` | `@RequestParam` or `@ModelAttribute` |
| Request Body | `[FromBody]` | `@RequestBody` |
| Return Type | `IActionResult`, `ActionResult<T>` | `ResponseEntity<T>` |
| Authorization | `[Authorize(Roles = "Admin")]` | `@PreAuthorize("hasRole('ADMIN')")` |

---

## Entity & ORM

### ASP.NET Core (Entity Framework Core)

#### Entity Definition:
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
    public string? PhoneNumber { get; set; }

    [Required]
    public required DateTime DateOfBirth { get; init; } = dateOfBirth;

    [Required]
    [StringLength(50)]
    public required string EnrollmentNumber { get; init; } = enrollmentNumber;

    // Navigation property
    public ICollection<Enrollment> Enrollments { get; set; } = [];
}

// Base entity
public abstract class BaseEntity
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; } = false;
}
```

#### DbContext Configuration:
```csharp
public class StudentDbContext : DbContext
{
    public DbSet<Student> Students => Set<Student>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Fluent API configuration
        modelBuilder.Entity<Student>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.EnrollmentNumber).IsUnique();
            entity.HasQueryFilter("SoftDeleteFilter", e => !e.IsDeleted);
            
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
        });

        modelBuilder.Entity<Enrollment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Grade).HasPrecision(5, 2);

            // Relationships
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

### Spring Boot (JPA/Hibernate)

#### Entity Definition:
```java
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "students",
    indexes = {
        @Index(name = "idx_student_email", columnList = "email", unique = true),
        @Index(name = "idx_enrollment_number", columnList = "enrollmentNumber", unique = true)
    }
)
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @NotNull
    @Size(min = 1, max = 100)
    @Column(nullable = false, length = 100)
    private String firstName;
    
    @NotNull
    @Size(min = 1, max = 100)
    @Column(nullable = false, length = 100)
    private String lastName;
    
    @NotNull
    @Email
    @Size(max = 255)
    @Column(nullable = false, unique = true, length = 255)
    private String email;
    
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$")
    @Column(length = 20)
    private String phoneNumber;
    
    @NotNull
    @Past
    @Column(nullable = false)
    private LocalDate dateOfBirth;
    
    @NotNull
    @Size(max = 50)
    @Column(nullable = false, unique = true, length = 50)
    private String enrollmentNumber;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    @Column(nullable = false)
    private boolean deleted = false;
    
    // Relationships
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Enrollment> enrollments = new ArrayList<>();
}
```

#### Enrollment Entity (Relationship Example):
```java
@Entity
@Table(name = "enrollments",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"student_id", "course_id"})
    }
)
@Data
@NoArgsConstructor
public class Enrollment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
    
    @Column(nullable = false)
    private LocalDateTime enrolledAt;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EnrollmentStatus status;
    
    @DecimalMin("0.0")
    @DecimalMax("100.0")
    @Column(precision = 5, scale = 2)
    private BigDecimal grade;
}
```

**Key Differences**:
| Feature | EF Core | JPA/Hibernate |
|---------|---------|---------------|
| Entity Annotation | None (POCO) | `@Entity` |
| Table Name | `[Table("students")]` or Fluent API | `@Table(name = "students")` |
| Primary Key | `public Guid Id { get; init; }` | `@Id` + `@GeneratedValue` |
| Required Field | `[Required]` or `required` keyword | `@NotNull` + `@Column(nullable = false)` |
| String Length | `[StringLength(100)]` | `@Size(max = 100)` |
| Relationships | Fluent API or Navigation props | `@ManyToOne`, `@OneToMany`, `@JoinColumn` |
| Soft Delete | Query Filter | Custom logic or annotations |
| Auditing | Manual or interceptors | `@CreatedDate`, `@LastModifiedDate` with `@EntityListeners` |

---

## Database Configuration

### ASP.NET Core

#### Connection String (appsettings.json):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.\\SQLEXPRESS;Database=StudentMgmtDb;Trusted_Connection=True;TrustServerCertificate=True"
  }
}
```

#### Registration (Program.cs):
```csharp
builder.Services.AddDbContext<StudentDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        b => b.MigrationsAssembly("StudentMgmt.Infrastructure")));
```

#### Migrations:
```powershell
# Create migration
dotnet ef migrations add InitialCreate --project StudentMgmt.Infrastructure --startup-project StudentMgmt.Api

# Update database
dotnet ef database update --project StudentMgmt.Infrastructure --startup-project StudentMgmt.Api
```

### Spring Boot

#### Connection Properties (application.yml):
```yaml
spring:
  datasource:
    url: jdbc:sqlserver://localhost:1433;databaseName=StudentMgmtDb;encrypt=true;trustServerCertificate=true
    username: sa
    password: your_password
    driver-class-name: com.microsoft.sqlserver.jdbc.SQLServerDriver
  
  jpa:
    hibernate:
      ddl-auto: update  # or validate, create, create-drop
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.SQLServerDialect
        format_sql: true
        use_sql_comments: true
    open-in-view: false
```

#### Or application.properties:
```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=StudentMgmtDb
spring.datasource.username=sa
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

#### Liquibase/Flyway Migrations:
```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
```

```sql
-- V1__Initial_schema.sql (resources/db/migration/)
CREATE TABLE students (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    first_name NVARCHAR(100) NOT NULL,
    last_name NVARCHAR(100) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    enrollment_number NVARCHAR(50) NOT NULL UNIQUE,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
```

---

## Authentication & Security

### ASP.NET Core (JWT)

#### JWT Configuration:
```csharp
// JwtSettings.cs
public class JwtSettings
{
    public const string SectionName = "Jwt";
    public required string Key { get; init; }
    public required string Issuer { get; init; }
    public required string Audience { get; init; }
    public int ExpirationMinutes { get; init; } = 60;
}

// Program.cs
builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection(JwtSettings.SectionName));

var jwtSettings = builder.Configuration
    .GetSection(JwtSettings.SectionName)
    .Get<JwtSettings>()!;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
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
```

#### Token Generation:
```csharp
public class AuthService
{
    private readonly JwtSettings _jwtSettings;

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
            new Claim(ClaimTypes.Role, user.Role)
        };

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
```

#### Password Hashing:
```csharp
// Using BCrypt.Net
string hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);
bool isValid = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
```

#### Controller Authorization:
```csharp
[ApiController]
[Authorize]  // Require authentication
public class StudentsController : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Admin,Teacher")]  // Role-based
    public async Task<IActionResult> GetAll()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var role = User.FindFirstValue(ClaimTypes.Role);
        // ...
    }
}
```

### Spring Boot (JWT + Spring Security)

#### Security Configuration:
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    
    private final JwtAuthenticationEntryPoint jwtAuthEntryPoint;
    private final JwtRequestFilter jwtRequestFilter;
    
    public SecurityConfig(
            JwtAuthenticationEntryPoint jwtAuthEntryPoint,
            JwtRequestFilter jwtRequestFilter) {
        this.jwtAuthEntryPoint = jwtAuthEntryPoint;
        this.jwtRequestFilter = jwtRequestFilter;
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .exceptionHandling()
                .authenticationEntryPoint(jwtAuthEntryPoint)
                .and()
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/students/**").hasAnyRole("ADMIN", "TEACHER")
                .anyRequest().authenticated())
            .addFilterBefore(jwtRequestFilter, 
                UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
```

#### JWT Utility:
```java
@Component
public class JwtUtil {
    
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expiration}")
    private Long expiration;
    
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return Jwts.builder()
            .setClaims(claims)
            .setSubject(userDetails.getUsername())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(SignatureAlgorithm.HS512, secret)
            .compact();
    }
    
    public String getUsernameFromToken(String token) {
        return Jwts.parser()
            .setSigningKey(secret)
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
    }
    
    public boolean validateToken(String token, UserDetails userDetails) {
        String username = getUsernameFromToken(token);
        return username.equals(userDetails.getUsername()) 
            && !isTokenExpired(token);
    }
}
```

#### JWT Filter:
```java
@Component
public class JwtRequestFilter extends OncePerRequestFilter {
    
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {
        
        String requestTokenHeader = request.getHeader("Authorization");
        
        String username = null;
        String jwtToken = null;
        
        if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
            jwtToken = requestTokenHeader.substring(7);
            try {
                username = jwtUtil.getUsernameFromToken(jwtToken);
            } catch (IllegalArgumentException e) {
                logger.error("Unable to get JWT Token");
            } catch (ExpiredJwtException e) {
                logger.error("JWT Token has expired");
            }
        }
        
        if (username != null && SecurityContextHolder.getContext()
                .getAuthentication() == null) {
            
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            
            if (jwtUtil.validateToken(jwtToken, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = 
                    new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        chain.doFilter(request, response);
    }
}
```

#### Controller Authorization:
```java
@RestController
@RequestMapping("/api/students")
public class StudentController {
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<StudentDto>> getAll() {
        Authentication auth = SecurityContextHolder.getContext()
            .getAuthentication();
        String username = auth.getName();
        Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
        // ...
    }
}
```

#### Password Encoding:
```java
@Service
public class AuthService {
    
    private final PasswordEncoder passwordEncoder;
    
    public void register(RegisterRequest request) {
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        // Save user with hashed password
    }
    
    public boolean verifyPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
}
```

---

## Configuration Management

### ASP.NET Core

#### appsettings.json:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=.\\SQLEXPRESS;Database=StudentMgmtDb"
  },
  "Jwt": {
    "Key": "YourSuperSecretKey",
    "Issuer": "StudentManagementAPI",
    "Audience": "StudentManagementClient",
    "ExpirationMinutes": 60
  },
  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "Port": 587
  }
}
```

#### Options Pattern:
```csharp
// Configuration class
public class EmailSettings
{
    public const string SectionName = "EmailSettings";
    public required string SmtpServer { get; init; }
    public required int Port { get; init; }
}

// Registration
builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection(EmailSettings.SectionName));

// Usage via DI
public class EmailService(IOptions<EmailSettings> emailOptions)
{
    private readonly EmailSettings _settings = emailOptions.Value;
}
```

#### Direct Access:
```csharp
var apiKey = builder.Configuration["ApiKey"];
var dbConnection = builder.Configuration.GetConnectionString("DefaultConnection");
var port = builder.Configuration.GetValue<int>("EmailSettings:Port");
```

### Spring Boot

#### application.yml:
```yaml
logging:
  level:
    root: INFO
    com.example: DEBUG

spring:
  datasource:
    url: jdbc:sqlserver://localhost;databaseName=StudentMgmtDb
  
jwt:
  secret: YourSuperSecretKey
  issuer: StudentManagementAPI
  audience: StudentManagementClient
  expiration: 3600000  # milliseconds

email:
  smtp-server: smtp.gmail.com
  port: 587
```

#### @ConfigurationProperties:
```java
@Configuration
@ConfigurationProperties(prefix = "email")
@Data
public class EmailProperties {
    private String smtpServer;
    private int port;
    private String username;
    private String password;
}

// Usage via DI
@Service
public class EmailService {
    
    private final EmailProperties emailProperties;
    
    public EmailService(EmailProperties emailProperties) {
        this.emailProperties = emailProperties;
    }
}
```

#### @Value Annotation:
```java
@Service
public class JwtService {
    
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expiration}")
    private Long expiration;
    
    @Value("${spring.datasource.url}")
    private String databaseUrl;
}
```

#### Profile-Specific Configuration:
```yaml
# application-dev.yml
spring:
  datasource:
    url: jdbc:sqlserver://localhost;databaseName=StudentMgmtDb_Dev

# application-prod.yml
spring:
  datasource:
    url: jdbc:sqlserver://prod-server;databaseName=StudentMgmtDb
```

---

## Validation

### ASP.NET Core

#### FluentValidation:
```csharp
// Validator
public class CreateStudentRequestValidator 
    : AbstractValidator<CreateStudentRequest>
{
    public CreateStudentRequestValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required")
            .MaximumLength(100).WithMessage("First name too long");

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(255);

        RuleFor(x => x.DateOfBirth)
            .LessThan(DateTime.Today)
            .Must(BeAtLeast18YearsOld).WithMessage("Must be 18+");
    }

    private bool BeAtLeast18YearsOld(DateTime dob)
    {
        return DateTime.Today.Year - dob.Year >= 18;
    }
}

// Registration
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<CreateStudentRequestValidator>();

// DTO
public class CreateStudentRequest
{
    public required string FirstName { get; set; }
    public required string Email { get; set; }
    public required DateTime DateOfBirth { get; set; }
}
```

#### Data Annotations:
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

    [DataType(DataType.Date)]
    [Required]
    public required DateTime DateOfBirth { get; set; }
}

// Controller
[HttpPost]
public IActionResult Create([FromBody] CreateStudentRequest request)
{
    if (!ModelState.IsValid)
    {
        return BadRequest(ModelState);
    }
    // Process...
}
```

### Spring Boot

#### Bean Validation (JSR-380):
```java
public class CreateStudentRequest {
    
    @NotBlank(message = "First name is required")
    @Size(min = 1, max = 100, message = "First name must be 1-100 characters")
    private String firstName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 255)
    private String email;
    
    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    @ValidAge(min = 18, message = "Must be at least 18 years old")
    private LocalDate dateOfBirth;
    
    // Getters and setters
}

// Controller
@PostMapping
public ResponseEntity<StudentDto> create(
        @Valid @RequestBody CreateStudentRequest request,
        BindingResult result) {
    
    if (result.hasErrors()) {
        // Handle validation errors
        Map<String, String> errors = result.getFieldErrors()
            .stream()
            .collect(Collectors.toMap(
                FieldError::getField, 
                FieldError::getDefaultMessage));
        throw new ValidationException(errors);
    }
    // Process...
}
```

#### Custom Validator:
```java
// Custom annotation
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = AgeValidator.class)
public @interface ValidAge {
    String message() default "Invalid age";
    int min() default 0;
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

// Validator implementation
public class AgeValidator implements ConstraintValidator<ValidAge, LocalDate> {
    
    private int minAge;
    
    @Override
    public void initialize(ValidAge constraint) {
        this.minAge = constraint.min();
    }
    
    @Override
    public boolean isValid(LocalDate dateOfBirth, ConstraintValidatorContext context) {
        if (dateOfBirth == null) return true;
        
        int age = Period.between(dateOfBirth, LocalDate.now()).getYears();
        return age >= minAge;
    }
}
```

---

## Middleware vs Filters

### ASP.NET Core (Middleware)

#### Custom Middleware:
```csharp
// Middleware class
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(
        RequestDelegate next,
        ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        _logger.LogInformation(
            "Request: {Method} {Path}",
            context.Request.Method,
            context.Request.Path);

        await _next(context);

        _logger.LogInformation(
            "Response: {StatusCode}",
            context.Response.StatusCode);
    }
}

// Extension method
public static class MiddlewareExtensions
{
    public static IApplicationBuilder UseRequestLogging(
        this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<RequestLoggingMiddleware>();
    }
}

// Registration (order matters!)
app.UseRequestLogging();
app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
```

### Spring Boot (Filters & Interceptors)

#### Servlet Filter:
```java
@Component
@Order(1)
public class RequestLoggingFilter implements Filter {
    
    private static final Logger logger = 
        LoggerFactory.getLogger(RequestLoggingFilter.class);
    
    @Override
    public void doFilter(
            ServletRequest request,
            ServletResponse response,
            FilterChain chain) throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        logger.info("Request: {} {}", 
            httpRequest.getMethod(), 
            httpRequest.getRequestURI());
        
        chain.doFilter(request, response);
        
        logger.info("Response: {}", httpResponse.getStatus());
    }
}
```

#### HandlerInterceptor:
```java
@Component
public class LoggingInterceptor implements HandlerInterceptor {
    
    private static final Logger logger = 
        LoggerFactory.getLogger(LoggingInterceptor.class);
    
    @Override
    public boolean preHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler) throws Exception {
        
        logger.info("Pre-handle: {} {}", 
            request.getMethod(), 
            request.getRequestURI());
        
        return true;  // Continue to handler
    }
    
    @Override
    public void postHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler,
            ModelAndView modelAndView) throws Exception {
        
        logger.info("Post-handle: Status {}", response.getStatus());
    }
    
    @Override
    public void afterCompletion(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler,
            Exception ex) throws Exception {
        
        if (ex != null) {
            logger.error("Request failed", ex);
        }
    }
}

// Registration
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    private final LoggingInterceptor loggingInterceptor;
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(loggingInterceptor)
            .addPathPatterns("/api/**")
            .excludePathPatterns("/api/auth/**");
    }
}
```

---

## Exception Handling

### ASP.NET Core

#### Global Exception Handler:
```csharp
// Program.cs
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
            Type = "https://tools.ietf.org/html/rfc7231#section-6.6.1",
            Title = "An unexpected error occurred.",
            Status = 500,
            TraceId = traceId
        });
    });
});
```

#### Controller-Level:
```csharp
[HttpGet("{id}")]
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
    catch (ApplicationException ex)
    {
        return BadRequest(new { Message = ex.Message });
    }
}
```

### Spring Boot

#### @ControllerAdvice:
```java
@ControllerAdvice
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    private static final Logger logger = 
        LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
    @ExceptionHandler(StudentNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleStudentNotFound(
            StudentNotFoundException ex,
            HttpServletRequest request) {
        
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            ex.getMessage(),
            request.getRequestURI(),
            LocalDateTime.now()
        );
        
        logger.warn("Student not found: {}", ex.getMessage());
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex) {
        
        Map<String, String> errors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .collect(Collectors.toMap(
                FieldError::getField,
                FieldError::getDefaultMessage
            ));
        
        ValidationErrorResponse response = new ValidationErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "Validation failed",
            errors
        );
        
        return ResponseEntity.badRequest().body(response);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(
            Exception ex,
            HttpServletRequest request) {
        
        String traceId = MDC.get("traceId");
        
        logger.error("Unhandled exception. TraceId: {}", traceId, ex);
        
        ErrorResponse error = new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "An unexpected error occurred",
            request.getRequestURI(),
            LocalDateTime.now(),
            traceId
        );
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(error);
    }
}

// Error response DTO
@Data
@AllArgsConstructor
public class ErrorResponse {
    private int status;
    private String message;
    private String path;
    private LocalDateTime timestamp;
    private String traceId;
}
```

---

## Logging

### ASP.NET Core (Serilog)

#### Configuration:
```csharp
// Program.cs
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

builder.Host.UseSerilog((context, services, configuration) => configuration
    .ReadFrom.Configuration(context.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .Enrich.WithThreadId());
```

#### appsettings.json:
```json
{
  "Serilog": {
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
        "Name": "File",
        "Args": { "path": "logs/log-.txt", "rollingInterval": "Day" }
      }
    ]
  }
}
```

#### Usage:
```csharp
public class StudentService(ILogger<StudentService> logger)
{
    public async Task<StudentDto> GetByIdAsync(Guid id)
    {
        logger.LogInformation("Fetching student {StudentId}", id);
        
        try
        {
            // Logic
            logger.LogDebug("Student found: {EnrollmentNumber}", student.EnrollmentNumber);
            return student;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching student {StudentId}", id);
            throw;
        }
    }
}
```

### Spring Boot (SLF4J + Logback)

#### application.yml:
```yaml
logging:
  level:
    root: INFO
    com.example.studentmgmt: DEBUG
    org.springframework.web: DEBUG
    org.hibernate: INFO
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
  file:
    name: logs/application.log
    max-size: 10MB
    max-history: 30
```

#### logback-spring.xml:
```xml
<configuration>
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/application.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>logs/application-%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="FILE"/>
    </root>
</configuration>
```

#### Usage:
```java
@Service
public class StudentService {
    
    private static final Logger logger = 
        LoggerFactory.getLogger(StudentService.class);
    
    public StudentDto getById(UUID id) {
        logger.info("Fetching student {}", id);
        
        try {
            // Logic
            logger.debug("Student found: {}", student.getEnrollmentNumber());
            return student;
        } catch (Exception ex) {
            logger.error("Error fetching student {}", id, ex);
            throw ex;
        }
    }
}
```

#### Lombok @Slf4j:
```java
@Service
@Slf4j  // Lombok generates logger field
public class StudentService {
    
    public StudentDto getById(UUID id) {
        log.info("Fetching student {}", id);
        // Use log directly
    }
}
```

---

## Feature Comparison Matrix

| Feature | ASP.NET Core | Spring Boot |
|---------|--------------|-------------|
| **Language** | C# | Java |
| **Primary IDE** | Visual Studio, VS Code, Rider | IntelliJ IDEA, Eclipse |
| **Package Manager** | NuGet | Maven, Gradle |
| **Base Framework** | .NET (CLR) | Spring Framework (JVM) |
| **Dependency Injection** | Built-in (Microsoft.Extensions.DI) | Built-in (Spring IoC) |
| **ORM** | Entity Framework Core | JPA/Hibernate |
| **Configuration** | appsettings.json + Options Pattern | application.yml + @ConfigurationProperties |
| **Validation** | FluentValidation, DataAnnotations | Bean Validation (JSR-380) |
| **Authentication** | ASP.NET Core Identity, JWT | Spring Security |
| **API Controllers** | `[ApiController]` + Attributes | `@RestController` + Annotations |
| **Routing** | Attribute routing | Annotation-based |
| **Middleware** | Middleware pipeline | Filters & Interceptors |
| **Logging** | ILogger, Serilog | SLF4J, Logback |
| **Testing** | xUnit, NUnit, MSTest | JUnit, TestNG, Mockito |
| **API Documentation** | Swagger/Swashbuckle | SpringDoc OpenAPI |
| **Async Programming** | async/await (native) | CompletableFuture, @Async |
| **Null Safety** | Nullable Reference Types (C# 8+) | Optional<T>, @Nullable annotations |
| **Primary Constructor** | Yes (C# 12) | No (use Lombok @RequiredArgsConstructor) |
| **Record Types** | Yes (C# 9+) | Yes (Java 14+) |
| **Pattern Matching** | Advanced (C# 7+) | Basic (Java 14+) |
| **LINQ** | Yes (native) | Streams API |
| **Extension Methods** | Yes | No (utility classes) |
| **Properties** | Yes (getters/setters syntax) | No (use Lombok @Data) |
| **Deployment** | IIS, Kestrel, Docker | Tomcat (embedded), Docker |
| **Hot Reload** | Yes (.NET 6+) | Yes (Spring DevTools) |
| **Cloud Native** | Good (Azure-optimized) | Excellent (Spring Cloud) |

---

## Key Philosophical Differences

### ASP.NET Core
- **Modern C# features**: Primary constructors, required members, init-only setters
- **Explicit configuration**: More manual setup in Program.cs
- **Strong typing**: Compile-time safety with nullable reference types
- **Async-first**: async/await throughout
- **Minimal ceremony**: Top-level statements, implicit usings

### Spring Boot
- **Convention over configuration**: Auto-configuration magic
- **Annotation-driven**: Heavy use of annotations for behavior
- **Mature ecosystem**: Extensive Spring ecosystem integration
- **Enterprise focus**: Production-ready features out of the box
- **Dependency on Lombok**: Common use of Lombok to reduce boilerplate

---

## When to Choose Which?

### Choose ASP.NET Core if:
✅ Team expertise in C# and .NET  
✅ Microsoft Azure infrastructure  
✅ Modern language features priority  
✅ Windows-first development  
✅ Visual Studio tooling preference  
✅ Entity Framework Core preference

### Choose Spring Boot if:
✅ Team expertise in Java  
✅ JVM ecosystem preference  
✅ Mature enterprise patterns needed  
✅ Cloud-agnostic deployment  
✅ Extensive Spring ecosystem needed  
✅ Larger talent pool for hiring

---

## Conclusion

Both ASP.NET Core and Spring Boot are **excellent frameworks** for building modern web APIs with:
- ✅ Clean architecture support
- ✅ Built-in dependency injection
- ✅ Comprehensive security features
- ✅ Strong ORM capabilities
- ✅ Excellent performance
- ✅ Cloud-ready deployment
- ✅ Rich ecosystems

The choice often comes down to **team expertise, existing infrastructure, and organizational preferences** rather than technical superiority of one over the other.

This Student Management System demonstrates that both frameworks can implement the same **Clean Architecture principles** and **best practices**, just with different syntax and conventions.

---

*For detailed implementation examples, refer to the actual codebase files in each respective framework.*
