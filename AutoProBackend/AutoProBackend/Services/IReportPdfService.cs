using AutoProBackend.DTOs;

namespace AutoProBackend.Services;

public interface IReportPdfService
{
    byte[] GenerateFinancialReport(FinancialReportResponse data, string period, int year, int? month);
    byte[] GeneratePurchaseOrderInvoice(PurchaseOrderResponse data);
}
