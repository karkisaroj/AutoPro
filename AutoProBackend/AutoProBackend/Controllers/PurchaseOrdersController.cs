using AutoProBackend.DTOs;
using AutoProBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoProBackend.Controllers;

[ApiController]
[Route("api/purchase-orders")]
[Authorize(Roles = "Admin")]
public class PurchaseOrdersController : ControllerBase
{
    private readonly IPurchaseOrderService _purchaseOrders;
    public PurchaseOrdersController(IPurchaseOrderService purchaseOrders) => _purchaseOrders = purchaseOrders;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status) =>
        Ok(await _purchaseOrders.GetAllAsync(status));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var order = await _purchaseOrders.GetByIdAsync(id);
        return order == null ? NotFound() : Ok(order);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePurchaseOrderRequest req)
    {
        var (response, vendorNotFound, partsNotFound) = await _purchaseOrders.CreateAsync(req);
        if (vendorNotFound) return BadRequest(new { message = "Vendor not found or inactive" });
        if (partsNotFound) return BadRequest(new { message = "One or more parts not found" });
        return Created($"/api/purchase-orders/{response!.Id}", response);
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdatePurchaseOrderStatusRequest req) =>
        await _purchaseOrders.UpdateStatusAsync(id, req) ? NoContent() : NotFound();
}
