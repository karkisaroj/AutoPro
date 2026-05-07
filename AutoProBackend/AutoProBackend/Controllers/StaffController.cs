using AutoProBackend.DTOs;
using AutoProBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoProBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class StaffController : ControllerBase
{
    private readonly IStaffService _staff;
    public StaffController(IStaffService staff) => _staff = staff;

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _staff.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var staff = await _staff.GetByIdAsync(id);
        return staff == null ? NotFound() : Ok(staff);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateStaffRequest req)
    {
        var (response, emailConflict) = await _staff.CreateAsync(req);
        if (emailConflict) return Conflict(new { message = "Email already registered" });
        return Created($"/api/staff/{response!.Id}", response);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateStaffRequest req) =>
        await _staff.UpdateAsync(id, req) ? NoContent() : NotFound();

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id) =>
        await _staff.DeleteAsync(id) ? NoContent() : NotFound();

    [HttpPatch("{id}/toggle-status")]
    public async Task<IActionResult> ToggleStatus(int id)
    {
        var result = await _staff.ToggleStatusAsync(id);
        return result == null ? NotFound() : Ok(new { isActive = result });
    }
}
