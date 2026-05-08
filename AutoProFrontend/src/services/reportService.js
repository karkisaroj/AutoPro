import { apiFetch, BASE_URL } from './api';

export const getFinancialReport = (period = 'monthly', year = null, month = null) => {
  const params = new URLSearchParams({ period });
  if (year  != null) params.append('year',  year);
  if (month != null) params.append('month', month);
  return apiFetch(`/api/reports/financial?${params.toString()}`).then(data => ({
    summary: {
      totalRevenue: data.totalRevenue,
      totalExpenses: data.totalExpenses,
      netProfit: data.netProfit,
      monthOverMonth: data.monthOverMonthChange,
      invoicesIssued: data.invoicesIssued,
      avgInvoiceValue: data.averageInvoiceValue,
    },
    monthly: (data.monthlyTrend || []).map(entry => ({
      month:    entry.month,
      revenue:  entry.revenue,
      expenses: entry.expenses,
    })),
    breakdown: (data.dailyBreakdown || []).map(entry => ({
      date:     new Date(entry.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      revenue:  entry.revenue,
      invoices: entry.invoices,
    })),
    serviceBreakdown: (data.serviceBreakdown || []).map(s => ({
      service: s.service,
      count:   s.count,
      revenue: s.revenue,
      pct:     s.pct,
    })),
  }));
};

export const getCustomerReport = () =>
  apiFetch('/api/reports/customers').then(data => ({
    topSpenders: (data.topSpenders || []).map(c => ({
      customerId: c.customerId,
      name: c.name,
      spent: c.totalSpent,
      visits: c.visits,
      tier: c.tier,
    })),
    loyaltyBreakdown: (data.loyaltyTiers || []).map(t => ({
      tier: t.tier,
      count: t.count,
      minSpend: 0,
    })),
    overdueCredits: (data.overdueCredits || []).map(o => ({
      customerId: o.customerId,
      name: o.name,
      invoice: `Sale #${o.customerId}`,
      amount: o.amountDue,
      dueDate: o.saleDate ? o.saleDate.split('T')[0] : '',
      overdueDays: o.daysOverdue,
    })),
    newCustomersThisMonth: 0,
    repeatCustomers: 0,
  }));

export const sendLowStockAlert = () =>
  apiFetch('/api/reports/send-low-stock-alert', { method: 'POST' });

export const getLowStockAlerts = () =>
  apiFetch('/api/reports/low-stock');

export async function downloadFinancialReportPdf(period = 'monthly', year = null, month = null) {
  const token = localStorage.getItem('authToken');
  const params = new URLSearchParams({ period });
  if (year  != null) params.append('year',  year);
  if (month != null) params.append('month', month);

  const res = await fetch(`${BASE_URL}/api/reports/financial/pdf?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error((await res.text()) || 'PDF generation failed');

  const disposition = res.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^";\n]+)"?/);
  const filename = match ? match[1] : 'autopro-financial-report.pdf';

  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
