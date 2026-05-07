using AutoProBackend.DTOs;
using AutoProBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoProBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Staff")]
public class PartsController : ControllerBase
{
    private readonly IPartsService _parts;
    public PartsController(IPartsService parts) => _parts = parts;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? category,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10) =>
        Ok(await _parts.GetAllAsync(category, page, pageSize));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var part = await _parts.GetByIdAsync(id);
        return part == null ? NotFound() : Ok(part);
    }

    [HttpGet("low-stock")]
    public async Task<IActionResult> GetLowStock() =>
        Ok(await _parts.GetLowStockAsync());

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreatePartRequest req)
    {
        var (response, vendorNotFound) = await _parts.CreateAsync(req);
        if (vendorNotFound) return BadRequest(new { message = "Vendor not found or inactive" });
        return Created($"/api/parts/{response!.Id}", response);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePartRequest req) =>
        await _parts.UpdateAsync(id, req) ? NoContent() : NotFound();

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id) =>
        await _parts.DeleteAsync(id) ? NoContent() : NotFound();
}
