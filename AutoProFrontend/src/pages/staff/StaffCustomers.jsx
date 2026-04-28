import React, { useState, useEffect } from 'react';
import { UserPlus, Car, History, ChevronDown, ChevronUp, X, Check, Search } from 'lucide-react';
import { getCustomers, createCustomer, addVehicle } from '../../services/customerService';
import { PageHeader, Avatar, Spinner } from '../../components/ui/index';

const EMPTY_FORM = { name: '', email: '', phone: '', password: '', licenseId: '', vehicleType: '', plateNo: '' };

export default function StaffCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [query, setQuery]         = useState('');

  useEffect(() => {
    getCustomers().then(data => { setCustomers(data); setLoading(false); });
  }, []);

  const save = async () => {
    if (!form.name || !form.phone || !form.email) return;
    const c = await createCustomer(form);
    if (form.vehicleType && form.plateNo) {
      await addVehicle(c.id, {
        vehicleType: form.vehicleType,
        plateNo: form.plateNo,
        registrationDate: new Date().toISOString().split('T')[0],
      }).catch(() => {});
    }
    const refreshed = await getCustomers();
    setCustomers(refreshed);
    setShowModal(false);
    setForm(EMPTY_FORM);
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.phone.includes(query) ||
    c.vehicles?.some(v => v.plateNo?.toLowerCase().includes(query.toLowerCase()))
  );

  if (loading) return (
    <div className="space-y-6">
      <PageHeader eyebrow="Staff" title="Customer Management" subtitle="Register and view customer profiles." />
      <Spinner />
    </div>
  );

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <PageHeader eyebrow="Staff" title="Customer Management" subtitle="Register and view customer profiles, vehicles, and history." />
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <UserPlus size={16} /> Register Customer
        </button>
      </div>

      {/* Search */}
      <div className="dash-card p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, phone, or vehicle…"
            className="form-input pl-10"
          />
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Customers', value: customers.length },
          { label: 'With Loyalty Discount', value: customers.filter(c => c.totalSpent >= 5000).length },
          { label: 'New This Month', value: 2 },
        ].map(s => (
          <div key={s.label} className="dash-card p-4 text-center">
            <p className="text-2xl font-black text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Customer List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="dash-card p-10 text-center">
            <p className="font-bold text-foreground">No customers match your search.</p>
          </div>
        )}
        {filtered.map(c => (
          <div key={c.id} className="dash-card overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === c.id ? null : c.id)}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-card-hover transition-colors text-left"
            >
              <Avatar name={c.name} size="md" color="blue" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground truncate">{c.phone} · {c.vehicles?.[0] ? `${c.vehicles[0].vehicleType} (${c.vehicles[0].plateNo})` : 'No vehicle'}</p>
              </div>
              {c.totalSpent >= 5000 && (
                <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full hidden sm:inline">
                  🎉 Loyalty Member
                </span>
              )}
              <div className="text-right mr-2 flex-shrink-0">
                <p className="font-bold text-foreground text-sm">NPR {c.totalSpent.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Spent</p>
              </div>
              {expanded === c.id ? <ChevronUp size={16} className="text-muted-foreground flex-shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground flex-shrink-0" />}
            </button>

            {expanded === c.id && (
              <div className="border-t border-border px-5 pb-5 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Details */}
                  <div>
                    <h4 className="font-bold text-foreground mb-3 text-sm flex items-center gap-2">
                      <Car size={14} className="text-primary" /> Customer & Vehicle Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      {[
                        ['ID', c.id], ['Email', c.email], ['Phone', c.phone],
                        ['License ID', c.licenseId], ['Member Since', c.joinDate || c.joined],
                        ['Tier', c.tier], ['Loyalty Points', c.loyaltyPts],
                      ].map(([k, v]) => (
                        <div key={k} className="flex gap-3">
                          <span className="text-muted-foreground w-28 flex-shrink-0">{k}:</span>
                          <span className="font-medium text-foreground">{v ?? '—'}</span>
                        </div>
                      ))}
                      {c.vehicles?.length > 0 && (
                        <div>
                          <span className="text-muted-foreground text-xs font-semibold">Vehicles:</span>
                          {c.vehicles.map(v => (
                            <p key={v.id} className="text-xs font-medium text-foreground ml-2">{v.vehicleType} — {v.plateNo}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* History */}
                  <div>
                    <h4 className="font-bold text-foreground mb-3 text-sm flex items-center gap-2">
                      <History size={14} className="text-primary" /> Purchase / Service History
                    </h4>
                    {(!c.history || c.history.length === 0) ? (
                      <p className="text-xs text-muted-foreground">No records yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {c.history.map((h, i) => (
                          <div key={i} className="flex items-center justify-between bg-muted/50 rounded-xl px-3 py-2 text-xs">
                            <div>
                              <p className="font-semibold text-foreground">{h.item}</p>
                              <p className="text-muted-foreground">{h.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-foreground">NPR {h.amount.toLocaleString()}</p>
                              <span className={`font-semibold ${h.type === 'Parts' ? 'text-blue-600' : 'text-violet-600'}`}>{h.type}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Register Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg z-10">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-lg font-display font-black text-foreground">Register New Customer</h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Full Name',      key: 'name',     ph: 'Ram Bahadur Thapa', col: 2 },
                  { label: 'Email',          key: 'email',    ph: 'ram@gmail.com',      col: 2 },
                  { label: 'Phone Number',   key: 'phone',    ph: '98XXXXXXXX',         col: 1 },
                  { label: 'License ID',     key: 'licenseId',ph: 'L-1234-XXXX',        col: 1 },
                  { label: 'Password',       key: 'password', ph: 'Customer@123',       col: 2, type: 'password' },
                ].map(({ label, key, ph, col, type }) => (
                  <div key={key} className={col === 2 ? 'col-span-2' : ''}>
                    <label className="form-label">{label}</label>
                    <input
                      type={type || 'text'}
                      value={form[key]}
                      placeholder={ph}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-1">Vehicle (optional)</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Vehicle Type</label>
                  <input value={form.vehicleType} placeholder="Toyota Corolla 2019"
                    onChange={e => setForm(f => ({ ...f, vehicleType: e.target.value }))}
                    className="form-input" />
                </div>
                <div>
                  <label className="form-label">Plate Number</label>
                  <input value={form.plateNo} placeholder="BA 3 PA 8888"
                    onChange={e => setForm(f => ({ ...f, plateNo: e.target.value }))}
                    className="form-input" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={save} className="btn-primary flex-1">
                  <Check size={16} /> Register
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
