namespace AutoProBackend.Models;

public class Sale
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public int StaffId { get; set; }
    public Staff Staff { get; set; } = null!;
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public decimal Subtotal { get; set; }
    public decimal LoyaltyDiscount { get; set; } = 0;
    public decimal Tax { get; set; } = 0;
    public decimal Total { get; set; }
    public string PaymentMethod { get; set; } = string.Empty; // Cash, Card, Online
    public string Status { get; set; } = "Paid"; // Paid, Pending
    public int LoyaltyPointsAwarded { get; set; } = 0;

    public ICollection<SaleItem> Items { get; set; } = new List<SaleItem>();
}
