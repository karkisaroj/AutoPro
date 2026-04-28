import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Car, Wrench, ShoppingBag, Bell, Settings, LogOut,
  CheckCircle2, Clock, AlertTriangle, TrendingUp,
  PackageOpen, Star, Calendar, ChevronRight, Activity,
  Fuel, Gauge, Zap
} from 'lucide-react';

const sidebarItems = [
  { icon: <Activity size={20} />, label: 'Overview', id: 'overview' },
  { icon: <Wrench size={20} />, label: 'My Services', id: 'services' },
  { icon: <ShoppingBag size={20} />, label: 'Parts Orders', id: 'parts' },
  { icon: <Car size={20} />, label: 'My Vehicles', id: 'vehicles' },
  { icon: <Bell size={20} />, label: 'Notifications', id: 'notifications' },
  { icon: <Settings size={20} />, label: 'Settings', id: 'settings' },
];

const recentServices = [
  { service: 'Full Engine Diagnostic', date: 'Apr 10, 2026', status: 'completed', cost: 'NPR 1,500', tech: 'Rajan S.' },
  { service: 'Brake Pad Replacement', date: 'Mar 22, 2026', status: 'completed', cost: 'NPR 3,500', tech: 'Bikash K.' },
  { service: 'Suspension Alignment', date: 'Apr 14, 2026', status: 'scheduled', cost: 'NPR 4,200', tech: 'Rajan S.' },
  { service: 'Oil & Filter Change', date: 'Feb 5, 2026', status: 'completed', cost: 'NPR 800', tech: 'Sushila T.' },
];

const parts = [
  { name: 'Bosch Spark Plugs x4', orderId: '#ORD-2841', date: 'Apr 9, 2026', status: 'delivered', price: 'NPR 2,200' },
  { name: 'Air Filter – Toyota Hilux', orderId: '#ORD-2756', date: 'Mar 30, 2026', status: 'delivered', price: 'NPR 950' },
  { name: 'Castrol EDGE 5W-40 4L', orderId: '#ORD-2930', date: 'Apr 12, 2026', status: 'in_transit', price: 'NPR 3,100' },
];

const vehicles = [
  { make: 'Toyota', model: 'Hilux Surf', year: '2020', plate: 'BA 2 CHA 4521', health: 92, fuel: 64, mileage: '42,800 km', img: 'https://i.pravatar.cc/60?img=1' },
  { make: 'Honda', model: 'CB350 Highness', year: '2022', plate: 'BA 91 PA 1234', health: 87, fuel: 30, mileage: '12,100 km', img: 'https://i.pravatar.cc/60?img=2' },
];

const StatusBadge = ({ status }) => {
  const map = {
    completed: { label: 'Completed', cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: <CheckCircle2 size={12} /> },
    scheduled: { label: 'Scheduled', cls: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: <Calendar size={12} /> },
    in_transit: { label: 'In Transit', cls: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', icon: <Clock size={12} /> },
    delivered: { label: 'Delivered', cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: <CheckCircle2 size={12} /> },
    pending: { label: 'Pending', cls: 'bg-orange-500/10 text-orange-500 border-orange-500/20', icon: <AlertTriangle size={12} /> },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest border px-3 py-1.5 rounded-full ${s.cls}`}>
      {s.icon} {s.label}
    </span>
  );
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { label: 'Services Done', val: '12', icon: <Wrench size={22} />, sub: '+2 this month', color: 'from-blue-500/20 to-primary/5' },
    { label: 'Parts Ordered', val: '8', icon: <PackageOpen size={22} />, sub: '1 in transit', color: 'from-indigo-500/20 to-primary/5' },
    { label: 'Active Vehicles', val: '2', icon: <Car size={22} />, sub: 'All healthy', color: 'from-cyan-500/20 to-primary/5' },
    { label: 'Loyalty Points', val: '1,240', icon: <Star size={22} />, sub: 'Earn more', color: 'from-yellow-500/20 to-orange-500/5' },
  ];

  return (
    <div className="flex gap-0 min-h-[85vh] -mx-10 max-md:-mx-5 animate-[fadeIn_0.5s_ease-out]">

      {/* ─── Sidebar ─── */}
      <aside className="w-64 bg-card border-r border-border flex flex-col py-8 px-5 max-md:hidden flex-shrink-0">
        <div className="flex items-center gap-3 px-3 mb-10">
          <div className="w-10 h-10 rounded-xl overflow-hidden">
            <img src="https://i.pravatar.cc/80?img=32" alt="avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-sm font-black text-foreground font-display">Roshan S.</div>
            <div className="text-xs text-muted font-semibold">Member since 2024</div>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${activeTab === item.id ? 'bg-primary text-white shadow-[0_8px_20px_rgba(37,99,235,0.3)]' : 'text-muted hover:text-foreground hover:bg-background'}`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-muted hover:text-foreground hover:bg-background transition-all mt-4">
          <LogOut size={20} /> Back to Site
        </Link>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1 overflow-auto bg-background px-8 py-8 max-md:px-5">

        {/* Header */}
        <div className="flex items-center justify-between mb-10 max-md:flex-col max-md:items-start max-md:gap-4">
          <div>
            <p className="text-primary text-sm font-black uppercase tracking-widest mb-1">Dashboard</p>
            <h1 className="text-3xl font-black font-display text-foreground tracking-tight">Good morning, Roshan 👋</h1>
          </div>
          <Link to="/services" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all">
            Book a Service <ChevronRight size={16} />
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {stats.map((s, i) => (
            <div key={i} className={`group bg-linear-to-br ${s.color} border border-border rounded-3xl p-6 transition-all hover:-translate-y-1 hover:border-primary/30 cursor-default`}>
              <div className="flex items-start justify-between mb-4">
                <div className="text-primary">{s.icon}</div>
                <TrendingUp size={14} className="text-emerald-500" />
              </div>
              <div className="text-3xl font-black font-display text-foreground mb-1">{s.val}</div>
              <div className="text-xs font-black uppercase tracking-widest text-muted mb-1">{s.label}</div>
              <div className="text-xs text-muted font-semibold">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Two-column: Services + Vehicles */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Recent Services */}
          <div className="lg:col-span-2 bg-card border border-border rounded-3xl overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-border">
              <h2 className="text-xl font-black font-display text-foreground">Recent Services</h2>
              <button className="text-sm font-bold text-primary hover:underline">View all</button>
            </div>
            <div className="divide-y divide-border">
              {recentServices.map((svc, i) => (
                <div key={i} className="flex items-center gap-4 px-8 py-4 hover:bg-background/50 transition-colors">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <Wrench size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-black text-foreground truncate">{svc.service}</div>
                    <div className="text-xs text-muted font-semibold">{svc.date} · {svc.tech}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-black text-foreground mb-1">{svc.cost}</div>
                    <StatusBadge status={svc.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Vehicles */}
          <div className="bg-card border border-border rounded-3xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-6 border-b border-border">
              <h2 className="text-xl font-black font-display text-foreground">Vehicles</h2>
              <button className="text-sm font-bold text-primary hover:underline">Add +</button>
            </div>
            <div className="p-4 space-y-4">
              {vehicles.map((v, i) => (
                <div key={i} className="group bg-background border border-border rounded-2xl p-5 hover:border-primary/30 transition-all cursor-pointer">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg font-display">
                      {v.make[0]}
                    </div>
                    <div>
                      <div className="text-sm font-black text-foreground">{v.make} {v.model}</div>
                      <div className="text-xs text-muted font-semibold">{v.year} · {v.plate}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-xs text-muted font-bold uppercase tracking-widest mb-1 flex items-center justify-center gap-1"><Gauge size={10} /> Health</div>
                      <div className={`text-sm font-black ${v.health >= 90 ? 'text-emerald-500' : v.health >= 70 ? 'text-yellow-500' : 'text-red-500'}`}>{v.health}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted font-bold uppercase tracking-widest mb-1 flex items-center justify-center gap-1"><Fuel size={10} /> Fuel</div>
                      <div className={`text-sm font-black ${v.fuel >= 50 ? 'text-foreground' : v.fuel >= 25 ? 'text-yellow-500' : 'text-red-500'}`}>{v.fuel}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted font-bold uppercase tracking-widest mb-1 flex items-center justify-center gap-1"><Zap size={10} /> km</div>
                      <div className="text-sm font-black text-foreground">{v.mileage.split(' ')[0]}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Parts Orders */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden">
          <div className="flex items-center justify-between px-8 py-6 border-b border-border">
            <h2 className="text-xl font-black font-display text-foreground">Parts Orders</h2>
            <Link to="/services" className="text-sm font-bold text-primary hover:underline">Browse Inventory</Link>
          </div>
          <div className="divide-y divide-border">
            {parts.map((p, i) => (
              <div key={i} className="flex items-center gap-4 px-8 py-4 hover:bg-background/50 transition-colors">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <PackageOpen size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-black text-foreground truncate">{p.name}</div>
                  <div className="text-xs text-muted font-semibold">{p.orderId} · {p.date}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-black text-foreground mb-1">{p.price}</div>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
