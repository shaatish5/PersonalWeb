using System.ComponentModel.DataAnnotations;

namespace ResumeAPI.Models;

public class Skill
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(80)]
    public string Category { get; set; } = string.Empty;

   /* [MaxLength(40)]
    public string Proficiency { get; set; } = string.Empty;
   */
    public int DisplayOrder { get; set; }
}