import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, CreditCard, Download, Trophy, Star, AlertCircle, Send } from 'lucide-react';
import { getCustomerReport } from '../../services/reportService';
import { getCustomers } from '../../services/customerService';
import { apiFetch } from '../../services/api';
import { PageHeader, Avatar, Spinner } from '../../components/ui/index';

const TABS = ['Top Spenders', 'Regular Customers', 'Pending Credits'];

const RANK_STYLES = {
  1: 'bg-amber-400 text-white',
  2: 'bg-gray-300 text-gray-800',
  3: 'bg-amber-700/80 text-white',
};

export default function StaffReports() {
  const [tab, setTab]                   = useState(0);
  const [loading, setLoading]           = useState(true);
  const [topSpenders, setTopSpenders]   = useState([]);
  const [regularCustomers, setRegularCustomers] = useState([]);
  const [pendingCredits, setPendingCredits]      = useState([]);
  const [sending, setSending]           = useState(false);

  useEffect(() => {
    Promise.all([getCustomerReport(), getCustomers()]).then(([report, allCust]) => {
      setTopSpenders(report.topSpenders || []);
      setRegularCustomers(allCust.filter(c => c.visits >= 5).sort((a, b) => b.visits - a.visits).slice(0, 10));
      setPendingCredits(report.overdueCredits || []);
      setLoading(false);
    });
  }, []);

  const sendReminders = async () => {
    setSending(true);
    try {
      const result = await apiFetch('/api/reports/send-overdue-reminders', { method: 'POST' });
      alert(`${result.sent} reminder email(s) sent successfully.`);
    } catch {
      alert('Failed to send reminders. Check email configuration.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return (
    <div className="space-y-6">
      <PageHeader eyebrow="Staff" title="Customer Reports" subtitle="Identify top spenders, regulars, and customers with overdue credit." />
      <Spinner />
    </div>
  );

  const totalOverdue = pendingCredits.reduce((s, c) => s + (c.amount || 0), 0);

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <PageHeader eyebrow="Staff" title="Customer Reports" subtitle="Identify top spenders, regulars, and customers with overdue credit." />
        <button className="btn-secondary">
          <Download size={14} /> Export
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Top Spender Revenue',
            value: topSpenders[0] ? `NPR ${topSpenders[0].spent?.toLocaleString()}` : '—',
            sub: topSpenders[0]?.name || 'No data',
            color: 'bg-amber-400',
          },
          {
            label: 'Regular Customers',
            value: regularCustomers.length,
            sub: '5+ visits',
            color: 'bg-blue-500',
          },
          {
            label: 'Overdue Credit',
            value: `NPR ${totalOverdue.toLocaleString()}`,
            sub: `${pendingCredits.length} account${pendingCredits.length !== 1 ? 's' : ''}`,
            color: 'bg-red-500',
          },
        ].map(s => (
          <div key={s.label} className="dash-card p-5">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className="text-xl font-black text-foreground mt-1">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 border border-border rounded-xl p-1 w-fit flex-wrap">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === i ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab 0 — Top Spenders */}
      {tab === 0 && (
        <div className="dash-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Trophy size={16} className="text-amber-500" />
            <h2 className="font-bold text-foreground">Top Spending Customers</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>{['Rank', 'Customer', 'Total Spent', 'Visits', 'Tier'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {topSpenders.map((c, idx) => (
                  <tr key={c.customerId || c.name}>
                    <td>
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${RANK_STYLES[idx + 1] || 'bg-muted text-muted-foreground'}`}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Avatar name={c.name} size="sm" color="blue" />
                        <span className="font-semibold text-foreground">{c.name}</span>
                      </div>
                    </td>
                    <td className="font-black text-primary">NPR {c.spent?.toLocaleString()}</td>
                    <td className="text-center">
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs">{c.visits}x</span>
                    </td>
                    <td>
                      <span className="text-xs font-bold bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 px-2 py-0.5 rounded-full">{c.tier}</span>
                    </td>
                  </tr>
                ))}
                {topSpenders.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No data yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 1 — Regular Customers */}
      {tab === 1 && (
        <div className="dash-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Star size={16} className="text-violet-500" />
            <h2 className="font-bold text-foreground">Regular Customers (≥5 visits)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>{['Customer', 'Phone', 'Visits', 'Total Spent', 'Vehicle'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {regularCustomers.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Avatar name={c.name} size="sm" color="violet" />
                        <span className="font-semibold text-foreground">{c.name}</span>
                      </div>
                    </td>
                    <td>{c.phone}</td>
                    <td className="text-center">
                      <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-bold text-xs">{c.visits}x</span>
                    </td>
                    <td className="font-bold text-primary">NPR {c.totalSpent?.toLocaleString()}</td>
                    <td className="text-xs">{c.vehicles?.[0] ? `${c.vehicles[0].vehicleType}` : '—'}</td>
                  </tr>
                ))}
                {regularCustomers.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No customers with 5+ visits yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2 — Pending Credits */}
      {tab === 2 && (
        <div className="space-y-4">
          {pendingCredits.length > 0 && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 font-semibold dark:bg-amber-950/30 dark:border-amber-800/50 dark:text-amber-400">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                {pendingCredits.length} overdue account{pendingCredits.length !== 1 ? 's' : ''} detected (&gt;30 days pending).
              </div>
              <button onClick={sendReminders} disabled={sending} className="btn-primary text-xs px-3 py-1 disabled:opacity-50">
                {sending ? <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin inline-block" /> : <Send size={12} />}
                Send All Reminders
              </button>
            </div>
          )}
          <div className="dash-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <CreditCard size={16} className="text-red-500" />
              <h2 className="font-bold text-foreground">Overdue Credit Payments</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr>{['Customer', 'Phone', 'Amount Due', 'Days Overdue', 'Sale Date'].map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {pendingCredits.map((c, i) => (
                    <tr key={i}>
                      <td className="font-semibold text-foreground">{c.name}</td>
                      <td>{c.phone}</td>
                      <td className="font-bold text-red-600">NPR {c.amount?.toLocaleString()}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${c.overdueDays > 60 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {c.overdueDays}d overdue
                        </span>
                      </td>
                      <td className="text-xs">{c.dueDate}</td>
                    </tr>
                  ))}
                  {pendingCredits.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No overdue credits</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
