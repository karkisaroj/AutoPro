namespace AutoProBackend.Models;

public class Vendor
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Rating { get; set; } = 0;
    public int TotalOrders { get; set; } = 0;
    public DateTime? LastOrder { get; set; }
    public decimal TotalSpent { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public string PaymentTerms { get; set; } = string.Empty;

    public ICollection<Part> Parts { get; set; } = new List<Part>();
    public ICollection<PurchaseOrder> PurchaseOrders { get; set; } = new List<PurchaseOrder>();
}
