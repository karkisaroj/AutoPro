using System.ComponentModel.DataAnnotations;

namespace AutoProBackend.DTOs;

public class LoginRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequest
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

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public int UserId { get; set; }
    public int? ProfileId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}
