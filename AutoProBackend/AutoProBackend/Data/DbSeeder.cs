using AutoProBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace AutoProBackend.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        await db.Database.MigrateAsync();

        // Fix any customer user emails that are not deliverable — map to Gmail plus-addresses
        // using the customer's own first name so the tag is meaningful (e.g. +ram, +test)
        var badDomains = new[] { "@test.com", "@customer.com", "@email.com" };
        var placeholderPrefix = "karkisaroj3012+customer";

        var customersWithBadEmail = await db.Customers
            .Include(c => c.User)
            .Where(c => badDomains.Any(d => c.User.Email.EndsWith(d))
                     || c.User.Email.StartsWith(placeholderPrefix))
            .ToListAsync();

        if (customersWithBadEmail.Count > 0)
        {
            foreach (var customer in customersWithBadEmail)
            {
                var firstName = customer.Name.Split(' ')[0].ToLowerInvariant()
                    .Replace(" ", "").Replace(".", "");
                customer.User.Email = $"karkisaroj3012+{firstName}@gmail.com";
            }
            await db.SaveChangesAsync();
        }

        // Seed default admin user if none exists
        if (!await db.Users.AnyAsync(u => u.Role.Name == "Admin"))
        {
            var adminRole = await db.Roles.FirstAsync(r => r.Name == "Admin");

            var adminUser = new User
            {
                Email = "admin@autopro.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                RoleId = adminRole.Id
            };
            db.Users.Add(adminUser);
            await db.SaveChangesAsync();

            var adminStaff = new Staff
            {
                UserId = adminUser.Id,
                Name = "Admin User",
                Phone = "9800000000",
                JobTitle = "Admin Manager",
                Department = "Management",
                Salary = 0
            };
            db.Staff.Add(adminStaff);
            await db.SaveChangesAsync();
        }
    }
}
