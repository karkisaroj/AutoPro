using AutoProBackend.Data;
using AutoProBackend.DTOs;
using AutoProBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace AutoProBackend.Services;

public class SalesService : ISalesService
{
    private readonly AppDbContext _db;
    private readonly IEmailService _email;

    public SalesService(AppDbContext db, IEmailService email)
    {
        _db = db;
        _email = email;
    }

    public async Task<List<SaleResponse>> GetAllAsync(string? status, DateTime? from, DateTime? to)
    {
        var query = _db.Sales
            .Include(s => s.Customer)
            .Include(s => s.Staff)
            .Include(s => s.Items)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status)) query = query.Where(s => s.Status == status);
        if (from.HasValue) query = query.Where(s => s.Date >= from.Value);
        if (to.HasValue) query = query.Where(s => s.Date <= to.Value);

        return await query.OrderByDescending(s => s.Date).Select(s => MapToResponse(s)).ToListAsync();
    }

    public async Task<SaleResponse?> GetByIdAsync(int id)
    {
        var sale = await _db.Sales
            .Include(s => s.Customer)
            .Include(s => s.Staff)
            .Include(s => s.Items).ThenInclude(i => i.Part)
            .FirstOrDefaultAsync(s => s.Id == id);
        return sale == null ? null : MapToResponse(sale);
    }

    public async Task<List<SaleResponse>> GetByCustomerAsync(int customerId) =>
        await _db.Sales
            .Include(s => s.Customer)
            .Include(s => s.Staff)
            .Include(s => s.Items)
            .Where(s => s.CustomerId == customerId)
            .OrderByDescending(s => s.Date)
            .Select(s => MapToResponse(s))
            .ToListAsync();

    public async Task<(SaleResponse? response, string? errorMessage, bool forbidden)> CreateAsync(CreateSaleRequest req, int staffUserId)
    {
        var customer = await _db.Customers.FindAsync(req.CustomerId);
        if (customer == null)
            return (null, "Customer not found", false);

        var staff = await _db.Staff.FirstOrDefaultAsync(s => s.UserId == staffUserId);
        if (staff == null)
            return (null, null, true);

        var partIds = req.Items.Select(i => i.PartId).ToList();
        var parts = await _db.Parts.Where(p => partIds.Contains(p.Id)).ToListAsync();

        if (parts.Count != partIds.Count)
            return (null, "One or more parts not found", false);

        foreach (var item in req.Items)
        {
            var part = parts.First(p => p.Id == item.PartId);
            if (part.Quantity < item.Quantity)
                return (null, $"Insufficient stock for '{part.Name}'. Available: {part.Quantity}", false);
        }

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
        decimal loyaltyDiscount = subtotal > 5000 ? subtotal * 0.10m : 0;
        decimal tax = (subtotal - loyaltyDiscount) * 0.13m;
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

        foreach (var item in req.Items)
        {
            var part = parts.First(p => p.Id == item.PartId);
            part.Quantity -= item.Quantity;
        }

        customer.TotalSpent += total;
        customer.LoyaltyPoints += pointsAwarded;
        customer.Visits += 1;
        customer.Tier = CalculateTier(customer.TotalSpent);

        await _db.SaveChangesAsync();

        await _db.Entry(sale).Reference(s => s.Customer).LoadAsync();
        await _db.Entry(sale).Reference(s => s.Staff).LoadAsync();

        return (MapToResponse(sale), null, false);
    }

    public async Task<bool> SendInvoiceEmailAsync(int id)
    {
        var sale = await _db.Sales
            .Include(s => s.Customer).ThenInclude(c => c.User)
            .Include(s => s.Items)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (sale == null) return false;

        var email = sale.Customer?.User?.Email;
        if (string.IsNullOrWhiteSpace(email)) return false;

        var itemRows = string.Join("", sale.Items.Select(i =>
            $"<tr><td>{i.PartName}</td><td style='text-align:center'>{i.Quantity}</td><td>NPR {i.UnitPrice:N0}</td><td>NPR {i.LineTotal:N0}</td></tr>"));

        var body = $@"
<html><body style='font-family:Arial,sans-serif;color:#333'>
<h2 style='color:#7c3aed'>AutoPro Garage — Invoice #{sale.Id}</h2>
<p>Dear {sale.Customer?.Name},</p>
<p>Thank you for your visit. Here is your invoice summary:</p>
<table border='1' cellpadding='8' cellspacing='0' style='border-collapse:collapse;width:100%'>
  <thead style='background:#f3f4f6'><tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
  <tbody>{itemRows}</tbody>
</table>
<br/>
<p><strong>Subtotal:</strong> NPR {sale.Subtotal:N0}</p>
{(sale.LoyaltyDiscount > 0 ? $"<p><strong>Loyalty Discount (10%):</strong> -NPR {sale.LoyaltyDiscount:N0}</p>" : "")}
<p><strong>VAT (13%):</strong> NPR {sale.Tax:N0}</p>
<p style='font-size:1.1em'><strong>Grand Total:</strong> NPR {sale.Total:N0}</p>
<p><strong>Payment Method:</strong> {sale.PaymentMethod}</p>
<br/><p>Thank you for choosing AutoPro Garage!</p>
</body></html>";

        await _email.SendAsync(email, $"AutoPro Invoice #{sale.Id}", body);
        return true;
    }

    private static string CalculateTier(decimal totalSpent) => totalSpent switch
    {
        >= 100000 => "Platinum",
        >= 50000 => "Gold",
        >= 20000 => "Silver",
        _ => "Bronze"
    };

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
