using AutoProBackend.Data;
using AutoProBackend.DTOs;
using AutoProBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AutoProBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AppointmentsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AppointmentsController(AppDbContext db) => _db = db;

    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] DateTime? date)
    {
        var query = _db.Appointments
            .Include(a => a.Customer)
            .Include(a => a.Vehicle)
            .Include(a => a.Staff)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(a => a.Status == status);

        if (date.HasValue)
            query = query.Where(a => a.Date.Date == date.Value.Date);

        var appointments = await query
            .OrderByDescending(a => a.Date)
            .Select(a => MapToResponse(a))
            .ToListAsync();

        return Ok(appointments);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var appointment = await _db.Appointments
            .Include(a => a.Customer)
            .Include(a => a.Vehicle)
            .Include(a => a.Staff)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (appointment == null) return NotFound();

        if (User.IsInRole("Customer"))
        {
            var customerId = GetCustomerIdFromToken();
            if (appointment.CustomerId != customerId) return Forbid();
        }

        return Ok(MapToResponse(appointment));
    }

    [HttpGet("my")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMine()
    {
        var customerId = GetCustomerIdFromToken();
        var appointments = await _db.Appointments
            .Include(a => a.Customer)
            .Include(a => a.Vehicle)
            .Include(a => a.Staff)
            .Where(a => a.CustomerId == customerId)
            .OrderByDescending(a => a.Date)
            .Select(a => MapToResponse(a))
            .ToListAsync();

        return Ok(appointments);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAppointmentRequest req)
    {
        if (User.IsInRole("Customer"))
        {
            var customerId = GetCustomerIdFromToken();
            if (req.CustomerId != customerId) return Forbid();
        }

        if (!await _db.Customers.AnyAsync(c => c.Id == req.CustomerId))
            return BadRequest(new { message = "Customer not found" });

        if (req.VehicleId.HasValue && !await _db.Vehicles.AnyAsync(v => v.Id == req.VehicleId && v.CustomerId == req.CustomerId))
            return BadRequest(new { message = "Vehicle not found for this customer" });

        if (!TimeSpan.TryParse(req.Time, out var time))
            return BadRequest(new { message = "Invalid time format. Use HH:mm" });

        var appointment = new Appointment
        {
            CustomerId = req.CustomerId,
            VehicleId = req.VehicleId,
            StaffId = req.StaffId,
            Date = req.Date.Date,
            Time = time,
            ServiceType = req.ServiceType,
            Notes = req.Notes
        };

        _db.Appointments.Add(appointment);
        await _db.SaveChangesAsync();

        await _db.Entry(appointment).Reference(a => a.Customer).LoadAsync();
        await _db.Entry(appointment).Reference(a => a.Vehicle).LoadAsync();
        await _db.Entry(appointment).Reference(a => a.Staff).LoadAsync();

        return Created($"/api/appointments/{appointment.Id}", MapToResponse(appointment));
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateAppointmentStatusRequest req)
    {
        var allowed = new[] { "Pending", "Confirmed", "Completed", "Cancelled" };
        if (!allowed.Contains(req.Status))
            return BadRequest(new { message = "Invalid status" });

        var appointment = await _db.Appointments.FindAsync(id);
        if (appointment == null) return NotFound();

        appointment.Status = req.Status;
        if (req.Notes != null) appointment.Notes = req.Notes;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        var appointment = await _db.Appointments.FindAsync(id);
        if (appointment == null) return NotFound();

        if (User.IsInRole("Customer"))
        {
            var customerId = GetCustomerIdFromToken();
            if (appointment.CustomerId != customerId) return Forbid();
        }

        if (appointment.Status == "Completed")
            return BadRequest(new { message = "Cannot cancel a completed appointment" });

        appointment.Status = "Cancelled";
        await _db.SaveChangesAsync();
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

    private int? GetCustomerIdFromToken()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        return _db.Customers.FirstOrDefault(c => c.UserId == userId)?.Id;
    }

    private static AppointmentResponse MapToResponse(Appointment a) => new()
    {
        Id = a.Id,
        CustomerId = a.CustomerId,
        CustomerName = a.Customer?.Name ?? string.Empty,
        VehicleId = a.VehicleId,
        PlateNo = a.Vehicle?.PlateNo,
        StaffId = a.StaffId,
        StaffName = a.Staff?.Name,
        Date = a.Date,
        Time = a.Time.ToString(@"hh\:mm"),
        ServiceType = a.ServiceType,
        Status = a.Status,
        Notes = a.Notes,
        CreatedAt = a.CreatedAt
    };
}
