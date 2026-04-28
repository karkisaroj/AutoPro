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
public class VendorsController : ControllerBase
{
    private readonly AppDbContext _db;

    public VendorsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool? activeOnly)
    {
        var query = _db.Vendors.AsQueryable();

        if (activeOnly == true)
            query = query.Where(v => v.IsActive);

        var vendors = await query.Select(v => MapToResponse(v)).ToListAsync();
        return Ok(vendors);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var vendor = await _db.Vendors.FindAsync(id);
        if (vendor == null) return NotFound();
        return Ok(MapToResponse(vendor));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateVendorRequest req)
    {
        var vendor = new Vendor
        {
            Name = req.Name,
            ContactPerson = req.ContactPerson,
            Phone = req.Phone,
            Email = req.Email,
            Address = req.Address,
            Category = req.Category,
            PaymentTerms = req.PaymentTerms
        };
        _db.Vendors.Add(vendor);
        await _db.SaveChangesAsync();

        return Created($"/api/vendors/{vendor.Id}", MapToResponse(vendor));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateVendorRequest req)
    {
        var vendor = await _db.Vendors.FindAsync(id);
        if (vendor == null) return NotFound();

        if (req.Name != null) vendor.Name = req.Name;
        if (req.ContactPerson != null) vendor.ContactPerson = req.ContactPerson;
        if (req.Phone != null) vendor.Phone = req.Phone;
        if (req.Email != null) vendor.Email = req.Email;
        if (req.Address != null) vendor.Address = req.Address;
        if (req.Category != null) vendor.Category = req.Category;
        if (req.PaymentTerms != null) vendor.PaymentTerms = req.PaymentTerms;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var vendor = await _db.Vendors.FindAsync(id);
        if (vendor == null) return NotFound();

        _db.Vendors.Remove(vendor);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id}/toggle-status")]
    public async Task<IActionResult> ToggleStatus(int id)
    {
        var vendor = await _db.Vendors.FindAsync(id);
        if (vendor == null) return NotFound();

        vendor.IsActive = !vendor.IsActive;
        await _db.SaveChangesAsync();

        return Ok(new { isActive = vendor.IsActive });
    }

    private static VendorResponse MapToResponse(Vendor v) => new()
    {
        Id = v.Id,
        Name = v.Name,
        ContactPerson = v.ContactPerson,
        Phone = v.Phone,
        Email = v.Email,
        Address = v.Address,
        Category = v.Category,
        Rating = v.Rating,
        TotalOrders = v.TotalOrders,
        LastOrder = v.LastOrder,
        TotalSpent = v.TotalSpent,
        IsActive = v.IsActive,
        PaymentTerms = v.PaymentTerms
    };
}
