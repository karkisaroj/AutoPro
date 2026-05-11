using AutoProBackend.DTOs;

namespace AutoProBackend.Services;

public interface IPartsService
{
    Task<PagedResult<PartResponse>> GetAllAsync(string? category, string? search, int page, int pageSize);
    Task<PartResponse?> GetByIdAsync(int id);
    Task<List<LowStockPartResponse>> GetLowStockAsync();
    Task<(PartResponse? response, bool vendorNotFound, bool skuConflict)> CreateAsync(CreatePartRequest req);
    Task<(bool found, bool skuConflict)> UpdateAsync(int id, UpdatePartRequest req);
    Task<(bool found, bool inUse)> DeleteAsync(int id);
}
