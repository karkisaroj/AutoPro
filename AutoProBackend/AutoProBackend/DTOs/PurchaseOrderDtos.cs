using System.ComponentModel.DataAnnotations;

namespace AutoProBackend.DTOs;

public class PurchaseOrderResponse
{
    public int Id { get; set; }
    public int VendorId { get; set; }
    public string VendorName { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public decimal Total { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<PurchaseOrderItemResponse> Items { get; set; } = new();
}

public class PurchaseOrderItemResponse
{
    public int Id { get; set; }
    public int PartId { get; set; }
    public string PartName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public decimal LineTotal { get; set; }
}

public class CreatePurchaseOrderRequest
{
    [Required]
    public int VendorId { get; set; }

    public string? Notes { get; set; }

    [Required, MinLength(1)]
    public List<PurchaseOrderItemRequest> Items { get; set; } = new();
}

public class PurchaseOrderItemRequest
{
    [Required]
    public int PartId { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    [Range(0, double.MaxValue)]
    public decimal UnitCost { get; set; }
}

public class UpdatePurchaseOrderStatusRequest
{
    [Required]
    public string Status { get; set; } = string.Empty;
}
