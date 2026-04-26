namespace AutoProBackend.Models;

public class Customer
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? LicenseId { get; set; }
    public DateTime JoinDate { get; set; } = DateTime.UtcNow;
    public int LoyaltyPoints { get; set; } = 0;
    public string Tier { get; set; } = "Bronze"; // Bronze, Silver, Gold, Platinum
    public decimal TotalSpent { get; set; } = 0;
    public int Visits { get; set; } = 0;

    public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    public ICollection<Sale> Sales { get; set; } = new List<Sale>();
}
