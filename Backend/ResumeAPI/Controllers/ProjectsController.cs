using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResumeAPI.Data;
using ResumeAPI.Models;

namespace ResumeAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly ResumeDbContext _context;

    public ProjectsController(ResumeDbContext context)
    {
        _context = context;
    }

    // GET: api/projects
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Project>>> GetProjects()
    {
        var projects = await _context.Projects
            .OrderBy(p => p.DisplayOrder)
            .ThenByDescending(p => p.Id)
            .ToListAsync();

        return Ok(projects);
    }

    // GET: api/projects/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Project>> GetProject(int id)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project is null)
        {
            return NotFound(new { message = $"Project with ID {id} was not found." });
        }

        return Ok(project);
    }

    // POST: api/projects
    [Authorize]
    [HttpPost]
    public async Task<ActionResult<Project>> CreateProject([FromBody] Project project)
    {
        project.Id = 0;
        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProject), new { id = project.Id }, project);
    }

    // PUT: api/projects/{id}
    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateProject(int id, [FromBody] Project updated)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project is null)
        {
            return NotFound(new { message = $"Project with ID {id} was not found." });
        }

        project.Title = updated.Title;
        project.Summary = updated.Summary;
        project.TechStack = updated.TechStack;
        project.RepoUrl = updated.RepoUrl;
        project.LiveUrl = updated.LiveUrl;
        project.DisplayOrder = updated.DisplayOrder;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/projects/{id}
    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteProject(int id)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project is null)
        {
            return NotFound(new { message = $"Project with ID {id} was not found." });
        }

        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}