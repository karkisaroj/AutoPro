import { apiFetch } from './api';

// Convert HH:mm (24h) → HH:MM AM/PM
function to12h(time) {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
}

// Convert HH:MM AM/PM → HH:mm (24h)
function to24h(time) {
  if (!time) return '09:00';
  const [timePart, suffix] = time.split(' ');
  let [h, m] = timePart.split(':').map(Number);
  if (suffix === 'PM' && h !== 12) h += 12;
  if (suffix === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

const adapt = (a) => ({
  id: a.id,
  customerId: a.customerId,
  customerName: a.customerName,
  phone: '',
  vehicle: a.plateNo || '',
  plateNo: a.plateNo || '',
  service: a.serviceType,        // backend: serviceType → frontend: service
  date: a.date ? a.date.split('T')[0] : '',
  time: to12h(a.time),           // backend HH:mm → frontend HH:MM AM/PM
  mechanic: a.staffName || '',   // backend: staffName → frontend: mechanic
  status: a.status,
  notes: a.notes || '',
});

const SERVICES = [
  'Oil & Filter Change', 'Full Service', 'Brake Inspection & Repair',
  'Tyre Rotation & Balancing', 'AC Service & Recharge', 'Engine Diagnostics',
  'Suspension Check', 'Electrical Inspection', 'Detailing & Wash', 'Wheel Alignment',
];

export const getAppointments = () =>
  apiFetch('/api/appointments').then(data => data.map(adapt));

export const getMyAppointments = () =>
  apiFetch('/api/appointments/my').then(data => data.map(adapt));

export const getAvailableServices = () => Promise.resolve(SERVICES);

export const getAvailableMechanics = () =>
  apiFetch('/api/staff').then(staff => staff.map(s => s.name));

export const getCustomerAppointments = (customerId) =>
  apiFetch('/api/appointments').then(data =>
    data.filter(a => a.customerId === customerId).map(adapt)
  );

export const createAppointment = (data) =>
  apiFetch('/api/appointments', {
    method: 'POST',
    body: JSON.stringify({
      customerId: data.customerId,
      vehicleId: data.vehicleId || null,
      staffId: data.staffId || null,
      date: data.date,
      time: data.time?.includes('AM') || data.time?.includes('PM') ? to24h(data.time) : data.time,
      serviceType: data.service || data.serviceType,
      notes: data.notes || '',
    }),
  }).then(adapt);

export const cancelAppointment = (id) =>
  apiFetch(`/api/appointments/${id}/cancel`, { method: 'PATCH' })
    .then(() => ({ id, status: 'Cancelled' }));

export const completeAppointment = (id, notes = '') =>
  apiFetch(`/api/appointments/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'Completed', notes }),
  }).then(() => ({ id, status: 'Completed', notes }));
