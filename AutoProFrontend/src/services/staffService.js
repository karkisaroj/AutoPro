import { mockFetch } from './api';

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
// Replace with real API calls when backend is ready: mockFetch(data) → apiFetch('/api/staff', ...)

let _staff = [
  { id: 1, name: 'Anil Shrestha',  email: 'anil@autopro.com',    phone: '9841-001-001', role: 'Senior Mechanic', department: 'Workshop',  joined: '2024-03-01', salary: 38000, active: true,  avatar: 'AS' },
  { id: 2, name: 'Manisha Thapa',  email: 'manisha@autopro.com',  phone: '9841-002-002', role: 'Service Advisor', department: 'Front Desk',joined: '2024-07-15', salary: 32000, active: true,  avatar: 'MT' },
  { id: 3, name: 'Bikash Rai',     email: 'bikash@autopro.com',   phone: '9841-003-003', role: 'Admin Manager',  department: 'Management',joined: '2023-01-10', salary: 55000, active: true,  avatar: 'BR' },
  { id: 4, name: 'Sita Gurung',    email: 'sita@autopro.com',     phone: '9841-004-004', role: 'Junior Mechanic',department: 'Workshop',  joined: '2025-02-20', salary: 24000, active: false, avatar: 'SG' },
  { id: 5, name: 'Dipak Magar',    email: 'dipak@autopro.com',    phone: '9841-005-005', role: 'Parts Manager',  department: 'Inventory', joined: '2024-09-01', salary: 30000, active: true,  avatar: 'DM' },
  { id: 6, name: 'Purnima Khadka', email: 'purnima@autopro.com',  phone: '9841-006-006', role: 'Accountant',     department: 'Finance',   joined: '2023-06-15', salary: 35000, active: true,  avatar: 'PK' },
];

// ─── SERVICE FUNCTIONS ────────────────────────────────────────────────────────

/** GET /api/staff */
export const getStaff = () => mockFetch(_staff);
// Real API: return apiFetch('/api/staff');

/** POST /api/staff */
export const createStaff = (data) => {
  const newStaff = {
    id: Date.now(),
    avatar: data.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    joined: new Date().toISOString().split('T')[0],
    active: true,
    ...data,
  };
  _staff = [..._staff, newStaff];
  return mockFetch(newStaff);
  // Real API: return apiFetch('/api/staff', { method: 'POST', body: JSON.stringify(data) });
};

/** PUT /api/staff/:id */
export const updateStaff = (id, data) => {
  _staff = _staff.map(s => s.id === id ? { ...s, ...data } : s);
  return mockFetch(_staff.find(s => s.id === id));
  // Real API: return apiFetch(`/api/staff/${id}`, { method: 'PUT', body: JSON.stringify(data) });
};

/** DELETE /api/staff/:id */
export const deleteStaff = (id) => {
  _staff = _staff.filter(s => s.id !== id);
  return mockFetch({ success: true });
  // Real API: return apiFetch(`/api/staff/${id}`, { method: 'DELETE' });
};

/** PATCH /api/staff/:id/toggle-status */
export const toggleStaffStatus = (id) => {
  _staff = _staff.map(s => s.id === id ? { ...s, active: !s.active } : s);
  return mockFetch(_staff.find(s => s.id === id));
  // Real API: return apiFetch(`/api/staff/${id}/toggle-status`, { method: 'PATCH' });
};
