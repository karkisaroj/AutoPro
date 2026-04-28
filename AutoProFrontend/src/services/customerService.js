import { apiFetch } from './api';

const adapt = (c) => ({
  id: c.id,
  name: c.name,
  phone: c.phone,
  email: c.email,
  // Derive vehicle and plateNo from first vehicle in list
  vehicle: c.vehicles?.length > 0 ? `${c.vehicles[0].vehicleType} ${c.vehicles[0].plateNo}` : 'N/A',
  plateNo: c.vehicles?.length > 0 ? c.vehicles[0].plateNo : '',
  loyaltyPts: c.loyaltyPoints,   // backend: loyaltyPoints → frontend: loyaltyPts
  tier: c.tier,
  joinDate: c.joinDate ? c.joinDate.split('T')[0] : '',
  totalSpent: c.totalSpent,
  visits: c.visits,
  vehicles: c.vehicles || [],
});

export const getCustomers = () =>
  apiFetch('/api/customers').then(data => data.map(adapt));

export const getCustomerById = (id) =>
  apiFetch(`/api/customers/${id}`).then(adapt);

export const createCustomer = (data) =>
  apiFetch('/api/customers', {
    method: 'POST',
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      password: data.password || 'Customer@123',
      phone: data.phone,
      licenseId: data.licenseId,
    }),
  }).then(adapt);

export const updateCustomer = (id, data) =>
  apiFetch(`/api/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: data.name,
      phone: data.phone,
      licenseId: data.licenseId,
    }),
  }).then(() => ({ ...data, id }));

export const addVehicle = (customerId, data) =>
  apiFetch(`/api/customers/${customerId}/vehicles`, {
    method: 'POST',
    body: JSON.stringify({
      vehicleType: data.vehicleType,
      plateNo: data.plateNo,
      registrationDate: data.registrationDate,
    }),
  });

export const getCustomerHistory = (id) =>
  apiFetch(`/api/customers/${id}/history`).then(data =>
    data.map(s => ({
      id: s.id,
      date: s.date ? s.date.split('T')[0] : '',
      staffName: s.staffName,
      subtotal: s.subtotal,
      loyaltyDiscount: s.loyaltyDiscount,
      tax: s.tax,
      total: s.total,
      status: s.status,
      paymentMethod: s.paymentMethod,
      items: (s.items || []).map(i => ({
        partName: i.partName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        lineTotal: i.lineTotal,
      })),
    }))
  );
