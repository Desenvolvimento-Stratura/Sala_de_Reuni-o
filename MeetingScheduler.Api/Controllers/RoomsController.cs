using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MeetingScheduler.Api.Data;
using MeetingScheduler.Api.Models;

namespace MeetingScheduler.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoomsController : ControllerBase
{
    private readonly AppDbContext _context;

    public RoomsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetRooms()
    {
        return Ok(await _context.Rooms.ToListAsync());
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRoomById(int id)
    {
        var room = await _context.Rooms.FindAsync(id);

        if (room == null)
            return NotFound();

        return Ok(room);
    }

    [HttpPost]
    public async Task<IActionResult> CreateRoom(Room room)
    {
        _context.Rooms.Add(room);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetRoomById),
            new { id = room.Id },
            room
        );
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRoom(int id, Room updatedRoom)
    {
        var room = await _context.Rooms.FindAsync(id);

        if (room == null)
            return NotFound();

        room.Name = updatedRoom.Name;
        room.Capacity = updatedRoom.Capacity;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRoom(int id)
    {
        var room = await _context.Rooms.FindAsync(id);

        if (room == null)
            return NotFound();

        _context.Rooms.Remove(room);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}