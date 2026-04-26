import { mockFetch } from './api';

let _appointments = [
  { id: 'APT-101', customerId: 5, customerName: 'Saroj Karki',    phone: '9841-111-005', vehicle: 'KIA Seltos 2022',     plateNo: 'BA 4 KA 7890', service: 'Full Service',          date: '2026-04-20', time: '10:00 AM', mechanic: 'Anil Shrestha',  status: 'Confirmed', notes: 'Customer requested synthetic oil' },
  { id: 'APT-100', customerId: 1, customerName: 'Ram Bahadur Thapa', phone: '9841-111-001', vehicle: 'Toyota Fortuner 2021', plateNo: 'BA 1 CHA 1234', service: 'Tyre Rotation',        date: '2026-04-22', time: '02:00 PM', mechanic: 'Dipak Magar',    status: 'Pending',   notes: '' },
  { id: 'APT-099', customerId: 2, customerName: 'Sunita Sharma',   phone: '9841-111-002', vehicle: 'Honda City 2022',    plateNo: 'BA 2 KHA 5678', service: 'AC Service',            date: '2026-04-19', time: '11:30 AM', mechanic: 'Anil Shrestha',  status: 'Confirmed', notes: '' },
  { id: 'APT-098', customerId: 6, customerName: 'Anita Rai',       phone: '9841-111-006', vehicle: 'Mahindra XUV300 2021',plateNo:'JA 1 PA 2345',  service: 'Brake Inspection',     date: '2026-04-18', time: '09:00 AM', mechanic: 'Anil Shrestha',  status: 'Completed', notes: 'Replaced front brake pads' },
  { id: 'APT-097', customerId: 3, customerName: 'Prakash Oli',     phone: '9841-111-003', vehicle: 'Suzuki Swift 2020',  plateNo: 'GA 1 GA 9012',  service: 'Oil & Filter Change',  date: '2026-04-17', time: '03:00 PM', mechanic: 'Dipak Magar',    status: 'Completed', notes: '' },
  { id: 'APT-096', customerId: 4, customerName: 'Binita Gurung',   phone: '9841-111-004', vehicle: 'Hyundai Creta 2023', plateNo: 'BA 3 CHA 3456', service: 'Wheel Alignment',      date: '2026-04-15', time: '01:00 PM', mechanic: 'Anil Shrestha',  status: 'Completed', notes: '' },
];

const SERVICES = [
  'Oil & Filter Change',
  'Full Service',
  'Brake Inspection & Repair',
  'Tyre Rotation & Balancing',
  'AC Service & Recharge',
  'Engine Diagnostics',
  'Suspension Check',
  'Electrical Inspection',
  'Detailing & Wash',
  'Wheel Alignment',
];

const MECHANICS = ['Anil Shrestha', 'Dipak Magar', 'Sita Gurung'];

export const getAppointments         = ()   => mockFetch(_appointments);
export const getAvailableServices    = ()   => mockFetch(SERVICES);
export const getAvailableMechanics   = ()   => mockFetch(MECHANICS);
export const getCustomerAppointments = (id) => mockFetch(_appointments.filter(a => a.customerId === id));

export const createAppointment = (data) => {
  const id = 'APT-' + (101 + _appointments.length + 1);
  const apt = { id, status: 'Pending', ...data };
  _appointments = [apt, ..._appointments];
  return mockFetch(apt);
};

export const cancelAppointment = (id) => {
  _appointments = _appointments.map(a => a.id === id ? { ...a, status: 'Cancelled' } : a);
  return mockFetch(_appointments.find(a => a.id === id));
};

export const completeAppointment = (id, notes = '') => {
  _appointments = _appointments.map(a => a.id === id ? { ...a, status: 'Completed', notes } : a);
  return mockFetch(_appointments.find(a => a.id === id));
};
