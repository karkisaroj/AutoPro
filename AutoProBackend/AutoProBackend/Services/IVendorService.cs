using AutoProBackend.DTOs;

namespace AutoProBackend.Services;

public interface IVendorService
{
    Task<List<VendorResponse>> GetAllAsync(bool? activeOnly);
    Task<VendorResponse?> GetByIdAsync(int id);
    Task<VendorResponse> CreateAsync(CreateVendorRequest req);
    Task<bool> UpdateAsync(int id, UpdateVendorRequest req);
    Task<bool> DeleteAsync(int id);
    Task<bool?> ToggleStatusAsync(int id);
}
