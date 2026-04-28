using AutoProBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace AutoProBackend.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        await db.Database.MigrateAsync();

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
