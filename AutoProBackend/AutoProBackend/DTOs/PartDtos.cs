using System.ComponentModel.DataAnnotations;

namespace AutoProBackend.DTOs;

public class PartResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public int VendorId { get; set; }
    public string VendorName { get; set; } = string.Empty;
    public int MinQuantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public DateTime? LastRestocked { get; set; }
    public bool IsLowStock { get; set; }
}

public class CreatePartRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    public string Sku { get; set; } = string.Empty;

    [Required]
    public string Category { get; set; } = string.Empty;

    [Range(0, double.MaxValue)]
    public decimal Price { get; set; }

    [Range(0, int.MaxValue)]
    public int Quantity { get; set; }

    [Required]
    public int VendorId { get; set; }

    [Range(1, int.MaxValue)]
    public int MinQuantity { get; set; } = 10;

    public string Unit { get; set; } = "pcs";
}

public class UpdatePartRequest
{
    public string? Name { get; set; }
    public string? Sku { get; set; }
    public string? Category { get; set; }
    public decimal? Price { get; set; }
    public int? Quantity { get; set; }
    public int? VendorId { get; set; }
    public int? MinQuantity { get; set; }
    public string? Unit { get; set; }
}
