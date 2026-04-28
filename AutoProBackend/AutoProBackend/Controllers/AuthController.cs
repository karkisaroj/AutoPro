using AutoProBackend.Data;
using AutoProBackend.DTOs;
using AutoProBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AutoProBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var user = await _db.Users
            .Include(u => u.Role)
            .Include(u => u.Customer)
            .Include(u => u.Staff)
            .FirstOrDefaultAsync(u => u.Email == req.Email && u.IsActive);

        if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid email or password" });

        var name = user.Customer?.Name ?? user.Staff?.Name ?? user.Email;
        var profileId = user.Customer?.Id ?? user.Staff?.Id;
        var token = GenerateToken(user, name);

        return Ok(new AuthResponse
        {
            Token = token,
            Role = user.Role.Name,
            UserId = user.Id,
            ProfileId = profileId,
            Name = name,
            Email = user.Email
        });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        if (await _db.Users.AnyAsync(u => u.Email == req.Email))
            return Conflict(new { message = "Email already registered" });

        var customerRole = await _db.Roles.FirstOrDefaultAsync(r => r.Name == "Customer");
        if (customerRole == null) return StatusCode(500, new { message = "Role setup incomplete" });

        var user = new User
        {
            Email = req.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            RoleId = customerRole.Id
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var customer = new Customer
        {
            UserId = user.Id,
            Name = req.Name,
            Phone = req.Phone,
            LicenseId = req.LicenseId
        };

        _db.Customers.Add(customer);
        await _db.SaveChangesAsync();

        var token = GenerateToken(user, customer.Name);

        return Created(string.Empty, new AuthResponse
        {
            Token = token,
            Role = "Customer",
            UserId = user.Id,
            ProfileId = customer.Id,
            Name = customer.Name,
            Email = user.Email
        });
    }

    private string GenerateToken(User user, string name)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role?.Name ?? "Customer"),
            new Claim("name", name)
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
