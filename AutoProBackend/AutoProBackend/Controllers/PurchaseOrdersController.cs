using AutoProBackend.Data;
using AutoProBackend.DTOs;
using AutoProBackend.Models;
<<<<<<< HEAD
=======
using AutoProBackend.Services;
>>>>>>> noble
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoProBackend.Controllers;

[ApiController]
[Route("api/purchase-orders")]
[Authorize(Roles = "Admin")]
public class PurchaseOrdersController : ControllerBase
{
    private readonly AppDbContext _db;
<<<<<<< HEAD

    public PurchaseOrdersController(AppDbContext db) => _db = db;
=======
    private readonly IReportPdfService _pdf;

    public PurchaseOrdersController(AppDbContext db, IReportPdfService pdf)
    {
        _db  = db;
        _pdf = pdf;
    }
>>>>>>> noble

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status)
    {
        var query = _db.PurchaseOrders
            .Include(po => po.Vendor)
            .Include(po => po.Items)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(po => po.Status == status);

        var orders = await query.OrderByDescending(po => po.Date).Select(po => MapToResponse(po)).ToListAsync();
        return Ok(orders);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var order = await _db.PurchaseOrders
            .Include(po => po.Vendor)
            .Include(po => po.Items).ThenInclude(i => i.Part)
            .FirstOrDefaultAsync(po => po.Id == id);

        if (order == null) return NotFound();
        return Ok(MapToResponse(order));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePurchaseOrderRequest req)
    {
        if (!await _db.Vendors.AnyAsync(v => v.Id == req.VendorId && v.IsActive))
            return BadRequest(new { message = "Vendor not found or inactive" });

        var partIds = req.Items.Select(i => i.PartId).ToList();
        var parts = await _db.Parts.Where(p => partIds.Contains(p.Id)).ToListAsync();

        if (parts.Count != partIds.Count)
            return BadRequest(new { message = "One or more parts not found" });

        var orderItems = req.Items.Select(item =>
        {
            var part = parts.First(p => p.Id == item.PartId);
            return new PurchaseOrderItem
            {
                PartId = item.PartId,
                PartName = part.Name,
                Quantity = item.Quantity,
                UnitCost = item.UnitCost,
                LineTotal = item.UnitCost * item.Quantity
            };
        }).ToList();

        var order = new PurchaseOrder
        {
            VendorId = req.VendorId,
            Total = orderItems.Sum(i => i.LineTotal),
            Notes = req.Notes,
            Items = orderItems
        };

        _db.PurchaseOrders.Add(order);
        await _db.SaveChangesAsync();

        await _db.Entry(order).Reference(po => po.Vendor).LoadAsync();
        return Created($"/api/purchase-orders/{order.Id}", MapToResponse(order));
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdatePurchaseOrderStatusRequest req)
    {
        var order = await _db.PurchaseOrders
            .Include(po => po.Items).ThenInclude(i => i.Part)
            .Include(po => po.Vendor)
            .FirstOrDefaultAsync(po => po.Id == id);

        if (order == null) return NotFound();

        if (req.Status == "Received" && order.Status != "Received")
        {
            // Update inventory quantities
            foreach (var item in order.Items)
            {
                item.Part.Quantity += item.Quantity;
                item.Part.LastRestocked = DateTime.UtcNow;
            }

            // Update vendor stats
            order.Vendor.TotalOrders += 1;
            order.Vendor.TotalSpent += order.Total;
            order.Vendor.LastOrder = DateTime.UtcNow;
        }

        order.Status = req.Status;
        await _db.SaveChangesAsync();
        return NoContent();
    }

<<<<<<< HEAD
=======
    [HttpGet("{id}/pdf")]
    public async Task<IActionResult> GetPdf(int id)
    {
        var order = await _db.PurchaseOrders
            .Include(po => po.Vendor)
            .Include(po => po.Items).ThenInclude(i => i.Part)
            .FirstOrDefaultAsync(po => po.Id == id);

        if (order == null) return NotFound();

        var data     = MapToResponse(order);
        var pdfBytes = _pdf.GeneratePurchaseOrderInvoice(data);
        return File(pdfBytes, "application/pdf", $"autopro-po-{id}.pdf");
    }

>>>>>>> noble
    private static PurchaseOrderResponse MapToResponse(PurchaseOrder po) => new()
    {
        Id = po.Id,
        VendorId = po.VendorId,
        VendorName = po.Vendor?.Name ?? string.Empty,
        Date = po.Date,
        Total = po.Total,
        Status = po.Status,
        Notes = po.Notes,
        CreatedAt = po.CreatedAt,
        Items = po.Items?.Select(i => new PurchaseOrderItemResponse
        {
            Id = i.Id,
            PartId = i.PartId,
            PartName = i.PartName,
            Quantity = i.Quantity,
            UnitCost = i.UnitCost,
            LineTotal = i.LineTotal
        }).ToList() ?? new()
    };
}
