import { mockFetch } from './api';

let _vendors = [
  { id: 1, name: 'NepalAuto Supplies',   contact: 'Hari Prasad Shrestha', phone: '01-4512345', email: 'info@nepalauto.com.np',   address: 'New Baneshwor, Kathmandu', category: 'Multi-category', rating: 4.8, totalOrders: 48, lastOrder: '2026-04-12', totalSpent: 580000, status: 'Active',   paymentTerms: 'Net 30' },
  { id: 2, name: 'KTM Parts Hub',        contact: 'Sanjay Maharjan',       phone: '01-4523456', email: 'sales@ktmparts.com.np',   address: 'Putalisadak, Kathmandu',   category: 'Filters & Belts',rating: 4.5, totalOrders: 32, lastOrder: '2026-04-08', totalSpent: 245000, status: 'Active',   paymentTerms: 'Net 15' },
  { id: 3, name: 'AutoZone Pvt. Ltd.',   contact: 'Rajan Thapa',           phone: '01-4534567', email: 'rajan@autozone.com.np',   address: 'Kalanki, Kathmandu',       category: 'Suspension & Parts', rating: 4.2, totalOrders: 27, lastOrder: '2026-04-05', totalSpent: 390000, status: 'Active',   paymentTerms: 'Net 30' },
  { id: 4, name: 'Lubrikant Nepal',      contact: 'Bina Karki',            phone: '01-4545678', email: 'orders@lubrikant.com.np', address: 'Thapathali, Kathmandu',    category: 'Oils & Fluids',  rating: 4.9, totalOrders: 55, lastOrder: '2026-03-28', totalSpent: 320000, status: 'Active',   paymentTerms: 'Net 14' },
  { id: 5, name: 'Tyre World Nepal',     contact: 'Suresh Lama',           phone: '01-4556789', email: 'tyreworld@gmail.com',     address: 'Chabahil, Kathmandu',      category: 'Tyres',          rating: 4.6, totalOrders: 18, lastOrder: '2026-03-20', totalSpent: 750000, status: 'Active',   paymentTerms: 'Advance' },
  { id: 6, name: 'Sparks Electronics',   contact: 'Nisha Bajracharya',     phone: '01-4567890', email: 'sparks@electron.com.np',  address: 'Durbarmarg, Kathmandu',    category: 'Electrical',     rating: 3.9, totalOrders: 12, lastOrder: '2026-02-14', totalSpent: 185000, status: 'Inactive', paymentTerms: 'Net 30' },
];

export const getVendors    = ()        => mockFetch(_vendors);
export const getVendorById = (id)      => mockFetch(_vendors.find(v => v.id === id));

export const createVendor  = (data)    => {
  const newVendor = { id: Date.now(), totalOrders: 0, totalSpent: 0, rating: 4.0, lastOrder: '—', ...data };
  _vendors = [..._vendors, newVendor];
  return mockFetch(newVendor);
};

export const updateVendor  = (id, data) => {
  _vendors = _vendors.map(v => v.id === id ? { ...v, ...data } : v);
  return mockFetch(_vendors.find(v => v.id === id));
};

export const deleteVendor  = (id)      => {
  _vendors = _vendors.filter(v => v.id !== id);
  return mockFetch({ success: true });
};

export const toggleVendorStatus = (id) => {
  _vendors = _vendors.map(v =>
    v.id === id ? { ...v, status: v.status === 'Active' ? 'Inactive' : 'Active' } : v
  );
  return mockFetch(_vendors.find(v => v.id === id));
};

