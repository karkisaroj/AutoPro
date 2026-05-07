using AutoProBackend.DTOs;

namespace AutoProBackend.Services;

public interface IPartsService
{
    Task<PagedResult<PartResponse>> GetAllAsync(string? category, int page, int pageSize);
    Task<PartResponse?> GetByIdAsync(int id);
    Task<List<LowStockPartResponse>> GetLowStockAsync();
    Task<(PartResponse? response, bool vendorNotFound)> CreateAsync(CreatePartRequest req);
    Task<bool> UpdateAsync(int id, UpdatePartRequest req);
    Task<bool> DeleteAsync(int id);
}
