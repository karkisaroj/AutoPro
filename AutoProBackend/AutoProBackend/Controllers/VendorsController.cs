using AutoProBackend.DTOs;
using AutoProBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoProBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class VendorsController : ControllerBase
{
    private readonly IVendorService _vendors;
    public VendorsController(IVendorService vendors) => _vendors = vendors;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool? activeOnly) =>
        Ok(await _vendors.GetAllAsync(activeOnly));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var vendor = await _vendors.GetByIdAsync(id);
        return vendor == null ? NotFound() : Ok(vendor);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateVendorRequest req)
    {
        var vendor = await _vendors.CreateAsync(req);
        return Created($"/api/vendors/{vendor.Id}", vendor);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateVendorRequest req) =>
        await _vendors.UpdateAsync(id, req) ? NoContent() : NotFound();

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var (found, inUse) = await _vendors.DeleteAsync(id);
        if (!found) return NotFound();
        if (inUse) return Conflict(new { message = "Cannot delete this vendor — they have parts or purchase orders on record. Remove those first." });
        return NoContent();
    }

    [HttpPatch("{id}/toggle-status")]
    public async Task<IActionResult> ToggleStatus(int id)
    {
        var result = await _vendors.ToggleStatusAsync(id);
        return result == null ? NotFound() : Ok(new { isActive = result });
    }
}
