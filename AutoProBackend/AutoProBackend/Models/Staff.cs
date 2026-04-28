namespace AutoProBackend.Models;

public class Staff
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty; // Senior Mechanic, Service Advisor, etc.
    public string Department { get; set; } = string.Empty; // Workshop, Front Desk, Management, etc.
    public decimal Salary { get; set; }
    public DateTime JoinDate { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    public ICollection<Sale> Sales { get; set; } = new List<Sale>();
}
