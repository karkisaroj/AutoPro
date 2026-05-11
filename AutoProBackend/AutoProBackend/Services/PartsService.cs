using AutoProBackend.Data;
using AutoProBackend.DTOs;
using AutoProBackend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace AutoProBackend.Services;

public class PartsService : IPartsService
{
    private readonly AppDbContext _db;
    private readonly IMemoryCache _cache;
    private const string CacheKey = "parts_all";

    public PartsService(AppDbContext db, IMemoryCache cache)
    {
        _db    = db;
        _cache = cache;
    }

    public async Task<PagedResult<PartResponse>> GetAllAsync(string? category, string? search, int page, int pageSize)
    {
        // Try to get all parts from cache; if not cached, fetch from DB and store for 30 seconds
        if (!_cache.TryGetValue(CacheKey, out List<PartResponse>? allParts))
        {
            var parts = await _db.Parts.Include(p => p.Vendor).OrderBy(p => p.Name).ToListAsync();
            allParts = parts.Select(MapToResponse).ToList();
            _cache.Set(CacheKey, allParts, TimeSpan.FromSeconds(30));
        }

        // Filter by category and search term in memory (no extra DB call needed)
        var filtered = allParts!;
        if (!string.IsNullOrWhiteSpace(category))
            filtered = filtered.Where(p => p.Category == category).ToList();
        if (!string.IsNullOrWhiteSpace(search))
            filtered = filtered.Where(p =>
                p.Name.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                p.Sku.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                p.VendorName.Contains(search, StringComparison.OrdinalIgnoreCase)
            ).ToList();

        var total = filtered.Count;
        return new PagedResult<PartResponse>
        {
            TotalCount = total,
            Page       = page,
            PageSize   = pageSize,
            TotalPages = (int)Math.Ceiling((double)total / pageSize),
            Data       = filtered.Skip((page - 1) * pageSize).Take(pageSize).ToList()
        };
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

    public async Task<(PartResponse? response, bool vendorNotFound, bool skuConflict)> CreateAsync(CreatePartRequest req)
    {
        if (!await _db.Vendors.AnyAsync(v => v.Id == req.VendorId && v.IsActive))
            return (null, true, false);

        // Enforce SKU uniqueness when a SKU is provided
        if (!string.IsNullOrWhiteSpace(req.Sku) && await _db.Parts.AnyAsync(p => p.Sku == req.Sku))
            return (null, false, true);

        var part = new Part
        {
            Name        = req.Name,
            Sku         = req.Sku,
            Category    = req.Category,
            Price       = req.Price,
            Quantity    = req.Quantity,
            VendorId    = req.VendorId,
            MinQuantity = req.MinQuantity,
            Unit        = req.Unit,
            LastRestocked = req.Quantity > 0 ? DateTime.UtcNow : null
        };
        _db.Parts.Add(part);
        await _db.SaveChangesAsync();
        _cache.Remove(CacheKey);
        await _db.Entry(part).Reference(p => p.Vendor).LoadAsync();
        return (MapToResponse(part), false, false);
    }

    public async Task<(bool found, bool skuConflict)> UpdateAsync(int id, UpdatePartRequest req)
    {
        var part = await _db.Parts.FindAsync(id);
        if (part == null) return (false, false);

        // Enforce SKU uniqueness when changing to a new non-empty SKU
        if (!string.IsNullOrWhiteSpace(req.Sku) && req.Sku != part.Sku &&
            await _db.Parts.AnyAsync(p => p.Sku == req.Sku && p.Id != id))
            return (true, true);

        if (req.Name        != null)  part.Name        = req.Name;
        if (req.Sku         != null)  part.Sku         = req.Sku;
        if (req.Category    != null)  part.Category    = req.Category;
        if (req.Price.HasValue)       part.Price       = req.Price.Value;
        if (req.VendorId.HasValue)    part.VendorId    = req.VendorId.Value;
        if (req.MinQuantity.HasValue) part.MinQuantity = req.MinQuantity.Value;
        if (req.Unit        != null)  part.Unit        = req.Unit;

        if (req.Quantity.HasValue && req.Quantity.Value != part.Quantity)
        {
            part.Quantity     = req.Quantity.Value;
            part.LastRestocked = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        _cache.Remove(CacheKey);
        return (true, false);
    }

    public async Task<(bool found, bool inUse)> DeleteAsync(int id)
    {
        var part = await _db.Parts.FindAsync(id);
        if (part == null) return (false, false);

        // Prevent deletion if the part appears in any sales or purchase orders
        bool inUse = await _db.SaleItems.AnyAsync(si => si.PartId == id)
                  || await _db.PurchaseOrderItems.AnyAsync(poi => poi.PartId == id);
        if (inUse) return (true, true);

        _db.Parts.Remove(part);
        await _db.SaveChangesAsync();
        _cache.Remove(CacheKey);
        return (true, false);
    }

    private static PartResponse MapToResponse(Part p) => new()
    {
        Id            = p.Id,
        Name          = p.Name,
        Sku           = p.Sku,
        Category      = p.Category,
        Price         = p.Price,
        Quantity      = p.Quantity,
        VendorId      = p.VendorId,
        VendorName    = p.Vendor?.Name ?? string.Empty,
        MinQuantity   = p.MinQuantity,
        Unit          = p.Unit,
        LastRestocked = p.LastRestocked,
        IsLowStock    = p.Quantity < p.MinQuantity
    };
}
