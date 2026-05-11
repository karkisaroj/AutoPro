import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { LayoutDashboard, Calendar, Clock, Cpu, User, Package } from 'lucide-react';

import CustomerOverview      from './customer/CustomerOverview';
import CustomerAppointments  from './customer/CustomerAppointments';
import CustomerHistory       from './customer/CustomerHistory';
import CustomerDiagnostics   from './customer/CustomerDiagnostics';
import CustomerProfile       from './customer/CustomerProfile';
import CustomerPartRequests  from './customer/CustomerPartRequests';

const NAV = [
  { label: 'My Dashboard',    icon: LayoutDashboard, to: '/customer',                  end: true },
  { label: 'Appointments',    icon: Calendar,        to: '/customer/appointments'                },
  { label: 'Service History', icon: Clock,           to: '/customer/history'                     },
  { label: 'Part Requests',   icon: Package,         to: '/customer/part-requests'               },
  { label: 'My Profile',      icon: User,            to: '/customer/profile'                     },
  { label: 'AI Diagnostics',  icon: Cpu,             to: '/customer/diagnostics'                 },
];

export default function CustomerDashboard() {
  return (
    <DashboardLayout role="Customer" navItems={NAV}>
      <Routes>
        <Route index                  element={<CustomerOverview />}     />
        <Route path="appointments"    element={<CustomerAppointments />} />
        <Route path="history"         element={<CustomerHistory />}      />
        <Route path="part-requests"   element={<CustomerPartRequests />} />
        <Route path="profile"         element={<CustomerProfile />}      />
        <Route path="diagnostics"     element={<CustomerDiagnostics />}  />
        <Route path="*"               element={<Navigate to="/customer" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
