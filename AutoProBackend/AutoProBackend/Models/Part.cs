namespace AutoProBackend.Models;

public class Part
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // Brakes, Engine, Filters, etc.
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public int VendorId { get; set; }
    public Vendor Vendor { get; set; } = null!;
    public int MinQuantity { get; set; } = 10;
    public string Unit { get; set; } = "pcs";
    public DateTime? LastRestocked { get; set; }

    public ICollection<SaleItem> SaleItems { get; set; } = new List<SaleItem>();
    public ICollection<PurchaseOrderItem> PurchaseOrderItems { get; set; } = new List<PurchaseOrderItem>();
}
