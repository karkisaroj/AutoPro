import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileText, Car, Clock, TrendingUp, Star, User, Package } from 'lucide-react';
import { getCustomerById } from '../../services/customerService';
import { getMyAppointments } from '../../services/appointmentService';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../../components/ui/index';

const TIER_ORDER  = ['Bronze', 'Silver', 'Gold', 'Platinum'];
const TIER_THRESH = { Bronze: 0, Silver: 20000, Gold: 50000, Platinum: 100000 };
const TIER_COLOR  = {
  Bronze:   'from-orange-400 to-amber-500',
  Silver:   'from-slate-400 to-slate-500',
  Gold:     'from-amber-400 to-yellow-500',
  Platinum: 'from-violet-500 to-purple-600',
};

function LoyaltyProgress({ tier, totalSpent }) {
  const idx  = TIER_ORDER.indexOf(tier);
  const next = TIER_ORDER[idx + 1];
  if (!next) return (
    <div className="mt-3 bg-white/10 rounded-xl p-3 text-xs text-white/90">
      <span className="font-black">Platinum</span> — Top tier! You get loyalty discounts on every eligible purchase.
    </div>
  );
  const from    = TIER_THRESH[tier];
  const to      = TIER_THRESH[next];
  const pct     = Math.min(100, Math.round(((totalSpent - from) / (to - from)) * 100));
  const remaining = (to - totalSpent).toLocaleString();
  return (
    <div className="mt-3 bg-white/10 rounded-xl p-3 space-y-1.5">
      <div className="flex justify-between text-[11px] text-white/80 font-semibold">
        <span>{tier}</span><span>{next} in NPR {remaining}</span>
      </div>
      <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
        <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10px] text-white/60">{pct}% toward {next}</p>
    </div>
  );
}

const QUICK_LINKS = [
  { to: '/customer/appointments',  label: 'Book Appointment', icon: Calendar, desc: 'Schedule a new service visit',   color: 'emerald' },
  { to: '/customer/history',       label: 'Service History',  icon: FileText, desc: 'View past invoices & receipts',  color: 'blue'    },
  { to: '/customer/part-requests', label: 'Request a Part',   icon: Package,  desc: 'Ask for an out-of-stock part',   color: 'violet'  },
  { to: '/customer/profile',       label: 'My Profile',       icon: User,     desc: 'Update details & vehicles',      color: 'amber'   },
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

  const loyaltyDiscount = customer?.totalSpent >= 5000 ? '10% on purchases ≥ NPR 5k' : 'Spend NPR 5,000+ per purchase';

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
      <div className={`bg-gradient-to-r ${TIER_COLOR[customer?.tier] || TIER_COLOR.Bronze} rounded-2xl p-6 text-white relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">
              {customer?.tier || 'Bronze'} Member
            </span>
          </div>
          <h1 className="text-2xl font-display font-black">{customer?.name || user?.name} 👋</h1>
          {customer?.vehicles?.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-2">
              {customer.vehicles.map(v => (
                <div key={v.id} className="flex items-center gap-1.5 text-white/80 text-xs bg-white/10 px-2.5 py-1 rounded-full">
                  <Car size={11} />
                  <span>{v.plateNo} — {v.vehicleType}</span>
                </div>
              ))}
            </div>
          )}
          {customer && <LoyaltyProgress tier={customer.tier} totalSpent={customer.totalSpent} />}
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
