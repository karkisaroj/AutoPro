import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeProvider';
import { useAuth } from '../context/AuthContext';
import {
  Menu, X, Sun, Moon, Bell, ChevronRight,
  LogOut, Settings, User, Zap
} from 'lucide-react';

export default function DashboardLayout({ navItems = [], role = 'User', children }) {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const userName = user?.name ?? role;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const location = useLocation();
  useNavigate();

  /* Breadcrumb */
  const segments = location.pathname.split('/').filter(Boolean);
  const crumbs   = segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1),
    path:  '/' + segments.slice(0, i + 1).join('/'),
  }));

  /* Role colors */
  const roleColors = {
    Admin:    { gradient: 'from-violet-500 to-purple-600',  shadow: 'shadow-violet-500/30' },
    Staff:    { gradient: 'from-blue-500 to-cyan-600',      shadow: 'shadow-blue-500/30'   },
    Customer: { gradient: 'from-emerald-500 to-teal-600',   shadow: 'shadow-emerald-500/30'},
  };
  const rc = roleColors[role] || roleColors.Admin;

  const notifications = [
    { id: 1, title: 'Low stock alert',    desc: 'Brake Pad Set below 10 units',    time: '2m ago',    dot: 'bg-red-500'    },
    { id: 2, title: 'New appointment',    desc: 'Ram Bahadur – Oil Change 2:00PM', time: '14m ago',   dot: 'bg-blue-500'   },
    { id: 3, title: 'Invoice paid',       desc: 'INV-1042 confirmed – NPR 8,200',  time: '1hr ago',   dot: 'bg-emerald-500'},
  ];

  return (
    <div className="dashboard-root">

      {/* ── SIDEBAR ── */}
      <aside className={`sidebar ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>

        {/* Brand */}
        <div className="flex items-center gap-2.5 px-4 py-5 border-b border-border">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${rc.gradient} shadow-lg ${rc.shadow} flex items-center justify-center flex-shrink-0`}>
            <Zap size={16} className="text-white" />
          </div>
          <div className="overflow-hidden">
            <p className="font-display text-base font-black text-foreground leading-none">AutoPro</p>
            <p className="text-[10px] text-muted-foreground font-semibold mt-0.5 uppercase tracking-widest">{role} Portal</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon className="nav-icon" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Profile pod */}
        <div className="m-3 p-3 rounded-xl border border-border bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${rc.gradient} flex items-center justify-center text-white text-xs font-black flex-shrink-0`}>
              {userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{userName}</p>
              <p className="text-[10px] text-muted-foreground">{role}</p>
            </div>
            <button
              onClick={logout}
              className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-danger hover:border-red-300 transition-colors cursor-pointer"
              title="Log out"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className={`content-area ${sidebarOpen ? '' : 'content-area-full'}`}>

        {/* ── TOP BAR ── */}
        <header className="topbar">

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-card-hover transition-all cursor-pointer"
          >
            {sidebarOpen ? <X size={17} /> : <Menu size={17} />}
          </button>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
            {crumbs.map((c, i) => (
              <React.Fragment key={c.path}>
                {i > 0 && <ChevronRight size={12} className="text-muted-foreground flex-shrink-0" />}
                <span className={`text-sm truncate ${
                  i === crumbs.length - 1
                    ? 'font-bold text-foreground'
                    : 'text-muted-foreground hover:text-foreground cursor-pointer'
                }`}>
                  {c.label}
                </span>
              </React.Fragment>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-card-hover transition-all cursor-pointer"
              >
                <Bell size={16} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-card" />
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 dash-card overflow-hidden z-50 shadow-xl shadow-black/10 animate-[fadeScale_0.15s_ease-out]">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <p className="text-xs font-black text-foreground uppercase tracking-wide">Notifications</p>
                    <span className="badge bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">{notifications.length}</span>
                  </div>
                  {notifications.map(n => (
                    <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-card-hover transition-colors cursor-pointer border-b border-border last:border-0">
                      <span className={`w-2 h-2 rounded-full ${n.dot} mt-1.5 flex-shrink-0`} />
                      <div>
                        <p className="text-xs font-bold text-foreground">{n.title}</p>
                        <p className="text-[11px] text-muted-foreground">{n.desc}</p>
                        <p className="text-[10px] text-subtle mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Theme */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer
                ${isDark
                  ? 'border-border bg-card text-amber-400 hover:bg-card-hover hover:border-amber-400/40'
                  : 'border-border bg-card text-slate-600 hover:bg-card-hover hover:text-primary hover:border-primary/30'
                }`}
              title="Toggle theme"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-90"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
