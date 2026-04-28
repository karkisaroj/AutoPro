import React, { useState, useEffect } from 'react';
import { ShoppingCart, Users, CheckCircle2, Clock, TrendingUp, Calendar } from 'lucide-react';
import { getSales } from '../../services/salesService';
import { getAppointments } from '../../services/appointmentService';
import { PageHeader, StatusBadge, Spinner, Avatar } from '../../components/ui/index';
import StatCard from '../../components/ui/StatCard';
import { useAuth } from '../../context/AuthContext';

export default function StaffOverview() {
  const { user } = useAuth();
  const [sales, setSales]        = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([getSales(), getAppointments()]).then(([s, a]) => {
      setSales(s);
      setAppointments(a);
      setLoading(false);
    });
  }, []);

  const todaySales     = sales.filter(s => s.status === 'Paid').slice(0, 5);
  const pendingSales   = sales.filter(s => s.status === 'Pending');
  const upcomingApts   = appointments.filter(a => ['Confirmed', 'Pending'].includes(a.status)).slice(0, 4);

  const todayRevenue   = todaySales.reduce((a, s) => a + s.amount, 0);

  const stats = [
    { label: "Today's Revenue",  value: `NPR ${todayRevenue.toLocaleString()}`,  color: 'blue',    icon: TrendingUp  },
    { label: 'Completed Sales',  value: todaySales.length.toString(),             color: 'emerald', icon: CheckCircle2},
    { label: 'Pending Payments', value: pendingSales.length.toString(),           color: 'amber',   icon: Clock       },
    { label: 'Appointments',     value: upcomingApts.length.toString(),           color: 'violet',  icon: Calendar    },
  ];

  if (loading) return (
    <div className="space-y-6">
      <PageHeader eyebrow="Staff" title="Staff Overview" subtitle="Your work summary for today." />
      <Spinner />
    </div>
  );

  return (
    <div className="space-y-6 page-enter">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, white 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
        <div className="relative">
          <p className="text-white/75 text-sm font-semibold">Good morning,</p>
          <h1 className="text-2xl font-display font-black">{user?.name} 👋</h1>
          <p className="text-white/70 text-sm mt-1">Service Advisor · AutoPro Garage, Kathmandu</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* Today's sales + Upcoming appointments */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Sales Table */}
        <div className="dash-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-display font-bold text-foreground">Today's Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>{['Invoice', 'Customer', 'Amount', 'Status'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {todaySales.map(s => (
                  <tr key={s.id}>
                    <td className="font-mono text-xs text-muted-foreground">{s.id}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Avatar name={s.customerName} size="sm" color="blue" />
                        <p className="font-semibold text-foreground text-xs">{s.customerName}</p>
                      </div>
                    </td>
                    <td className="font-bold text-foreground">NPR {s.amount.toLocaleString()}</td>
                    <td><StatusBadge status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="dash-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-display font-bold text-foreground">Upcoming Appointments</h2>
          </div>
          <div className="divide-y divide-border">
            {upcomingApts.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-10">No upcoming appointments</p>
            ) : upcomingApts.map(a => (
              <div key={a.id} className="flex items-center gap-4 px-5 py-3 hover:bg-card-hover transition-colors">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                  <Calendar size={15} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{a.customerName}</p>
                  <p className="text-[11px] text-muted-foreground">{a.service} · {a.date} at {a.time}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick tip */}
      <div className="dash-card p-5 flex items-start gap-4 border-l-4 border-primary">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <TrendingUp size={18} className="text-primary" />
        </div>
        <div>
          <p className="font-bold text-foreground text-sm">Performance Tip</p>
          <p className="text-sm text-muted-foreground mt-1">You are on track to beat last week's revenue by <strong className="text-emerald-600">18%</strong>. Keep up the great work! Aim to close all pending invoices before EOD.</p>
        </div>
      </div>
    </div>
  );
}
