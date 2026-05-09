using AutoProBackend.Data;
using AutoProBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoProBackend.Controllers;

[ApiController]
[Route("api/reviews")]
[Authorize]
public class ReviewsController(AppDbContext db) : ControllerBase
{
    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Submit([FromBody] SubmitReviewRequest req)
    {
        var appt = await db.Appointments
            .Include(a => a.Customer).ThenInclude(c => c.User)
            .FirstOrDefaultAsync(a => a.Id == req.AppointmentId);

        if (appt == null) return NotFound();
        if (appt.Customer.User.Email != User.Identity!.Name) return Forbid();
        if (appt.Status != "Completed")
            return BadRequest(new { message = "You can only review completed appointments." });
        if (await db.Reviews.AnyAsync(r => r.AppointmentId == req.AppointmentId))
            return Conflict(new { message = "You have already reviewed this appointment." });

        var review = new Review
        {
            AppointmentId = req.AppointmentId,
            CustomerId    = appt.CustomerId,
            Rating        = Math.Clamp(req.Rating, 1, 5),
            Comment       = req.Comment ?? string.Empty,
        };
        db.Reviews.Add(review);
        await db.SaveChangesAsync();

        return Created($"/api/reviews/{review.Id}", new
        {
            review.Id,
            review.Rating,
            review.Comment,
            review.CreatedAt,
        });
    }

    [HttpGet("appointment/{appointmentId:int}")]
    public async Task<IActionResult> GetForAppointment(int appointmentId)
    {
        var review = await db.Reviews.FirstOrDefaultAsync(r => r.AppointmentId == appointmentId);
        if (review == null) return NotFound();
        return Ok(new { review.Id, review.Rating, review.Comment, review.CreatedAt });
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetAll()
    {
        var reviews = await db.Reviews
            .Include(r => r.Customer)
            .Include(r => r.Appointment)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.Rating,
                r.Comment,
                r.CreatedAt,
                CustomerName    = r.Customer.Name,
                AppointmentService = r.Appointment.ServiceType,
            })
            .ToListAsync();
        return Ok(reviews);
    }
}

public class SubmitReviewRequest
{
    public int AppointmentId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
}
