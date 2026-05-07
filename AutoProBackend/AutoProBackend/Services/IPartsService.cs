using AutoProBackend.DTOs;

namespace AutoProBackend.Services;

public interface IPartsService
{
    Task<List<PartResponse>> GetAllAsync(string? category);
    Task<PartResponse?> GetByIdAsync(int id);
    Task<List<LowStockPartResponse>> GetLowStockAsync();
    Task<(PartResponse? response, bool vendorNotFound)> CreateAsync(CreatePartRequest req);
    Task<bool> UpdateAsync(int id, UpdatePartRequest req);
    Task<bool> DeleteAsync(int id);
}
