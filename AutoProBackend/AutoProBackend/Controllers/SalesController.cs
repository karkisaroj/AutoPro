using AutoProBackend.DTOs;
using AutoProBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AutoProBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SalesController : ControllerBase
{
    private readonly ISalesService _sales;
    private readonly ICustomerService _customers;
    private readonly IReportPdfService _pdf;

    public SalesController(ISalesService sales, ICustomerService customers, IReportPdfService pdf)
    {
        _sales = sales;
        _customers = customers;
        _pdf = pdf;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] DateTime? from, [FromQuery] DateTime? to) =>
        Ok(await _sales.GetAllAsync(status, from, to));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var sale = await _sales.GetByIdAsync(id);
        if (sale == null) return NotFound();

        if (User.IsInRole("Customer") && sale.CustomerId != await GetCustomerIdFromToken())
            return Forbid();

        return Ok(sale);
    }

    [HttpGet("customer/{customerId}")]
    public async Task<IActionResult> GetByCustomer(int customerId)
    {
        if (User.IsInRole("Customer") && await GetCustomerIdFromToken() != customerId)
            return Forbid();

        return Ok(await _sales.GetByCustomerAsync(customerId));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Create([FromBody] CreateSaleRequest req)
    {
        var staffUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        var (response, errorMessage, forbidden) = await _sales.CreateAsync(req, staffUserId);

        if (forbidden) return Forbid();
        if (errorMessage != null) return BadRequest(new { message = errorMessage });
        return Created($"/api/sales/{response!.Id}", response);
    }

    [HttpGet("{id}/pdf")]
    public async Task<IActionResult> GetInvoicePdf(int id)
    {
        var sale = await _sales.GetByIdAsync(id);
        if (sale == null) return NotFound();

        if (User.IsInRole("Customer") && sale.CustomerId != await GetCustomerIdFromToken())
            return Forbid();

        var pdfBytes = _pdf.GenerateSaleInvoice(sale);
        return File(pdfBytes, "application/pdf", $"autopro-invoice-{id}.pdf");
    }

    [HttpPost("{id}/send-email")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> SendInvoiceEmail(int id)
    {
        try
        {
            var sent = await _sales.SendInvoiceEmailAsync(id);
            if (!sent) return NotFound();
            return Ok(new { message = "Invoice email sent" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    private async Task<int?> GetCustomerIdFromToken()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        return await _customers.GetCustomerIdByUserIdAsync(userId);
    }
}
