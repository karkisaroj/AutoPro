namespace AutoProBackend.DTOs;

public class FinancialReportResponse
{
    public decimal TotalRevenue { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal NetProfit { get; set; }
    public int InvoicesIssued { get; set; }
    public decimal AverageInvoiceValue { get; set; }
    public decimal MonthOverMonthChange { get; set; }
    public List<DailyRevenueEntry> DailyBreakdown { get; set; } = new();
}

public class DailyRevenueEntry
{
    public DateTime Date { get; set; }
    public decimal Revenue { get; set; }
    public int Invoices { get; set; }
}

public class CustomerReportResponse
{
    public List<TopSpenderEntry> TopSpenders { get; set; } = new();
    public List<LoyaltyTierSummary> LoyaltyTiers { get; set; } = new();
    public List<OverdueCreditEntry> OverdueCredits { get; set; } = new();
}

public class TopSpenderEntry
{
    public int CustomerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal TotalSpent { get; set; }
    public int Visits { get; set; }
    public string Tier { get; set; } = string.Empty;
}

public class LoyaltyTierSummary
{
    public string Tier { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class OverdueCreditEntry
{
    public int CustomerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public decimal AmountDue { get; set; }
    public DateTime SaleDate { get; set; }
    public int DaysOverdue { get; set; }
}

public class LowStockPartResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public int MinQuantity { get; set; }
    public string VendorName { get; set; } = string.Empty;
}
