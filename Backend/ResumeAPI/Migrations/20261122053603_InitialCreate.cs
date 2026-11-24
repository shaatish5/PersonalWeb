using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResumeAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AboutMeEntries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    FullName = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    Headline = table.Column<string>(type: "TEXT", maxLength: 160, nullable: false),
                    Summary = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: false),
                    Location = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 160, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AboutMeEntries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EducationItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Institution = table.Column<string>(type: "TEXT", maxLength: 160, nullable: false),
                    Degree = table.Column<string>(type: "TEXT", maxLength: 160, nullable: false),
                    FieldOfStudy = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    StartYear = table.Column<int>(type: "INTEGER", nullable: false),
                    EndYear = table.Column<int>(type: "INTEGER", nullable: true),
                    Description = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EducationItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Projects",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Title = table.Column<string>(type: "TEXT", maxLength: 150, nullable: false),
                    Summary = table.Column<string>(type: "TEXT", maxLength: 1500, nullable: false),
                    TechStack = table.Column<string>(type: "TEXT", maxLength: 300, nullable: false),
                    RepoUrl = table.Column<string>(type: "TEXT", maxLength: 300, nullable: true),
                    LiveUrl = table.Column<string>(type: "TEXT", maxLength: 300, nullable: true),
                    DisplayOrder = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Projects", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Skills",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Category = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    DisplayOrder = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Skills", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AboutMeEntries");

            migrationBuilder.DropTable(
                name: "EducationItems");

            migrationBuilder.DropTable(
                name: "Projects");

            migrationBuilder.DropTable(
                name: "Skills");
        }
    }
}
