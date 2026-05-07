using AutoProBackend.DTOs;
using AutoProBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AutoProBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentService _appointments;
    private readonly ICustomerService _customers;

    public AppointmentsController(IAppointmentService appointments, ICustomerService customers)
    {
        _appointments = appointments;
        _customers = customers;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] DateTime? date) =>
        Ok(await _appointments.GetAllAsync(status, date));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var appointment = await _appointments.GetByIdAsync(id);
        if (appointment == null) return NotFound();

        if (User.IsInRole("Customer") && appointment.CustomerId != await GetCustomerIdFromToken())
            return Forbid();

        return Ok(appointment);
    }

    [HttpGet("my")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMine()
    {
        var customerId = await GetCustomerIdFromToken();
        if (customerId == null) return Forbid();
        return Ok(await _appointments.GetByCustomerAsync(customerId.Value));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAppointmentRequest req)
    {
        if (User.IsInRole("Customer") && req.CustomerId != await GetCustomerIdFromToken())
            return Forbid();

        var (response, customerNotFound, vehicleNotFound, badTime) = await _appointments.CreateAsync(req);

        if (customerNotFound) return BadRequest(new { message = "Customer not found" });
        if (vehicleNotFound) return BadRequest(new { message = "Vehicle not found for this customer" });
        if (badTime) return BadRequest(new { message = "Invalid time format. Use HH:mm" });

        return Created($"/api/appointments/{response!.Id}", response);
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateAppointmentStatusRequest req)
    {
        var (found, badStatus) = await _appointments.UpdateStatusAsync(id, req);
        if (badStatus) return BadRequest(new { message = "Invalid status" });
        return found ? NoContent() : NotFound();
    }

    [HttpPatch("{id}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        if (User.IsInRole("Customer"))
        {
            var appointment = await _appointments.GetByIdAsync(id);
            if (appointment == null) return NotFound();
            if (appointment.CustomerId != await GetCustomerIdFromToken()) return Forbid();
        }

        var (found, alreadyCompleted) = await _appointments.CancelAsync(id);
        if (!found) return NotFound();
        if (alreadyCompleted) return BadRequest(new { message = "Cannot cancel a completed appointment" });
        return NoContent();
    }

    [HttpGet("services")]
    [AllowAnonymous]
    public IActionResult GetServiceTypes()
    {
        var services = new[]
        {
            "Oil & Filter Change", "Full Service", "Brake Inspection", "Tyre Rotation",
            "AC Service", "Engine Diagnostics", "Suspension Check",
            "Electrical Inspection", "Detailing", "Wheel Alignment"
        };
        return Ok(services);
    }

    private async Task<int?> GetCustomerIdFromToken()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        return await _customers.GetCustomerIdByUserIdAsync(userId);
    }
}
