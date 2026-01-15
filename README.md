# Student Management System

A comprehensive web-based student management system built with modern technologies to handle academic administration, course management, enrollment tracking, grade management, and analytics.

## Features

### Core Functionality
- **User Management**: Role-based authentication and authorization (Admin, Teacher, Student)
- **Course Management**: Create, update, and manage courses with credits, descriptions, and instructor assignments
- **Student Enrollment**: Students can enroll in courses, view their enrollments, and track progress
- **Grade Management**: Teachers can assign grades and manage enrollment statuses
- **Department Management**: Organize courses and faculty by departments

### Advanced Features (Phase 7 - Complete)
- **Enrollment Status Management**: Track enrollment lifecycle (Active, Completed, Failed)
- **Batch Operations**: Bulk update enrollment statuses for multiple students
- **Grade Locking**: Prevent grade changes for completed enrollments
- **Validation Rules**: Business logic for status transitions and grade requirements
- **Enhanced UI**: Modern React interface with selection controls and modals
- **Teacher-Course Relations**: Proper instructor assignments with foreign key relationships
- **Student Transcripts**: Complete academic record viewing with GPA calculations
- **Analytics Dashboard**: Grade distribution, performance metrics, and academic insights
- **Course Details**: Individual course pages with enrollment information and instructor details

### Dashboard & Analytics
- **Admin Dashboard**: System overview with user statistics and course metrics
- **Teacher Dashboard**: Course management and grade analytics
- **Student Dashboard**: Personal enrollment tracking with instructor names and course details
- **Grade Distribution**: Visual representation of grade statistics
- **Academic Analytics**: Performance trends, GPA tracking, and completion rates

## Tech Stack

### Backend
- **Framework**: ASP.NET Core 10.0
- **Language**: C# 12/14 (with primary constructors)
- **ORM**: Entity Framework Core 10
- **Database**: SQL Server (Express/Developer Edition)
- **Authentication**: JWT Bearer Tokens with BCrypt password hashing
- **Architecture**: Clean Architecture (Domain, Application, Infrastructure, API layers)
- **Logging**: Serilog with structured logging
- **Validation**: FluentValidation with auto-validation

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 7.3.1
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Routing**: React Router
- **HTTP Client**: Axios with interceptors

### Development Tools
- **Version Control**: Git
- **Package Management**: NuGet (Backend), npm (Frontend)
- **Database Migrations**: EF Core Migrations
- **API Documentation**: Swagger/OpenAPI (available in development)

## Prerequisites

Before running this application, make sure you have the following installed:

- **.NET 10 SDK** (or later)
- **Node.js** (v18 or later)
- **SQL Server** (Express or Developer Edition)
- **Git** (for version control)

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/akib024/StudentManagementSystem.git
cd StudentManagementSystem
```

### 2. Backend Setup
```bash
# Navigate to the API project
cd StudentMgmt.Api

# Restore NuGet packages
dotnet restore

# Update database (run migrations)
dotnet ef database update --startup-project . --project ../StudentMgmt.Infrastructure
```

### 3. Frontend Setup
```bash
# Navigate to the UI project
cd ../StudentMgmt.UI

# Install npm dependencies
npm install

# Build the frontend (optional, for production)
npm run build
```

## Running the Application

### Development Mode
```bash
# Start the backend API (from StudentMgmt.Api directory)
dotnet run

# In another terminal, start the frontend (from StudentMgmt.UI directory)
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5174 (Vite dev server)
- **Backend API**: http://localhost:5154/api (HTTP for development)

### Production Build
```bash
# Build and run backend
cd StudentMgmt.Api
dotnet publish -c Release
dotnet StudentMgmt.Api.dll

# Build frontend for production
cd ../StudentMgmt.UI
npm run build
# Serve the dist folder with a web server
```

## Test Accounts

Use these accounts to explore the application:

### Student Account
- **Username**: john.doe
- **Password**: password123
- **Role**: Student (has StudentId for full functionality)

### Admin Account
- **Username**: admin
- **Password**: password123
- **Role**: Administrator

### Teacher Accounts
- **Username**: emily.davis
- **Password**: password123
- **Role**: Teacher

- **Username**: james.wilson
- **Password**: password123
- **Role**: Teacher

### Staff Account
- **Username**: staff
- **Password**: password123
- **Role**: Staff

## Database Setup

The application uses SQL Server with Entity Framework Core migrations.

### Initial Setup
1. Ensure SQL Server is running (default instance: `.\SQLEXPRESS`)
2. Update the connection string in `appsettings.json` (StudentMgmt.Api) if needed
3. Run migrations: `dotnet ef database update --startup-project StudentMgmt.Api --project StudentMgmt.Infrastructure`

### Database Schema
- **Users**: Authentication and role management
- **Students**: Student profiles with academic information
- **Teachers**: Teacher profiles with department assignments
- **Courses**: Course information with teacher relationships
- **Enrollments**: Student-course relationships with grades and status
- **Departments**: Organizational structure for courses and faculty

### Recent Migrations
- Initial database creation with all entities
- Added Teacher entity and Course-Teacher relationships
- Enhanced enrollment tracking and analytics support
- Added department management and user profile enhancements

## API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login (returns JWT token)
- `POST /api/auth/register` - User registration

### User Management
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/{id}` - Get user by ID
- `PUT /api/users/{id}` - Update user

### Course Management
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course (Admin/Teacher)
- `PUT /api/courses/{id}` - Update course
- `DELETE /api/courses/{id}` - Delete course
- `GET /api/courses/{id}` - Get course details

### Enrollment Management
- `GET /api/enrollments/course/{courseId}` - Get course enrollments
- `POST /api/enrollments` - Enroll student in course
- `PUT /api/enrollments/{id}/grade` - Update grade
- `PUT /api/enrollments/{id}/status` - Update status
- `PUT /api/enrollments/batch/status` - Batch update statuses
- `GET /api/enrollments/my-transcript` - Get student's transcript (Student role)
- `GET /api/reports/analytics/my-analytics` - Get student's analytics (Student role)

### Department Management
- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create department

## Project Structure

```
StudentManagementSystem/
├── StudentMgmt.Api/           # ASP.NET Core Web API
│   ├── Controllers/           # API Controllers (Auth, Users, Courses, etc.)
│   ├── Program.cs            # Application entry point with DI setup
│   ├── appsettings.json      # Configuration (connection strings, JWT)
│   └── Properties/launchSettings.json
├── StudentMgmt.Application/   # Application layer (Services, DTOs)
│   ├── Services/             # Business logic (Auth, Enrollment, etc.)
│   ├── DTOs/                 # Data transfer objects (EnrollmentResponseDto, etc.)
│   └── Interfaces/           # Service contracts
├── StudentMgmt.Domain/        # Domain layer (Entities, Business rules)
│   ├── Entities/             # Domain models (User, Course, Enrollment, etc.)
│   └── Enums/                # Domain enumerations
├── StudentMgmt.Infrastructure/# Infrastructure layer (EF, Migrations)
│   ├── Persistence/          # Database context and configurations
│   └── Migrations/           # EF Core migrations (auto-generated)
└── StudentMgmt.UI/            # React frontend
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── pages/           # Page components (Dashboard, Courses, etc.)
    │   ├── services/        # API service clients (auth, enrollment, etc.)
    │   ├── hooks/           # Custom React hooks
    │   └── utils/           # Utilities and constants
    ├── public/               # Static assets
    └── package.json          # Dependencies and scripts
```

## Documentation

This project includes comprehensive documentation:

- **[END_USER_GUIDE.md](END_USER_GUIDE.md)** - Complete user guide for all roles
- **[BACKEND_TECHNICAL_DOCUMENTATION.md](BACKEND_TECHNICAL_DOCUMENTATION.md)** - ASP.NET Core technical documentation
- **[FEATURE_STATUS_AND_ROADMAP.md](FEATURE_STATUS_AND_ROADMAP.md)** - Implementation status and future roadmap
- **[ASPNET_VS_SPRING_BOOT_COMPARISON.md](ASPNET_VS_SPRING_BOOT_COMPARISON.md)** - Framework comparison

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow Clean Architecture principles
- Write unit tests for new features
- Update documentation for API changes
- Use meaningful commit messages
- Run migrations after entity changes: `dotnet ef migrations add MigrationName`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email akib024@example.com or create an issue in the GitHub repository.

---

**Note**: This system is designed for educational institutions to manage student data, courses, and academic records efficiently. Always ensure compliance with data protection regulations when deploying in production environments.

- **.NET 10 SDK** (or later)
- **Node.js** (v18 or later)
- **SQL Server** (Express or Developer Edition)
- **Git** (for version control)

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/akib024/StudentManagementSystem.git
cd StudentManagementSystem
```

### 2. Backend Setup
```bash
# Navigate to the API project
cd StudentMgmt.Api

# Restore NuGet packages
dotnet restore

# Update database (run migrations)
dotnet ef database update --startup-project . --context StudentDbContext
```

### 3. Frontend Setup
```bash
# Navigate to the UI project
cd ../StudentMgmt.UI

# Install npm dependencies
npm install

# Build the frontend (optional, for production)
npm run build
```

## Running the Application

### Development Mode
```bash
# Start the backend API (from StudentMgmt.Api directory)
dotnet run

# In another terminal, start the frontend (from StudentMgmt.UI directory)
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend API**: http://localhost:5000 (or configured port)

### Production Build
```bash
# Build and run backend
cd StudentMgmt.Api
dotnet publish -c Release
dotnet StudentMgmt.Api.dll

# Build frontend for production
cd ../StudentMgmt.UI
npm run build
# Serve the dist folder with a web server
```

## Database Setup

The application uses SQL Server with Entity Framework Core migrations.

### Initial Setup
1. Ensure SQL Server is running
2. Update the connection string in `appsettings.json` (StudentMgmt.Api)
3. Run migrations: `dotnet ef database update`

### Database Schema
- **Users**: Authentication and role management
- **Students**: Student profiles
- **Teachers**: Teacher profiles
- **Courses**: Course information
- **Enrollments**: Student-course relationships with grades and status
- **Departments**: Organizational structure

## API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### User Management
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/{id}` - Get user by ID
- `PUT /api/users/{id}` - Update user

### Course Management
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course (Admin/Teacher)
- `PUT /api/courses/{id}` - Update course
- `DELETE /api/courses/{id}` - Delete course

### Enrollment Management
- `GET /api/enrollments/course/{courseId}` - Get course enrollments
- `POST /api/enrollments` - Enroll student in course
- `PUT /api/enrollments/{id}/grade` - Update grade
- `PUT /api/enrollments/{id}/status` - Update status
- `PUT /api/enrollments/batch/status` - Batch update statuses

### Department Management
- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create department

## Project Structure

```
StudentManagementSystem/
├── StudentMgmt.Api/           # ASP.NET Core Web API
│   ├── Controllers/           # API Controllers
│   ├── Program.cs            # Application entry point
│   └── appsettings.json      # Configuration
├── StudentMgmt.Application/   # Application layer (Services, DTOs)
│   ├── Services/             # Business logic
│   ├── DTOs/                 # Data transfer objects
│   └── Interfaces/           # Service contracts
├── StudentMgmt.Domain/        # Domain layer (Entities, Business rules)
│   └── Entities/             # Domain models
├── StudentMgmt.Infrastructure/# Infrastructure layer (EF, Migrations)
│   ├── Persistence/          # Database context and configurations
│   └── Migrations/           # EF Core migrations
└── StudentMgmt.UI/            # React frontend
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── pages/           # Page components
    │   ├── services/        # API service clients
    │   └── utils/           # Utilities and constants
    └── public/               # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow Clean Architecture principles
- Write unit tests for new features
- Update documentation for API changes
- Use meaningful commit messages

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email akib024@example.com or create an issue in the GitHub repository.

---

**Note**: This system is designed for educational institutions to manage student data, courses, and academic records efficiently. Always ensure compliance with data protection regulations when deploying in production environments.</content>
<parameter name="filePath">f:\BJIT Academy\Akib Imtiaz\Student project\README.md