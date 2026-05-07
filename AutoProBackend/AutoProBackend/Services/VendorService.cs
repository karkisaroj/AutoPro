using AutoProBackend.Data;
using AutoProBackend.DTOs;
using AutoProBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace AutoProBackend.Services;

public class VendorService : IVendorService
{
    private readonly AppDbContext _db;
    public VendorService(AppDbContext db) => _db = db;

    public async Task<List<VendorResponse>> GetAllAsync(bool? activeOnly)
    {
        var query = _db.Vendors.AsQueryable();
        if (activeOnly == true)
            query = query.Where(v => v.IsActive);
        return await query.Select(v => MapToResponse(v)).ToListAsync();
    }

    public async Task<VendorResponse?> GetByIdAsync(int id)
    {
        var vendor = await _db.Vendors.FindAsync(id);
        return vendor == null ? null : MapToResponse(vendor);
    }

    public async Task<VendorResponse> CreateAsync(CreateVendorRequest req)
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
        return MapToResponse(vendor);
    }

    public async Task<bool> UpdateAsync(int id, UpdateVendorRequest req)
    {
        var vendor = await _db.Vendors.FindAsync(id);
        if (vendor == null) return false;

        if (req.Name != null) vendor.Name = req.Name;
        if (req.ContactPerson != null) vendor.ContactPerson = req.ContactPerson;
        if (req.Phone != null) vendor.Phone = req.Phone;
        if (req.Email != null) vendor.Email = req.Email;
        if (req.Address != null) vendor.Address = req.Address;
        if (req.Category != null) vendor.Category = req.Category;
        if (req.PaymentTerms != null) vendor.PaymentTerms = req.PaymentTerms;

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var vendor = await _db.Vendors.FindAsync(id);
        if (vendor == null) return false;

        _db.Vendors.Remove(vendor);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool?> ToggleStatusAsync(int id)
    {
        var vendor = await _db.Vendors.FindAsync(id);
        if (vendor == null) return null;

        vendor.IsActive = !vendor.IsActive;
        await _db.SaveChangesAsync();
        return vendor.IsActive;
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
