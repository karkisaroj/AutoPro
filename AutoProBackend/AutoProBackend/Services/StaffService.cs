using AutoProBackend.Data;
using AutoProBackend.DTOs;
using AutoProBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace AutoProBackend.Services;

public class StaffService : IStaffService
{
    private readonly AppDbContext _db;
    public StaffService(AppDbContext db) => _db = db;

    public async Task<List<StaffResponse>> GetAllAsync() =>
        await _db.Staff
            .Include(s => s.User)
            .Select(s => MapToResponse(s))
            .ToListAsync();

    public async Task<StaffResponse?> GetByIdAsync(int id)
    {
        var staff = await _db.Staff.Include(s => s.User).FirstOrDefaultAsync(s => s.Id == id);
        return staff == null ? null : MapToResponse(staff);
    }

    public async Task<(StaffResponse? response, bool emailConflict)> CreateAsync(CreateStaffRequest req)
    {
        if (await _db.Users.AnyAsync(u => u.Email == req.Email))
            return (null, true);

        var staffRole = await _db.Roles.FirstAsync(r => r.Name == "Staff");

        var user = new User
        {
            Email = req.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            RoleId = staffRole.Id
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var staff = new Staff
        {
            UserId = user.Id,
            Name = req.Name,
            Phone = req.Phone,
            JobTitle = req.JobTitle,
            Department = req.Department,
            Salary = req.Salary
        };
        _db.Staff.Add(staff);
        await _db.SaveChangesAsync();

        await _db.Entry(staff).Reference(s => s.User).LoadAsync();
        return (MapToResponse(staff), false);
    }

    public async Task<bool> UpdateAsync(int id, UpdateStaffRequest req)
    {
        var staff = await _db.Staff.FindAsync(id);
        if (staff == null) return false;

        if (req.Name != null) staff.Name = req.Name;
        if (req.Phone != null) staff.Phone = req.Phone;
        if (req.JobTitle != null) staff.JobTitle = req.JobTitle;
        if (req.Department != null) staff.Department = req.Department;
        if (req.Salary.HasValue) staff.Salary = req.Salary.Value;

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var staff = await _db.Staff.Include(s => s.User).FirstOrDefaultAsync(s => s.Id == id);
        if (staff == null) return false;

        staff.User.IsActive = false;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool?> ToggleStatusAsync(int id)
    {
        var staff = await _db.Staff.Include(s => s.User).FirstOrDefaultAsync(s => s.Id == id);
        if (staff == null) return null;

        staff.IsActive = !staff.IsActive;
        staff.User.IsActive = staff.IsActive;
        await _db.SaveChangesAsync();
        return staff.IsActive;
    }

    private static StaffResponse MapToResponse(Staff s) => new()
    {
        Id = s.Id,
        UserId = s.UserId,
        Name = s.Name,
        Email = s.User?.Email ?? string.Empty,
        Phone = s.Phone,
        JobTitle = s.JobTitle,
        Department = s.Department,
        Salary = s.Salary,
        JoinDate = s.JoinDate,
        IsActive = s.IsActive
    };
}
