using Microsoft.EntityFrameworkCore;
using StudentMgmt.Domain.Entities;
using BCrypt.Net;

namespace StudentMgmt.Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task SeedAsync(StudentDbContext context)
    {
        // Check if Users table is empty - if so, create initial admin
        if (!await context.Users.AnyAsync())
        {
            var adminUser = new User
            {
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("AdminPassword123!"),
                Role = "Admin"
            };

            await context.Users.AddAsync(adminUser);
            await context.SaveChangesAsync();
        }

        // Check if Students table has data - if not, seed sample data
        if (await context.Students.AnyAsync())
        {
            return;
        }

        var course1 = new Course(
            courseCode: "CS101",
            title: "Introduction to C#",
            credits: 3)
        {
            CourseCode = "CS101",
            Title = "Introduction to C#",
            Credits = 3,
            Description = "Learn the fundamentals of C# programming language, including syntax, data types, and object-oriented concepts.",
            CreatedBy = "System"
        };

        var course2 = new Course(
            courseCode: "DB201",
            title: "Database Design",
            credits: 4)
        {
            CourseCode = "DB201",
            Title = "Database Design",
            Credits = 4,
            Description = "Comprehensive course covering relational database design, normalization, and SQL.",
            CreatedBy = "System"
        };

        var course3 = new Course(
            courseCode: "API301",
            title: "Web API Architecture",
            credits: 3)
        {
            CourseCode = "API301",
            Title = "Web API Architecture",
            Credits = 3,
            Description = "Master RESTful API design, implementation using ASP.NET Core, and best practices.",
            CreatedBy = "System"
        };

        await context.Courses.AddRangeAsync(course1, course2, course3);

        var teacher1 = new Teacher(
            firstName: "Sarah",
            lastName: "Johnson",
            email: "sarah.johnson@university.edu",
            employeeId: "EMP001",
            department: "Computer Science")
        {
            FirstName = "Sarah",
            LastName = "Johnson",
            Email = "sarah.johnson@university.edu",
            EmployeeId = "EMP001",
            Department = "Computer Science",
            CreatedBy = "System"
        };

        var teacher2 = new Teacher(
            firstName: "Michael",
            lastName: "Chen",
            email: "michael.chen@university.edu",
            employeeId: "EMP002",
            department: "Information Technology")
        {
            FirstName = "Michael",
            LastName = "Chen",
            Email = "michael.chen@university.edu",
            EmployeeId = "EMP002",
            Department = "Information Technology",
            CreatedBy = "System"
        };

        await context.Teachers.AddRangeAsync(teacher1, teacher2);

        // Student with fixed ID matching the mock authentication (student/student)
        var studentTest = new Student(
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@student.edu",
            dateOfBirth: new DateTime(2002, 1, 1),
            enrollmentNumber: "STU2024000")
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john.doe@student.edu",
            DateOfBirth = new DateTime(2002, 1, 1),
            EnrollmentNumber = "STU2024000",
            CreatedBy = "System"
        };

        var student1 = new Student(
            firstName: "Emily",
            lastName: "Davis",
            email: "emily.davis@student.edu",
            dateOfBirth: new DateTime(2002, 3, 15),
            enrollmentNumber: "STU2024001")
        {
            FirstName = "Emily",
            LastName = "Davis",
            Email = "emily.davis@student.edu",
            DateOfBirth = new DateTime(2002, 3, 15),
            EnrollmentNumber = "STU2024001",
            CreatedBy = "System"
        };

        var student2 = new Student(
            firstName: "James",
            lastName: "Wilson",
            email: "james.wilson@student.edu",
            dateOfBirth: new DateTime(2001, 7, 22),
            enrollmentNumber: "STU2024002")
        {
            FirstName = "James",
            LastName = "Wilson",
            Email = "james.wilson@student.edu",
            DateOfBirth = new DateTime(2001, 7, 22),
            EnrollmentNumber = "STU2024002",
            CreatedBy = "System"
        };

        var student3 = new Student(
            firstName: "Sophia",
            lastName: "Martinez",
            email: "sophia.martinez@student.edu",
            dateOfBirth: new DateTime(2003, 11, 8),
            enrollmentNumber: "STU2024003")
        {
            FirstName = "Sophia",
            LastName = "Martinez",
            Email = "sophia.martinez@student.edu",
            DateOfBirth = new DateTime(2003, 11, 8),
            EnrollmentNumber = "STU2024003",
            CreatedBy = "System"
        };

        var student4 = new Student(
            firstName: "Liam",
            lastName: "Anderson",
            email: "liam.anderson@student.edu",
            dateOfBirth: new DateTime(2002, 5, 30),
            enrollmentNumber: "STU2024004")
        {
            FirstName = "Liam",
            LastName = "Anderson",
            Email = "liam.anderson@student.edu",
            DateOfBirth = new DateTime(2002, 5, 30),
            EnrollmentNumber = "STU2024004",
            CreatedBy = "System"
        };

        var student5 = new Student(
            firstName: "Olivia",
            lastName: "Taylor",
            email: "olivia.taylor@student.edu",
            dateOfBirth: new DateTime(2001, 9, 12),
            enrollmentNumber: "STU2024005")
        {
            FirstName = "Olivia",
            LastName = "Taylor",
            Email = "olivia.taylor@student.edu",
            DateOfBirth = new DateTime(2001, 9, 12),
            EnrollmentNumber = "STU2024005",
            CreatedBy = "System"
        };

        await context.Students.AddRangeAsync(studentTest, student1, student2, student3, student4, student5);
        await context.SaveChangesAsync(); // Save to generate IDs

        // Get the actual student ID
        var testStudentId = studentTest.Id;

        // Update the auth controller's student ID in a comment for reference
        // The test student ID is: {testStudentId}

        // Enrollments for test student
        var enrollmentTest1 = new Enrollment(
            studentId: testStudentId,
            courseId: course1.Id)
        {
            StudentId = testStudentId,
            CourseId = course1.Id,
            Status = EnrollmentStatus.Active,
            CreatedBy = "System"
        };

        var enrollmentTest2 = new Enrollment(
            studentId: testStudentId,
            courseId: course2.Id)
        {
            StudentId = testStudentId,
            CourseId = course2.Id,
            Status = EnrollmentStatus.Active,
            CreatedBy = "System"
        };

        var enrollmentTest3 = new Enrollment(
            studentId: testStudentId,
            courseId: course3.Id)
        {
            StudentId = testStudentId,
            CourseId = course3.Id,
            Status = EnrollmentStatus.Active,
            CreatedBy = "System"
        };

        var enrollment1 = new Enrollment(
            studentId: student1.Id,
            courseId: course1.Id)
        {
            StudentId = student1.Id,
            CourseId = course1.Id,
            Status = EnrollmentStatus.Active,
            CreatedBy = "System"
        };

        var enrollment2 = new Enrollment(
            studentId: student2.Id,
            courseId: course1.Id)
        {
            StudentId = student2.Id,
            CourseId = course1.Id,
            Status = EnrollmentStatus.Active,
            CreatedBy = "System"
        };

        await context.Enrollments.AddRangeAsync(enrollmentTest1, enrollmentTest2, enrollmentTest3, enrollment1, enrollment2);

        await context.SaveChangesAsync();

        // Seed additional User accounts with hashed passwords (admin already created at start)
        var staffUser = new User
        {
            Username = "staff",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("staff"),
            Role = "Staff"
        };

        var johnDoeUser = new User
        {
            Username = "john.doe",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
            Role = "Student",
            StudentId = studentTest.Id
        };

        var emilyUser = new User
        {
            Username = "emily.davis",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
            Role = "Student",
            StudentId = student1.Id
        };

        var jamesUser = new User
        {
            Username = "james.wilson",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
            Role = "Student",
            StudentId = student2.Id
        };

        var sophiaUser = new User
        {
            Username = "sophia.martinez",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
            Role = "Student",
            StudentId = student3.Id
        };

        var liamUser = new User
        {
            Username = "liam.anderson",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
            Role = "Student",
            StudentId = student4.Id
        };

        var oliviaUser = new User
        {
            Username = "olivia.taylor",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
            Role = "Student",
            StudentId = student5.Id
        };

        await context.Users.AddRangeAsync(
            staffUser, 
            johnDoeUser, 
            emilyUser, 
            jamesUser, 
            sophiaUser, 
            liamUser, 
            oliviaUser);

        await context.SaveChangesAsync();
    }
}
