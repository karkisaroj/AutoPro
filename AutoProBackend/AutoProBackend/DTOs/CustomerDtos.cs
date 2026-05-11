using System.ComponentModel.DataAnnotations;

namespace AutoProBackend.DTOs;

public class CustomerResponse
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? LicenseId { get; set; }
    public DateTime JoinDate { get; set; }
    public int LoyaltyPoints { get; set; }
    public string Tier { get; set; } = string.Empty;
    public decimal TotalSpent { get; set; }
    public int Visits { get; set; }
    public List<VehicleResponse> Vehicles { get; set; } = new();
}

public class CreateCustomerRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Phone { get; set; } = string.Empty;

    public string? LicenseId { get; set; }
}

public class UpdateCustomerRequest
{
    [MinLength(1), MaxLength(100)]
    public string? Name { get; set; }

    [MaxLength(20)]
    public string? Phone { get; set; }

    [MaxLength(50)]
    public string? LicenseId { get; set; }
}

public class VehicleResponse
{
    public int Id { get; set; }
    public string VehicleType { get; set; } = string.Empty;
    public string PlateNo { get; set; } = string.Empty;
    public DateTime? RegistrationDate { get; set; }
}

public class AddVehicleRequest
{
    [Required, MinLength(1), MaxLength(100)]
    public string VehicleType { get; set; } = string.Empty;

    [Required, MinLength(1), MaxLength(20)]
    public string PlateNo { get; set; } = string.Empty;

    public DateTime? RegistrationDate { get; set; }
}

public class UpdateVehicleRequest
{
    [MinLength(1), MaxLength(100)]
    public string? VehicleType { get; set; }

    [MinLength(1), MaxLength(20)]
    public string? PlateNo { get; set; }

    public DateTime? RegistrationDate { get; set; }
}
