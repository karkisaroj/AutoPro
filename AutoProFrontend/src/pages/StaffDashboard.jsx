import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { LayoutDashboard, Users, ShoppingCart, BarChart3, Search } from 'lucide-react';

import StaffOverview  from './staff/StaffOverview';
import StaffCustomers from './staff/StaffCustomers';
import StaffSales     from './staff/StaffSales';
import StaffReports   from './staff/StaffReports';
import StaffSearch    from './staff/StaffSearch';

const NAV = [
  { label: 'Overview',         icon: LayoutDashboard, to: '/staff',           end: true },
  { label: 'Customers',        icon: Users,            to: '/staff/customers'            },
  { label: 'Sales & Invoices', icon: ShoppingCart,     to: '/staff/sales'                },
  { label: 'Reports',          icon: BarChart3,        to: '/staff/reports'              },
  { label: 'Search',           icon: Search,           to: '/staff/search'               },
];

export default function StaffDashboard() {
  return (
    <DashboardLayout role="Staff" navItems={NAV}>
      <Routes>
        <Route index            element={<StaffOverview />}  />
        <Route path="customers" element={<StaffCustomers />} />
        <Route path="sales"     element={<StaffSales />}     />
        <Route path="reports"   element={<StaffReports />}   />
        <Route path="search"    element={<StaffSearch />}    />
        <Route path="*"         element={<Navigate to="/staff" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
