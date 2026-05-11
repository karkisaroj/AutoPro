import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, Car, CheckCircle, XCircle, AlertCircle,
  Plus, X, CalendarCheck, Star, Check,
} from 'lucide-react';
import { PageHeader, Spinner } from '../../components/ui/index';
import { useAuth } from '../../context/AuthContext';
import {
  getMyAppointments, createAppointment, cancelAppointment,
} from '../../services/appointmentService';
import { getCustomerById } from '../../services/customerService';
import { submitReview, getReviewForAppointment } from '../../services/reviewService';

const TIMES = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];
const SERVICES = [
  'Oil & Filter Change', 'Full Service', 'Brake Inspection', 'Tyre Rotation',
  'AC Service', 'Engine Diagnostics', 'Suspension Check',
  'Electrical Inspection', 'Detailing', 'Wheel Alignment',
];

const STATUS_CONFIG = {
  Confirmed: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' },
  Pending:   { icon: AlertCircle, color: 'text-amber-600',   bg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'   },
  Completed: { icon: CheckCircle, color: 'text-blue-600',    bg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'    },
  Cancelled: { icon: XCircle,     color: 'text-red-500',     bg: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'       },
};

const EMPTY_FORM = { service: SERVICES[0], date: '', time: TIMES[0], vehicleId: '', note: '' };
const AUTO_DISMISS_MS = 4000;

export default function CustomerAppointments() {
  const { user } = useAuth();

  const [appts,         setAppts]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [vehicles,      setVehicles]      = useState([]);
  const [reviewedIds,   setReviewedIds]   = useState(new Set());

  // book modal
  const [showModal,   setShowModal]   = useState(false);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [saving,      setSaving]      = useState(false);
  const [bookError,   setBookError]   = useState(null);

  // review modal
  const [reviewAppt,     setReviewAppt]     = useState(null); // full appointment object
  const [reviewRating,   setReviewRating]   = useState(5);
  const [reviewComment,  setReviewComment]  = useState('');
  const [reviewSaving,   setReviewSaving]   = useState(false);
  const [reviewError,    setReviewError]    = useState(null);

  // cancel state
  const [cancellingId,  setCancellingId]  = useState(null);
  const [cancelError,   setCancelError]   = useState(null);

  // page-level banner
  const [pageMsg, setPageMsg] = useState(null);

  const showPageMsg = (type, text) => {
    setPageMsg({ type, text });
    setTimeout(() => setPageMsg(null), AUTO_DISMISS_MS);
  };

  useEffect(() => {
    if (!user?.profileId) { setLoading(false); return; }
    Promise.all([
      getMyAppointments(),
      getCustomerById(user.profileId),
    ]).then(async ([apptList, customer]) => {
      setAppts(apptList);
      setVehicles(customer.vehicles || []);
      setForm(f => ({
        ...f,
        vehicleId: customer.vehicles?.[0]?.id?.toString() || '',
      }));

      const completedIds = apptList.filter(a => a.status === 'Completed').map(a => a.id);
      const checks = await Promise.allSettled(completedIds.map(id => getReviewForAppointment(id)));
      setReviewedIds(new Set(
        completedIds.filter((_, i) => checks[i].status === 'fulfilled')
      ));

      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const upcoming = appts.filter(a => ['Confirmed', 'Pending'].includes(a.status));
  const past     = appts.filter(a => ['Completed', 'Cancelled'].includes(a.status));

  // ── Book ────────────────────────────────────────────────────────────────
  const openBookModal = () => { setBookError(null); setShowModal(true); };

  const book = async () => {
    if (!form.date) return;
    setSaving(true);
    setBookError(null);
    try {
      const created = await createAppointment({
        customerId: user.profileId,
        vehicleId:  form.vehicleId ? Number(form.vehicleId) : null,
        service:    form.service,
        date:       form.date,
        time:       form.time,
        notes:      form.note,
      });
      setAppts(prev => [created, ...prev]);
      setShowModal(false);
      setForm(f => ({ ...f, date: '', note: '' }));
      showPageMsg('success', `Appointment booked for ${created.date} at ${created.time}. Status: Pending confirmation.`);
    } catch (err) {
      setBookError(err?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Cancel ──────────────────────────────────────────────────────────────
  const cancel = async (id) => {
    setCancelError(null);
    setCancellingId(id);
    try {
      await cancelAppointment(id);
      setAppts(prev => prev.map(a => a.id === id ? { ...a, status: 'Cancelled' } : a));
      showPageMsg('success', 'Appointment cancelled successfully.');
    } catch (err) {
      setCancelError(err?.message || 'Could not cancel this appointment. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  // ── Review ──────────────────────────────────────────────────────────────
  const openReview = (appt) => {
    setReviewRating(5);
    setReviewComment('');
    setReviewError(null);
    setReviewAppt(appt);
  };

  const submitReviewHandler = async () => {
    setReviewSaving(true);
    setReviewError(null);
    try {
      await submitReview({ appointmentId: reviewAppt.id, rating: reviewRating, comment: reviewComment });
      setReviewedIds(prev => new Set([...prev, reviewAppt.id]));
      setReviewAppt(null);
      showPageMsg('success', 'Thank you! Your review has been submitted.');
    } catch (err) {
      setReviewError(err?.message || 'Failed to submit review.');
    } finally {
      setReviewSaving(false);
    }
  };

  if (loading) return (
    <div className="space-y-6">
      <PageHeader eyebrow="Customer" title="My Appointments" subtitle="Book and manage your vehicle service appointments." />
      <Spinner />
    </div>
  );

  return (
    <div className="space-y-6 page-enter">

      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <PageHeader eyebrow="Customer" title="My Appointments" subtitle="Book and manage your vehicle service appointments." />
        <button onClick={openBookModal} className="btn-primary">
          <Plus size={16} /> Book Appointment
        </button>
      </div>

      {/* Page-level banner */}
      {pageMsg && (
        <div className={`flex items-center gap-2 text-sm rounded-xl px-4 py-3 border ${
          pageMsg.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400'
            : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400'
        }`}>
          {pageMsg.type === 'success' ? <Check size={14} /> : <X size={14} />}
          {pageMsg.text}
        </div>
      )}

      {/* Cancel error */}
      {cancelError && (
        <div className="flex items-center gap-2 text-sm rounded-xl px-4 py-3 border bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400">
          <X size={14} /> {cancelError}
          <button onClick={() => setCancelError(null)} className="ml-auto"><X size={12} /></button>
        </div>
      )}

      {/* ── Upcoming ── */}
      <div>
        <h2 className="section-label mb-3">Upcoming ({upcoming.length})</h2>
        {upcoming.length === 0 ? (
          <div className="dash-card p-10 text-center">
            <CalendarCheck size={36} className="mx-auto text-muted-foreground mb-3 opacity-40" />
            <p className="font-bold text-foreground">No upcoming appointments</p>
            <p className="text-xs text-muted-foreground mt-1">Use the button above to book your first service visit</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map(a => {
              const s = STATUS_CONFIG[a.status] || STATUS_CONFIG.Pending;
              const Icon = s.icon;
              const isCancelling = cancellingId === a.id;
              return (
                <div key={a.id} className="dash-card p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-md">
                      <Car size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-foreground">{a.service}</h3>
                        <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${s.bg}`}>
                          <Icon size={10} /> {a.status}
                        </span>
                      </div>
                      <div className="flex gap-4 mt-1.5 flex-wrap text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar size={10} /> {a.date}</span>
                        <span className="flex items-center gap-1"><Clock size={10} /> {a.time}</span>
                        {a.vehicle && <span className="flex items-center gap-1"><Car size={10} /> {a.vehicle}</span>}
                        {a.mechanic && <span>Mechanic: {a.mechanic}</span>}
                      </div>
                      {a.notes && <p className="text-xs text-muted-foreground italic mt-1.5">"{a.notes}"</p>}
                    </div>
                    {a.status === 'Pending' && (
                      <button
                        onClick={() => cancel(a.id)}
                        disabled={isCancelling}
                        className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50 cursor-pointer flex-shrink-0"
                      >
                        {isCancelling
                          ? <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                          : <XCircle size={12} />}
                        {isCancelling ? 'Cancelling…' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Past ── */}
      <div>
        <h2 className="section-label mb-3">Past Appointments</h2>
        <div className="dash-card divide-y divide-border">
          {past.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">No past appointments yet</p>
          ) : past.map(a => {
            const s = STATUS_CONFIG[a.status] || STATUS_CONFIG.Cancelled;
            const Icon = s.icon;
            const alreadyReviewed = reviewedIds.has(a.id);
            return (
              <div key={a.id} className="flex items-center gap-4 px-5 py-4 hover:bg-card-hover transition-colors">
                <Icon size={16} className={`flex-shrink-0 ${s.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{a.service}</p>
                  <p className="text-xs text-muted-foreground">{a.date} · {a.time}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.bg}`}>{a.status}</span>
                  {a.status === 'Completed' && (
                    alreadyReviewed ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                        <CheckCircle size={10} /> Reviewed
                      </span>
                    ) : (
                      <button
                        onClick={() => openReview(a)}
                        className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors cursor-pointer"
                      >
                        <Star size={10} /> Leave Review
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Review Modal ── */}
      {reviewAppt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="text-base font-display font-black text-foreground">Leave a Review</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{reviewAppt.service} · {reviewAppt.date}</p>
              </div>
              <button onClick={() => setReviewAppt(null)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {reviewError && (
                <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2">
                  {reviewError}
                </div>
              )}
              <div>
                <label className="form-label mb-2">Your Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setReviewRating(n)}
                      className={`text-2xl transition-transform hover:scale-110 cursor-pointer ${n <= reviewRating ? 'text-amber-400' : 'text-muted-foreground/30'}`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">{reviewRating}/5</span>
                </div>
              </div>
              <div>
                <label className="form-label">Comment (optional)</label>
                <textarea
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  rows={3}
                  placeholder="Share your experience…"
                  className="form-input resize-none"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setReviewAppt(null)} className="btn-secondary flex-1">Cancel</button>
                <button
                  onClick={submitReviewHandler}
                  disabled={reviewSaving}
                  className="btn-primary flex-1 justify-center disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                >
                  {reviewSaving
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Star size={14} />}
                  {reviewSaving ? 'Submitting…' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Book Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-display font-black text-foreground">Book Appointment</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {bookError && (
                <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2.5">
                  {bookError}
                </div>
              )}
              <div>
                <label className="form-label">Service Type</label>
                <select
                  value={form.service}
                  onChange={e => setForm(p => ({ ...p, service: e.target.value }))}
                  className="form-select"
                >
                  {SERVICES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              {vehicles.length > 0 && (
                <div>
                  <label className="form-label">Vehicle</label>
                  <select
                    value={form.vehicleId}
                    onChange={e => setForm(p => ({ ...p, vehicleId: e.target.value }))}
                    className="form-select"
                  >
                    <option value="">— No vehicle —</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.vehicleType} — {v.plateNo}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="form-label">Preferred Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Time Slot</label>
                <select
                  value={form.time}
                  onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                  className="form-select"
                >
                  {TIMES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Note (optional)</label>
                <textarea
                  value={form.note}
                  onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                  rows={2}
                  placeholder="Any specific concerns…"
                  className="form-input resize-none"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button
                  onClick={book}
                  disabled={!form.date || saving}
                  className="btn-primary flex-1 justify-center disabled:opacity-50 cursor-pointer"
                >
                  {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {saving ? 'Booking…' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
