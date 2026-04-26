import React from 'react';

/** Avatar with gradient background and initials */
export function Avatar({ name, size = 'md', color = 'violet' }) {
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';
  const sizeMap = { sm: 'w-7 h-7 text-[10px]', md: 'w-9 h-9 text-xs', lg: 'w-12 h-12 text-sm', xl: 'w-16 h-16 text-base' };
  const colorMap = {
    violet:  'from-violet-500 to-purple-600',
    blue:    'from-blue-500 to-cyan-600',
    emerald: 'from-emerald-500 to-teal-600',
    amber:   'from-amber-400 to-orange-500',
    indigo:  'from-indigo-500 to-violet-600',
  };
  return (
    <div className={`${sizeMap[size]} rounded-full bg-gradient-to-br ${colorMap[color] || colorMap.violet} flex items-center justify-center text-white font-black flex-shrink-0`}>
      {initials}
    </div>
  );
}

/** Status badge */
export function StatusBadge({ status }) {
  const map = {
    Active:    'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
    Inactive:  'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
    Paid:      'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
    Pending:   'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
    Received:  'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
    Confirmed: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
    Completed: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
    Cancelled: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
    Gold:      'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    Silver:    'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    Bronze:    'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
    Platinum:  'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400',
  };
  return (
    <span className={`badge ${map[status] || 'bg-muted text-muted-foreground'}`}>{status}</span>
  );
}

/** Table skeleton row */
export function TableSkeleton({ cols = 5, rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-t border-border animate-pulse">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 bg-muted rounded" style={{ width: `${60 + (j * 15) % 40}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/** Empty state */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Icon size={28} className="text-muted-foreground" />
        </div>
      )}
      <p className="text-base font-bold text-foreground">{title}</p>
      {description && <p className="text-sm text-muted-foreground mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Loading spinner */
export function Spinner({ size = 20 }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div
        style={{ width: size, height: size }}
        className="rounded-full border-[3px] border-primary/20 border-t-primary animate-spin"
      />
    </div>
  );
}

/** Section / Page header */
export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="flex items-start justify-between flex-wrap gap-4">
      <div>
        {eyebrow && <p className="section-label">{eyebrow}</p>}
        <h1 className="text-2xl font-display font-black text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

/** Confirmation dialog */
export function ConfirmDialog({ title, description, onConfirm, onCancel, danger = true }) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10" style={{ animation: 'fadeScale 0.15s ease-out' }}>
        <h3 className="text-base font-black text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6">{description}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-bold text-white transition-all cursor-pointer ${
              danger ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary-dark'
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
