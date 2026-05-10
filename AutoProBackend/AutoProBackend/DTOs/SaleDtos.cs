using System.ComponentModel.DataAnnotations;

namespace AutoProBackend.DTOs;

public class SaleResponse
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public int StaffId { get; set; }
    public string StaffName { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public decimal Subtotal { get; set; }
    public decimal LoyaltyDiscount { get; set; }
    public decimal Tax { get; set; }
    public decimal Total { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int LoyaltyPointsAwarded { get; set; }
    public List<SaleItemResponse> Items { get; set; } = new();
}

public class SaleItemResponse
{
    public int Id { get; set; }
    public int PartId { get; set; }
    public string PartName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
}

public class CreateSaleRequest
{
    [Required]
    public int CustomerId { get; set; }

    [Required]
    public string PaymentMethod { get; set; } = string.Empty;

    [Required, MinLength(1)]
    public List<SaleItemRequest> Items { get; set; } = new();
}

public class SaleItemRequest
{
    [Required]
    public int PartId { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }
}
