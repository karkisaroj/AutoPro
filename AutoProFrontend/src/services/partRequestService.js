import { apiFetch } from './api';

const adapt = (r) => ({
  id: r.id,
  partName: r.partName,
  description: r.description || '',
  vehicleModel: r.vehicleModel || '',
  quantity: r.quantity,
  status: r.status,
  adminNote: r.adminNote || '',
  createdAt: r.createdAt ? r.createdAt.split('T')[0] : '',
  customerName: r.customerName || '',
});

export const getPartsCatalog = () =>
  apiFetch('/api/part-requests/parts-catalog');

export const getMyPartRequests = () =>
  apiFetch('/api/part-requests/my').then(data => data.map(adapt));

export const createPartRequest = (data) =>
  apiFetch('/api/part-requests', {
    method: 'POST',
    body: JSON.stringify({
      partName:     data.partName,
      description:  data.description || null,
      vehicleModel: data.vehicleModel || null,
      quantity:     data.quantity,
    }),
  }).then(adapt);

export const getAllPartRequests = (status) =>
  apiFetch(`/api/part-requests${status ? `?status=${status}` : ''}`).then(data => data.map(adapt));

export const updatePartRequestStatus = (id, status, adminNote) =>
  apiFetch(`/api/part-requests/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, adminNote: adminNote || null }),
  });
