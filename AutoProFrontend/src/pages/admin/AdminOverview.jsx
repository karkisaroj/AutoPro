import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { TrendingUp, Users, Package, AlertTriangle, ArrowUp, ArrowDown, Clock } from 'lucide-react';
=======
import { TrendingUp, Users, Package, AlertTriangle, Clock } from 'lucide-react';
>>>>>>> noble
import { getStaff } from '../../services/staffService';
import { getParts, getLowStockParts } from '../../services/partsService';
import { getSales } from '../../services/salesService';
import { getFinancialReport } from '../../services/reportService';
<<<<<<< HEAD
import { Spinner } from '../../components/ui/index';

const statusConfig = {
  paid:     { label: 'Paid',     cls: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' },
  received: { label: 'Received', cls: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'             },
  pending:  { label: 'Pending',  cls: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'         },
  credit:   { label: 'Credit',   cls: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'                 },
=======
import { PageHeader, Spinner, StatusBadge } from '../../components/ui/index';
import StatCard from '../../components/ui/StatCard';

const STATUS_CLS = {
  paid:     'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  received: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  pending:  'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  credit:   'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
>>>>>>> noble
};

function initials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function AdminOverview() {
<<<<<<< HEAD
  const [data, setData]     = useState(null);
=======
  const [data,    setData]    = useState(null);
>>>>>>> noble
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getFinancialReport(),
      getStaff(),
      getParts(),
      getLowStockParts(),
      getSales(),
    ]).then(([financial, staffList, partsList, lowStockList, salesList]) => {
      setData({ financial, staffList, partsList, lowStockList, salesList });
      setLoading(false);
<<<<<<< HEAD
    });
  }, []);

  if (loading) return (
    <div className="space-y-6 page-enter">
      <div>
        <p className="section-label">Dashboard</p>
        <h1 className="text-2xl font-display font-black text-foreground">Admin Overview</h1>
      </div>
=======
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <PageHeader eyebrow="Dashboard" title="Admin Overview" subtitle="Loading your dashboard…" />
>>>>>>> noble
      <Spinner />
    </div>
  );

  const { financial, staffList, partsList, lowStockList, salesList } = data;
  const activeStaff = staffList.filter(s => s.active).length;
<<<<<<< HEAD
  const totalParts  = partsList.reduce((s, p) => s + (p.quantity || 0), 0);
  const recentTx    = salesList.slice(0, 5).map(s => ({
    id: s.id,
    party: s.customerName,
    amount: s.total,
    date: s.date,
    status: s.status?.toLowerCase() || 'pending',
  }));

  const stats = [
    {
      label: 'Monthly Revenue',
      value: `NPR ${(financial.summary.totalRevenue || 0).toLocaleString()}`,
      change: `${financial.summary.monthOverMonth >= 0 ? '+' : ''}${financial.summary.monthOverMonth?.toFixed(1)}%`,
      up: financial.summary.monthOverMonth >= 0,
      gradient: 'from-violet-500 to-purple-600',
      shadow: 'shadow-violet-200 dark:shadow-violet-900/40',
      icon: TrendingUp,
    },
    {
      label: 'Active Staff',
      value: activeStaff.toString(),
      change: `${staffList.length} total`,
      up: true,
      gradient: 'from-blue-500 to-cyan-500',
      shadow: 'shadow-blue-200 dark:shadow-blue-900/40',
      icon: Users,
    },
    {
      label: 'Parts in Stock',
      value: totalParts.toLocaleString(),
      change: `${partsList.length} SKUs`,
      up: true,
      gradient: 'from-amber-400 to-orange-500',
      shadow: 'shadow-amber-200 dark:shadow-amber-900/40',
      icon: Package,
    },
    {
      label: 'Low Stock Alerts',
      value: lowStockList.length.toString(),
      change: 'items below min',
      up: false,
      gradient: 'from-red-500 to-rose-600',
      shadow: 'shadow-red-200 dark:shadow-red-900/40',
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="section-label">Dashboard</p>
          <h1 className="text-2xl font-display font-black text-foreground">Admin Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-xl px-3 py-1.5">
          <Clock size={14} />
          <span>Live data</span>
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
=======
  const totalParts  = partsList.reduce((acc, p) => acc + (p.quantity || 0), 0);
  const recentSales = salesList.slice(0, 6);
  const maxRev      = Math.max(...financial.monthly.map(m => m.revenue), 1);

  const momDisplay = financial.summary.monthOverMonth != null
    ? `${financial.summary.monthOverMonth >= 0 ? '+' : ''}${Number(financial.summary.monthOverMonth).toFixed(1)}%`
    : null;

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        eyebrow="Dashboard"
        title="Admin Overview"
        subtitle="Real-time operational snapshot of AutoPro Garage."
        actions={
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-card border border-border rounded-xl px-3 py-1.5">
            <Clock size={13} />
            <span>Live data</span>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Monthly Revenue"
          value={`NPR ${Number(financial.summary.totalRevenue || 0).toLocaleString()}`}
          color="violet"
          icon={TrendingUp}
          change={momDisplay}
          up={financial.summary.monthOverMonth >= 0}
        />
        <StatCard
          label="Active Staff"
          value={activeStaff.toString()}
          color="blue"
          icon={Users}
          sub={`${staffList.length} total members`}
        />
        <StatCard
          label="Parts in Stock"
          value={totalParts.toLocaleString()}
          color="amber"
          icon={Package}
          sub={`${partsList.length} unique SKUs`}
        />
        <StatCard
          label="Low Stock Alerts"
          value={lowStockList.length.toString()}
          color={lowStockList.length > 0 ? 'red' : 'emerald'}
          icon={AlertTriangle}
          sub={lowStockList.length === 0 ? 'All stocked up' : 'Reorder needed'}
        />
>>>>>>> noble
      </div>

      {/* Low-stock alert banner */}
      {lowStockList.length > 0 && (
        <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-2xl p-4">
          <div className="w-8 h-8 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={15} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-red-700 dark:text-red-400 text-sm">Low Stock Detected</p>
            <p className="text-xs text-red-600 dark:text-red-300 mt-0.5">
<<<<<<< HEAD
              {lowStockList.length} part{lowStockList.length > 1 ? 's' : ''} below minimum stock level. Review the table below and reorder as needed.
=======
              {lowStockList.length} part{lowStockList.length !== 1 ? 's' : ''} below minimum stock level.
              Go to Parts &rarr; Purchase Orders to reorder.
>>>>>>> noble
            </p>
          </div>
        </div>
      )}

<<<<<<< HEAD
      {/* Recent Transactions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
=======
      {/* Revenue Trend + Recent Transactions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Revenue bar chart */}
>>>>>>> noble
        <div className="xl:col-span-2 dash-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-bold text-foreground">Revenue Trend</h2>
<<<<<<< HEAD
              <p className="text-xs text-muted-foreground mt-0.5">Monthly from financial report</p>
            </div>
          </div>
          <div className="flex items-end gap-2 h-32">
            {(financial.monthly.length > 0 ? financial.monthly : [{ month: 'Now', revenue: financial.summary.totalRevenue || 0 }]).map((m, i) => {
              const maxRev = Math.max(...financial.monthly.map(x => x.revenue || 0), 1);
              const pct    = Math.round(((m.revenue || 0) / maxRev) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <p className="text-[10px] text-muted-foreground font-semibold" style={{ fontSize: '9px' }}>
                    {((m.revenue || 0) / 1000).toFixed(0)}k
                  </p>
                  <div className="w-full flex items-end h-24">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-violet-600 to-violet-400 transition-all duration-500"
                      style={{ height: `${pct || 4}%`, minHeight: '6px' }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium">{m.month}</p>
                </div>
              );
            })}
          </div>
        </div>

=======
              <p className="text-xs text-muted-foreground mt-0.5">Last 6 months</p>
            </div>
            <span className="text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-2.5 py-1 rounded-full">
              NPR {Number(financial.summary.totalRevenue || 0).toLocaleString()} this month
            </span>
          </div>
          {financial.monthly.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">No revenue data yet</p>
          ) : (
            <div className="flex items-end gap-2 h-40">
              {financial.monthly.map(m => {
                const pct = Math.round((m.revenue / maxRev) * 100);
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-0.5">
                    <p className="text-[9px] text-muted-foreground font-semibold mb-1">
                      {m.revenue > 0 ? `${(m.revenue / 1000).toFixed(0)}k` : '—'}
                    </p>
                    <div className="w-full flex items-end h-28">
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-violet-600 to-violet-400 hover:from-violet-700 hover:to-violet-500 transition-all duration-300 cursor-pointer"
                        style={{ height: `${pct || 2}%`, minHeight: 4 }}
                        title={`${m.month}: NPR ${m.revenue.toLocaleString()}`}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium mt-1">{m.month}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent transactions */}
>>>>>>> noble
        <div className="dash-card overflow-hidden">
          <div className="px-4 py-4 border-b border-border">
            <h2 className="font-display font-bold text-foreground">Recent Transactions</h2>
          </div>
          <div className="divide-y divide-border">
<<<<<<< HEAD
            {recentTx.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">No transactions yet</p>
            ) : recentTx.map(tx => {
              const sc = statusConfig[tx.status] || statusConfig.pending;
              return (
                <div key={tx.id} className="flex items-center gap-3 px-4 py-3 hover:bg-card-hover transition-colors">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 bg-gradient-to-br from-violet-500 to-purple-600">
                    {initials(tx.party)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{tx.party}</p>
                    <p className="text-[10px] text-muted-foreground">{tx.date}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-black text-foreground">NPR {tx.amount?.toLocaleString()}</p>
                    <span className={`badge ${sc.cls} text-[9px]`}>{sc.label}</span>
=======
            {recentSales.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">No transactions yet</p>
            ) : recentSales.map(tx => {
              const status = tx.status?.toLowerCase() || 'pending';
              const cls    = STATUS_CLS[status] || STATUS_CLS.pending;
              return (
                <div key={tx.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0 bg-gradient-to-br from-violet-500 to-purple-600">
                    {initials(tx.customerName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{tx.customerName}</p>
                    <p className="text-[10px] text-muted-foreground">{tx.date}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-black text-foreground">NPR {tx.total?.toLocaleString()}</p>
                    <span className={`badge ${cls} text-[9px]`}>{tx.status}</span>
>>>>>>> noble
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Low Stock Table */}
      {lowStockList.length > 0 && (
        <div className="dash-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-display font-bold text-foreground">Low Stock Parts</h2>
<<<<<<< HEAD
            <span className="badge bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">{lowStockList.length} items</span>
=======
            <span className="badge bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">
              {lowStockList.length} items
            </span>
>>>>>>> noble
          </div>
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
<<<<<<< HEAD
                <tr>{['Name', 'Category', 'Qty / Min', 'Stock Level', 'Vendor'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {lowStockList.map(p => {
                  const pct = Math.min(100, Math.round(((p.quantity || 0) / (p.minStock || 1)) * 100));
=======
                <tr>
                  {['Name', 'Category', 'Qty / Min', 'Stock Level', 'Vendor'].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {lowStockList.map(p => {
                  const min = p.minStock ?? p.minQuantity ?? 1;
                  const pct = Math.min(100, Math.round(((p.quantity || 0) / min) * 100));
>>>>>>> noble
                  return (
                    <tr key={p.id}>
                      <td className="font-semibold text-foreground">{p.name}</td>
                      <td className="text-muted-foreground text-xs">{p.category}</td>
                      <td>
<<<<<<< HEAD
                        <span className="badge bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">{p.quantity} / {p.minStock}</span>
=======
                        <span className="badge bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">
                          {p.quantity} / {min}
                        </span>
>>>>>>> noble
                      </td>
                      <td className="min-w-[120px]">
                        <div className="space-y-1">
                          <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${pct <= 30 ? 'bg-red-500' : pct <= 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground">{pct}%</p>
                        </div>
                      </td>
<<<<<<< HEAD
                      <td className="text-muted-foreground">{p.supplier}</td>
=======
                      <td className="text-muted-foreground">{p.vendorName}</td>
>>>>>>> noble
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
