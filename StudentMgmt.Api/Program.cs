using System.Diagnostics;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using StudentMgmt.Application.Interfaces;
using StudentMgmt.Application.Services;
using StudentMgmt.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// Configure logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Register StudentDbContext with SQL Server
builder.Services.AddDbContext<StudentDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions => sqlOptions.MigrationsAssembly("StudentMgmt.Infrastructure")));

// Register DbContext abstraction for Application layer
builder.Services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<StudentDbContext>());

// Register Application Services (Scoped lifetime)
builder.Services.AddScoped<IStudentService, StudentService>();

var app = builder.Build();

// Global Exception Handling Middleware
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";

        var exceptionHandlerFeature = context.Features.Get<IExceptionHandlerFeature>();
        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
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
    app.MapOpenApi();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "Student Management API v1");
        options.RoutePrefix = string.Empty;
    });
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
