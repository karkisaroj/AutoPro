import { apiFetch } from './api';

// Backend field adapter: maps API response → frontend expected shape
const adapt = (s) => ({
  id: s.id,
  name: s.name,
  email: s.email,
  phone: s.phone,
  role: s.jobTitle,           // backend: jobTitle → frontend: role
  department: s.department,
  salary: s.salary,
  joined: s.joinDate ? s.joinDate.split('T')[0] : '',   // backend: joinDate → frontend: joined
  active: s.isActive,         // backend: isActive → frontend: active
  avatar: s.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
});

export const getStaff = () =>
  apiFetch('/api/staff').then(data => data.map(adapt));

export const createStaff = (data) =>
  apiFetch('/api/staff', {
    method: 'POST',
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      password: data.password || 'Staff@123',
      phone: data.phone,
      jobTitle: data.role,
      department: data.department,
      salary: Number(data.salary),
    }),
  }).then(adapt);

export const updateStaff = (id, data) =>
  apiFetch(`/api/staff/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: data.name,
      phone: data.phone,
      jobTitle: data.role,
      department: data.department,
      salary: data.salary !== undefined ? Number(data.salary) : undefined,
    }),
  }).then(() => ({ ...data, id }));

export const deleteStaff = (id) =>
  apiFetch(`/api/staff/${id}`, { method: 'DELETE' })
    .then(() => ({ success: true }));

export const toggleStaffStatus = (id) =>
  apiFetch(`/api/staff/${id}/toggle-status`, { method: 'PATCH' });
