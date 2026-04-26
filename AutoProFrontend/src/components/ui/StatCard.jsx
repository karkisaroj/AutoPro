import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const GRADIENTS = {
  violet:  { icon: 'from-violet-500 to-purple-600',  glow: 'shadow-violet-500/20' },
  blue:    { icon: 'from-blue-500 to-cyan-500',       glow: 'shadow-blue-500/20'   },
  emerald: { icon: 'from-emerald-500 to-teal-500',    glow: 'shadow-emerald-500/20'},
  amber:   { icon: 'from-amber-400 to-orange-500',    glow: 'shadow-amber-500/20'  },
  red:     { icon: 'from-red-500 to-rose-600',        glow: 'shadow-red-500/20'    },
  indigo:  { icon: 'from-indigo-500 to-violet-600',   glow: 'shadow-indigo-500/20' },
};

/**
 * KPI / Stat card with gradient icon and change indicator
 * Usage: <StatCard label="Revenue" value="NPR 4,82,500" change="+12%" up icon={TrendingUp} color="violet" />
 */
export default function StatCard({ label, value, sub, change, up, icon: Icon, color = 'violet', loading }) {
  const g = GRADIENTS[color] || GRADIENTS.violet;

  if (loading) {
    return (
      <div className="stat-card animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-11 h-11 rounded-xl bg-muted`} />
          <div className="w-14 h-6 rounded-full bg-muted" />
        </div>
        <div className="h-7 w-28 bg-muted rounded-lg mb-2" />
        <div className="h-4 w-20 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${g.icon} shadow-lg ${g.glow} flex items-center justify-center transition-transform duration-200 group-hover:scale-105`}>
          {Icon && <Icon size={18} className="text-white" />}
        </div>
        {change !== undefined && (
          <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${
            up
              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
              : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
          }`}>
            {up ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
            {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-display font-black text-foreground tracking-tight leading-none">{value}</p>
      {sub && <p className="text-xs text-primary font-semibold mt-1">{sub}</p>}
      <p className="text-xs text-muted-foreground font-medium mt-1.5">{label}</p>
    </div>
  );
}
