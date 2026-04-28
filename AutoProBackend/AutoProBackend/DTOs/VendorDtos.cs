using System.ComponentModel.DataAnnotations;

namespace AutoProBackend.DTOs;

public class VendorResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Rating { get; set; }
    public int TotalOrders { get; set; }
    public DateTime? LastOrder { get; set; }
    public decimal TotalSpent { get; set; }
    public bool IsActive { get; set; }
    public string PaymentTerms { get; set; } = string.Empty;
}

public class CreateVendorRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string ContactPerson { get; set; } = string.Empty;

    [Required]
    public string Phone { get; set; } = string.Empty;

    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Address { get; set; } = string.Empty;

    [Required]
    public string Category { get; set; } = string.Empty;

    public string PaymentTerms { get; set; } = string.Empty;
}

public class UpdateVendorRequest
{
    public string? Name { get; set; }
    public string? ContactPerson { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? Category { get; set; }
    public string? PaymentTerms { get; set; }
}
