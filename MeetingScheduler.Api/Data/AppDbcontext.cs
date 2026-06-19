using Microsoft.EntityFrameworkCore;
using MeetingScheduler.Api.Models;

namespace MeetingScheduler.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Room> Rooms { get; set; }

    public DbSet<Meeting> Meetings { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Room>().ToTable("rooms");
        modelBuilder.Entity<Meeting>().ToTable("meetings");

        base.OnModelCreating(modelBuilder);
    }
}