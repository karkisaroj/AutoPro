using AutoProBackend.DTOs;
using AutoProBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoProBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Staff")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reports;
    private readonly IReportPdfService _pdf;

    public ReportsController(IReportService reports, IReportPdfService pdf)
    {
        _reports = reports;
        _pdf = pdf;
    }

    [HttpGet("financial")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetFinancialReport(
        [FromQuery] string period = "monthly",
        [FromQuery] int? year = null,
        [FromQuery] int? month = null)
    {
        var y = year ?? DateTime.UtcNow.Year;
        var m = month ?? DateTime.UtcNow.Month;
        return Ok(await _reports.GetFinancialReportAsync(period, y, m));
    }

    [HttpGet("financial/pdf")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetFinancialReportPdf(
        [FromQuery] string period = "monthly",
        [FromQuery] int? year = null,
        [FromQuery] int? month = null)
    {
        var y = year ?? DateTime.UtcNow.Year;
        var m = month ?? DateTime.UtcNow.Month;

        var data = await _reports.GetFinancialReportAsync(period, y, m);
        var pdfBytes = _pdf.GenerateFinancialReport(data, period, y, month);

        var tag = period.ToLower() switch
        {
            "daily"   => $"daily-{y}-{m:D2}-{DateTime.UtcNow.Day:D2}",
            "monthly" => $"monthly-{y}-{m:D2}",
            _         => $"yearly-{y}"
        };

        return File(pdfBytes, "application/pdf", $"autopro-financial-report-{tag}.pdf");
    }

    [HttpGet("customers")]
    public async Task<IActionResult> GetCustomerReport() =>
        Ok(await _reports.GetCustomerReportAsync());

    [HttpPost("send-overdue-reminders")]
    public async Task<IActionResult> SendOverdueReminders()
    {
        try
        {
            var sent = await _reports.SendOverdueRemindersAsync();
            return Ok(new { sent, message = $"{sent} reminder email(s) sent" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPost("send-low-stock-alert")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SendLowStockAlert()
    {
        try
        {
            var count = await _reports.SendLowStockAlertAsync();
            return Ok(new { count, message = count > 0 ? $"Low stock alert sent for {count} part(s)" : "No low-stock parts found" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("low-stock")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetLowStockAlert() =>
        Ok(await _reports.GetLowStockAlertAsync());
}
