using MeetingScheduler.Api.Data;
using MeetingScheduler.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MeetingScheduler.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class MeetingsController : ControllerBase
{
    private readonly AppDbContext _context;

    public MeetingsController(AppDbContext context)
    {
        _context = context;
    }

    // Extrai o login (parte antes do @) da identidade autenticada no token.
    // NUNCA confie no valor enviado pelo cliente para identificar o usuário.
    private string GetLogin()
    {
        var raw = User.FindFirst("preferred_username")?.Value
                  ?? User.Identity?.Name
                  ?? string.Empty;
        return raw.Split('@')[0];
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

        // O criador é sempre o usuário autenticado — o corpo da requisição é ignorado.
        meeting.CreatedByLogin = GetLogin();

        // Transação Serializable: a checagem de conflito e a inserção viram uma
        // operação atômica, impedindo que duas reservas simultâneas passem as duas
        // na checagem e gerem uma reserva dupla (race condition TOCTOU).
        await using var tx = await _context.Database.BeginTransactionAsync(
            System.Data.IsolationLevel.Serializable);

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
        await tx.CommitAsync();

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

        // Só o dono da reserva pode alterá-la.
        if (!string.Equals(meeting.CreatedByLogin, GetLogin(), StringComparison.OrdinalIgnoreCase))
            return Forbid();

        if (updatedMeeting.StartTime >= updatedMeeting.EndTime)
        {
            return BadRequest("O horário final deve ser maior que o inicial.");
        }

        await using var tx = await _context.Database.BeginTransactionAsync(
            System.Data.IsolationLevel.Serializable);

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
        // CreatedByLogin não é alterável — a reserva continua pertencendo a quem criou.

        await _context.SaveChangesAsync();
        await tx.CommitAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMeeting(int id)
    {
        var meeting = await _context.Meetings.FindAsync(id);

        if (meeting == null)
            return NotFound();

        // Só o dono da reserva pode cancelá-la.
        if (!string.Equals(meeting.CreatedByLogin, GetLogin(), StringComparison.OrdinalIgnoreCase))
            return Forbid();

        _context.Meetings.Remove(meeting);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}