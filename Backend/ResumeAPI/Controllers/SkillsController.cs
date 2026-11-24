using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResumeAPI.Data;
using ResumeAPI.Models;

namespace ResumeAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SkillsController : ControllerBase
{
    private readonly ResumeDbContext _context;

    public SkillsController(ResumeDbContext context)
    {
        _context = context;
    }

    // GET: api/skills
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Skill>>> GetSkills()
    {
        var skills = await _context.Skills
            .OrderBy(s => s.DisplayOrder)
            .ThenBy(s => s.Id)
            .ToListAsync();

        return Ok(skills);
    }

    // GET: api/skills/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Skill>> GetSkill(int id)
    {
        var skill = await _context.Skills.FindAsync(id);
        if (skill is null)
        {
            return NotFound(new { message = $"Skill with ID {id} was not found." });
        }

        return Ok(skill);
    }

    // POST: api/skills
    [Authorize]
    [HttpPost]
    public async Task<ActionResult<Skill>> CreateSkill([FromBody] Skill skill)
    {
        skill.Id = 0;
        _context.Skills.Add(skill);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSkill), new { id = skill.Id }, skill);
    }

    // PUT: api/skills/{id}
    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateSkill(int id, [FromBody] Skill updated)
    {
        var skill = await _context.Skills.FindAsync(id);
        if (skill is null)
        {
            return NotFound(new { message = $"Skill with ID {id} was not found." });
        }

        skill.Name = updated.Name;
        skill.Category = updated.Category;
        skill.DisplayOrder = updated.DisplayOrder;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/skills/{id}
    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteSkill(int id)
    {
        var skill = await _context.Skills.FindAsync(id);
        if (skill is null)
        {
            return NotFound(new { message = $"Skill with ID {id} was not found." });
        }

        _context.Skills.Remove(skill);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}