import React from 'react';
import { TrendingUp, Users, Package, AlertTriangle, ArrowUp, ArrowDown, ShoppingCart, Clock } from 'lucide-react';

const stats = [
  { label: 'Monthly Revenue',  value: 'NPR 4,82,500', change: '+12%', up: true,  icon: TrendingUp,    gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-200 dark:shadow-violet-900/40'  },
  { label: 'Active Staff',     value: '8',            change: '+1',   up: true,  icon: Users,         gradient: 'from-blue-500 to-cyan-500',     shadow: 'shadow-blue-200 dark:shadow-blue-900/40'     },
  { label: 'Parts in Stock',   value: '1,240',        change: '-34',  up: false, icon: Package,       gradient: 'from-amber-400 to-orange-500',  shadow: 'shadow-amber-200 dark:shadow-amber-900/40'   },
  { label: 'Low Stock Alerts', value: '5',            change: '+2',   up: false, icon: AlertTriangle, gradient: 'from-red-500 to-rose-600',      shadow: 'shadow-red-200 dark:shadow-red-900/40'       },
];

const lowStockParts = [
  { id: 'PT-001', name: 'Brake Pad Set (Toyota)',     qty: 4,  threshold: 10, vendor: 'NepalAuto Supplies', pct: 40 },
  { id: 'PT-008', name: 'Air Filter (Honda City)',    qty: 7,  threshold: 10, vendor: 'KTM Parts Hub',      pct: 70 },
  { id: 'PT-019', name: 'Engine Oil 5W-30 (5L)',     qty: 3,  threshold: 10, vendor: 'Lubrikant Nepal',    pct: 30 },
  { id: 'PT-024', name: 'Spark Plug Set NGK',         qty: 8,  threshold: 10, vendor: 'NepalAuto Supplies', pct: 80 },
  { id: 'PT-031', name: 'Timing Belt (Hyundai i20)', qty: 2,  threshold: 10, vendor: 'AutoZone Pvt. Ltd.', pct: 20 },
];

const recentTx = [
  { id: 'INV-1042', type: 'Sale',     party: 'Ram Bahadur',       amount: 'NPR 8,200',  date: 'Today 10:30 AM',    status: 'paid'     },
  { id: 'PO-2031',  type: 'Purchase', party: 'NepalAuto Supplies', amount: 'NPR 45,000', date: 'Today 09:15 AM',    status: 'received' },
  { id: 'INV-1041', type: 'Sale',     party: 'Sunita Thapa',      amount: 'NPR 3,500',  date: 'Yesterday 4:00 PM', status: 'pending'  },
  { id: 'INV-1040', type: 'Sale',     party: 'Prakash Oli',       amount: 'NPR 12,800', date: 'Yesterday 2:10 PM', status: 'paid'     },
];

const revenue = [
  { day: 'Mon', val: 18200 }, { day: 'Tue', val: 9600 },
  { day: 'Wed', val: 24500 }, { day: 'Thu', val: 11000 },
  { day: 'Fri', val: 32000 }, { day: 'Sat', val: 6500 },
  { day: 'Sun', val: 15300 },
];
const maxRevenue = Math.max(...revenue.map(r => r.val));

const statusConfig = {
  paid:     { label: 'Paid',     cls: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' },
  received: { label: 'Received', cls: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'             },
  pending:  { label: 'Pending',  cls: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'         },
};

function initials(name) { return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(); }

export default function AdminOverview() {
  return (
    <div className="space-y-6 page-enter">

      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="section-label">Dashboard</p>
          <h1 className="text-2xl font-display font-black text-foreground">Admin Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-xl px-3 py-1.5">
          <Clock size={14} />
          <span>Last updated: just now</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, change, up, icon: Icon, gradient, shadow }) => (
          <div key={label} className="stat-card group">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} shadow-lg ${shadow} flex items-center justify-center transition-transform duration-200 group-hover:scale-105`}>
                <Icon size={18} className="text-white" />
              </div>
              <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                up ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                   : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
              }`}>
                {up ? <ArrowUp size={11} /> : <ArrowDown size={11} />} {change}
              </span>
            </div>
            <p className="text-2xl font-display font-black text-foreground tracking-tight">{value}</p>
            <p className="text-xs text-muted-foreground font-medium mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Low-stock alert banner */}
      <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-2xl p-4">
        <div className="w-8 h-8 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={15} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-red-700 dark:text-red-400 text-sm">Auto-Notification: Low Stock Detected</p>
          <p className="text-xs text-red-600 dark:text-red-300 mt-0.5">System flagged 5 parts below 10 units. Email notifications sent to procurement team automatically.</p>
        </div>
      </div>

      {/* Revenue chart + Transactions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Mini bar chart */}
        <div className="xl:col-span-2 dash-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-bold text-foreground">Weekly Revenue</h2>
              <p className="text-xs text-muted-foreground mt-0.5">April 6 – 12, 2026</p>
            </div>
            <span className="badge bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">This Week</span>
          </div>
          <div className="flex items-end gap-2 h-32">
            {revenue.map(r => {
              const pct = Math.round((r.val / maxRevenue) * 100);
              return (
                <div key={r.day} className="flex-1 flex flex-col items-center gap-1">
                  <p className="text-[10px] text-muted-foreground font-semibold" style={{fontSize:'9px'}}>
                    {(r.val/1000).toFixed(0)}k
                  </p>
                  <div className="w-full flex items-end h-24">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-violet-600 to-violet-400 transition-all duration-500 hover:from-violet-700 hover:to-violet-500"
                      style={{ height: `${pct}%`, minHeight: '6px' }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium">{r.day}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="dash-card overflow-hidden">
          <div className="px-4 py-4 border-b border-border">
            <h2 className="font-display font-bold text-foreground">Recent Transactions</h2>
          </div>
          <div className="divide-y divide-border">
            {recentTx.map(tx => {
              const sc = statusConfig[tx.status] || statusConfig.pending;
              return (
                <div key={tx.id} className="flex items-center gap-3 px-4 py-3 hover:bg-card-hover transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0
                    ${tx.type === 'Sale' ? 'bg-gradient-to-br from-violet-500 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-cyan-600'}`}
                  >
                    {initials(tx.party)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{tx.party}</p>
                    <p className="text-[10px] text-muted-foreground">{tx.date}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-black text-foreground">{tx.amount}</p>
                    <span className={`badge ${sc.cls} text-[9px]`}>{sc.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Low Stock Table */}
      <div className="dash-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-display font-bold text-foreground">Low Stock Parts</h2>
          <span className="badge bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">{lowStockParts.length} items</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                {['Part ID', 'Name', 'Qty / Threshold', 'Stock Level', 'Vendor'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lowStockParts.map(p => (
                <tr key={p.id}>
                  <td className="font-mono text-xs text-muted-foreground">{p.id}</td>
                  <td className="font-semibold text-foreground">{p.name}</td>
                  <td>
                    <span className="badge bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">{p.qty} / {p.threshold}</span>
                  </td>
                  <td className="min-w-[120px]">
                    <div className="space-y-1">
                      <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${p.pct <= 30 ? 'bg-red-500' : p.pct <= 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${p.pct}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground">{p.pct}%</p>
                    </div>
                  </td>
                  <td className="text-muted-foreground">{p.vendor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
