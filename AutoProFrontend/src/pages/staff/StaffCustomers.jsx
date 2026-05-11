import React, { useState, useEffect } from 'react';
import {
  UserPlus, Car, ChevronDown, ChevronUp,
  Search, Users, Star, Calendar, Truck, Check, X,
} from 'lucide-react';
import { getCustomers, createCustomer, addVehicle, getCustomerHistory } from '../../services/customerService';
import { PageHeader, Avatar, Spinner, EmptyState } from '../../components/ui/index';
import StatCard from '../../components/ui/StatCard';
import Modal from '../../components/ui/Modal';

const TIER_BADGE = {
  Platinum: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400',
  Gold:     'bg-amber-100  dark:bg-amber-900/30  text-amber-700  dark:text-amber-400',
  Silver:   'bg-slate-100  dark:bg-slate-800      text-slate-600  dark:text-slate-400',
  Bronze:   'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
};

const EMPTY_FORM = {
  name: '', email: '', phone: '', password: '', licenseId: '',
  vehicleType: '', plateNo: '',
};

function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

export default function StaffCustomers() {
  const [customers,   setCustomers]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [expanded,    setExpanded]    = useState(null);
  const [historyMap,  setHistoryMap]  = useState({});
  const [showModal,   setShowModal]   = useState(false);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [query,     setQuery]     = useState('');
  const [saving,    setSaving]    = useState(false);
  const [formError, setFormError] = useState(null);
  const [banner,    setBanner]    = useState(null);

  const [addVehicleFor, setAddVehicleFor] = useState(null);
  const [vForm,   setVForm]   = useState({ vehicleType: '', plateNo: '' });
  const [vError,  setVError]  = useState(null);
  const [vSaving, setVSaving] = useState(false);

  useEffect(() => {
    getCustomers()
      .then(data => { setCustomers(data); setLoading(false); })
      .catch(()  => setLoading(false));
  }, []);

  // ── Derived stats ────────────────────────────────────────────────────────
  const now = new Date();
  const newThisMonth = customers.filter(c => {
    if (!c.joinDate) return false;
    const [y, m] = c.joinDate.split('-').map(Number);
    return y === now.getFullYear() && m === now.getMonth() + 1;
  }).length;
  const totalVehicles  = customers.reduce((a, c) => a + (c.vehicles?.length || 0), 0);
  const loyaltyMembers = customers.filter(c => c.tier !== 'Bronze').length;

  // ── Search filter ────────────────────────────────────────────────────────
  const filtered = customers.filter(c => {
    const q = query.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.phone || '').includes(q) ||
      c.vehicles?.some(v => v.plateNo?.toLowerCase().includes(q))
    );
  });

  // ── Open modal ───────────────────────────────────────────────────────────
  const openModal = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowModal(true);
  };

  // ── Save with full exception handling ────────────────────────────────────
  const save = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.password.trim()) {
      setFormError('Full name, email, phone, and password are required.');
      return;
    }
    if (form.password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    if ((form.vehicleType.trim() || form.plateNo.trim()) && !(form.vehicleType.trim() && form.plateNo.trim())) {
      setFormError('Please enter both vehicle type and plate number, or leave both empty.');
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const created = await createCustomer(form);

      if (form.vehicleType.trim() && form.plateNo.trim()) {
        try {
          await addVehicle(created.id, {
            vehicleType: form.vehicleType.trim(),
            plateNo: form.plateNo.trim(),
            registrationDate: new Date().toISOString(),
          });
        } catch (vehicleErr) {
          const refreshed = await getCustomers();
          setCustomers(refreshed);
          setShowModal(false);
          setForm(EMPTY_FORM);
          setBanner({
            type: 'warn',
            msg: `${created.name} registered, but vehicle could not be added: ${vehicleErr.message}`,
          });
          return;
        }
      }

      const refreshed = await getCustomers();
      setCustomers(refreshed);
      setShowModal(false);
      setForm(EMPTY_FORM);
      setBanner({ type: 'success', msg: `${created.name} has been registered successfully.` });
    } catch (err) {
      setFormError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const saveVehicle = async (customerId) => {
    if (!vForm.vehicleType.trim() || !vForm.plateNo.trim()) {
      setVError('Both vehicle type and plate number are required.');
      return;
    }
    setVSaving(true);
    setVError(null);
    try {
      await addVehicle(customerId, {
        vehicleType: vForm.vehicleType.trim(),
        plateNo:     vForm.plateNo.trim(),
        registrationDate: new Date().toISOString(),
      });
      const refreshed = await getCustomers();
      setCustomers(refreshed);
      setAddVehicleFor(null);
      setVForm({ vehicleType: '', plateNo: '' });
      setBanner({ type: 'success', msg: 'Vehicle added successfully.' });
    } catch (err) {
      setVError(err?.message || 'Failed to add vehicle.');
    } finally {
      setVSaving(false);
    }
  };

  if (loading) return (
    <div className="space-y-6">
      <PageHeader eyebrow="Staff" title="Customer Management" subtitle="Loading customers…" />
      <Spinner />
    </div>
  );

  return (
    <div className="space-y-6 page-enter">

      <PageHeader
        eyebrow="Staff"
        title="Customer Management"
        subtitle="Register new customers with vehicle details and view service history."
        actions={
          <button onClick={openModal} className="btn-primary">
            <UserPlus size={15} /> Register Customer
          </button>
        }
      />

      {/* Success / warning banner */}
      {banner && (
        <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 border ${
          banner.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50'
            : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50'
        }`}>
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
            banner.type === 'success' ? 'bg-emerald-500' : 'bg-amber-500'
          }`}>
            <Check size={13} className="text-white" />
          </div>
          <p className={`text-sm font-semibold flex-1 ${
            banner.type === 'success'
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-amber-700 dark:text-amber-400'
          }`}>
            {banner.msg}
          </p>
          <button onClick={() => setBanner(null)} className="text-muted-foreground hover:text-foreground flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Customers"  value={customers.length.toString()}  color="violet"  icon={Users}    />
        <StatCard label="Loyalty Members"  value={loyaltyMembers.toString()}    color="amber"   icon={Star}     />
        <StatCard label="New This Month"   value={newThisMonth.toString()}      color="emerald" icon={Calendar} />
        <StatCard label="Total Vehicles"   value={totalVehicles.toString()}     color="blue"    icon={Truck}    />
      </div>

      {/* Customer list card */}
      <div className="dash-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-4 flex-wrap">
          <h2 className="font-display font-bold text-foreground">
            Customers
            <span className="ml-2 text-sm font-normal text-muted-foreground">({filtered.length})</span>
          </h2>
          <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2 bg-muted/30 w-64">
            <Search size={14} className="text-muted-foreground flex-shrink-0" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Name, phone, plate…"
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={query ? 'No customers match your search' : 'No customers yet'}
            description={
              query
                ? 'Try a different name, phone number, or plate.'
                : 'Use the Register Customer button above to add the first customer.'
            }
          />
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(c => (
              <div key={c.id}>

                {/* Collapsed row */}
                <button
                  onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors text-left"
                >
                  <Avatar name={c.name} size="md" color="blue" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-foreground text-sm">{c.name}</p>
                      <span className={`badge text-[10px] font-semibold ${TIER_BADGE[c.tier] || TIER_BADGE.Bronze}`}>
                        {c.tier}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {c.phone}
                      {c.vehicles?.length > 0 && (
                        <> · <Car size={10} className="inline mb-0.5" /> {c.vehicles[0].vehicleType} ({c.vehicles[0].plateNo})</>
                      )}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 mr-2 hidden sm:block">
                    <p className="font-black text-foreground text-sm">NPR {Number(c.totalSpent).toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">{c.loyaltyPts} pts</p>
                  </div>
                  {expanded === c.id
                    ? <ChevronUp  size={15} className="text-muted-foreground flex-shrink-0" />
                    : <ChevronDown size={15} className="text-muted-foreground flex-shrink-0" />
                  }
                </button>

                {/* Expanded detail panel */}
                {expanded === c.id && (() => {
                  if (!historyMap[c.id]) {
                    getCustomerHistory(c.id)
                      .then(h => setHistoryMap(m => ({ ...m, [c.id]: h })))
                      .catch(() => setHistoryMap(m => ({ ...m, [c.id]: [] })));
                  }
                  return null;
                })()}
                {expanded === c.id && (
                  <div className="border-t border-border bg-muted/10 px-5 py-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      {/* Customer info */}
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                          Customer Details
                        </p>
                        <div className="space-y-2">
                          {[
                            ['ID',             `#${c.id}`],
                            ['Email',          c.email],
                            ['Phone',          c.phone],
                            ['License ID',     c.licenseId || '—'],
                            ['Member Since',   c.joinDate || '—'],
                            ['Tier',           c.tier],
                            ['Loyalty Points', `${c.loyaltyPts} pts`],
                            ['Total Spent',    `NPR ${Number(c.totalSpent).toLocaleString()}`],
                            ['Visits',         c.visits],
                          ].map(([k, v]) => (
                            <div key={k} className="flex items-start gap-3">
                              <span className="text-muted-foreground w-28 flex-shrink-0 text-xs">{k}</span>
                              <span className="font-semibold text-foreground text-xs">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Vehicles */}
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <Car size={11} /> Registered Vehicles ({c.vehicles?.length || 0})
                        </p>
                        {!c.vehicles?.length ? (
                          <p className="text-xs text-muted-foreground">No vehicles registered.</p>
                        ) : (
                          <div className="space-y-2">
                            {c.vehicles.map(v => (
                              <div key={v.id} className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                                  <Car size={13} className="text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-foreground">{v.vehicleType}</p>
                                  <p className="text-xs text-muted-foreground font-mono">{v.plateNo}</p>
                                </div>
                                {v.registrationDate && (
                                  <p className="text-[10px] text-muted-foreground flex-shrink-0">
                                    {new Date(v.registrationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Vehicle inline form */}
                        {addVehicleFor === c.id ? (
                          <div className="mt-3 space-y-2 bg-card border border-border rounded-xl px-4 py-3">
                            {vError && (
                              <p className="text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1">
                                <X size={11} /> {vError}
                              </p>
                            )}
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={vForm.vehicleType}
                                onChange={e => setVForm(f => ({ ...f, vehicleType: e.target.value }))}
                                placeholder="Toyota Corolla 2019"
                                className="form-input text-xs py-1.5"
                              />
                              <input
                                type="text"
                                value={vForm.plateNo}
                                onChange={e => setVForm(f => ({ ...f, plateNo: e.target.value }))}
                                placeholder="BA 3 PA 8888"
                                className="form-input text-xs py-1.5"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveVehicle(c.id)}
                                disabled={vSaving}
                                className="btn-primary text-xs py-1.5 flex-1 justify-center"
                              >
                                {vSaving
                                  ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  : <Check size={12} />
                                }
                                {vSaving ? 'Saving…' : 'Save Vehicle'}
                              </button>
                              <button
                                onClick={() => { setAddVehicleFor(null); setVError(null); }}
                                className="btn-secondary text-xs py-1.5 px-3"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setAddVehicleFor(c.id); setVForm({ vehicleType: '', plateNo: '' }); setVError(null); }}
                            className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                          >
                            <Car size={12} /> + Add Vehicle
                          </button>
                        )}
                      </div>

                    </div>

                    {/* Purchase History */}
                    <div className="mt-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                        Purchase History
                      </p>
                      {!historyMap[c.id] ? (
                        <p className="text-xs text-muted-foreground">Loading…</p>
                      ) : historyMap[c.id].length === 0 ? (
                        <p className="text-xs text-muted-foreground">No purchases yet.</p>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-border">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-muted/50 text-left">
                                <th className="px-3 py-2 font-bold text-muted-foreground">Date</th>
                                <th className="px-3 py-2 font-bold text-muted-foreground">Items</th>
                                <th className="px-3 py-2 font-bold text-muted-foreground text-right">Total</th>
                                <th className="px-3 py-2 font-bold text-muted-foreground">Payment</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {historyMap[c.id].slice(0, 8).map(s => (
                                <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                                  <td className="px-3 py-2 text-muted-foreground">{s.date}</td>
                                  <td className="px-3 py-2 text-foreground max-w-[200px] truncate">
                                    {s.items.map(i => i.partName).join(', ') || '—'}
                                  </td>
                                  <td className="px-3 py-2 font-bold text-primary text-right">NPR {Number(s.total).toLocaleString()}</td>
                                  <td className="px-3 py-2 text-muted-foreground">{s.paymentMethod}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Register Customer Modal ─────────────────────────────────────────── */}
      {showModal && (
        <Modal title="Register New Customer" onClose={() => setShowModal(false)} icon={UserPlus}>
          <div className="space-y-4">

            {formError && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2.5">
                <X size={14} className="flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <SectionDivider label="Personal Details" />
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="form-label">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Ram Bahadur Thapa"
                  className="form-input"
                />
              </div>
              <div className="col-span-2">
                <label className="form-label">Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="ram@gmail.com"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Phone Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="98XXXXXXXX"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">License ID</label>
                <input
                  type="text"
                  value={form.licenseId}
                  onChange={e => setForm(f => ({ ...f, licenseId: e.target.value }))}
                  placeholder="L-1234-XXXX"
                  className="form-input"
                />
              </div>
            </div>

            <SectionDivider label="Account Access" />
            <div>
              <label className="form-label">Password <span className="text-red-500">*</span></label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Minimum 6 characters"
                className="form-input"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Customer uses this to log into their self-service portal.
              </p>
            </div>

            <SectionDivider label="Vehicle Details — Optional" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Vehicle Type / Model</label>
                <input
                  type="text"
                  value={form.vehicleType}
                  onChange={e => setForm(f => ({ ...f, vehicleType: e.target.value }))}
                  placeholder="Toyota Corolla 2019"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Plate Number</label>
                <input
                  type="text"
                  value={form.plateNo}
                  onChange={e => setForm(f => ({ ...f, plateNo: e.target.value }))}
                  placeholder="BA 3 PA 8888"
                  className="form-input"
                />
              </div>
            </div>
            {(form.vehicleType.trim() || form.plateNo.trim()) && !(form.vehicleType.trim() && form.plateNo.trim()) && (
              <p className="text-[10px] text-amber-600 dark:text-amber-400 -mt-1">
                Enter both vehicle type and plate number, or leave both empty.
              </p>
            )}

            <div className="flex gap-3 pt-2 border-t border-border">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={save} className="btn-primary flex-1 justify-center" disabled={saving}>
                {saving
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <UserPlus size={14} />
                }
                {saving ? 'Registering…' : 'Register Customer'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
