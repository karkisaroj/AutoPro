using AutoProBackend.Data;
using AutoProBackend.DTOs;
using AutoProBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoProBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Staff")]
public class PartsController : ControllerBase
{
    private readonly AppDbContext _db;

    public PartsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? category)
    {
        var query = _db.Parts.Include(p => p.Vendor).AsQueryable();

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(p => p.Category == category);

        var parts = await query.Select(p => MapToResponse(p)).ToListAsync();
        return Ok(parts);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var part = await _db.Parts.Include(p => p.Vendor).FirstOrDefaultAsync(p => p.Id == id);
        if (part == null) return NotFound();
        return Ok(MapToResponse(part));
    }

    [HttpGet("low-stock")]
    public async Task<IActionResult> GetLowStock()
    {
        var parts = await _db.Parts
            .Include(p => p.Vendor)
            .Where(p => p.Quantity < p.MinQuantity)
            .Select(p => new LowStockPartResponse
            {
                Id = p.Id,
                Name = p.Name,
                Category = p.Category,
                Quantity = p.Quantity,
                MinQuantity = p.MinQuantity,
                VendorName = p.Vendor.Name
            })
            .ToListAsync();

        return Ok(parts);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreatePartRequest req)
    {
        if (!await _db.Vendors.AnyAsync(v => v.Id == req.VendorId && v.IsActive))
            return BadRequest(new { message = "Vendor not found or inactive" });

        var part = new Part
        {
            Name = req.Name,
            Category = req.Category,
            Price = req.Price,
            Quantity = req.Quantity,
            VendorId = req.VendorId,
            MinQuantity = req.MinQuantity,
            Unit = req.Unit,
            LastRestocked = req.Quantity > 0 ? DateTime.UtcNow : null
        };
        _db.Parts.Add(part);
        await _db.SaveChangesAsync();

        await _db.Entry(part).Reference(p => p.Vendor).LoadAsync();
        return Created($"/api/parts/{part.Id}", MapToResponse(part));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePartRequest req)
    {
        var part = await _db.Parts.FindAsync(id);
        if (part == null) return NotFound();

        if (req.Name != null) part.Name = req.Name;
        if (req.Category != null) part.Category = req.Category;
        if (req.Price.HasValue) part.Price = req.Price.Value;
        if (req.VendorId.HasValue) part.VendorId = req.VendorId.Value;
        if (req.MinQuantity.HasValue) part.MinQuantity = req.MinQuantity.Value;
        if (req.Unit != null) part.Unit = req.Unit;

        if (req.Quantity.HasValue && req.Quantity.Value != part.Quantity)
        {
            part.Quantity = req.Quantity.Value;
            part.LastRestocked = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var part = await _db.Parts.FindAsync(id);
        if (part == null) return NotFound();

        _db.Parts.Remove(part);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static PartResponse MapToResponse(Part p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Category = p.Category,
        Price = p.Price,
        Quantity = p.Quantity,
        VendorId = p.VendorId,
        VendorName = p.Vendor?.Name ?? string.Empty,
        MinQuantity = p.MinQuantity,
        Unit = p.Unit,
        LastRestocked = p.LastRestocked,
        IsLowStock = p.Quantity < p.MinQuantity
    };
}
