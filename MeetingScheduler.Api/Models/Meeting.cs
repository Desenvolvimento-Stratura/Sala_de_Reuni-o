namespace MeetingScheduler.Api.Models;

public class Meeting
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public DateOnly MeetingDate { get; set; }

    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }

    public int RoomId { get; set; }

    public Room? Room { get; set; }

    public string CreatedByLogin { get; set; } = string.Empty;
}