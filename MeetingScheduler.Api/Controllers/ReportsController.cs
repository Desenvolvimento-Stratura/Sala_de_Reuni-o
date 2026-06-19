using MeetingScheduler.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MeetingScheduler.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReportsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("top-creators")]
    public async Task<IActionResult> GetTopCreators()
    {
        var report = await _context.Meetings
            .GroupBy(m => m.CreatedByLogin)
            .Select(g => new
            {
                Login = g.Key,
                MeetingsCount = g.Count()
            })
            .OrderByDescending(x => x.MeetingsCount)
            .ToListAsync();

        return Ok(report);
    }

    [HttpGet("top-creators/month/{month}/year/{year}")]
    public async Task<IActionResult> GetTopCreatorsByMonth(int month, int year)
    {
        if (month < 1 || month > 12)
        {
            return BadRequest("Mês tem que esta entre 1 e 12.");
        }

        if (year < 2000 || year > DateTime.Now.Year + 1)
        {
            return BadRequest("Ano Inválido.");
        }

        var report = await _context.Meetings
            .Where(m => m.MeetingDate.Month == month &&
                        m.MeetingDate.Year == year)
            .GroupBy(m => m.CreatedByLogin)
            .Select(g => new
            {
                Login = g.Key,
                MeetingsCount = g.Count()
            })
            .OrderByDescending(x => x.MeetingsCount)
            .ToListAsync();

        return Ok(report);
    }
}