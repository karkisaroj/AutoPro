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
    private readonly IReportPdfService _pdf;

    public ReportsController(AppDbContext db, IEmailService email, IReportPdfService pdf)
    {
        _db = db;
        _email = email;
        _pdf = pdf;
    }

    [HttpGet("financial")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetFinancialReport(
        [FromQuery] string period = "monthly",
        [FromQuery] int? year = null,
        [FromQuery] int? month = null)
    {
        year  ??= DateTime.UtcNow.Year;
        month ??= DateTime.UtcNow.Month;
        return Ok(await BuildFinancialDataAsync(period, year.Value, month.Value));
    }

    [HttpGet("financial/pdf")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetFinancialReportPdf(
        [FromQuery] string period = "monthly",
        [FromQuery] int? year = null,
        [FromQuery] int? month = null)
    {
        year  ??= DateTime.UtcNow.Year;
        month ??= DateTime.UtcNow.Month;

        var data = await BuildFinancialDataAsync(period, year.Value, month.Value);
        var pdfBytes = _pdf.GenerateFinancialReport(data, period, year.Value, month);

        var tag = period.ToLower() switch
        {
            "daily"   => $"daily-{year}-{month:D2}-{DateTime.UtcNow.Day:D2}",
            "monthly" => $"monthly-{year}-{month:D2}",
            _         => $"yearly-{year}"
        };

        return File(pdfBytes, "application/pdf", $"autopro-financial-report-{tag}.pdf");
    }

    // ── Shared data builder ──────────────────────────────────────────────────
    private async Task<FinancialReportResponse> BuildFinancialDataAsync(string period, int year, int month)
    {
        // 1. Period-scoped sales
        IQueryable<Models.Sale> salesQ = _db.Sales;
        IQueryable<Models.PurchaseOrder> poQ = _db.PurchaseOrders.Where(po => po.Status == "Received");

        if (period == "daily")
        {
            int today = DateTime.UtcNow.Day;
            salesQ = salesQ.Where(s => s.Date.Year == year && s.Date.Month == month && s.Date.Day == today);
            poQ    = poQ.Where(po => po.Date.Year == year && po.Date.Month == month && po.Date.Day == today);
        }
        else if (period == "monthly")
        {
            salesQ = salesQ.Where(s => s.Date.Year == year && s.Date.Month == month);
            poQ    = poQ.Where(po => po.Date.Year == year && po.Date.Month == month);
        }
        else // yearly
        {
            salesQ = salesQ.Where(s => s.Date.Year == year);
            poQ    = poQ.Where(po => po.Date.Year == year);
        }

        var sales        = await salesQ.ToListAsync();
        var totalRevenue = sales.Where(s => s.Status == "Paid").Sum(s => s.Total);
        var totalExpenses = await poQ.SumAsync(po => po.Total);

        // 2. Month-over-month revenue change
        var prevMonth   = month == 1 ? 12 : month - 1;
        var prevYear    = month == 1 ? year - 1 : year;
        var prevRevenue = await _db.Sales
            .Where(s => s.Date.Year == prevYear && s.Date.Month == prevMonth && s.Status == "Paid")
            .SumAsync(s => s.Total);
        var momChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

        // 3. Per-date breakdown for the table
        var dailyBreakdown = sales
            .Where(s => s.Status == "Paid")
            .GroupBy(s => s.Date.Date)
            .Select(g => new DailyRevenueEntry
            {
                Date     = g.Key,
                Revenue  = g.Sum(s => s.Total),
                Invoices = g.Count()
            })
            .OrderBy(e => e.Date)
            .ToList();

        // 4. Monthly trend — always last 6 calendar months (for the bar chart)
        var sixMonthsAgo = new DateTime(
            DateTime.UtcNow.AddMonths(-5).Year,
            DateTime.UtcNow.AddMonths(-5).Month,
            1, 0, 0, 0, DateTimeKind.Utc);

        var trendSales = await _db.Sales
            .Where(s => s.Date >= sixMonthsAgo && s.Status == "Paid")
            .GroupBy(s => new { s.Date.Year, s.Date.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Revenue = g.Sum(s => s.Total) })
            .ToListAsync();

        var trendPOs = await _db.PurchaseOrders
            .Where(po => po.Date >= sixMonthsAgo && po.Status == "Received")
            .GroupBy(po => new { po.Date.Year, po.Date.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Expenses = g.Sum(po => po.Total) })
            .ToListAsync();

        var monthlyTrend = Enumerable.Range(0, 6)
            .Select(i => DateTime.UtcNow.AddMonths(-5 + i))
            .Select(d => new MonthlyTrendEntry
            {
                Month    = d.ToString("MMM"),
                Revenue  = trendSales.FirstOrDefault(s => s.Year == d.Year && s.Month == d.Month)?.Revenue  ?? 0,
                Expenses = trendPOs.FirstOrDefault(p => p.Year == d.Year && p.Month == d.Month)?.Expenses ?? 0
            })
            .ToList();

        // 5. Service breakdown by Part category
        var paidIds  = sales.Where(s => s.Status == "Paid").Select(s => s.Id).ToList();
        var saleItems = await _db.SaleItems
            .Include(si => si.Part)
            .Where(si => paidIds.Contains(si.SaleId))
            .ToListAsync();

        var serviceGroups = saleItems
            .GroupBy(si => si.Part.Category)
            .Select(g => new ServiceBreakdownEntry
            {
                Service = g.Key,
                Count   = g.Select(si => si.SaleId).Distinct().Count(),
                Revenue = g.Sum(si => si.LineTotal)
            })
            .OrderByDescending(s => s.Revenue)
            .ToList();

        var totalSvcRev = serviceGroups.Sum(s => s.Revenue);
        foreach (var s in serviceGroups)
            s.Pct = totalSvcRev > 0 ? Math.Round((s.Revenue / totalSvcRev) * 100, 1) : 0;

        return new FinancialReportResponse
        {
            TotalRevenue         = totalRevenue,
            TotalExpenses        = totalExpenses,
            NetProfit            = totalRevenue - totalExpenses,
            InvoicesIssued       = sales.Count,
            AverageInvoiceValue  = sales.Count > 0 ? totalRevenue / sales.Count : 0,
            MonthOverMonthChange = momChange,
            DailyBreakdown       = dailyBreakdown,
            MonthlyTrend         = monthlyTrend,
            ServiceBreakdown     = serviceGroups
        };
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
                Name       = c.Name,
                TotalSpent = c.TotalSpent,
                Visits     = c.Visits,
                Tier       = c.Tier
            })
            .ToListAsync();

        var loyaltyTiers = await _db.Customers
            .GroupBy(c => c.Tier)
            .Select(g => new LoyaltyTierSummary
            {
                Tier  = g.Key,
                Count = g.Count()
            })
            .ToListAsync();

        var oneMonthAgo = DateTime.UtcNow.AddMonths(-1);
        var overdueCredits = await _db.Sales
            .Include(s => s.Customer)
            .Where(s => s.Status == "Pending" && s.Date <= oneMonthAgo)
            .Select(s => new OverdueCreditEntry
            {
                CustomerId  = s.CustomerId,
                Name        = s.Customer.Name,
                Phone       = s.Customer.Phone,
                AmountDue   = s.Total,
                SaleDate    = s.Date,
                DaysOverdue = (int)(DateTime.UtcNow - s.Date).TotalDays
            })
            .ToListAsync();

        return Ok(new CustomerReportResponse
        {
            TopSpenders    = topSpenders,
            LoyaltyTiers   = loyaltyTiers,
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
                Id          = p.Id,
                Name        = p.Name,
                Category    = p.Category,
                Quantity    = p.Quantity,
                MinQuantity = p.MinQuantity,
                VendorName  = p.Vendor.Name
            })
            .ToListAsync();

        return Ok(parts);
    }
}
