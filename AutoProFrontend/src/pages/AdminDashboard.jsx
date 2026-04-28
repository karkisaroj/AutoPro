import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
<<<<<<< HEAD
import { LayoutDashboard, BarChart3, Users, Package, Store } from 'lucide-react';

import AdminOverview from './admin/AdminOverview';
import AdminReports  from './admin/AdminReports';
import AdminStaff    from './admin/AdminStaff';
import AdminParts    from './admin/AdminParts';
import AdminVendors  from './admin/AdminVendors';

const NAV = [
  { label: 'Overview',      icon: LayoutDashboard, to: '/admin',          end: true },
  { label: 'Reports',       icon: BarChart3,        to: '/admin/reports'            },
  { label: 'Staff',         icon: Users,            to: '/admin/staff'              },
  { label: 'Parts & Stock', icon: Package,          to: '/admin/parts'              },
  { label: 'Vendors',       icon: Store,            to: '/admin/vendors'            },
=======
import { LayoutDashboard, BarChart3, Users, Package, Store, ShoppingCart } from 'lucide-react';

import AdminOverview        from './admin/AdminOverview';
import AdminReports         from './admin/AdminReports';
import AdminStaff           from './admin/AdminStaff';
import AdminParts           from './admin/AdminParts';
import AdminVendors         from './admin/AdminVendors';
import AdminPurchaseOrders  from './admin/AdminPurchaseOrders';

const NAV = [
  { label: 'Overview',        icon: LayoutDashboard, to: '/admin',                 end: true },
  { label: 'Reports',         icon: BarChart3,        to: '/admin/reports'                   },
  { label: 'Staff',           icon: Users,            to: '/admin/staff'                     },
  { label: 'Parts & Stock',   icon: Package,          to: '/admin/parts'                     },
  { label: 'Purchase Orders', icon: ShoppingCart,     to: '/admin/purchase-orders'           },
  { label: 'Vendors',         icon: Store,            to: '/admin/vendors'                   },
>>>>>>> noble
];

export default function AdminDashboard() {
  return (
    <DashboardLayout role="Admin" navItems={NAV}>
      <Routes>
<<<<<<< HEAD
        <Route index              element={<AdminOverview />} />
        <Route path="reports"     element={<AdminReports />}  />
        <Route path="staff"       element={<AdminStaff />}    />
        <Route path="parts"       element={<AdminParts />}    />
        <Route path="vendors"     element={<AdminVendors />}  />
        <Route path="*"           element={<Navigate to="/admin" replace />} />
=======
        <Route index                    element={<AdminOverview />}       />
        <Route path="reports"           element={<AdminReports />}        />
        <Route path="staff"             element={<AdminStaff />}          />
        <Route path="parts"             element={<AdminParts />}          />
        <Route path="purchase-orders"   element={<AdminPurchaseOrders />} />
        <Route path="vendors"           element={<AdminVendors />}        />
        <Route path="*"                 element={<Navigate to="/admin" replace />} />
>>>>>>> noble
      </Routes>
    </DashboardLayout>
  );
}
