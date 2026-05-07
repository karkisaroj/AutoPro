using AutoProBackend.DTOs;

namespace AutoProBackend.Services;

public interface IPurchaseOrderService
{
    Task<List<PurchaseOrderResponse>> GetAllAsync(string? status);
    Task<PurchaseOrderResponse?> GetByIdAsync(int id);
    Task<(PurchaseOrderResponse? response, bool vendorNotFound, bool partsNotFound)> CreateAsync(CreatePurchaseOrderRequest req);
    Task<bool> UpdateStatusAsync(int id, UpdatePurchaseOrderStatusRequest req);
}
