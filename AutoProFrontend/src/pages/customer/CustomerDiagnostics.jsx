import React, { useState } from 'react';
import { Cpu, AlertTriangle, CheckCircle, Info, Zap, BarChart2, ChevronRight } from 'lucide-react';
import { PageHeader } from '../../components/ui/index';

const VEHICLE = { plate: 'BA 3 PA 8888', model: 'Toyota Corolla 2019', mileage: '48,200 km', lastService: '2026-03-10' };

const INITIAL_CHECKS = [
  { id: 'engine',   label: 'Engine Health',      status: 'ok',      detail: 'Engine running within normal parameters.',        score: 95 },
  { id: 'battery',  label: 'Battery Voltage',     status: 'ok',      detail: '12.6V — Battery is in good health.',               score: 88 },
  { id: 'brakes',   label: 'Brake Pads',          status: 'warning', detail: 'Front pads at ~30% — schedule inspection soon.',   score: 30 },
  { id: 'tyre',     label: 'Tyre Pressure',       status: 'critical', detail: 'Front-left: 26 PSI (below 32 PSI threshold).',   score: 60 },
  { id: 'coolant',  label: 'Coolant Level',       status: 'ok',      detail: 'Level is optimal. No leaks detected.',             score: 93 },
  { id: 'oillife',  label: 'Oil Life',            status: 'warning', detail: 'Estimated 1,200 km until next oil change.',        score: 45 },
  { id: 'exhaust',  label: 'Exhaust Emissions',   status: 'ok',      detail: 'Emissions within legal limits.',                   score: 90 },
  { id: 'trans',    label: 'Transmission Fluid',  status: 'ok',      detail: 'Fluid level and condition: Good.',                 score: 87 },
];

const STATUS_CFG = {
  ok:       { icon: CheckCircle,  color: 'text-emerald-600', bar: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  warning:  { icon: AlertTriangle,color: 'text-amber-500',   bar: 'bg-amber-500',   badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500'         },
  critical: { icon: AlertTriangle,color: 'text-red-600',     bar: 'bg-red-500',     badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'                },
};

function ScoreBar({ score, status }) {
  const color = STATUS_CFG[status].bar;
  return (
    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-2">
      <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${score}%` }} />
    </div>
  );
}

export default function CustomerDiagnostics() {
  const [running, setRunning] = useState(false);
  const [done, setDone]       = useState(false);
  const [checks, setChecks]   = useState([]);
  const [selected, setSelected] = useState(null);

  const overallScore = done
    ? Math.round(checks.reduce((s, c) => s + c.score, 0) / checks.length)
    : null;

  const runScan = async () => {
    setRunning(true);
    setDone(false);
    setChecks([]);
    for (let i = 0; i < INITIAL_CHECKS.length; i++) {
      await new Promise(r => setTimeout(r, 400));
      setChecks(prev => [...prev, INITIAL_CHECKS[i]]);
    }
    setRunning(false);
    setDone(true);
  };

  const warnings  = checks.filter(c => c.status === 'warning');
  const criticals = checks.filter(c => c.status === 'critical');

  return (
    <div className="space-y-6 page-enter">
      <PageHeader eyebrow="Customer" title="AI Vehicle Diagnostics" subtitle="Run a simulated health scan of your vehicle's key systems." />

      {/* Vehicle info */}
      <div className="dash-card p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md flex-shrink-0">
          <Cpu size={22} className="text-white" />
        </div>
        <div>
          <p className="font-black text-foreground">{VEHICLE.model}</p>
          <p className="text-xs text-muted-foreground">{VEHICLE.plate} · {VEHICLE.mileage} · Last service: {VEHICLE.lastService}</p>
        </div>
        <div className="ml-auto">
          <button
            onClick={runScan}
            disabled={running}
            className="btn-primary disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
          >
            {running ? (
              <><span className="inline-block w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" /> Scanning…</>
            ) : (
              <><Zap size={14} /> {done ? 'Re-scan' : 'Run Scan'}</>
            )}
          </button>
        </div>
      </div>

      {/* Overall score */}
      {done && (
        <div className="dash-card p-5 flex items-center gap-6">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" className="text-muted/40" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none"
                stroke={criticals.length ? '#ef4444' : warnings.length ? '#f59e0b' : '#10b981'}
                strokeWidth="3"
                strokeDasharray={`${overallScore} ${100 - overallScore}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-foreground">{overallScore}</span>
              <span className="text-xs text-muted-foreground font-semibold">/100</span>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-black text-foreground">
              {criticals.length ? '⚠️ Urgent Issues Found' : warnings.length ? '🔶 Attention Required' : '✅ Vehicle is Healthy'}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {criticals.length} critical · {warnings.length} warnings · {checks.length - criticals.length - warnings.length} passed
            </p>
            <div className="flex gap-2 mt-3 flex-wrap">
              {criticals.length > 0 && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">{criticals.length} Critical</span>}
              {warnings.length  > 0 && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">{warnings.length} Warnings</span>}
            </div>
          </div>
        </div>
      )}

      {/* Scan results */}
      {checks.length > 0 && (
        <div className="dash-card divide-y divide-border">
          {checks.map(c => {
            const cfg  = STATUS_CFG[c.status];
            const Icon = cfg.icon;
            return (
              <button
                key={c.id}
                onClick={() => setSelected(selected === c.id ? null : c.id)}
                className="w-full hover:bg-card-hover transition-colors text-left"
              >
                <div className="flex items-center gap-4 px-5 py-4">
                  <Icon size={16} className={cfg.color} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-foreground">{c.label}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{c.status}</span>
                    </div>
                    <ScoreBar score={c.score} status={c.status} />
                    {selected === c.id && (
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{c.detail}</p>
                    )}
                  </div>
                  <ChevronRight size={14} className={`text-muted-foreground transition-transform ${selected === c.id ? 'rotate-90' : ''}`} />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {!done && !running && (
        <div className="dash-card p-12 text-center">
          <BarChart2 size={40} className="mx-auto text-muted-foreground mb-3" />
          <h3 className="font-bold text-foreground">No scan results yet</h3>
          <p className="text-xs text-muted-foreground mt-1">Click "Run Scan" above to analyse your vehicle's health.</p>
        </div>
      )}

      {/* recommendation banner */}
      {done && (criticals.length > 0 || warnings.length > 0) && (
        <div className="bg-gradient-to-r from-violet-500 to-purple-700 rounded-2xl p-5 text-white">
          <p className="font-bold text-sm mb-1 flex items-center gap-2"><Info size={14} /> AutoPro Recommendation</p>
          <p className="text-xs text-white/85 leading-relaxed">
            {criticals.length > 0
              ? 'Please book an urgent inspection for the critical issues detected. Our technicians can resolve these quickly.'
              : 'We recommend scheduling a follow-up service within the next 2 weeks for the warnings identified above.'}
          </p>
          <button className="mt-3 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
            Book Inspection
          </button>
        </div>
      )}
    </div>
  );
}
