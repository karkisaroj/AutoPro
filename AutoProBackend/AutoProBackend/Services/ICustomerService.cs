using AutoProBackend.DTOs;

namespace AutoProBackend.Services;

public interface ICustomerService
{
    Task<List<CustomerResponse>> GetAllAsync(string? search, string? searchBy);
    Task<CustomerResponse?> GetByIdAsync(int id);
    Task<(CustomerResponse? response, bool emailConflict)> CreateAsync(CreateCustomerRequest req);
    Task<(CustomerResponse? response, bool notFound)> UpdateAsync(int id, UpdateCustomerRequest req);
    Task<List<SaleResponse>> GetHistoryAsync(int customerId);
    Task<(VehicleResponse? response, bool notFound, bool plateConflict)> AddVehicleAsync(int customerId, AddVehicleRequest req);
    Task<(VehicleResponse? response, bool notFound, bool plateConflict, bool hasActiveAppointments)> UpdateVehicleAsync(int customerId, int vehicleId, UpdateVehicleRequest req);
    Task<(bool success, bool notFound, bool hasActiveAppointments)> RemoveVehicleAsync(int customerId, int vehicleId);
    Task<int?> GetCustomerIdByUserIdAsync(int userId);
}
