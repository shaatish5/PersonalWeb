using System.ComponentModel.DataAnnotations;

namespace ResumeAPI.Models;

public class Education
{
    public int Id { get; set; }

    [Required, MaxLength(160)]
    public string Institution { get; set; } = string.Empty;

    [Required, MaxLength(160)]
    public string Degree { get; set; } = string.Empty;

    [MaxLength(120)]
    public string FieldOfStudy { get; set; } = string.Empty;

    public int StartYear { get; set; }

    public int? EndYear { get; set; }

    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;
}