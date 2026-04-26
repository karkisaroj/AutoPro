import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { LayoutDashboard, Calendar, Clock, Cpu } from 'lucide-react';

import CustomerOverview     from './customer/CustomerOverview';
import CustomerAppointments from './customer/CustomerAppointments';
import CustomerHistory      from './customer/CustomerHistory';
import CustomerDiagnostics  from './customer/CustomerDiagnostics';

const NAV = [
  { label: 'My Dashboard',   icon: LayoutDashboard, to: '/customer',               end: true },
  { label: 'Appointments',   icon: Calendar,         to: '/customer/appointments'             },
  { label: 'Service History', icon: Clock,           to: '/customer/history'                  },
  { label: 'AI Diagnostics', icon: Cpu,              to: '/customer/diagnostics'              },
];

export default function CustomerDashboard() {
  return (
    <DashboardLayout role="Customer" userName="Saroj Karki" navItems={NAV}>
      <Routes>
        <Route index               element={<CustomerOverview />}     />
        <Route path="appointments" element={<CustomerAppointments />} />
        <Route path="history"      element={<CustomerHistory />}      />
        <Route path="diagnostics"  element={<CustomerDiagnostics />}  />
        <Route path="*"            element={<Navigate to="/customer" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
