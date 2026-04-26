import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Download, Users, ArrowUp } from 'lucide-react';
import { getFinancialReport, getCustomerReport } from '../../services/reportService';
import { PageHeader, Spinner, Avatar } from '../../components/ui/index';
import StatCard from '../../components/ui/StatCard';

const VIEWS = ['Daily', 'Monthly', 'Yearly'];

const dailyData = [
  { period: 'Apr 18', revenue: 18200, expenses: 5000, profit: 13200 },
  { period: 'Apr 17', revenue: 24500, expenses: 8000, profit: 16500 },
  { period: 'Apr 16', revenue: 9600,  expenses: 2000, profit: 7600  },
  { period: 'Apr 15', revenue: 11000, expenses: 3500, profit: 7500  },
  { period: 'Apr 14', revenue: 32000, expenses: 12000,profit: 20000 },
  { period: 'Apr 13', revenue: 6500,  expenses: 1500, profit: 5000  },
  { period: 'Apr 12', revenue: 15300, expenses: 3000, profit: 12300 },
];

function BarRow({ label, value, max, color = 'bg-violet-500' }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <p className="text-xs text-muted-foreground w-14 flex-shrink-0 font-medium">{label}</p>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs font-bold text-foreground w-20 text-right">NPR {(value/1000).toFixed(1)}K</p>
    </div>
  );
}

export default function AdminReports() {
  const [financial, setFinancial] = useState(null);
  const [customers, setCustomers] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [view,      setView]      = useState(1); // monthly default

  useEffect(() => {
    Promise.all([getFinancialReport(), getCustomerReport()]).then(([f, c]) => {
      setFinancial(f);
      setCustomers(c);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <PageHeader eyebrow="Analytics" title="Financial Reports" subtitle="Revenue, profit, and customer analytics." />
      <Spinner />
    </div>
  );

  const { summary, monthly, serviceBreakdown, topStaff } = financial;
  const maxMonthly = Math.max(...monthly.map(m => m.revenue));

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        eyebrow="Analytics"
        title="Financial Reports"
        subtitle="Revenue, expenses, and profit trends for your garage."
        actions={
          <button className="btn-secondary">
            <Download size={14} /> Export PDF
          </button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard label="Total Revenue"     value={`NPR ${summary.totalRevenue.toLocaleString()}`}  color="violet"  icon={TrendingUp} change="+12.4%" up />
        <StatCard label="Total Expenses"    value={`NPR ${summary.totalExpenses.toLocaleString()}`} color="red"     icon={BarChart3}  change="+3.2%"  up={false} />
        <StatCard label="Net Profit"        value={`NPR ${summary.netProfit.toLocaleString()}`}     color="emerald" icon={TrendingUp} change="+18.7%" up />
      </div>

      {/* Chart + Service Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Monthly bar chart */}
        <div className="xl:col-span-2 dash-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-bold text-foreground">Monthly Revenue vs Expenses</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Last 6 months</p>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-violet-500 inline-block" /> Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400 inline-block" /> Expenses</span>
            </div>
          </div>

          {/* Custom bar chart */}
          <div className="flex items-end gap-2 h-40">
            {monthly.map(m => {
              const revPct = Math.round((m.revenue / maxMonthly) * 100);
              const expPct = Math.round((m.expenses / maxMonthly) * 100);
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-0.5">
                  <p className="text-[9px] text-muted-foreground font-semibold mb-1">{(m.revenue/1000).toFixed(0)}k</p>
                  <div className="w-full flex items-end justify-center gap-0.5 h-28">
                    <div
                      className="w-5/12 rounded-t-md bg-gradient-to-t from-violet-600 to-violet-400 hover:from-violet-700 hover:to-violet-500 transition-all duration-300 cursor-pointer"
                      style={{ height: `${revPct}%`, minHeight: 4 }}
                      title={`Revenue: NPR ${m.revenue.toLocaleString()}`}
                    />
                    <div
                      className="w-5/12 rounded-t-md bg-gradient-to-t from-red-500 to-red-300 transition-all duration-300 cursor-pointer"
                      style={{ height: `${expPct}%`, minHeight: 4 }}
                      title={`Expenses: NPR ${m.expenses.toLocaleString()}`}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium mt-1">{m.month}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Service revenue breakdown */}
        <div className="dash-card p-5">
          <h2 className="font-display font-bold text-foreground mb-4">Revenue by Service</h2>
          <div className="space-y-3">
            {serviceBreakdown.slice(0, 5).map(s => (
              <div key={s.service}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-foreground truncate max-w-[65%]">{s.service}</p>
                  <p className="text-xs font-bold text-primary">{s.pct}%</p>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full transition-all duration-700"
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.count} jobs · NPR {s.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily breakdown table + Top staff */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 dash-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-display font-bold text-foreground">Daily Breakdown (This Week)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>{['Date', 'Revenue', 'Expenses', 'Net Profit', 'Margin'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {dailyData.map(row => {
                  const margin = ((row.profit / row.revenue) * 100).toFixed(1);
                  return (
                    <tr key={row.period}>
                      <td className="font-semibold text-foreground">{row.period}</td>
                      <td className="font-bold text-violet-600">NPR {row.revenue.toLocaleString()}</td>
                      <td className="text-muted-foreground">NPR {row.expenses.toLocaleString()}</td>
                      <td className="font-bold text-emerald-600">NPR {row.profit.toLocaleString()}</td>
                      <td>
                        <span className="badge bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">{margin}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top staff */}
        <div className="dash-card p-5">
          <h2 className="font-display font-bold text-foreground mb-4">Top Performers</h2>
          <div className="space-y-4">
            {topStaff.map((s, i) => (
              <div key={s.name} className="flex items-center gap-3">
                <div className="relative">
                  <Avatar name={s.name} color={['violet','emerald','blue'][i]} />
                  {i === 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full text-white text-[8px] font-black flex items-center justify-center">1</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{s.name}</p>
                  <p className="text-[11px] text-muted-foreground">{s.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-foreground">NPR {(s.revenue/1000).toFixed(0)}K</p>
                  <p className="text-[10px] text-muted-foreground">{s.invoices} invoices</p>
                </div>
              </div>
            ))}
          </div>

          {/* Customer tier stats */}
          <div className="mt-5 pt-4 border-t border-border">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Customer Tiers</p>
            {customers.loyaltyBreakdown.map(t => (
              <div key={t.tier} className="flex items-center justify-between text-sm py-1">
                <span className={`badge ${
                  t.tier === 'Platinum' ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400' :
                  t.tier === 'Gold'     ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                  t.tier === 'Silver'   ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' :
                  'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                }`}>{t.tier}</span>
                <span className="font-bold text-foreground">{t.count} customer{t.count > 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
