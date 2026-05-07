using AutoProBackend.DTOs;

namespace AutoProBackend.Services;

public interface IAppointmentService
{
    Task<List<AppointmentResponse>> GetAllAsync(string? status, DateTime? date);
    Task<AppointmentResponse?> GetByIdAsync(int id);
    Task<List<AppointmentResponse>> GetByCustomerAsync(int customerId);
    Task<(AppointmentResponse? response, bool customerNotFound, bool vehicleNotFound, bool badTime)> CreateAsync(CreateAppointmentRequest req);
    Task<(bool found, bool badStatus)> UpdateStatusAsync(int id, UpdateAppointmentStatusRequest req);
    Task<(bool found, bool alreadyCompleted)> CancelAsync(int id);
}
