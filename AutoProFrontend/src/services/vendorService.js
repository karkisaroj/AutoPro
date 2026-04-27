import { apiFetch } from './api';

const adapt = (v) => ({
  id: v.id,
  name: v.name,
  contact: v.contactPerson,       // backend: contactPerson → frontend: contact
  phone: v.phone,
  email: v.email,
  address: v.address,
  category: v.category,
  rating: v.rating,
  totalOrders: v.totalOrders,
  lastOrder: v.lastOrder ? v.lastOrder.split('T')[0] : '—',
  totalSpent: v.totalSpent,
  status: v.isActive ? 'Active' : 'Inactive',  // backend: isActive → frontend: status string
  paymentTerms: v.paymentTerms,
});

export const getVendors = () =>
  apiFetch('/api/vendors').then(data => data.map(adapt));

export const getVendorById = (id) =>
  apiFetch(`/api/vendors/${id}`).then(adapt);

export const createVendor = (data) =>
  apiFetch('/api/vendors', {
    method: 'POST',
    body: JSON.stringify({
      name: data.name,
      contactPerson: data.contact,
      phone: data.phone,
      email: data.email,
      address: data.address,
      category: data.category,
      paymentTerms: data.paymentTerms || '',
    }),
  }).then(adapt);

export const updateVendor = (id, data) =>
  apiFetch(`/api/vendors/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: data.name,
      contactPerson: data.contact,
      phone: data.phone,
      email: data.email,
      address: data.address,
      category: data.category,
      paymentTerms: data.paymentTerms,
    }),
  }).then(() => ({ ...data, id }));

export const deleteVendor = (id) =>
  apiFetch(`/api/vendors/${id}`, { method: 'DELETE' })
    .then(() => ({ success: true }));

export const toggleVendorStatus = (id) =>
  apiFetch(`/api/vendors/${id}/toggle-status`, { method: 'PATCH' });
