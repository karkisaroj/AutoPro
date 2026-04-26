namespace AutoProBackend.Models;

public class PurchaseOrder
{
    public int Id { get; set; }
    public int VendorId { get; set; }
    public Vendor Vendor { get; set; } = null!;
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public decimal Total { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Received
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<PurchaseOrderItem> Items { get; set; } = new List<PurchaseOrderItem>();
}
