import { apiFetch, BASE_URL } from './api';

// Backend field adapter → AdminParts.jsx expects: name, sku, category, supplier, price, quantity, minStock, unit
const adaptPart = (p) => ({
  id: p.id,
  name: p.name,
  sku: p.sku || '',
  category: p.category,
  supplier: p.vendorName || '',   // backend: vendorName → frontend: supplier
  vendorId: p.vendorId,
  price: p.price,
  quantity: p.quantity,           // backend: quantity → frontend: quantity ✓
  minStock: p.minQuantity,        // backend: minQuantity → frontend: minStock
  unit: p.unit,
  lastRestocked: p.lastRestocked ? p.lastRestocked.split('T')[0] : null,
  isLowStock: p.isLowStock,
});

const adaptPO = (po) => ({
  id: po.id,
  vendor: po.vendorName,
  date: po.date ? po.date.split('T')[0] : '',
  items: po.items?.length ?? 0,
  total: po.total,
  status: po.status,
  notes: po.notes || '',
});

export const getParts = () =>
  apiFetch('/api/parts').then(data => data.map(adaptPart));

export const getLowStockParts = () =>
  apiFetch('/api/parts/low-stock').then(data =>
    data.map(p => ({ ...p, quantity: p.quantity, minStock: p.minQuantity }))
  );

export const getPurchaseOrders = () =>
  apiFetch('/api/purchase-orders').then(data => data.map(adaptPO));

export const createPart = async (data) => {
  // Resolve supplier name → vendorId by fetching vendors
  let vendorId = data.vendorId;
  if (!vendorId && data.supplier) {
    const vendors = await apiFetch('/api/vendors');
    const match = vendors.find(v => v.name.toLowerCase() === data.supplier.toLowerCase());
    vendorId = match?.id ?? (vendors[0]?.id ?? 1);
  }

  const created = await apiFetch('/api/parts', {
    method: 'POST',
    body: JSON.stringify({
      name: data.name,
      sku: data.sku || '',
      category: data.category,
      price: Number(data.price),
      quantity: Number(data.quantity),
      vendorId: vendorId,
      minQuantity: Number(data.minStock),
      unit: data.unit,
    }),
  });
  return adaptPart(created);
};

export const updatePart = async (id, data) => {
  let vendorId = data.vendorId;
  if (!vendorId && data.supplier) {
    const vendors = await apiFetch('/api/vendors');
    const match = vendors.find(v => v.name.toLowerCase() === data.supplier.toLowerCase());
    if (match) vendorId = match.id;
  }

  await apiFetch(`/api/parts/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: data.name,
      sku: data.sku,
      category: data.category,
      price: data.price !== undefined ? Number(data.price) : undefined,
      quantity: data.quantity !== undefined ? Number(data.quantity) : undefined,
      vendorId: vendorId,
      minQuantity: data.minStock !== undefined ? Number(data.minStock) : undefined,
      unit: data.unit,
    }),
  });
  return { ...data, id };
};

export const deletePart = (id) =>
  apiFetch(`/api/parts/${id}`, { method: 'DELETE' })
    .then(() => ({ success: true }));

export const createPurchaseOrder = (data) =>
  apiFetch('/api/purchase-orders', {
    method: 'POST',
    body: JSON.stringify(data),
  }).then(adaptPO);

export const updatePurchaseOrderStatus = (id, status) =>
  apiFetch(`/api/purchase-orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

export async function downloadPurchaseOrderPdf(id) {
  const token = localStorage.getItem('authToken');
  const res = await fetch(`${BASE_URL}/api/purchase-orders/${id}/pdf`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.text()) || 'PDF generation failed');
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `autopro-po-${id}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
