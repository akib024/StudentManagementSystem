using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentMgmt.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDepartmentTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "DepartmentId",
                table: "Teachers",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Departments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Departments", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Teachers_DepartmentId",
                table: "Teachers",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_Name",
                table: "Departments",
                column: "Name",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Teachers_Departments_DepartmentId",
                table: "Teachers",
                column: "DepartmentId",
                principalTable: "Departments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            // Seed initial departments
            migrationBuilder.InsertData(
                table: "Departments",
                columns: new[] { "Id", "Name", "Description", "CreatedAt", "CreatedBy", "IsDeleted", "LastModifiedAt", "LastModifiedBy", "DeletedAt" },
                values: new object[,]
                {
                    { Guid.Parse("00000000-0000-0000-0000-000000000001"), "Computer Science", "Department of Computer Science", DateTime.UtcNow, "System", false, null, null, null },
                    { Guid.Parse("00000000-0000-0000-0000-000000000002"), "Mathematics", "Department of Mathematics", DateTime.UtcNow, "System", false, null, null, null },
                    { Guid.Parse("00000000-0000-0000-0000-000000000003"), "Physics", "Department of Physics", DateTime.UtcNow, "System", false, null, null, null },
                    { Guid.Parse("00000000-0000-0000-0000-000000000004"), "Chemistry", "Department of Chemistry", DateTime.UtcNow, "System", false, null, null, null },
                    { Guid.Parse("00000000-0000-0000-0000-000000000005"), "Biology", "Department of Biology", DateTime.UtcNow, "System", false, null, null, null },
                    { Guid.Parse("00000000-0000-0000-0000-000000000006"), "Engineering", "Department of Engineering", DateTime.UtcNow, "System", false, null, null, null },
                    { Guid.Parse("00000000-0000-0000-0000-000000000007"), "Business", "Department of Business", DateTime.UtcNow, "System", false, null, null, null },
                    { Guid.Parse("00000000-0000-0000-0000-000000000008"), "Arts", "Department of Arts", DateTime.UtcNow, "System", false, null, null, null },
                    { Guid.Parse("00000000-0000-0000-0000-000000000009"), "Languages", "Department of Languages", DateTime.UtcNow, "System", false, null, null, null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Teachers_Departments_DepartmentId",
                table: "Teachers");

            migrationBuilder.DropTable(
                name: "Departments");

            migrationBuilder.DropIndex(
                name: "IX_Teachers_DepartmentId",
                table: "Teachers");

            migrationBuilder.DropColumn(
                name: "DepartmentId",
                table: "Teachers");
        }
    }
}
