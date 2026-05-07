using AutoProBackend.Data;
using AutoProBackend.DTOs;
using AutoProBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace AutoProBackend.Services;

public class AppointmentService : IAppointmentService
{
    private readonly AppDbContext _db;
    public AppointmentService(AppDbContext db) => _db = db;

    public async Task<List<AppointmentResponse>> GetAllAsync(string? status, DateTime? date)
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

        return await query
            .OrderByDescending(a => a.Date)
            .Select(a => MapToResponse(a))
            .ToListAsync();
    }

    public async Task<AppointmentResponse?> GetByIdAsync(int id)
    {
        var appointment = await _db.Appointments
            .Include(a => a.Customer)
            .Include(a => a.Vehicle)
            .Include(a => a.Staff)
            .FirstOrDefaultAsync(a => a.Id == id);
        return appointment == null ? null : MapToResponse(appointment);
    }

    public async Task<List<AppointmentResponse>> GetByCustomerAsync(int customerId) =>
        await _db.Appointments
            .Include(a => a.Customer)
            .Include(a => a.Vehicle)
            .Include(a => a.Staff)
            .Where(a => a.CustomerId == customerId)
            .OrderByDescending(a => a.Date)
            .Select(a => MapToResponse(a))
            .ToListAsync();

    public async Task<(AppointmentResponse? response, bool customerNotFound, bool vehicleNotFound, bool badTime)> CreateAsync(CreateAppointmentRequest req)
    {
        if (!await _db.Customers.AnyAsync(c => c.Id == req.CustomerId))
            return (null, true, false, false);

        if (req.VehicleId.HasValue && !await _db.Vehicles.AnyAsync(v => v.Id == req.VehicleId && v.CustomerId == req.CustomerId))
            return (null, false, true, false);

        if (!TimeSpan.TryParse(req.Time, out var time))
            return (null, false, false, true);

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

        return (MapToResponse(appointment), false, false, false);
    }

    public async Task<(bool found, bool badStatus)> UpdateStatusAsync(int id, UpdateAppointmentStatusRequest req)
    {
        var allowed = new[] { "Pending", "Confirmed", "Completed", "Cancelled" };
        if (!allowed.Contains(req.Status))
            return (true, true);

        var appointment = await _db.Appointments.FindAsync(id);
        if (appointment == null) return (false, false);

        appointment.Status = req.Status;
        if (req.Notes != null) appointment.Notes = req.Notes;

        await _db.SaveChangesAsync();
        return (true, false);
    }

    public async Task<(bool found, bool alreadyCompleted)> CancelAsync(int id)
    {
        var appointment = await _db.Appointments.FindAsync(id);
        if (appointment == null) return (false, false);

        if (appointment.Status == "Completed")
            return (true, true);

        appointment.Status = "Cancelled";
        await _db.SaveChangesAsync();
        return (true, false);
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
