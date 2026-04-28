using System.ComponentModel.DataAnnotations;

namespace AutoProBackend.DTOs;

public class AppointmentResponse
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public int? VehicleId { get; set; }
    public string? PlateNo { get; set; }
    public int? StaffId { get; set; }
    public string? StaffName { get; set; }
    public DateTime Date { get; set; }
    public string Time { get; set; } = string.Empty;
    public string ServiceType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateAppointmentRequest
{
    [Required]
    public int CustomerId { get; set; }

    public int? VehicleId { get; set; }
    public int? StaffId { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Required]
    public string Time { get; set; } = string.Empty;

    [Required]
    public string ServiceType { get; set; } = string.Empty;

    public string? Notes { get; set; }
}

public class UpdateAppointmentStatusRequest
{
    [Required]
    public string Status { get; set; } = string.Empty;

    public string? Notes { get; set; }
}
