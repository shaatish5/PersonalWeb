using System.ComponentModel.DataAnnotations;

namespace ResumeAPI.Models;

public class AboutMe
{
    public int Id { get; set; }

    [Required, MaxLength(120)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(160)]
    public string Headline { get; set; } = string.Empty;

    [Required, MaxLength(2000)]
    public string Summary { get; set; } = string.Empty;

    [MaxLength(120)]
    public string Location { get; set; } = string.Empty;

    [MaxLength(160)]
    public string Email { get; set; } = string.Empty;
}