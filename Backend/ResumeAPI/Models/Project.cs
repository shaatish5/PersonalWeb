using System.ComponentModel.DataAnnotations;

namespace ResumeAPI.Models;

public class Project
{
    public int Id { get; set; }

    [Required, MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(1500)]
    public string Summary { get; set; } = string.Empty;

    [MaxLength(300)]
    public string TechStack { get; set; } = string.Empty;

    [MaxLength(300)]
    public string? RepoUrl { get; set; }

    [MaxLength(300)]
    public string? LiveUrl { get; set; }

    public int DisplayOrder { get; set; }
}