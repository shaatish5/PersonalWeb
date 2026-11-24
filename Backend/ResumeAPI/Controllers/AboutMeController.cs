using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResumeAPI.Data;
using ResumeAPI.Models;

namespace ResumeAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AboutMeController : ControllerBase
{
    private readonly ResumeDbContext _context;

    public AboutMeController(ResumeDbContext context)
    {
        _context = context;
    }

    // GET: api/aboutme
    [HttpGet]
    public async Task<ActionResult<AboutMe>> GetAboutMe()
    {
        var profile = await _context.AboutMeEntries
            .OrderBy(a => a.Id)
            .FirstOrDefaultAsync();

        if (profile is null)
        {
            return NotFound(new { message = "About Me profile has not been set yet." });
        }

        return Ok(profile);
    }

    // POST: api/aboutme
    [Authorize]
    [HttpPost]
    public async Task<ActionResult<AboutMe>> CreateAboutMe([FromBody] AboutMe model)
    {
        var existing = await _context.AboutMeEntries.FirstOrDefaultAsync();
        if (existing is not null)
        {
            return Conflict(new
            {
                message = "An About Me profile already exists. Use PUT /api/aboutme/{id} to update it.",
                existingId = existing.Id
            });
        }

        model.Id = 0; // Let SQLite assign the primary key
        _context.AboutMeEntries.Add(model);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAboutMe), new { id = model.Id }, model);
    }

    // PUT: api/aboutme/{id}
    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateAboutMe(int id, [FromBody] AboutMe updated)
    {
        var existing = await _context.AboutMeEntries.FindAsync(id);
        if (existing is null)
        {
            return NotFound(new { message = $"About Me entry with ID {id} was not found." });
        }

        existing.FullName = updated.FullName;
        existing.Headline = updated.Headline;
        existing.Summary = updated.Summary;
        existing.Location = updated.Location;
        existing.Email = updated.Email;

        await _context.SaveChangesAsync();
        return NoContent();
    }
}