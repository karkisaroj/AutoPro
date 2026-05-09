import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { LayoutDashboard, Calendar, Clock, Cpu, User } from 'lucide-react';

import CustomerOverview     from './customer/CustomerOverview';
import CustomerAppointments from './customer/CustomerAppointments';
import CustomerHistory      from './customer/CustomerHistory';
import CustomerDiagnostics  from './customer/CustomerDiagnostics';
import CustomerProfile      from './customer/CustomerProfile';

const NAV = [
  { label: 'My Dashboard',   icon: LayoutDashboard, to: '/customer',               end: true },
  { label: 'Appointments',   icon: Calendar,         to: '/customer/appointments'             },
  { label: 'Service History', icon: Clock,           to: '/customer/history'                  },
  { label: 'My Profile',     icon: User,             to: '/customer/profile'                  },
  { label: 'AI Diagnostics', icon: Cpu,              to: '/customer/diagnostics'              },
];

export default function CustomerDashboard() {
  return (
    <DashboardLayout role="Customer" navItems={NAV}>
      <Routes>
        <Route index               element={<CustomerOverview />}     />
        <Route path="appointments" element={<CustomerAppointments />} />
        <Route path="history"      element={<CustomerHistory />}      />
        <Route path="profile"      element={<CustomerProfile />}      />
        <Route path="diagnostics"  element={<CustomerDiagnostics />}  />
        <Route path="*"            element={<Navigate to="/customer" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
