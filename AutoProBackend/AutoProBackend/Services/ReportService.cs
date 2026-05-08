using AutoProBackend.Data;
using AutoProBackend.DTOs;
using Microsoft.EntityFrameworkCore;

namespace AutoProBackend.Services;

public class ReportService : IReportService
{
    private readonly AppDbContext _db;
    private readonly IEmailService _email;
    private readonly IConfiguration _config;

    public ReportService(AppDbContext db, IEmailService email, IConfiguration config)
    {
        _db = db;
        _email = email;
        _config = config;
    }

    public async Task<FinancialReportResponse> GetFinancialReportAsync(string period, int year, int month)
    {
        IQueryable<Models.Sale> query = _db.Sales;

        if (period == "daily")
            query = query.Where(s => s.Date.Year == year && s.Date.Month == month && s.Date.Day == DateTime.UtcNow.Day);
        else if (period == "monthly")
            query = query.Where(s => s.Date.Year == year && s.Date.Month == month);
        else
            query = query.Where(s => s.Date.Year == year);

        var sales = await query.ToListAsync();
        var totalRevenue = sales.Where(s => s.Status == "Paid").Sum(s => s.Total);
        var totalExpenses = await _db.PurchaseOrders
            .Where(po => po.Status == "Received" && po.Date.Year == year)
            .SumAsync(po => po.Total);

        var prevMonth = month == 1 ? 12 : month - 1;
        var prevYear = month == 1 ? year - 1 : year;
        var prevRevenue = await _db.Sales
            .Where(s => s.Date.Year == prevYear && s.Date.Month == prevMonth && s.Status == "Paid")
            .SumAsync(s => s.Total);

        var momChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

        var dailyBreakdown = sales
            .Where(s => s.Status == "Paid")
            .GroupBy(s => s.Date.Date)
            .Select(g => new DailyRevenueEntry
            {
                Date = g.Key,
                Revenue = g.Sum(s => s.Total),
                Invoices = g.Count()
            })
            .OrderBy(e => e.Date)
            .ToList();

        return new FinancialReportResponse
        {
            TotalRevenue = totalRevenue,
            TotalExpenses = totalExpenses,
            NetProfit = totalRevenue - totalExpenses,
            InvoicesIssued = sales.Count,
            AverageInvoiceValue = sales.Count > 0 ? totalRevenue / sales.Count : 0,
            MonthOverMonthChange = momChange,
            DailyBreakdown = dailyBreakdown
        };
    }

    public async Task<CustomerReportResponse> GetCustomerReportAsync()
    {
        var topSpenders = await _db.Customers
            .OrderByDescending(c => c.TotalSpent)
            .Take(10)
            .Select(c => new TopSpenderEntry
            {
                CustomerId = c.Id,
                Name = c.Name,
                TotalSpent = c.TotalSpent,
                Visits = c.Visits,
                Tier = c.Tier
            })
            .ToListAsync();

        var loyaltyTiers = await _db.Customers
            .GroupBy(c => c.Tier)
            .Select(g => new LoyaltyTierSummary
            {
                Tier = g.Key,
                Count = g.Count()
            })
            .ToListAsync();

        var oneMonthAgo = DateTime.UtcNow.AddMonths(-1);
        var overdueCredits = await _db.Sales
            .Include(s => s.Customer)
            .Where(s => s.Status == "Pending" && s.Date <= oneMonthAgo)
            .Select(s => new OverdueCreditEntry
            {
                CustomerId = s.CustomerId,
                Name = s.Customer.Name,
                Phone = s.Customer.Phone,
                AmountDue = s.Total,
                SaleDate = s.Date,
                DaysOverdue = (int)(DateTime.UtcNow - s.Date).TotalDays
            })
            .ToListAsync();

        return new CustomerReportResponse
        {
            TopSpenders = topSpenders,
            LoyaltyTiers = loyaltyTiers,
            OverdueCredits = overdueCredits
        };
    }

    public async Task<int> SendOverdueRemindersAsync()
    {
        var cutoff = DateTime.UtcNow.AddDays(-30);
        var overdue = await _db.Sales
            .Include(s => s.Customer).ThenInclude(c => c.User)
            .Where(s => s.Status == "Pending" && s.Date <= cutoff)
            .ToListAsync();

        int sent = 0;
        foreach (var sale in overdue)
        {
            var email = sale.Customer?.User?.Email;
            if (string.IsNullOrWhiteSpace(email)) continue;

            var daysOverdue = (int)(DateTime.UtcNow - sale.Date).TotalDays;
            var body = $@"
<html><body style='font-family:Arial,sans-serif;color:#333'>
<h2 style='color:#dc2626'>AutoPro Garage — Payment Reminder</h2>
<p>Dear {sale.Customer?.Name},</p>
<p>This is a reminder that your payment of <strong>NPR {sale.Total:N0}</strong> for Invoice #{sale.Id}
is overdue by <strong>{daysOverdue} days</strong>.</p>
<p>Please contact us at AutoPro Garage, Kathmandu to settle your balance at your earliest convenience.</p>
<p>Thank you.</p>
</body></html>";

            await _email.SendAsync(email, "AutoPro Garage — Payment Reminder", body);
            sent++;
        }

        return sent;
    }

    public async Task<List<LowStockPartResponse>> GetLowStockAlertAsync() =>
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

    public async Task<int> SendLowStockAlertAsync()
    {
        var lowStock = await _db.Parts
            .Include(p => p.Vendor)
            .Where(p => p.Quantity < 10)
            .ToListAsync();

        if (lowStock.Count == 0) return 0;

        var adminEmail = _config["Email:AdminEmail"];
        if (string.IsNullOrWhiteSpace(adminEmail)) return 0;

        var rows = string.Join("", lowStock.Select(p =>
            $"<tr><td>{p.Name}</td><td>{p.Category}</td><td style='color:red;font-weight:bold'>{p.Quantity}</td><td>{p.MinQuantity}</td><td>{p.Vendor?.Name}</td></tr>"));

        var body = $@"
<html><body style='font-family:Arial,sans-serif;color:#333'>
<h2 style='color:#dc2626'>AutoPro Garage &mdash; Low Stock Alert</h2>
<p>The following {lowStock.Count} part(s) are below the minimum threshold (10 units) and require restocking:</p>
<table border='1' cellpadding='8' cellspacing='0' style='border-collapse:collapse;width:100%'>
  <thead style='background:#fee2e2'><tr><th>Part Name</th><th>Category</th><th>Current Qty</th><th>Min Qty</th><th>Vendor</th></tr></thead>
  <tbody>{rows}</tbody>
</table>
<br/><p>Please raise a purchase order at your earliest convenience.</p>
<p>&mdash; AutoPro Garage System</p>
</body></html>";

        await _email.SendAsync(adminEmail, "AutoPro Garage — Low Stock Alert", body);
        return lowStock.Count;
    }
}
