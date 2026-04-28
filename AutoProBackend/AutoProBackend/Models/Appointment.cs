namespace AutoProBackend.Models;

public class Appointment
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public int? VehicleId { get; set; }
    public Vehicle? Vehicle { get; set; }
    public int? StaffId { get; set; }
    public Staff? Staff { get; set; }
    public DateTime Date { get; set; }
    public TimeSpan Time { get; set; }
    public string ServiceType { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, Confirmed, Completed, Cancelled
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
