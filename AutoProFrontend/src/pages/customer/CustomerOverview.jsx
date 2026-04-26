import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileText, Cpu, Car, AlertTriangle, Clock, TrendingUp, Star } from 'lucide-react';

const QUICK_LINKS = [
  { to: '/customer/appointments', label: 'Book Appointment', icon: Calendar, desc: 'Schedule a new service visit',     color: 'emerald' },
  { to: '/customer/history',      label: 'Service History',  icon: FileText,  desc: 'View past invoices & receipts',   color: 'blue'    },
  { to: '/customer/diagnostics',  label: 'AI Diagnostics',   icon: Cpu,       desc: 'Run a vehicle health scan',       color: 'violet'  },
];

const UPCOMING = [
  { service: 'Oil Change',    date: '2026-04-15', time: '10:00 AM', status: 'Confirmed' },
  { service: 'Tyre Rotation', date: '2026-04-20', time: '02:00 PM', status: 'Pending'   },
];

const ALERTS = [
  { level: 'warning',  msg: 'Brake pads at 30% — schedule inspection soon.', icon: AlertTriangle },
  { level: 'critical', msg: 'Front-left tyre pressure low (26 PSI). Check immediately.', icon: AlertTriangle },
];

const STATS = [
  { label: 'Total Spent',      value: 'NPR 42,500', sub: 'All time',      icon: TrendingUp, color: 'emerald' },
  { label: 'Service Visits',   value: '8',          sub: 'Total visits',   icon: Car,        color: 'blue'    },
  { label: 'Loyalty Discount', value: '10%',        sub: 'On your plan',   icon: Star,       color: 'amber'   },
  { label: 'Next Appointment', value: 'Apr 15',     sub: '10:00 AM',       icon: Calendar,   color: 'violet'  },
];

const ALERT_STYLES = {
  warning:  'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-800/50 dark:text-amber-400',
  critical: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-800/50 dark:text-red-400',
};

const ICON_BG = {
  emerald: 'from-emerald-500 to-teal-600',
  blue:    'from-blue-500 to-indigo-600',
  amber:   'from-amber-500 to-orange-600',
  violet:  'from-violet-500 to-purple-600',
};

export default function CustomerOverview() {
  return (
    <div className="space-y-6 page-enter">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
        <div className="relative">
          <p className="text-white/80 text-sm font-semibold">Welcome back,</p>
          <h1 className="text-2xl font-display font-black">Ram Bahadur Thapa 👋</h1>
          <div className="flex items-center gap-2 mt-2 text-white/80 text-sm">
            <Car size={14} />
            <span>BA 3 PA 8888 — Toyota Corolla 2019</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-card">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${ICON_BG[s.color]} flex items-center justify-center mb-3`}>
                <Icon size={16} className="text-white" />
              </div>
              <p className="text-xs text-muted-foreground font-semibold">{s.label}</p>
              <p className="text-xl font-black text-foreground mt-0.5">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Alerts */}
      {ALERTS.map((a, i) => {
        const Icon = a.icon;
        return (
          <div key={i} className={`flex items-start gap-3 border rounded-xl p-3 text-sm ${ALERT_STYLES[a.level]}`}>
            <Icon size={16} className="mt-0.5 flex-shrink-0" />
            <p className="font-semibold">{a.msg}</p>
          </div>
        );
      })}

      {/* Quick Actions */}
      <div>
        <h2 className="section-label mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {QUICK_LINKS.map(q => {
            const Icon = q.icon;
            return (
              <Link
                key={q.to}
                to={q.to}
                className="dash-card p-5 hover:shadow-lg transition-all group block"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${ICON_BG[q.color]} flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon size={18} className="text-white" />
                </div>
                <p className="font-black text-foreground group-hover:text-primary transition-colors">{q.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{q.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Upcoming appointments */}
      <div>
        <h2 className="section-label mb-3">Upcoming Appointments</h2>
        <div className="dash-card divide-y divide-border">
          {UPCOMING.map(a => (
            <div key={a.service} className="flex items-center gap-4 px-5 py-4 hover:bg-card-hover transition-colors">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                <Calendar size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-sm">{a.service}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock size={10} /> {a.date} · {a.time}
                </p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                a.status === 'Confirmed'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              }`}>{a.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
