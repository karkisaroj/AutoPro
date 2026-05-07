using AutoProBackend.DTOs;

namespace AutoProBackend.Services;

public interface IReportService
{
    Task<FinancialReportResponse> GetFinancialReportAsync(string period, int year, int month);
    Task<CustomerReportResponse> GetCustomerReportAsync();
    Task<int> SendOverdueRemindersAsync();
    Task<List<LowStockPartResponse>> GetLowStockAlertAsync();
}
