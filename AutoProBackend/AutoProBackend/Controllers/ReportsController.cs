using AutoProBackend.Data;
using AutoProBackend.DTOs;
using AutoProBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoProBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Staff")]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IEmailService _email;

    public ReportsController(AppDbContext db, IEmailService email)
    {
        _db = db;
        _email = email;
    }

    [HttpGet("financial")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetFinancialReport(
        [FromQuery] string period = "monthly",
        [FromQuery] int? year = null,
        [FromQuery] int? month = null)
    {
        year ??= DateTime.UtcNow.Year;
        month ??= DateTime.UtcNow.Month;

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

        // Previous period for MoM change
        var prevMonth = month == 1 ? 12 : month.Value - 1;
        var prevYear = month == 1 ? year.Value - 1 : year.Value;
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

        return Ok(new FinancialReportResponse
        {
            TotalRevenue = totalRevenue,
            TotalExpenses = totalExpenses,
            NetProfit = totalRevenue - totalExpenses,
            InvoicesIssued = sales.Count,
            AverageInvoiceValue = sales.Count > 0 ? totalRevenue / sales.Count : 0,
            MonthOverMonthChange = momChange,
            DailyBreakdown = dailyBreakdown
        });
    }

    [HttpGet("customers")]
    public async Task<IActionResult> GetCustomerReport()
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

        return Ok(new CustomerReportResponse
        {
            TopSpenders = topSpenders,
            LoyaltyTiers = loyaltyTiers,
            OverdueCredits = overdueCredits
        });
    }

    [HttpPost("send-overdue-reminders")]
    public async Task<IActionResult> SendOverdueReminders()
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

        return Ok(new { sent, message = $"{sent} reminder email(s) sent" });
    }

    [HttpGet("low-stock")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetLowStockAlert()
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
}
