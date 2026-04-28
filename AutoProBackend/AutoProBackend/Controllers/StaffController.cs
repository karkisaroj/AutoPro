using AutoProBackend.Data;
using AutoProBackend.DTOs;
using AutoProBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoProBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class StaffController : ControllerBase
{
    private readonly AppDbContext _db;

    public StaffController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var staff = await _db.Staff
            .Include(s => s.User)
            .Select(s => MapToResponse(s))
            .ToListAsync();

        return Ok(staff);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var staff = await _db.Staff.Include(s => s.User).FirstOrDefaultAsync(s => s.Id == id);
        if (staff == null) return NotFound();
        return Ok(MapToResponse(staff));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateStaffRequest req)
    {
        if (await _db.Users.AnyAsync(u => u.Email == req.Email))
            return Conflict(new { message = "Email already registered" });

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
        return Created($"/api/staff/{staff.Id}", MapToResponse(staff));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateStaffRequest req)
    {
        var staff = await _db.Staff.FindAsync(id);
        if (staff == null) return NotFound();

        if (req.Name != null) staff.Name = req.Name;
        if (req.Phone != null) staff.Phone = req.Phone;
        if (req.JobTitle != null) staff.JobTitle = req.JobTitle;
        if (req.Department != null) staff.Department = req.Department;
        if (req.Salary.HasValue) staff.Salary = req.Salary.Value;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var staff = await _db.Staff.Include(s => s.User).FirstOrDefaultAsync(s => s.Id == id);
        if (staff == null) return NotFound();

        staff.User.IsActive = false;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id}/toggle-status")]
    public async Task<IActionResult> ToggleStatus(int id)
    {
        var staff = await _db.Staff.Include(s => s.User).FirstOrDefaultAsync(s => s.Id == id);
        if (staff == null) return NotFound();

        staff.IsActive = !staff.IsActive;
        staff.User.IsActive = staff.IsActive;
        await _db.SaveChangesAsync();

        return Ok(new { isActive = staff.IsActive });
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
