using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResumeAPI.Data;
using ResumeAPI.Models;

namespace ResumeAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EducationController : ControllerBase
{
    private readonly ResumeDbContext _context;

    public EducationController(ResumeDbContext context)
    {
        _context = context;
    }

    // GET: api/education
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Education>>> GetEducation()
    {
        var education = await _context.EducationItems
            .OrderByDescending(e => e.EndYear ?? int.MaxValue)
            .ThenByDescending(e => e.StartYear)
            .ToListAsync();

        return Ok(education);
    }

    // GET: api/education/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Education>> GetEducationItem(int id)
    {
        var item = await _context.EducationItems.FindAsync(id);
        if (item is null)
        {
            return NotFound(new { message = $"Education entry with ID {id} was not found." });
        }

        return Ok(item);
    }

    // POST: api/education
    [Authorize]
    [HttpPost]
    public async Task<ActionResult<Education>> CreateEducation([FromBody] Education item)
    {
        item.Id = 0;
        _context.EducationItems.Add(item);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetEducationItem), new { id = item.Id }, item);
    }

    // PUT: api/education/{id}
    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateEducation(int id, [FromBody] Education updated)
    {
        var item = await _context.EducationItems.FindAsync(id);
        if (item is null)
        {
            return NotFound(new { message = $"Education entry with ID {id} was not found." });
        }

        item.Institution = updated.Institution;
        item.Degree = updated.Degree;
        item.FieldOfStudy = updated.FieldOfStudy;
        item.StartYear = updated.StartYear;
        item.EndYear = updated.EndYear;
        item.Description = updated.Description;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/education/{id}
    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteEducation(int id)
    {
        var item = await _context.EducationItems.FindAsync(id);
        if (item is null)
        {
            return NotFound(new { message = $"Education entry with ID {id} was not found." });
        }

        _context.EducationItems.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}