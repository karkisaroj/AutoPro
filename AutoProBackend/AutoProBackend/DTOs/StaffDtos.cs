using System.ComponentModel.DataAnnotations;

namespace AutoProBackend.DTOs;

public class StaffResponse
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public decimal Salary { get; set; }
    public DateTime JoinDate { get; set; }
    public bool IsActive { get; set; }
}

public class CreateStaffRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Phone { get; set; } = string.Empty;

    [Required]
    public string JobTitle { get; set; } = string.Empty;

    [Required]
    public string Department { get; set; } = string.Empty;

    [Range(0, double.MaxValue)]
    public decimal Salary { get; set; }
}

public class UpdateStaffRequest
{
    public string? Name { get; set; }
    public string? Phone { get; set; }
    public string? JobTitle { get; set; }
    public string? Department { get; set; }
    public decimal? Salary { get; set; }
}
