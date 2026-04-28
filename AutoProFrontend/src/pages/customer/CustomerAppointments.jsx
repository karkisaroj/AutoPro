import React, { useState } from 'react';
import { Calendar, Clock, Car, CheckCircle, XCircle, AlertCircle, Plus, X, CalendarCheck } from 'lucide-react';
import { PageHeader } from '../../components/ui/index';

const INITIAL_APPTS = [
  { id: 'APT-001', service: 'Oil Change',        date: '2026-04-15', time: '10:00 AM', vehicle: 'Toyota Corolla 2019', status: 'Confirmed', note: '' },
  { id: 'APT-002', service: 'Tyre Rotation',     date: '2026-04-20', time: '02:00 PM', vehicle: 'Toyota Corolla 2019', status: 'Pending',   note: '' },
  { id: 'APT-003', service: 'Full Body Service', date: '2026-03-10', time: '09:00 AM', vehicle: 'Toyota Corolla 2019', status: 'Completed', note: 'Serviced by Ramesh' },
  { id: 'APT-004', service: 'Engine Check',      date: '2026-02-05', time: '11:00 AM', vehicle: 'Toyota Corolla 2019', status: 'Cancelled', note: 'Customer request' },
];

const SERVICES = ['Oil Change', 'Tyre Rotation', 'Full Body Service', 'Engine Check', 'Brake Inspection', 'Battery Replacement', 'AC Service', 'Wheel Alignment'];
const TIMES    = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

const STATUS_CONFIG = {
  Confirmed: { icon: CheckCircle,  color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700' },
  Pending:   { icon: AlertCircle,  color: 'text-amber-600',   bg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700'   },
  Completed: { icon: CheckCircle,  color: 'text-blue-600',    bg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700'    },
  Cancelled: { icon: XCircle,      color: 'text-red-500',     bg: 'bg-red-100 dark:bg-red-900/30 text-red-700'       },
};

export default function CustomerAppointments() {
  const [appts, setAppts]         = useState(INITIAL_APPTS);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState({ service: SERVICES[0], date: '', time: TIMES[0], note: '' });

  const upcoming = appts.filter(a => ['Confirmed', 'Pending'].includes(a.status));
  const past     = appts.filter(a => ['Completed', 'Cancelled'].includes(a.status));

  const book = () => {
    if (!form.date) return;
    setAppts(prev => [{
      id: `APT-${String(prev.length + 1).padStart(3, '0')}`,
      service: form.service, date: form.date, time: form.time,
      vehicle: 'Toyota Corolla 2019', status: 'Pending', note: form.note,
    }, ...prev]);
    setShowModal(false);
    setForm({ service: SERVICES[0], date: '', time: TIMES[0], note: '' });
  };

  const cancel = (id) => setAppts(prev => prev.map(a => a.id === id ? { ...a, status: 'Cancelled' } : a));

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <PageHeader eyebrow="Customer" title="My Appointments" subtitle="Book and manage your vehicle service appointments." />
        <button onClick={() => setShowModal(true)} className="btn-primary" style={{ background: 'linear-gradient(135deg, #10b981, #0d9488)' }}>
          <Plus size={16} /> Book Appointment
        </button>
      </div>

      {/* Upcoming */}
      <div>
        <h2 className="section-label mb-3">Upcoming ({upcoming.length})</h2>
        {upcoming.length === 0 ? (
          <div className="dash-card p-10 text-center">
            <CalendarCheck size={36} className="mx-auto text-muted-foreground mb-3" />
            <p className="font-bold text-foreground">No upcoming appointments</p>
            <p className="text-xs text-muted-foreground mt-1">Book one using the button above</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map(a => {
              const s = STATUS_CONFIG[a.status];
              const Icon = s.icon;
              return (
                <div key={a.id} className="dash-card p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-md">
                      <Car size={18} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-foreground">{a.service}</h3>
                        <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${s.bg}`}>
                          <Icon size={10} /> {a.status}
                        </span>
                      </div>
                      <div className="flex gap-4 mt-1.5 flex-wrap text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar size={10} /> {a.date}</span>
                        <span className="flex items-center gap-1"><Clock size={10} /> {a.time}</span>
                        <span className="flex items-center gap-1"><Car size={10} /> {a.vehicle}</span>
                      </div>
                      {a.note && <p className="text-xs text-muted-foreground italic mt-1.5">Note: {a.note}</p>}
                    </div>
                    {a.status === 'Pending' && (
                      <button
                        onClick={() => cancel(a.id)}
                        className="text-xs font-bold text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 rounded-lg px-2 py-1 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Past */}
      <div>
        <h2 className="section-label mb-3">Past Appointments</h2>
        <div className="dash-card divide-y divide-border">
          {past.map(a => {
            const s = STATUS_CONFIG[a.status];
            const Icon = s.icon;
            return (
              <div key={a.id} className="flex items-center gap-4 px-5 py-4 hover:bg-card-hover transition-colors">
                <Icon size={16} className={s.color} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">{a.service}</p>
                  <p className="text-xs text-muted-foreground">{a.date} · {a.time}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.bg}`}>{a.status}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Book Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-display font-black text-foreground">Book Appointment</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="form-label">Service Type</label>
                <select value={form.service} onChange={e => setForm(p => ({ ...p, service: e.target.value }))} className="form-select">
                  {SERVICES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Preferred Date</label>
                <input type="date" value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Time Slot</label>
                <select value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} className="form-select">
                  {TIMES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Note (optional)</label>
                <textarea value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                  rows={2} placeholder="Any specific concerns…"
                  className="form-input resize-none"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={book} disabled={!form.date} className="btn-primary flex-1 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #10b981, #0d9488)' }}>
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
