namespace AutoProBackend.Models;

public class Vehicle
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public string VehicleType { get; set; } = string.Empty;
    public string PlateNo { get; set; } = string.Empty;
    public DateTime? RegistrationDate { get; set; }

    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}
