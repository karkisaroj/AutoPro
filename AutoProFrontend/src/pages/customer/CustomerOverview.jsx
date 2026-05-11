import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileText, Cpu, Car, Clock, TrendingUp, Star, User } from 'lucide-react';
import { getCustomerById } from '../../services/customerService';
import { getMyAppointments } from '../../services/appointmentService';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../../components/ui/index';

const QUICK_LINKS = [
  { to: '/customer/appointments', label: 'Book Appointment', icon: Calendar, desc: 'Schedule a new service visit',   color: 'emerald' },
  { to: '/customer/history',      label: 'Service History',  icon: FileText,  desc: 'View past invoices & receipts', color: 'blue'    },
  { to: '/customer/profile',      label: 'My Profile',       icon: User,      desc: 'Update details & vehicles',     color: 'amber'   },
  { to: '/customer/diagnostics',  label: 'AI Diagnostics',   icon: Cpu,       desc: 'Run a vehicle health scan',     color: 'violet'  },
];

const ICON_BG = {
  emerald: 'from-emerald-500 to-teal-600',
  blue:    'from-blue-500 to-indigo-600',
  amber:   'from-amber-500 to-orange-600',
  violet:  'from-violet-500 to-purple-600',
};

export default function CustomerOverview() {
  const { user } = useAuth();
  const [customer, setCustomer]           = useState(null);
  const [appointments, setAppointments]   = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    if (!user?.profileId) { setLoading(false); return; }
    Promise.all([
      getCustomerById(user.profileId),
      getMyAppointments(),
    ]).then(([c, appts]) => {
      setCustomer(c);
      setAppointments(appts);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  if (loading) return (
    <div className="space-y-6 page-enter">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
        <p className="text-white/80 text-sm font-semibold">Welcome back,</p>
        <h1 className="text-2xl font-display font-black">Loading…</h1>
      </div>
      <Spinner />
    </div>
  );

  const upcomingAppts = appointments
    .filter(a => ['Confirmed', 'Pending'].includes(a.status))
    .slice(0, 3);

  const loyaltyDiscount = customer?.tier === 'Bronze' ? '0%' :
    customer?.tier === 'Silver' ? '5%' :
    customer?.tier === 'Gold' ? '10%' : '15%';

  const nextAppt = upcomingAppts[0];

  const stats = [
    { label: 'Total Spent',      value: `NPR ${(customer?.totalSpent || 0).toLocaleString()}`, sub: 'All time',      icon: TrendingUp, color: 'emerald' },
    { label: 'Service Visits',   value: (customer?.visits || 0).toString(),                     sub: 'Total visits',  icon: Car,        color: 'blue'    },
    { label: 'Loyalty Tier',     value: customer?.tier || 'Bronze',                             sub: `${loyaltyDiscount} discount`,  icon: Star,  color: 'amber'  },
    { label: 'Next Appointment', value: nextAppt ? nextAppt.date : 'None',                      sub: nextAppt ? nextAppt.time : 'Book one today', icon: Calendar, color: 'violet' },
  ];

  return (
    <div className="space-y-6 page-enter">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
        <div className="relative">
          <p className="text-white/80 text-sm font-semibold">Welcome back,</p>
          <h1 className="text-2xl font-display font-black">{customer?.name || user?.name} 👋</h1>
          {customer?.vehicles?.[0] && (
            <div className="flex items-center gap-2 mt-2 text-white/80 text-sm">
              <Car size={14} />
              <span>{customer.vehicles[0].plateNo} — {customer.vehicles[0].vehicleType}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(s => {
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

      {/* Quick Actions */}
      <div>
        <h2 className="section-label mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_LINKS.map(q => {
            const Icon = q.icon;
            return (
              <Link key={q.to} to={q.to} className="dash-card p-5 hover:shadow-lg transition-all group block">
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
          {upcomingAppts.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar size={28} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
              <Link to="/customer/appointments" className="text-primary text-xs font-bold hover:underline mt-1 inline-block">Book one now</Link>
            </div>
          ) : upcomingAppts.map(a => (
            <div key={a.id} className="flex items-center gap-4 px-5 py-4 hover:bg-card-hover transition-colors">
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
