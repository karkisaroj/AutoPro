import { apiFetch } from './api';

const adaptItem = (i) => ({
  description: i.partName,
  qty: i.quantity,
  unitPrice: i.unitPrice,
  total: i.lineTotal,
});

const adapt = (s) => ({
  id: s.id,
  date: s.date ? s.date.split('T')[0] : '',
  customerId: s.customerId,
  customerName: s.customerName,
  vehicle: '',
  plateNo: '',
  items: (s.items || []).map(adaptItem),
  subtotal: s.subtotal,
  loyaltyDiscount: s.loyaltyDiscount,
  tax: s.tax ?? 0,
  total: s.total,
  amount: s.total,             // StaffOverview uses s.amount — alias to total
  loyaltyPoints: s.loyaltyPointsAwarded,
  paymentMethod: s.paymentMethod,
  status: s.status,
  staffName: s.staffName,
  notes: '',
});

export const getSales = () =>
  apiFetch('/api/sales').then(data => data.map(adapt));

export const getSaleById = (id) =>
  apiFetch(`/api/sales/${id}`).then(adapt);

export const createSale = (data) =>
  apiFetch('/api/sales', {
    method: 'POST',
    body: JSON.stringify({
      customerId: data.customerId,
      paymentMethod: data.paymentMethod,
      items: (data.items || []).map(i => ({
        partId: i.partId,
        quantity: i.qty || i.quantity,
      })),
    }),
  }).then(adapt);

export const getRevenueByDay = () =>
  apiFetch('/api/reports/financial?period=monthly').then(report => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (report.dailyBreakdown || []).slice(-7).map(entry => ({
      day: days[new Date(entry.date).getDay()],
      date: entry.date.split('T')[0],
      revenue: entry.revenue,
      invoices: entry.invoices,
    }));
  });
