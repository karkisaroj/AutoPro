import React, { useState, useEffect } from 'react';
import { Store, Plus, Edit2, Trash2, Check, Phone, Mail, MapPin, ShoppingBag, TrendingUp, Search } from 'lucide-react';
import { getVendors, createVendor, updateVendor, deleteVendor, toggleVendorStatus } from '../../services/vendorService';
import { StatusBadge, EmptyState, PageHeader, ConfirmDialog, Spinner } from '../../components/ui/index';
import StatCard from '../../components/ui/StatCard';
import Modal from '../../components/ui/Modal';

const CATS = ['Multi-Parts', 'Filters', 'Engine', 'Brakes', 'Tyres', 'Suspension', 'Lubricants', 'Electrical', 'Accessories'];
const EMPTY = { name: '', contact: '', phone: '', email: '', address: '', category: 'Multi-Parts' };
const COLORS = ['violet','blue','emerald','amber','indigo'];

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [confirm, setConfirm] = useState(null);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    getVendors().then(d => { setVendors(d); setLoading(false); });
  }, []);

  const filtered = vendors.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.category.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (v) => {
    setEditing(v.id);
    setForm({ name: v.name, contact: v.contact, phone: v.phone, email: v.email, address: v.address, category: v.category });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        const u = await updateVendor(editing, form);
        setVendors(prev => prev.map(v => v.id === editing ? { ...v, ...u } : v));
      } else {
        const c = await createVendor(form);
        setVendors(prev => [...prev, c]);
      }
      setModal(false);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    await deleteVendor(confirm.id);
    setVendors(prev => prev.filter(v => v.id !== confirm.id));
    setConfirm(null);
  };

  const handleToggle = async (id) => {
    const u = await toggleVendorStatus(id);
    setVendors(prev => prev.map(v => v.id === id ? { ...v, active: u.active } : v));
  };

  const totalSpent   = vendors.reduce((a, v) => a + v.totalSpent, 0);
  const totalOrders  = vendors.reduce((a, v) => a + v.totalOrders, 0);

  const stats = [
    { label: 'Total Vendors',  value: vendors.length.toString(),                          color: 'violet',  icon: Store       },
    { label: 'Active Vendors', value: vendors.filter(v=>v.active).length.toString(),      color: 'emerald', icon: Store       },
    { label: 'Total Orders',   value: totalOrders.toString(),                              color: 'blue',    icon: ShoppingBag },
    { label: 'Total Spend',    value: 'NPR ' + (totalSpent/1000).toFixed(0) + 'K',        color: 'amber',   icon: TrendingUp  },
  ];

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        eyebrow="Procurement"
        title="Vendor Management"
        subtitle="Manage supplier relationships, contacts, and order history."
        actions={
          <>
            <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2 bg-muted/30">
              <Search size={14} className="text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors..." className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-40" />
            </div>
            <button onClick={openAdd} className="btn-primary"><Plus size={15} /> Add Vendor</button>
          </>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={i} {...s} loading={loading} />)}
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-3"><EmptyState icon={Store} title="No vendors found" /></div>
          ) : filtered.map((v, i) => (
            <div key={v.id} className="dash-card p-5 hover:shadow-lg transition-all">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br flex-shrink-0 flex items-center justify-center text-white font-black text-sm
                    ${['from-violet-500 to-purple-600','from-blue-500 to-cyan-600','from-emerald-500 to-teal-600','from-amber-400 to-orange-500','from-indigo-500 to-violet-600'][i % 5]}`}>
                    {v.name[0]}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-foreground text-sm truncate">{v.name}</h3>
                    <span className="text-[11px] font-semibold text-muted-foreground">{v.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => handleToggle(v.id)} className="cursor-pointer">
                    <StatusBadge status={v.active ? 'Active' : 'Inactive'} />
                  </button>
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                  <Phone size={11} className="flex-shrink-0" /> <span>{v.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                  <Mail size={11} className="flex-shrink-0" /> <span className="truncate">{v.email}</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                  <MapPin size={11} className="flex-shrink-0" /> <span className="truncate">{v.address}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="pt-4 border-t border-border grid grid-cols-2 gap-3 mb-4">
                <div className="text-center">
                  <p className="text-xl font-black text-primary">{v.totalOrders}</p>
                  <p className="text-[11px] text-muted-foreground">Total Orders</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-foreground">NPR {(v.totalSpent/1000).toFixed(0)}K</p>
                  <p className="text-[11px] text-muted-foreground">Total Spend</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={() => openEdit(v)} className="btn-secondary flex-1 justify-center text-xs py-1.5">
                  <Edit2 size={12} /> Edit
                </button>
                <button onClick={() => setConfirm({ id: v.id, name: v.name })} className="p-2 rounded-xl border border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={editing ? 'Edit Vendor' : 'Add New Vendor'} onClose={() => setModal(false)} icon={Store}>
          <div className="space-y-4">
            {[
              { label: 'Company Name',   key: 'name',    ph: 'NepalAuto Supplies', col: 'col-span-2' },
              { label: 'Contact Person', key: 'contact', ph: 'Ramesh Shrestha',   col: 'col-span-2' },
              { label: 'Phone',          key: 'phone',   ph: '01-4567890',         col: '' },
              { label: 'Email',          key: 'email',   ph: 'info@vendor.com',    col: '' },
              { label: 'Address',        key: 'address', ph: 'Kathmandu, Nepal',   col: 'col-span-2' },
            ].map(({ label, key, ph, col }) => (
              <div key={key} className={`grid ${col === 'col-span-2' ? 'col-span-2' : ''}`}>
                <label className="form-label">{label}</label>
                <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph} className="form-input" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="form-label">Parts Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="form-select">
                  {CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2 border-t border-border">
              <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} className="btn-primary flex-1 justify-center" disabled={saving}>
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={15} />}
                {editing ? 'Save Changes' : 'Add Vendor'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog title={`Remove "${confirm.name}"?`} description="This vendor will be permanently deleted from the system." onConfirm={handleDelete} onCancel={() => setConfirm(null)} danger />
      )}
    </div>
  );
}
