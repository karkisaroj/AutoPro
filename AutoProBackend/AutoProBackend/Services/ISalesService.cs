using AutoProBackend.DTOs;

namespace AutoProBackend.Services;

public interface ISalesService
{
    Task<List<SaleResponse>> GetAllAsync(string? status, DateTime? from, DateTime? to);
    Task<SaleResponse?> GetByIdAsync(int id);
    Task<List<SaleResponse>> GetByCustomerAsync(int customerId);
    Task<(SaleResponse? response, string? errorMessage, bool forbidden)> CreateAsync(CreateSaleRequest req, int staffUserId);
    Task<string?> SendInvoiceEmailAsync(int id);
}
