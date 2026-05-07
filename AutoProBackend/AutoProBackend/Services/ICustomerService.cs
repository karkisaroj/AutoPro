using AutoProBackend.DTOs;

namespace AutoProBackend.Services;

public interface ICustomerService
{
    Task<List<CustomerResponse>> GetAllAsync(string? search, string? searchBy);
    Task<CustomerResponse?> GetByIdAsync(int id);
    Task<(CustomerResponse? response, bool emailConflict)> CreateAsync(CreateCustomerRequest req);
    Task<bool> UpdateAsync(int id, UpdateCustomerRequest req);
    Task<List<SaleResponse>> GetHistoryAsync(int customerId);
    Task<(VehicleResponse? response, bool notFound, bool plateConflict)> AddVehicleAsync(int customerId, AddVehicleRequest req);
    Task<bool> RemoveVehicleAsync(int customerId, int vehicleId);
    Task<int?> GetCustomerIdByUserIdAsync(int userId);
}
