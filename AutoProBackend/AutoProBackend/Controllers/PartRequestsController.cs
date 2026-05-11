using AutoProBackend.Data;
using AutoProBackend.Models;
using AutoProBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace AutoProBackend.Controllers;

[ApiController]
[Route("api/part-requests")]
[Authorize]
public class PartRequestsController(AppDbContext db, ICustomerService customers) : ControllerBase
{
    // ── Customer: submit a request ──────────────────────────────────────────
    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Create([FromBody] CreatePartRequestDto req)
    {
        var customerId = await GetCustomerIdFromToken();
        if (customerId == null) return Forbid();

        var request = new PartRequest
        {
            CustomerId   = customerId.Value,
            PartName     = req.PartName.Trim(),
            Description  = req.Description?.Trim(),
            VehicleModel = req.VehicleModel?.Trim(),
            Quantity     = req.Quantity,
        };

        db.PartRequests.Add(request);
        await db.SaveChangesAsync();

        return Created($"/api/part-requests/{request.Id}", MapToResponse(request, string.Empty));
    }

    // ── Customer: view own requests ─────────────────────────────────────────
    [HttpGet("my")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMine()
    {
        var customerId = await GetCustomerIdFromToken();
        if (customerId == null) return Forbid();

        var list = await db.PartRequests
            .Include(r => r.Customer)
            .Where(r => r.CustomerId == customerId.Value)
            .OrderByDescending(r => r.CreatedAt)
            .AsNoTracking()
            .ToListAsync();

        return Ok(list.Select(r => MapToResponse(r, r.Customer.Name)));
    }

    // ── All authenticated users: parts catalog for dropdown ────────────────
    [HttpGet("parts-catalog")]
    public async Task<IActionResult> GetPartsCatalog() =>
        Ok(await db.Parts
            .AsNoTracking()
            .OrderBy(p => p.Category)
            .ThenBy(p => p.Name)
            .Select(p => new { p.Id, p.Name, p.Category, p.Quantity, p.Unit })
            .ToListAsync());

    // ── Admin / Staff: view all requests ───────────────────────────────────
    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetAll([FromQuery] string? status)
    {
        var query = db.PartRequests.Include(r => r.Customer).AsNoTracking();
        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(r => r.Status == status);

        var list = await query.OrderByDescending(r => r.CreatedAt).ToListAsync();
        return Ok(list.Select(r => MapToResponse(r, r.Customer.Name)));
    }

    // ── Admin / Staff: update status ───────────────────────────────────────
    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdatePartRequestStatusDto req)
    {
        var valid = new[] { "Pending", "Acknowledged", "Fulfilled", "Rejected" };
        if (!valid.Contains(req.Status))
            return BadRequest(new { message = "Invalid status" });

        var item = await db.PartRequests.FindAsync(id);
        if (item == null) return NotFound();

        item.Status    = req.Status;
        item.AdminNote = req.AdminNote?.Trim();
        await db.SaveChangesAsync();
        return NoContent();
    }

    private async Task<int?> GetCustomerIdFromToken()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        return await customers.GetCustomerIdByUserIdAsync(userId);
    }

    private static object MapToResponse(PartRequest r, string customerName) => new
    {
        r.Id,
        r.CustomerId,
        CustomerName = customerName,
        r.PartName,
        r.Description,
        r.VehicleModel,
        r.Quantity,
        r.Status,
        r.AdminNote,
        r.CreatedAt,
    };
}

public class CreatePartRequestDto
{
    [Required, MinLength(2), MaxLength(200)]
    public string PartName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [MaxLength(100)]
    public string? VehicleModel { get; set; }

    [Range(1, 100)]
    public int Quantity { get; set; } = 1;
}

public class UpdatePartRequestStatusDto
{
    [Required]
    public string Status { get; set; } = string.Empty;

    [MaxLength(300)]
    public string? AdminNote { get; set; }
}
