using MeetingScheduler.Api.Data;
using MeetingScheduler.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MeetingScheduler.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MeetingsController : ControllerBase
{
    private readonly AppDbContext _context;

    public MeetingsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetMeetings()
    {
        return Ok(
            await _context.Meetings
                .Include(m => m.Room)
                .ToListAsync()
        );
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetMeetingById(int id)
    {
        var meeting = await _context.Meetings
            .Include(m => m.Room)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (meeting == null)
            return NotFound();

        return Ok(meeting);
    }

    [HttpPost]
    public async Task<IActionResult> CreateMeeting(Meeting meeting)
    {
        if (meeting.StartTime >= meeting.EndTime)
        {
            return BadRequest("O horário final deve ser maior que o inicial.");
        }

        var conflict = await _context.Meetings.AnyAsync(m =>
            m.RoomId == meeting.RoomId &&
            m.MeetingDate == meeting.MeetingDate &&
            meeting.StartTime < m.EndTime &&
            meeting.EndTime > m.StartTime);

        if (conflict)
        {
            return BadRequest("A sala já está reservada nesse horário.");
        }

        _context.Meetings.Add(meeting);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetMeetingById),
            new { id = meeting.Id },
            meeting
        );
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMeeting(int id, Meeting updatedMeeting)
    {
        var meeting = await _context.Meetings.FindAsync(id);

        if (meeting == null)
            return NotFound();

        if (updatedMeeting.StartTime >= updatedMeeting.EndTime)
        {
            return BadRequest("O horário final deve ser maior que o inicial.");
        }

        var conflict = await _context.Meetings.AnyAsync(m =>
            m.Id != id &&
            m.RoomId == updatedMeeting.RoomId &&
            m.MeetingDate == updatedMeeting.MeetingDate &&
            updatedMeeting.StartTime < m.EndTime &&
            updatedMeeting.EndTime > m.StartTime);

        if (conflict)
        {
            return BadRequest("A sala já está reservada nesse horário.");
        }

        meeting.Title = updatedMeeting.Title;
        meeting.MeetingDate = updatedMeeting.MeetingDate;
        meeting.StartTime = updatedMeeting.StartTime;
        meeting.EndTime = updatedMeeting.EndTime;
        meeting.RoomId = updatedMeeting.RoomId;
        meeting.CreatedByLogin = updatedMeeting.CreatedByLogin;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMeeting(int id)
    {
        var meeting = await _context.Meetings.FindAsync(id);

        if (meeting == null)
            return NotFound();

        _context.Meetings.Remove(meeting);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}