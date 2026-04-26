import { mockFetch } from './api';

export const getFinancialReport = () => mockFetch({
  summary: {
    totalRevenue:    482500,
    totalExpenses:   185000,
    netProfit:       297500,
    monthOverMonth:  12.4,
    invoicesIssued:  68,
    avgInvoiceValue: 7095,
  },
  monthly: [
    { month: 'Nov', revenue: 320000, expenses: 140000 },
    { month: 'Dec', revenue: 410000, expenses: 160000 },
    { month: 'Jan', revenue: 380000, expenses: 155000 },
    { month: 'Feb', revenue: 445000, expenses: 170000 },
    { month: 'Mar', revenue: 430000, expenses: 162000 },
    { month: 'Apr', revenue: 482500, expenses: 185000 },
  ],
  serviceBreakdown: [
    { service: 'Oil & Filter Change',   revenue: 145000, count: 42, pct: 30 },
    { service: 'Full Service Package',  revenue: 120000, count: 10, pct: 25 },
    { service: 'Brake Services',        revenue: 85000,  count: 18, pct: 18 },
    { service: 'AC & Cooling',          revenue: 62500,  count: 14, pct: 13 },
    { service: 'Tyre & Suspension',     revenue: 45000,  count: 8,  pct: 9  },
    { service: 'Other',                 revenue: 25000,  count: 12, pct: 5  },
  ],
  topStaff: [
    { name: 'Anil Shrestha',  role: 'Senior Mechanic',  invoices: 28, revenue: 220000 },
    { name: 'Manisha Thapa',  role: 'Service Advisor',  invoices: 24, revenue: 185000 },
    { name: 'Dipak Magar',    role: 'Parts Manager',    invoices: 16, revenue: 77500  },
  ],
});

export const getCustomerReport = () => mockFetch({
  topSpenders: [
    { customerId: 4, name: 'Binita Gurung',      spent: 125000, visits: 24, tier: 'Platinum' },
    { customerId: 1, name: 'Ram Bahadur Thapa',  spent: 82000,  visits: 12, tier: 'Gold'     },
    { customerId: 5, name: 'Saroj Karki',         spent: 68000,  visits: 9,  tier: 'Silver'   },
    { customerId: 2, name: 'Sunita Sharma',       spent: 45000,  visits: 7,  tier: 'Silver'   },
    { customerId: 3, name: 'Prakash Oli',         spent: 21000,  visits: 4,  tier: 'Bronze'   },
  ],
  loyaltyBreakdown: [
    { tier: 'Platinum', count: 1, minSpend: 100000 },
    { tier: 'Gold',     count: 1, minSpend: 75000  },
    { tier: 'Silver',   count: 2, minSpend: 40000  },
    { tier: 'Bronze',   count: 2, minSpend: 0       },
  ],
  overdueCredits: [
    { customerId: 2, name: 'Sunita Sharma', invoice: 'INV-1041', amount: 1500, dueDate: '2026-04-16', overdueDays: 2 },
  ],
  newCustomersThisMonth: 1,
  repeatCustomers: 5,
});
