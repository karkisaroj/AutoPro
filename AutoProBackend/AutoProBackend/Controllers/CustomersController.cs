using AutoProBackend.DTOs;
using AutoProBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AutoProBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _customers;
    public CustomersController(ICustomerService customers) => _customers = customers;

    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] string? searchBy) =>
        Ok(await _customers.GetAllAsync(search, searchBy));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        if (User.IsInRole("Customer") && await GetCustomerIdFromToken() != id)
            return Forbid();

        var customer = await _customers.GetByIdAsync(id);
        return customer == null ? NotFound() : Ok(customer);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Create([FromBody] CreateCustomerRequest req)
    {
        var (response, emailConflict) = await _customers.CreateAsync(req);
        if (emailConflict) return Conflict(new { message = "Email already registered" });
        return Created($"/api/customers/{response!.Id}", response);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCustomerRequest req)
    {
        if (User.IsInRole("Customer") && await GetCustomerIdFromToken() != id)
            return Forbid();

        var (response, notFound) = await _customers.UpdateAsync(id, req);
        if (notFound) return NotFound();
        return Ok(response);
    }

    [HttpGet("{id}/history")]
    public async Task<IActionResult> GetHistory(int id)
    {
        if (User.IsInRole("Customer") && await GetCustomerIdFromToken() != id)
            return Forbid();

        return Ok(await _customers.GetHistoryAsync(id));
    }

    [HttpPost("{id}/vehicles")]
    public async Task<IActionResult> AddVehicle(int id, [FromBody] AddVehicleRequest req)
    {
        if (User.IsInRole("Customer") && await GetCustomerIdFromToken() != id)
            return Forbid();

        var (response, notFound, plateConflict) = await _customers.AddVehicleAsync(id, req);
        if (notFound) return NotFound();
        if (plateConflict) return Conflict(new { message = "Plate number already registered" });
        return Created(string.Empty, response);
    }

    [HttpPut("{id}/vehicles/{vehicleId}")]
    public async Task<IActionResult> UpdateVehicle(int id, int vehicleId, [FromBody] UpdateVehicleRequest req)
    {
        if (User.IsInRole("Customer") && await GetCustomerIdFromToken() != id)
            return Forbid();

        var (response, notFound, plateConflict, hasActiveAppointments) =
            await _customers.UpdateVehicleAsync(id, vehicleId, req);

        if (notFound)               return NotFound();
        if (plateConflict)          return Conflict(new { message = "Plate number already registered" });
        if (hasActiveAppointments)  return Conflict(new { message = "Cannot update a vehicle with active appointments" });
        return Ok(response);
    }

    [HttpDelete("{id}/vehicles/{vehicleId}")]
    public async Task<IActionResult> RemoveVehicle(int id, int vehicleId)
    {
        if (User.IsInRole("Customer") && await GetCustomerIdFromToken() != id)
            return Forbid();

        var (success, notFound, hasActiveAppointments) = await _customers.RemoveVehicleAsync(id, vehicleId);
        if (notFound)              return NotFound();
        if (hasActiveAppointments) return Conflict(new { message = "Cannot remove a vehicle with active appointments" });
        return NoContent();
    }

    private async Task<int?> GetCustomerIdFromToken()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        return await _customers.GetCustomerIdByUserIdAsync(userId);
    }
}
