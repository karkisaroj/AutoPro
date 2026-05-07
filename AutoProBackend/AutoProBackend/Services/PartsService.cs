using AutoProBackend.Data;
using AutoProBackend.DTOs;
using AutoProBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace AutoProBackend.Services;

public class PartsService : IPartsService
{
    private readonly AppDbContext _db;
    public PartsService(AppDbContext db) => _db = db;

    public async Task<List<PartResponse>> GetAllAsync(string? category)
    {
        var query = _db.Parts.Include(p => p.Vendor).AsQueryable();
        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(p => p.Category == category);
        return await query.Select(p => MapToResponse(p)).ToListAsync();
    }

    public async Task<PartResponse?> GetByIdAsync(int id)
    {
        var part = await _db.Parts.Include(p => p.Vendor).FirstOrDefaultAsync(p => p.Id == id);
        return part == null ? null : MapToResponse(part);
    }

    public async Task<List<LowStockPartResponse>> GetLowStockAsync() =>
        await _db.Parts
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

    public async Task<(PartResponse? response, bool vendorNotFound)> CreateAsync(CreatePartRequest req)
    {
        if (!await _db.Vendors.AnyAsync(v => v.Id == req.VendorId && v.IsActive))
            return (null, true);

        var part = new Part
        {
            Name = req.Name,
            Sku = req.Sku,
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
        return (MapToResponse(part), false);
    }

    public async Task<bool> UpdateAsync(int id, UpdatePartRequest req)
    {
        var part = await _db.Parts.FindAsync(id);
        if (part == null) return false;

        if (req.Name != null) part.Name = req.Name;
        if (req.Sku != null) part.Sku = req.Sku;
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
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var part = await _db.Parts.FindAsync(id);
        if (part == null) return false;

        _db.Parts.Remove(part);
        await _db.SaveChangesAsync();
        return true;
    }

    private static PartResponse MapToResponse(Part p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Sku = p.Sku,
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
