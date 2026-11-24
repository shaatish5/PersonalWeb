using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ResumeAPI.Models;

namespace ResumeAPI.Data;

public class ResumeDbContext : IdentityDbContext<IdentityUser>
{
    public ResumeDbContext(DbContextOptions<ResumeDbContext> options)
        : base(options)
    {
    }

    public DbSet<AboutMe> AboutMeEntries => Set<AboutMe>();
    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<Education> EducationItems => Set<Education>();
    public DbSet<Project> Projects => Set<Project>();
}