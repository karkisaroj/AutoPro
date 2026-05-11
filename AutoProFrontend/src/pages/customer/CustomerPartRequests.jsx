import React, { useState, useEffect } from 'react';
import { Package, Plus, X, Check, Clock, CheckCircle, XCircle, Info } from 'lucide-react';
import { PageHeader, Spinner } from '../../components/ui/index';
import { getMyPartRequests, createPartRequest, getPartsCatalog } from '../../services/partRequestService';

const STATUS_CONFIG = {
  Pending:      { label: 'Pending',      bg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',     icon: Clock        },
  Acknowledged: { label: 'Acknowledged', bg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',         icon: Info         },
  Fulfilled:    { label: 'Fulfilled',    bg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400', icon: CheckCircle },
  Rejected:     { label: 'Rejected',     bg: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',             icon: XCircle      },
};

const EMPTY_FORM = { partId: '', partName: '', description: '', vehicleModel: '', quantity: 1 };
const AUTO_DISMISS_MS = 3500;

export default function CustomerPartRequests() {
  const [requests,   setRequests]   = useState([]);
  const [catalog,    setCatalog]    = useState([]);   // parts from DB
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [formError,  setFormError]  = useState(null);
  const [pageMsg,    setPageMsg]    = useState(null);

  const load = () =>
    Promise.all([getMyPartRequests(), getPartsCatalog()])
      .then(([reqs, parts]) => { setRequests(reqs); setCatalog(parts); setLoading(false); })
      .catch(() => setLoading(false));

  useEffect(() => { load(); }, []);

  // Group catalog by category for <optgroup>
  const catalogByCategory = catalog.reduce((acc, p) => {
    (acc[p.category] = acc[p.category] || []).push(p);
    return acc;
  }, {});

  const handlePartSelect = (e) => {
    const id = Number(e.target.value);
    if (!id) { setForm(f => ({ ...f, partId: '', partName: '' })); return; }
    const part = catalog.find(p => p.id === id);
    setForm(f => ({ ...f, partId: id, partName: part ? part.name : '' }));
  };

  const showMsg = (type, text) => {
    setPageMsg({ type, text });
    setTimeout(() => setPageMsg(null), AUTO_DISMISS_MS);
  };

  const submit = async () => {
    if (!form.partName) { setFormError('Please select a part from the list.'); return; }
    setSaving(true);
    setFormError(null);
    try {
      const created = await createPartRequest({ ...form });
      setRequests(prev => [created, ...prev]);
      setShowForm(false);
      setForm(EMPTY_FORM);
      showMsg('success', 'Part request submitted. Our team will get back to you shortly.');
    } catch (err) {
      setFormError(err?.message || 'Failed to submit request.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="space-y-6">
      <PageHeader eyebrow="Customer" title="Part Requests" subtitle="Request parts that aren't currently in stock." />
      <Spinner />
    </div>
  );

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <PageHeader eyebrow="Customer" title="Part Requests" subtitle="Request parts that aren't currently in stock." />
        <button
          onClick={() => { setFormError(null); setForm(EMPTY_FORM); setShowForm(v => !v); }}
          className="btn-primary"
        >
          <Plus size={16} /> Request a Part
        </button>
      </div>

      {/* Page-level feedback */}
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

      {/* Request form */}
      {showForm && (
        <div className="dash-card p-6 space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Package size={16} className="text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-foreground">New Part Request</p>
              <p className="text-xs text-muted-foreground">Fill in the details and we'll source it for you</p>
            </div>
          </div>

          {formError && (
            <div className="flex items-center gap-2 text-sm rounded-xl px-4 py-2.5 border bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400">
              <X size={14} /> {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="form-label">Select Part <span className="text-red-500">*</span></label>
              {catalog.length === 0 ? (
                <div className="form-input text-muted-foreground text-sm flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                  Loading parts…
                </div>
              ) : (
                <select
                  value={form.partId}
                  onChange={handlePartSelect}
                  className="form-select"
                >
                  <option value="">— Choose a part —</option>
                  {Object.entries(catalogByCategory).map(([category, parts]) => (
                    <optgroup key={category} label={category}>
                      {parts.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name}{p.quantity === 0 ? ' (Out of stock)' : p.quantity < 10 ? ` (Low stock: ${p.quantity} ${p.unit})` : ''}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="form-label">Vehicle Model</label>
              <input
                type="text"
                value={form.vehicleModel}
                onChange={e => setForm(f => ({ ...f, vehicleModel: e.target.value }))}
                placeholder="e.g. Toyota Corolla 2019"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Quantity Needed</label>
              <input
                type="number"
                min={1}
                max={100}
                value={form.quantity}
                onChange={e => setForm(f => ({ ...f, quantity: Math.max(1, Number(e.target.value)) }))}
                className="form-input"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Additional Details</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Any extra information that may help us find the right part…"
                className="form-input resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-1 border-t border-border">
            <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={submit} disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-50">
              {saving
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Check size={14} />}
              {saving ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </div>
      )}

      {/* Request list */}
      {requests.length === 0 ? (
        <div className="dash-card p-12 text-center">
          <Package size={36} className="mx-auto text-muted-foreground mb-3 opacity-40" />
          <p className="font-bold text-foreground">No part requests yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Can't find a part you need? Submit a request and we'll source it for you.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => {
            const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.Pending;
            const Icon = cfg.icon;
            return (
              <div key={r.id} className="dash-card p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Package size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-black text-foreground">{r.partName}</h3>
                      <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${cfg.bg}`}>
                        <Icon size={10} /> {cfg.label}
                      </span>
                    </div>
                    <div className="flex gap-4 flex-wrap text-xs text-muted-foreground">
                      {r.vehicleModel && <span>Vehicle: {r.vehicleModel}</span>}
                      <span>Qty: {r.quantity}</span>
                      <span>Submitted: {r.createdAt}</span>
                    </div>
                    {r.description && (
                      <p className="text-xs text-muted-foreground italic mt-1.5">{r.description}</p>
                    )}
                    {r.adminNote && (
                      <div className="mt-2 text-xs bg-muted/40 border border-border rounded-lg px-3 py-2">
                        <span className="font-bold text-foreground">Team note: </span>
                        <span className="text-muted-foreground">{r.adminNote}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
