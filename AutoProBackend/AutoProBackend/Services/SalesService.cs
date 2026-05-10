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
            .Include(s => s.Customer).ThenInclude(c => c.User)
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
            .Include(s => s.Customer).ThenInclude(c => c.User)
            .Include(s => s.Staff)
            .Include(s => s.Items).ThenInclude(i => i.Part)
            .FirstOrDefaultAsync(s => s.Id == id);
        return sale == null ? null : MapToResponse(sale);
    }

    public async Task<List<SaleResponse>> GetByCustomerAsync(int customerId) =>
        await _db.Sales
            .Include(s => s.Customer).ThenInclude(c => c.User)
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
        decimal loyaltyDiscount = subtotal >= 5000 ? subtotal * 0.10m : 0;
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

    public async Task<string?> SendInvoiceEmailAsync(int id)
    {
        var sale = await _db.Sales
            .Include(s => s.Customer).ThenInclude(c => c.User)
            .Include(s => s.Staff)
            .Include(s => s.Items)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (sale == null) return null;

        var email = sale.Customer?.User?.Email;
        if (string.IsNullOrWhiteSpace(email)) return null;

        var itemRows = string.Join("", sale.Items.Select((i, idx) =>
        {
            var bg = idx % 2 == 0 ? "#ffffff" : "#faf5ff";
            return $"<tr style='background:{bg};'>" +
                   $"<td style='padding:12px 16px;font-size:14px;color:#1f2937;border-bottom:1px solid #f3f4f6;'>{i.PartName}</td>" +
                   $"<td style='padding:12px 16px;text-align:center;font-size:14px;color:#6b7280;border-bottom:1px solid #f3f4f6;'>{i.Quantity}</td>" +
                   $"<td style='padding:12px 16px;text-align:right;font-size:14px;color:#6b7280;border-bottom:1px solid #f3f4f6;'>NPR {i.UnitPrice:N0}</td>" +
                   $"<td style='padding:12px 16px;text-align:right;font-size:14px;font-weight:700;color:#7c3aed;border-bottom:1px solid #f3f4f6;'>NPR {i.LineTotal:N0}</td>" +
                   $"</tr>";
        }));

        var customerFirstName = sale.Customer?.Name?.Split(' ')[0] ?? "Valued Customer";
        var loyaltyRow = sale.LoyaltyDiscount > 0
            ? $"<tr><td style='padding:6px 12px;color:#059669;'>Loyalty Discount (10%)</td><td style='padding:6px 12px;text-align:right;color:#059669;'>- NPR {sale.LoyaltyDiscount:N0}</td></tr>"
            : "";

        var body = $@"
<!DOCTYPE html>
<html>
<head><meta charset='utf-8'/></head>
<body style='margin:0;padding:0;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif;'>
  <table width='100%' cellpadding='0' cellspacing='0' style='background:#f4f4f7;padding:32px 0;'>
    <tr><td align='center'>
      <table width='600' cellpadding='0' cellspacing='0' style='background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);'>

        <!-- Header -->
        <tr>
          <td style='background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:32px 40px;'>
            <table width='100%' cellpadding='0' cellspacing='0'>
              <tr>
                <td>
                  <p style='margin:0;font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;'>AutoPro Garage</p>
                  <p style='margin:4px 0 0;font-size:12px;color:#ddd6fe;text-transform:uppercase;letter-spacing:2px;'>Professional Auto Services</p>
                </td>
                <td align='right'>
                  <p style='margin:0;font-size:13px;color:#ede9fe;font-weight:600;'>INVOICE</p>
                  <p style='margin:2px 0 0;font-size:22px;font-weight:900;color:#ffffff;'>#{sale.Id:D5}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Invoice meta -->
        <tr>
          <td style='background:#faf5ff;padding:20px 40px;border-bottom:1px solid #ede9fe;'>
            <table width='100%' cellpadding='0' cellspacing='0'>
              <tr>
                <td>
                  <p style='margin:0;font-size:11px;color:#7c3aed;font-weight:700;text-transform:uppercase;letter-spacing:1px;'>Billed To</p>
                  <p style='margin:4px 0 0;font-size:15px;font-weight:700;color:#1f2937;'>{sale.Customer?.Name}</p>
                  <p style='margin:2px 0 0;font-size:13px;color:#6b7280;'>{email}</p>
                </td>
                <td align='right'>
                  <p style='margin:0;font-size:11px;color:#7c3aed;font-weight:700;text-transform:uppercase;letter-spacing:1px;'>Invoice Date</p>
                  <p style='margin:4px 0 0;font-size:14px;font-weight:600;color:#1f2937;'>{sale.Date:dd MMM yyyy}</p>
                  <p style='margin:8px 0 0;font-size:11px;color:#7c3aed;font-weight:700;text-transform:uppercase;letter-spacing:1px;'>Served By</p>
                  <p style='margin:4px 0 0;font-size:14px;font-weight:600;color:#1f2937;'>{sale.Staff?.Name ?? "Staff"}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style='padding:28px 40px 12px;'>
            <p style='margin:0;font-size:15px;color:#374151;'>Dear <strong>{customerFirstName}</strong>,</p>
            <p style='margin:10px 0 0;font-size:14px;color:#6b7280;line-height:1.6;'>Thank you for visiting AutoPro Garage. Please find your invoice details below.</p>
          </td>
        </tr>

        <!-- Items table -->
        <tr>
          <td style='padding:12px 40px 0;'>
            <table width='100%' cellpadding='0' cellspacing='0' style='border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;'>
              <thead>
                <tr style='background:#7c3aed;'>
                  <th style='padding:12px 16px;text-align:left;font-size:12px;color:#ffffff;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;'>Description</th>
                  <th style='padding:12px 16px;text-align:center;font-size:12px;color:#ffffff;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;'>Qty</th>
                  <th style='padding:12px 16px;text-align:right;font-size:12px;color:#ffffff;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;'>Unit Price</th>
                  <th style='padding:12px 16px;text-align:right;font-size:12px;color:#ffffff;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;'>Amount</th>
                </tr>
              </thead>
              <tbody>
                {itemRows}
              </tbody>
            </table>
          </td>
        </tr>

        <!-- Totals -->
        <tr>
          <td style='padding:0 40px 12px;'>
            <table width='100%' cellpadding='0' cellspacing='0' style='margin-top:16px;'>
              <tr><td style='padding:6px 12px;color:#6b7280;font-size:14px;'>Subtotal</td><td style='padding:6px 12px;text-align:right;color:#374151;font-size:14px;'>NPR {sale.Subtotal:N0}</td></tr>
              {loyaltyRow}
              <tr><td style='padding:6px 12px;color:#6b7280;font-size:14px;'>VAT (13%)</td><td style='padding:6px 12px;text-align:right;color:#374151;font-size:14px;'>NPR {sale.Tax:N0}</td></tr>
              <tr style='border-top:2px solid #7c3aed;'>
                <td style='padding:14px 12px;font-size:16px;font-weight:900;color:#1f2937;'>Grand Total</td>
                <td style='padding:14px 12px;text-align:right;font-size:18px;font-weight:900;color:#7c3aed;'>NPR {sale.Total:N0}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Payment badge -->
        <tr>
          <td style='padding:0 40px 28px;'>
            <span style='display:inline-block;background:#ede9fe;color:#7c3aed;font-size:12px;font-weight:700;padding:6px 14px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;'>
              Payment: {sale.PaymentMethod}
            </span>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style='background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;'>
            <p style='margin:0;font-size:14px;font-weight:700;color:#374151;'>Thank you for choosing AutoPro Garage!</p>
            <p style='margin:6px 0 0;font-size:12px;color:#9ca3af;'>Questions? Contact us at autopro@gmail.com</p>
            <p style='margin:12px 0 0;font-size:11px;color:#d1d5db;'>AutoPro Garage · Kathmandu, Nepal</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>";

        await _email.SendAsync(email, $"AutoPro Invoice #{sale.Id}", body);
        return email;
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
        CustomerEmail = s.Customer?.User?.Email ?? string.Empty,
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
