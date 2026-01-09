# Student Management System

A comprehensive web-based student management system built with modern technologies to handle academic administration, course management, enrollment tracking, and grade management.

## Features

### Core Functionality
- **User Management**: Role-based authentication and authorization (Admin, Teacher, Student)
- **Course Management**: Create, update, and manage courses with credits and descriptions
- **Student Enrollment**: Students can enroll in courses, view their enrollments
- **Grade Management**: Teachers can assign grades and manage enrollment statuses
- **Department Management**: Organize courses and faculty by departments

### Advanced Features (Phase 6)
- **Enrollment Status Management**: Track enrollment lifecycle (Active, Completed, Failed)
- **Batch Operations**: Bulk update enrollment statuses for multiple students
- **Grade Locking**: Prevent grade changes for completed enrollments
- **Validation Rules**: Business logic for status transitions and grade requirements
- **Enhanced UI**: Modern React interface with selection controls and modals

### Dashboard & Analytics
- **Admin Dashboard**: System overview with user statistics and course metrics
- **Teacher Dashboard**: Course management and grade analytics
- **Student Dashboard**: Personal enrollment and grade tracking
- **Grade Distribution**: Visual representation of grade statistics

## Tech Stack

### Backend
- **Framework**: ASP.NET Core 10
- **ORM**: Entity Framework Core
- **Database**: SQL Server
- **Authentication**: JWT Bearer Tokens
- **Architecture**: Clean Architecture (Domain, Application, Infrastructure, API layers)

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 7.3.1
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Routing**: React Router

### Development Tools
- **Version Control**: Git
- **Package Management**: NuGet (Backend), npm (Frontend)
- **Database Migrations**: EF Core Migrations

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