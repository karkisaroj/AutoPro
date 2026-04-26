using AutoProBackend.Data;
using AutoProBackend.DTOs;
using AutoProBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AutoProBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SalesController : ControllerBase
{
    private readonly AppDbContext _db;

    public SalesController(AppDbContext db) => _db = db;

    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var query = _db.Sales
            .Include(s => s.Customer)
            .Include(s => s.Staff)
            .Include(s => s.Items)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status)) query = query.Where(s => s.Status == status);
        if (from.HasValue) query = query.Where(s => s.Date >= from.Value);
        if (to.HasValue) query = query.Where(s => s.Date <= to.Value);

        var sales = await query.OrderByDescending(s => s.Date).Select(s => MapToResponse(s)).ToListAsync();
        return Ok(sales);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var sale = await _db.Sales
            .Include(s => s.Customer)
            .Include(s => s.Staff)
            .Include(s => s.Items).ThenInclude(i => i.Part)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (sale == null) return NotFound();

        if (User.IsInRole("Customer"))
        {
            var customerId = GetCustomerIdFromToken();
            if (sale.CustomerId != customerId) return Forbid();
        }

        return Ok(MapToResponse(sale));
    }

    [HttpGet("customer/{customerId}")]
    public async Task<IActionResult> GetByCustomer(int customerId)
    {
        if (User.IsInRole("Customer"))
        {
            var myId = GetCustomerIdFromToken();
            if (myId != customerId) return Forbid();
        }

        var sales = await _db.Sales
            .Include(s => s.Customer)
            .Include(s => s.Staff)
            .Include(s => s.Items)
            .Where(s => s.CustomerId == customerId)
            .OrderByDescending(s => s.Date)
            .Select(s => MapToResponse(s))
            .ToListAsync();

        return Ok(sales);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Create([FromBody] CreateSaleRequest req)
    {
        var customer = await _db.Customers.FindAsync(req.CustomerId);
        if (customer == null) return BadRequest(new { message = "Customer not found" });

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        var staff = await _db.Staff.FirstOrDefaultAsync(s => s.UserId == userId);
        if (staff == null) return Forbid();

        // Validate and load parts
        var partIds = req.Items.Select(i => i.PartId).ToList();
        var parts = await _db.Parts.Where(p => partIds.Contains(p.Id)).ToListAsync();

        if (parts.Count != partIds.Count)
            return BadRequest(new { message = "One or more parts not found" });

        foreach (var item in req.Items)
        {
            var part = parts.First(p => p.Id == item.PartId);
            if (part.Quantity < item.Quantity)
                return BadRequest(new { message = $"Insufficient stock for '{part.Name}'. Available: {part.Quantity}" });
        }

        // Build sale items
        var saleItems = req.Items.Select(item =>
        {
            var part = parts.First(p => p.Id == item.PartId);
            return new SaleItem
            {
                PartId = item.PartId,
                PartName = part.Name,
                Quantity = item.Quantity,
                UnitPrice = part.Price,
                LineTotal = part.Price * item.Quantity
            };
        }).ToList();

        decimal subtotal = saleItems.Sum(i => i.LineTotal);
        decimal loyaltyDiscount = subtotal > 5000 ? subtotal * 0.10m : 0; // 10% discount for >5000
        decimal tax = (subtotal - loyaltyDiscount) * 0.13m; // 13% VAT Nepal
        decimal total = subtotal - loyaltyDiscount + tax;
        int pointsAwarded = (int)(total * 0.01m);

        var sale = new Sale
        {
            CustomerId = req.CustomerId,
            StaffId = staff.Id,
            Subtotal = subtotal,
            LoyaltyDiscount = loyaltyDiscount,
            Tax = tax,
            Total = total,
            PaymentMethod = req.PaymentMethod,
            LoyaltyPointsAwarded = pointsAwarded,
            Items = saleItems
        };

        _db.Sales.Add(sale);

        // Deduct stock
        foreach (var item in req.Items)
        {
            var part = parts.First(p => p.Id == item.PartId);
            part.Quantity -= item.Quantity;
        }

        // Update customer totals
        customer.TotalSpent += total;
        customer.LoyaltyPoints += pointsAwarded;
        customer.Visits += 1;
        customer.Tier = CalculateTier(customer.TotalSpent);

        await _db.SaveChangesAsync();

        await _db.Entry(sale).Reference(s => s.Customer).LoadAsync();
        await _db.Entry(sale).Reference(s => s.Staff).LoadAsync();

        return Created($"/api/sales/{sale.Id}", MapToResponse(sale));
    }

    private static string CalculateTier(decimal totalSpent) => totalSpent switch
    {
        >= 100000 => "Platinum",
        >= 50000 => "Gold",
        >= 20000 => "Silver",
        _ => "Bronze"
    };

    private int? GetCustomerIdFromToken()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        return _db.Customers.FirstOrDefault(c => c.UserId == userId)?.Id;
    }

    private static SaleResponse MapToResponse(Sale s) => new()
    {
        Id = s.Id,
        CustomerId = s.CustomerId,
        CustomerName = s.Customer?.Name ?? string.Empty,
        StaffId = s.StaffId,
        StaffName = s.Staff?.Name ?? string.Empty,
        Date = s.Date,
        Subtotal = s.Subtotal,
        LoyaltyDiscount = s.LoyaltyDiscount,
        Tax = s.Tax,
        Total = s.Total,
        PaymentMethod = s.PaymentMethod,
        Status = s.Status,
        LoyaltyPointsAwarded = s.LoyaltyPointsAwarded,
        Items = s.Items?.Select(i => new SaleItemResponse
        {
            Id = i.Id,
            PartId = i.PartId,
            PartName = i.PartName,
            Quantity = i.Quantity,
            UnitPrice = i.UnitPrice,
            LineTotal = i.LineTotal
        }).ToList() ?? new()
    };
}
