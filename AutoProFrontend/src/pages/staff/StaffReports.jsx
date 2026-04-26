import React, { useState } from 'react';
import { BarChart3, TrendingUp, CreditCard, Download, Trophy, Star, AlertCircle } from 'lucide-react';
import { PageHeader, Avatar, StatusBadge } from '../../components/ui/index';

const TABS = ['Top Spenders', 'Regular Customers', 'Pending Credits'];

const topSpenders = [
  { rank: 1, name: 'Ram Bahadur Thapa',  phone: '9841001001', totalSpent: 42500, visits: 8  },
  { rank: 2, name: 'Priya Basnet',       phone: '9861002002', totalSpent: 38000, visits: 11 },
  { rank: 3, name: 'Gopal Sharma',       phone: '9800003333', totalSpent: 29500, visits: 6  },
  { rank: 4, name: 'Sunita Thapa',       phone: '9852002002', totalSpent: 28000, visits: 9  },
  { rank: 5, name: 'Niraj Pandey',       phone: '9868004444', totalSpent: 19800, visits: 5  },
];

const regularCustomers = [
  { name: 'Priya Basnet',  phone: '9861002002', visits: 11, lastVisit: '2026-04-10', vehicle: 'KIA Sportage 2020'  },
  { name: 'Sunita Thapa',  phone: '9852002002', visits: 9,  lastVisit: '2026-04-11', vehicle: 'Honda City 2021'    },
  { name: 'Ram Bahadur',   phone: '9841001001', visits: 8,  lastVisit: '2026-04-12', vehicle: 'Toyota Corolla'     },
  { name: 'Gopal Sharma',  phone: '9800003333', visits: 6,  lastVisit: '2026-04-08', vehicle: 'Hyundai i20 2022'   },
];

const pendingCredits = [
  { name: 'Dinesh Tamang', phone: '9870005555', amount: 8500,  daysOverdue: 45, lastReminder: '2026-03-28' },
  { name: 'Kabita Karki',  phone: '9855006666', amount: 3200,  daysOverdue: 38, lastReminder: '2026-04-02' },
  { name: 'Arjun Lama',    phone: '9840007777', amount: 12000, daysOverdue: 62, lastReminder: '2026-03-15' },
];

const RANK_STYLES = {
  1: 'bg-amber-400 text-white',
  2: 'bg-gray-300 text-gray-800',
  3: 'bg-amber-700/80 text-white',
};

export default function StaffReports() {
  const [tab, setTab] = useState(0);

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
          { label: 'Top Spender Revenue',  value: `NPR ${topSpenders[0].totalSpent.toLocaleString()}`, sub: topSpenders[0].name, color: 'bg-amber-400' },
          { label: 'Regular Customers',    value: regularCustomers.length, sub: '5+ visits', color: 'bg-blue-500' },
          { label: 'Overdue Credit',       value: `NPR ${pendingCredits.reduce((s,c)=>s+c.amount,0).toLocaleString()}`, sub: `${pendingCredits.length} accounts`, color: 'bg-red-500' },
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
                <tr>{['Rank', 'Customer', 'Phone', 'Total Spent', 'Visits'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {topSpenders.map(c => (
                  <tr key={c.name}>
                    <td>
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${RANK_STYLES[c.rank] || 'bg-muted text-muted-foreground'}`}>
                        {c.rank === 1 ? '🥇' : c.rank === 2 ? '🥈' : c.rank === 3 ? '🥉' : c.rank}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Avatar name={c.name} size="sm" color="blue" />
                        <span className="font-semibold text-foreground">{c.name}</span>
                      </div>
                    </td>
                    <td>{c.phone}</td>
                    <td className="font-black text-primary">NPR {c.totalSpent.toLocaleString()}</td>
                    <td className="text-center">
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs">{c.visits}x</span>
                    </td>
                  </tr>
                ))}
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
                <tr>{['Customer', 'Phone', 'Visits', 'Last Visit', 'Vehicle'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {regularCustomers.map(c => (
                  <tr key={c.name}>
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
                    <td className="text-xs">{c.lastVisit}</td>
                    <td className="text-xs">{c.vehicle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2 — Pending Credits */}
      {tab === 2 && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 font-semibold dark:bg-amber-950/30 dark:border-amber-800/50 dark:text-amber-400">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
            Email reminders have been automatically sent to all overdue accounts (≥30 days).
          </div>
          <div className="dash-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <CreditCard size={16} className="text-red-500" />
              <h2 className="font-bold text-foreground">Overdue Credit Payments</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr>{['Customer', 'Phone', 'Amount Due', 'Days Overdue', 'Last Reminder', 'Action'].map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {pendingCredits.map(c => (
                    <tr key={c.name}>
                      <td className="font-semibold text-foreground">{c.name}</td>
                      <td>{c.phone}</td>
                      <td className="font-bold text-red-600">NPR {c.amount.toLocaleString()}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${c.daysOverdue > 60 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {c.daysOverdue}d overdue
                        </span>
                      </td>
                      <td className="text-xs">{c.lastReminder}</td>
                      <td>
                        <button className="text-xs font-bold text-primary hover:underline">Send Reminder</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
