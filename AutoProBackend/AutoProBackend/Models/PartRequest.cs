namespace AutoProBackend.Models;

public class PartRequest
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public string PartName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? VehicleModel { get; set; }
    public int Quantity { get; set; } = 1;
    public string Status { get; set; } = "Pending"; // Pending, Acknowledged, Fulfilled, Rejected
    public string? AdminNote { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
