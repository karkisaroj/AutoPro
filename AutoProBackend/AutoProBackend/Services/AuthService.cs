using AutoProBackend.Data;
using AutoProBackend.DTOs;
using AutoProBackend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AutoProBackend.Services;

public class AuthService(AppDbContext db, IConfiguration config) : IAuthService
{
    public async Task<AuthResponse?> LoginAsync(LoginRequest req)
    {
        var user = await db.Users
            .Include(u => u.Role)
            .Include(u => u.Customer)
            .Include(u => u.Staff)
            .FirstOrDefaultAsync(u => u.Email == req.Email && u.IsActive);

        if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return null;

        var name      = user.Customer?.Name ?? user.Staff?.Name ?? user.Email;
        var profileId = user.Customer?.Id   ?? user.Staff?.Id;

        return new AuthResponse
        {
            Token     = GenerateToken(user, name, user.Role.Name),
            Role      = user.Role.Name,
            UserId    = user.Id,
            ProfileId = profileId,
            Name      = name,
            Email     = user.Email
        };
    }

    public async Task<(AuthResponse? response, bool emailConflict, bool roleSetupIncomplete)> RegisterAsync(RegisterRequest req)
    {
        if (await db.Users.AnyAsync(u => u.Email == req.Email))
            return (null, true, false);

        var customerRole = await db.Roles.FirstOrDefaultAsync(r => r.Name == "Customer");
        if (customerRole == null)
            return (null, false, true);

        var user = new User
        {
            Email        = req.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            RoleId       = customerRole.Id
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        var customer = new Customer
        {
            UserId    = user.Id,
            Name      = req.Name,
            Phone     = req.Phone,
            LicenseId = req.LicenseId
        };

        db.Customers.Add(customer);
        await db.SaveChangesAsync();

        return (new AuthResponse
        {
            Token     = GenerateToken(user, customer.Name, customerRole.Name),
            Role      = "Customer",
            UserId    = user.Id,
            ProfileId = customer.Id,
            Name      = customer.Name,
            Email     = user.Email
        }, false, false);
    }

    private string GenerateToken(User user, string name, string roleName)
    {
        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, roleName),
            new Claim("name", name)
        };

        var token = new JwtSecurityToken(
            issuer:            config["Jwt:Issuer"],
            audience:          config["Jwt:Audience"],
            claims:            claims,
            expires:           DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
