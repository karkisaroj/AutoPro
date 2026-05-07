using AutoProBackend.DTOs;

namespace AutoProBackend.Services;

public interface IStaffService
{
    Task<List<StaffResponse>> GetAllAsync();
    Task<StaffResponse?> GetByIdAsync(int id);
    Task<(StaffResponse? response, bool emailConflict)> CreateAsync(CreateStaffRequest req);
    Task<bool> UpdateAsync(int id, UpdateStaffRequest req);
    Task<bool> DeleteAsync(int id);
    Task<bool?> ToggleStatusAsync(int id);
}
