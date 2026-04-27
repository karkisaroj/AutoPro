import { apiFetch } from './api';

export const getFinancialReport = () =>
  apiFetch('/api/reports/financial').then(data => ({
    summary: {
      totalRevenue: data.totalRevenue,
      totalExpenses: data.totalExpenses,
      netProfit: data.netProfit,
      monthOverMonth: data.monthOverMonthChange,
      invoicesIssued: data.invoicesIssued,
      avgInvoiceValue: data.averageInvoiceValue,
    },
    monthly: (data.dailyBreakdown || []).slice(-6).map((entry) => ({
      month: new Date(entry.date).toLocaleString('default', { month: 'short' }),
      revenue: entry.revenue,
      expenses: 0,
    })),
    serviceBreakdown: [],
    topStaff: [],
  }));

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
