import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { BarChart3, TrendingUp, Download, Users, ArrowUp } from 'lucide-react';
import { getFinancialReport, getCustomerReport } from '../../services/reportService';
=======
import { BarChart3, TrendingUp, Download, FileText } from 'lucide-react';
import { getFinancialReport, getCustomerReport, downloadFinancialReportPdf } from '../../services/reportService';
>>>>>>> noble
import { PageHeader, Spinner, Avatar } from '../../components/ui/index';
import StatCard from '../../components/ui/StatCard';

const VIEWS = ['Daily', 'Monthly', 'Yearly'];

<<<<<<< HEAD
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
=======
export default function AdminReports() {
  const [financial,  setFinancial]  = useState(null);
  const [customers,  setCustomers]  = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [view,       setView]       = useState(1); // Monthly default
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError,   setPdfError]   = useState(null);

  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  useEffect(() => {
    setLoading(true);
    setPdfError(null);
    const period = VIEWS[view].toLowerCase();
    Promise.all([
      getFinancialReport(period, year, view === 2 ? null : month),
      getCustomerReport(),
    ]).then(([f, c]) => {
      setFinancial(f);
      setCustomers(c);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [view, year, month]);

  const handleExportPdf = async () => {
    setPdfLoading(true);
    setPdfError(null);
    try {
      await downloadFinancialReportPdf(VIEWS[view].toLowerCase(), year, view === 2 ? null : month);
    } catch {
      setPdfError('Failed to generate PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };
>>>>>>> noble

  if (loading) return (
    <div className="space-y-6">
      <PageHeader eyebrow="Analytics" title="Financial Reports" subtitle="Revenue, profit, and customer analytics." />
      <Spinner />
    </div>
  );

<<<<<<< HEAD
  const { summary, monthly, serviceBreakdown } = financial;
  const maxMonthly = Math.max(...monthly.map(m => m.revenue), 1);

  // Derive daily breakdown table from monthly data
  const dailyData = monthly.map(m => ({
    period: m.month,
    revenue: m.revenue || 0,
    expenses: m.expenses || 0,
    profit: (m.revenue || 0) - (m.expenses || 0),
  }));

  // Use topSpenders from customer report for "Top Customers" section
  const topCustomers = (customers?.topSpenders || []).slice(0, 3);

=======
  const { summary, monthly, breakdown, serviceBreakdown } = financial;
  const maxMonthly = Math.max(...monthly.map(m => m.revenue), ...monthly.map(m => m.expenses), 1);
  const topCustomers = (customers?.topSpenders || []).slice(0, 3);

  const momDisplay = summary.monthOverMonth != null
    ? `${summary.monthOverMonth >= 0 ? '+' : ''}${Number(summary.monthOverMonth).toFixed(1)}%`
    : null;

  const periodLabel = VIEWS[view];
  const chartTitle = `${periodLabel} Revenue vs Expenses`;
  const tableTitle = `Revenue Breakdown — ${periodLabel}`;

>>>>>>> noble
  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        eyebrow="Analytics"
        title="Financial Reports"
        subtitle="Revenue, expenses, and profit trends for your garage."
        actions={
<<<<<<< HEAD
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
=======
          <div className="flex items-center gap-2 flex-wrap">
            {/* Period selector */}
            <div className="flex rounded-xl border border-border overflow-hidden">
              {VIEWS.map((v, i) => (
                <button
                  key={v}
                  onClick={() => setView(i)}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                    view === i
                      ? 'bg-primary text-white'
                      : 'bg-card text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <button className="btn-secondary" disabled={pdfLoading} onClick={handleExportPdf}>
              <Download size={14} />
              {pdfLoading ? 'Generating…' : 'Export PDF'}
            </button>
          </div>
        }
      />

      {pdfError && (
        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2">
          {pdfError}
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard
          label="Total Revenue"
          value={`NPR ${Number(summary.totalRevenue).toLocaleString()}`}
          color="violet"
          icon={TrendingUp}
          change={momDisplay}
          up={summary.monthOverMonth >= 0}
        />
        <StatCard
          label="Total Expenses"
          value={`NPR ${Number(summary.totalExpenses).toLocaleString()}`}
          color="red"
          icon={BarChart3}
        />
        <StatCard
          label="Net Profit"
          value={`NPR ${Number(summary.netProfit).toLocaleString()}`}
          color={summary.netProfit >= 0 ? 'emerald' : 'red'}
          icon={TrendingUp}
          sub={summary.netProfit >= 0 ? 'Profitable' : 'Loss'}
        />
        <StatCard
          label="Invoices Issued"
          value={summary.invoicesIssued.toString()}
          color="blue"
          icon={FileText}
        />
        <StatCard
          label="Avg Invoice Value"
          value={`NPR ${Number(summary.avgInvoiceValue).toLocaleString()}`}
          color="amber"
          icon={BarChart3}
        />
      </div>

      {/* Bar chart + Service breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Bar chart — last 6 months regardless of period */}
        <div className="xl:col-span-2 dash-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-bold text-foreground">{chartTitle}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Last 6 months</p>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-violet-500 inline-block" /> Revenue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block" /> Expenses
              </span>
            </div>
          </div>

          {monthly.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">No data for this period</p>
          ) : (
            <div className="flex items-end gap-2 h-40">
              {monthly.map(m => {
                const revPct = Math.round((m.revenue / maxMonthly) * 100);
                const expPct = Math.round((m.expenses / maxMonthly) * 100);
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-0.5">
                    <p className="text-[9px] text-muted-foreground font-semibold mb-1">
                      {m.revenue > 0 ? `${(m.revenue / 1000).toFixed(0)}k` : '—'}
                    </p>
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
          )}
>>>>>>> noble
        </div>

        {/* Service revenue breakdown */}
        <div className="dash-card p-5">
<<<<<<< HEAD
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
            <h2 className="font-display font-bold text-foreground">Revenue Breakdown (Monthly)</h2>
=======
          <h2 className="font-display font-bold text-foreground mb-4">Revenue by Category</h2>
          {serviceBreakdown.length === 0 ? (
            <p className="text-xs text-muted-foreground">No sales data for this period</p>
          ) : (
            <div className="space-y-3">
              {serviceBreakdown.slice(0, 6).map(s => (
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
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {s.count} sale{s.count !== 1 ? 's' : ''} · NPR {Number(s.revenue).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Breakdown table + Top customers */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 dash-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-display font-bold text-foreground">{tableTitle}</h2>
>>>>>>> noble
          </div>
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
<<<<<<< HEAD
                <tr>{['Date', 'Revenue', 'Expenses', 'Net Profit', 'Margin'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {dailyData.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground text-sm">No data for this period</td></tr>
                ) : dailyData.map(row => {
                  const margin = row.revenue > 0 ? ((row.profit / row.revenue) * 100).toFixed(1) : '0.0';
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
=======
                <tr>
                  {['Date', 'Revenue (NPR)', 'Invoices'].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {breakdown.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-muted-foreground text-sm">
                      No transactions for this period
                    </td>
                  </tr>
                ) : breakdown.map((row, idx) => (
                  <tr key={idx}>
                    <td className="font-semibold text-foreground">{row.date}</td>
                    <td className="font-bold text-violet-600">{Number(row.revenue).toLocaleString()}</td>
                    <td>
                      <span className="badge bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400">
                        {row.invoices}
                      </span>
                    </td>
                  </tr>
                ))}
>>>>>>> noble
              </tbody>
            </table>
          </div>
        </div>

        {/* Top customers */}
        <div className="dash-card p-5">
          <h2 className="font-display font-bold text-foreground mb-4">Top Customers</h2>
          <div className="space-y-4">
            {topCustomers.length === 0 ? (
              <p className="text-xs text-muted-foreground">No customer data yet</p>
            ) : topCustomers.map((s, i) => (
<<<<<<< HEAD
              <div key={s.name} className="flex items-center gap-3">
                <div className="relative">
                  <Avatar name={s.name} color={['violet','emerald','blue'][i]} />
                  {i === 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full text-white text-[8px] font-black flex items-center justify-center">1</span>
=======
              <div key={s.customerId} className="flex items-center gap-3">
                <div className="relative">
                  <Avatar name={s.name} color={['violet', 'emerald', 'blue'][i]} />
                  {i === 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full text-white text-[8px] font-black flex items-center justify-center">
                      1
                    </span>
>>>>>>> noble
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{s.name}</p>
                  <p className="text-[11px] text-muted-foreground">{s.tier} · {s.visits} visits</p>
                </div>
                <div className="text-right">
<<<<<<< HEAD
                  <p className="text-xs font-black text-foreground">NPR {((s.spent || 0) / 1000).toFixed(0)}K</p>
=======
                  <p className="text-xs font-black text-foreground">
                    NPR {((s.spent || 0) / 1000).toFixed(0)}K
                  </p>
>>>>>>> noble
                  <p className="text-[10px] text-muted-foreground">total spent</p>
                </div>
              </div>
            ))}
          </div>

          {/* Customer tier stats */}
          <div className="mt-5 pt-4 border-t border-border">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Customer Tiers</p>
<<<<<<< HEAD
            {customers.loyaltyBreakdown.map(t => (
=======
            {(customers?.loyaltyBreakdown || []).map(t => (
>>>>>>> noble
              <div key={t.tier} className="flex items-center justify-between text-sm py-1">
                <span className={`badge ${
                  t.tier === 'Platinum' ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400' :
                  t.tier === 'Gold'     ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                  t.tier === 'Silver'   ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' :
                  'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                }`}>{t.tier}</span>
<<<<<<< HEAD
                <span className="font-bold text-foreground">{t.count} customer{t.count > 1 ? 's' : ''}</span>
=======
                <span className="font-bold text-foreground">{t.count} customer{t.count !== 1 ? 's' : ''}</span>
>>>>>>> noble
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
