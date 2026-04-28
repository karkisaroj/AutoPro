import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Package, Plus, Edit2, Trash2, AlertTriangle, Search, Check } from 'lucide-react';
import { getParts, createPart, updatePart, deletePart } from '../../services/partsService';
import { TableSkeleton, EmptyState, PageHeader, StatusBadge, ConfirmDialog, Spinner } from '../../components/ui/index';
=======
import { Package, Plus, Edit2, Trash2, AlertTriangle, Search, Check, Layers, Tag, FileText, CheckCircle } from 'lucide-react';
import { getParts, createPart, updatePart, deletePart, createPurchaseOrder } from '../../services/partsService';
import { getVendors } from '../../services/vendorService';
import { TableSkeleton, EmptyState, PageHeader, ConfirmDialog } from '../../components/ui/index';
>>>>>>> noble
import StatCard from '../../components/ui/StatCard';
import Modal from '../../components/ui/Modal';

const CATEGORIES = ['Engine', 'Brakes', 'Tyres', 'Electrical', 'Suspension', 'Fluids', 'Body Parts', 'Filters', 'Transmission', 'AC System'];
<<<<<<< HEAD
const SUPPLIERS  = ['Kantipur Auto Parts', 'Himalayan Spares', 'Kathmandu Motors', 'Pokhara Vehicles', 'Bhairahawa Auto'];
const UNITS      = ['pcs', 'litre', 'set', 'pair', 'roll', 'box'];
const EMPTY_FORM = { name: '', category: 'Engine', sku: '', price: '', quantity: 0, minStock: 5, supplier: 'Kantipur Auto Parts', unit: 'pcs' };

export default function AdminParts() {
  const [parts,   setParts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [confirm, setConfirm] = useState(null);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    getParts().then(data => { setParts(data); setLoading(false); });
  }, []);

  const filtered = parts.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.supplier.toLowerCase().includes(q);
=======
const UNITS      = ['pcs', 'litre', 'set', 'pair', 'roll', 'box'];

const EMPTY_FORM = {
  name: '', category: 'Engine', sku: '', price: '', quantity: 0, minStock: 5, vendorId: '', unit: 'pcs',
};

const EMPTY_PO_FORM = { quantity: 10, unitCost: '', notes: '' };

function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

export default function AdminParts() {
  const [parts,     setParts]     = useState([]);
  const [vendors,   setVendors]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [catFilter, setCatFilter] = useState('All');

  // Part add/edit modal
  const [modal,     setModal]     = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Delete confirm
  const [confirm,   setConfirm]   = useState(null);

  // Purchase Order modal
  const [poTarget,  setPoTarget]  = useState(null); // the part being ordered
  const [poForm,    setPoForm]    = useState(EMPTY_PO_FORM);
  const [poSaving,  setPoSaving]  = useState(false);
  const [poError,   setPoError]   = useState(null);
  const [poSuccess, setPoSuccess] = useState(null); // PO id after creation

  useEffect(() => {
    Promise.all([getParts(), getVendors()]).then(([partsData, vendorsData]) => {
      setParts(partsData);
      setVendors(vendorsData);
      setLoading(false);
    });
  }, []);

  // Vendor helpers
  const activeVendors = vendors.filter(v => v.status === 'Active');
  const availableVendors = (() => {
    const byCategory = activeVendors.filter(v => v.category === form.category);
    return byCategory.length > 0 ? byCategory : activeVendors;
  })();

  // ── Filtering ────────────────────────────────────────────────────────────
  const filtered = parts.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) ||
      (p.sku || '').toLowerCase().includes(q) ||
      (p.supplier || '').toLowerCase().includes(q);
>>>>>>> noble
    const matchCat = catFilter === 'All' || p.category === catFilter;
    return matchSearch && matchCat;
  });

  const lowStock = parts.filter(p => p.quantity <= p.minStock);
<<<<<<< HEAD
  const cats = ['All', ...new Set(parts.map(p => p.category))];

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setModal(true); };
  const openEdit = (p) => {
    setEditing(p.id);
    setForm({ name: p.name, category: p.category, sku: p.sku, price: p.price, quantity: p.quantity, minStock: p.minStock, supplier: p.supplier, unit: p.unit });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.sku.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        const updated = await updatePart(editing, form);
        setParts(prev => prev.map(p => p.id === editing ? { ...p, ...updated } : p));
      } else {
        const created = await createPart(form);
        setParts(prev => [...prev, created]);
      }
      setModal(false);
    } finally { setSaving(false); }
=======
  const cats     = ['All', ...new Set(parts.map(p => p.category))];

  // ── Part CRUD ─────────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, vendorId: activeVendors[0]?.id || '' });
    setSaveError(null);
    setModal(true);
  };

  const openEdit = (p) => {
    setEditing(p.id);
    setForm({
      name: p.name, category: p.category, sku: p.sku || '',
      price: p.price, quantity: p.quantity, minStock: p.minStock,
      vendorId: p.vendorId || '', unit: p.unit,
    });
    setSaveError(null);
    setModal(true);
  };

  const handleCategoryChange = (newCat) => {
    const vendorsByNewCat = activeVendors.filter(v => v.category === newCat);
    const currentFits     = vendorsByNewCat.some(v => v.id === Number(form.vendorId));
    setForm(f => ({
      ...f,
      category: newCat,
      vendorId: currentFits
        ? f.vendorId
        : (vendorsByNewCat[0]?.id || activeVendors[0]?.id || ''),
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.sku.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      const payload = { ...form, vendorId: Number(form.vendorId) || undefined };
      if (editing) {
        const updated = await updatePart(editing, payload);
        setParts(prev => prev.map(p => p.id === editing ? { ...p, ...updated } : p));
      } else {
        const created = await createPart(payload);
        setParts(prev => [...prev, created]);
      }
      setModal(false);
    } catch (err) {
      setSaveError(err?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
>>>>>>> noble
  };

  const handleDelete = async () => {
    await deletePart(confirm.id);
    setParts(prev => prev.filter(p => p.id !== confirm.id));
    setConfirm(null);
  };

<<<<<<< HEAD
  const stats = [
    { label: 'Total Parts',   value: parts.length,          color: 'violet',  icon: Package      },
    { label: 'Low Stock Items',value: lowStock.length,      color: 'red',     icon: AlertTriangle},
    { label: 'Categories',    value: CATEGORIES.length,     color: 'blue',    icon: Package      },
    { label: 'Inv. Value',    value: 'NPR ' + (parts.reduce((a,p)=>a+p.price*p.quantity,0)/1000).toFixed(0)+'K', color:'emerald', icon: Package },
=======
  // ── Purchase Order ────────────────────────────────────────────────────────
  const openPO = (p) => {
    const defaultQty = Math.max((p.minStock - p.quantity) + 5, 5);
    setPoTarget(p);
    setPoForm({ quantity: defaultQty, unitCost: p.price, notes: '' });
    setPoError(null);
    setPoSuccess(null);
  };

  const handleCreatePO = async () => {
    if (!poTarget.vendorId) {
      setPoError('This part has no vendor assigned. Edit the part to assign a vendor first.');
      return;
    }
    setPoSaving(true);
    setPoError(null);
    try {
      const result = await createPurchaseOrder({
        vendorId: poTarget.vendorId,
        notes: poForm.notes || `Restock order for ${poTarget.name}`,
        items: [{
          partId:   poTarget.id,
          quantity: Number(poForm.quantity),
          unitCost: Number(poForm.unitCost),
        }],
      });
      setPoSuccess(result.id);
    } catch (err) {
      setPoError(err?.message || 'Failed to create purchase order.');
    } finally {
      setPoSaving(false);
    }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const invValue = parts.reduce((a, p) => a + (p.price * p.quantity), 0);
  const stats = [
    { label: 'Total Parts',     value: parts.length.toString(),                     color: 'violet',  icon: Package       },
    { label: 'Low Stock Items', value: lowStock.length.toString(),                   color: 'red',     icon: AlertTriangle },
    { label: 'Categories',      value: CATEGORIES.length.toString(),                 color: 'blue',    icon: Layers        },
    { label: 'Inventory Value', value: `NPR ${(invValue / 1000).toFixed(0)}K`,      color: 'emerald', icon: Tag           },
>>>>>>> noble
  ];

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        eyebrow="Inventory"
        title="Parts & Inventory"
<<<<<<< HEAD
        subtitle="Track spare parts, stock levels, and supplier information."
        actions={
          <button onClick={openAdd} className="btn-primary"><Plus size={15}/> Add Part</button>
        }
=======
        subtitle="Track spare parts, stock levels, and vendor information."
        actions={<button onClick={openAdd} className="btn-primary"><Plus size={15} /> Add Part</button>}
>>>>>>> noble
      />

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={i} {...s} loading={loading} />)}
      </div>

<<<<<<< HEAD
      {/* Low stock alert */}
=======
      {/* Low-stock alert */}
>>>>>>> noble
      {!loading && lowStock.length > 0 && (
        <div className="dash-card border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/10 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
<<<<<<< HEAD
            <p className="text-sm font-bold text-amber-800 dark:text-amber-400">Low Stock Alert:</p>
            <p className="text-sm text-amber-700 dark:text-amber-500">{lowStock.map(p => `${p.name} (${p.quantity} ${p.unit})`).join(' · ')}</p>
=======
            <p className="text-sm font-bold text-amber-800 dark:text-amber-400">Low Stock Alert</p>
            <p className="text-xs text-amber-700 dark:text-amber-500">
              {lowStock.map(p => `${p.name} (${p.quantity} ${p.unit})`).join(' · ')}
            </p>
>>>>>>> noble
          </div>
        </div>
      )}

      {/* Table */}
      <div className="dash-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex flex-wrap items-center gap-3 justify-between">
          <h2 className="font-display font-bold text-foreground">Parts List</h2>
          <div className="flex items-center gap-3 flex-wrap">
<<<<<<< HEAD
            {/* Category filter pills */}
            <div className="flex items-center gap-1 overflow-x-auto max-w-xs">
              {cats.map(c => (
                <button key={c} onClick={() => setCatFilter(c)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    catFilter === c ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-card-hover'
                  }`}>{c}</button>
=======
            <div className="flex items-center gap-1 overflow-x-auto">
              {cats.map(c => (
                <button
                  key={c}
                  onClick={() => setCatFilter(c)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    catFilter === c ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-card-hover'
                  }`}
                >
                  {c}
                </button>
>>>>>>> noble
              ))}
            </div>
            <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2 bg-muted/30">
              <Search size={14} className="text-muted-foreground" />
<<<<<<< HEAD
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search parts..." className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-44" />
=======
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search parts…"
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-40"
              />
>>>>>>> noble
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
<<<<<<< HEAD
              <tr>{['Part Name', 'SKU', 'Category', 'Supplier', 'Price', 'Stock', 'Status', ''].map(h=><th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <TableSkeleton cols={8} rows={6} /> : filtered.length === 0 ? (
                <tr><td colSpan={8}><EmptyState icon={Package} title="No parts found" description="Add inventory or adjust your filters." /></td></tr>
=======
              <tr>
                {['Part Name', 'SKU', 'Category', 'Vendor', 'Price', 'Stock', 'Purchase Order', ''].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? <TableSkeleton cols={8} rows={6} /> : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState icon={Package} title="No parts found" description="Add inventory or adjust your filters." />
                  </td>
                </tr>
>>>>>>> noble
              ) : filtered.map(p => {
                const isLow = p.quantity <= p.minStock;
                return (
                  <tr key={p.id}>
<<<<<<< HEAD
                    <td className="font-bold text-foreground text-sm">{p.name}</td>
=======
                    <td>
                      <p className="font-bold text-foreground text-sm">{p.name}</p>
                      {isLow && (
                        <p className="text-[10px] text-amber-500 font-semibold flex items-center gap-1 mt-0.5">
                          <AlertTriangle size={10} /> Low stock
                        </p>
                      )}
                    </td>
>>>>>>> noble
                    <td className="font-mono text-xs text-muted-foreground">{p.sku}</td>
                    <td><span className="badge badge-blue">{p.category}</span></td>
                    <td className="text-xs text-muted-foreground">{p.supplier}</td>
                    <td className="font-bold">NPR {Number(p.price).toLocaleString()}</td>
                    <td>
<<<<<<< HEAD
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isLow ? 'text-red-500' : 'text-foreground'}`}>{p.quantity}</span>
                        <span className="text-muted-foreground text-xs">{p.unit}</span>
                        {isLow && <AlertTriangle size={13} className="text-amber-500" />}
                      </div>
                    </td>
                    <td><StatusBadge status={isLow ? 'Pending' : 'Active'} /></td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"><Edit2 size={13}/></button>
                        <button onClick={() => setConfirm({id:p.id,name:p.name})} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-600 transition-colors cursor-pointer"><Trash2 size={13}/></button>
=======
                      <span className={`font-bold ${isLow ? 'text-red-500' : 'text-foreground'}`}>{p.quantity}</span>
                      <span className="text-muted-foreground text-xs ml-1">{p.unit}</span>
                    </td>
                    <td>
                      <button
                        onClick={() => openPO(p)}
                        disabled={!p.vendorId}
                        className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-white bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-600 dark:hover:bg-violet-600 rounded-lg px-2.5 py-1.5 transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        title={p.vendorId ? 'Generate Purchase Order' : 'No vendor assigned'}
                      >
                        <FileText size={12} />
                        Generate PO
                      </button>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"><Edit2 size={13} /></button>
                        <button onClick={() => setConfirm({ id: p.id, name: p.name })} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-600 transition-colors cursor-pointer"><Trash2 size={13} /></button>
>>>>>>> noble
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

<<<<<<< HEAD
      {/* Modal */}
      {modal && (
        <Modal title={editing ? 'Edit Part' : 'Add New Part'} onClose={() => setModal(false)} icon={Package}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="form-label">Part Name</label>
                <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Engine Oil Filter" className="form-input"/>
              </div>
              <div>
                <label className="form-label">SKU</label>
                <input value={form.sku} onChange={e=>setForm(f=>({...f,sku:e.target.value}))} placeholder="ENG-FLT-001" className="form-input"/>
              </div>
              <div>
                <label className="form-label">Unit</label>
                <select value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))} className="form-select">
                  {UNITS.map(u=><option key={u}>{u}</option>)}
=======
      {/* ── Part Add / Edit Modal ─────────────────────────────────────────── */}
      {modal && (
        <Modal title={editing ? 'Edit Part' : 'Add New Part'} onClose={() => setModal(false)} icon={Package}>
          <div className="space-y-4">
            {saveError && (
              <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2">
                {saveError}
              </div>
            )}

            <SectionDivider label="Part Information" />
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="form-label">Part Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Engine Oil Filter" className="form-input" />
              </div>
              <div>
                <label className="form-label">SKU</label>
                <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="ENG-FLT-001" className="form-input font-mono" />
              </div>
              <div>
                <label className="form-label">Unit</label>
                <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="form-select">
                  {UNITS.map(u => <option key={u}>{u}</option>)}
>>>>>>> noble
                </select>
              </div>
              <div>
                <label className="form-label">Category</label>
<<<<<<< HEAD
                <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className="form-select">
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Supplier</label>
                <select value={form.supplier} onChange={e=>setForm(f=>({...f,supplier:e.target.value}))} className="form-select">
                  {SUPPLIERS.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Price (NPR)</label>
                <input type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:+e.target.value}))} placeholder="500" className="form-input"/>
              </div>
              <div>
                <label className="form-label">Qty in Stock</label>
                <input type="number" value={form.quantity} onChange={e=>setForm(f=>({...f,quantity:+e.target.value}))} placeholder="50" className="form-input"/>
              </div>
              <div className="col-span-2">
                <label className="form-label">Min Stock Level (Alert below this)</label>
                <input type="number" value={form.minStock} onChange={e=>setForm(f=>({...f,minStock:+e.target.value}))} placeholder="5" className="form-input"/>
              </div>
            </div>
            <div className="flex gap-3 pt-2 border-t border-border">
              <button onClick={()=>setModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} className="btn-primary flex-1 justify-center" disabled={saving}>
                {saving?<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<Check size={15}/>}
                {editing?'Save Changes':'Add Part'}
=======
                <select value={form.category} onChange={e => handleCategoryChange(e.target.value)} className="form-select">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Vendor</label>
                <select value={form.vendorId} onChange={e => setForm(f => ({ ...f, vendorId: e.target.value }))} className="form-select">
                  {availableVendors.length === 0
                    ? <option value="">No active vendors</option>
                    : availableVendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)
                  }
                </select>
                {activeVendors.filter(v => v.category === form.category).length > 0 && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {activeVendors.filter(v => v.category === form.category).length} vendor{activeVendors.filter(v => v.category === form.category).length !== 1 ? 's' : ''} for {form.category}
                  </p>
                )}
              </div>
            </div>

            <SectionDivider label="Stock & Pricing" />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="form-label">Price (NPR)</label>
                <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} placeholder="500" className="form-input" />
              </div>
              <div>
                <label className="form-label">Qty in Stock</label>
                <input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: +e.target.value }))} placeholder="50" className="form-input" />
              </div>
              <div>
                <label className="form-label">Min Stock</label>
                <input type="number" value={form.minStock} onChange={e => setForm(f => ({ ...f, minStock: +e.target.value }))} placeholder="5" className="form-input" />
                <p className="text-[10px] text-muted-foreground mt-1">Alert threshold</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-border">
              <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} className="btn-primary flex-1 justify-center" disabled={saving}>
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={15} />}
                {editing ? 'Save Changes' : 'Add Part'}
>>>>>>> noble
              </button>
            </div>
          </div>
        </Modal>
      )}

<<<<<<< HEAD
      {confirm && (
        <ConfirmDialog title={`Delete "${confirm.name}"?`} description="This part will be permanently removed from inventory." onConfirm={handleDelete} onCancel={()=>setConfirm(null)} danger/>
=======
      {/* ── Purchase Order Modal ──────────────────────────────────────────── */}
      {poTarget && (
        <Modal title="Generate Purchase Order" onClose={() => setPoTarget(null)} icon={FileText}>
          {poSuccess ? (
            /* Success screen */
            <div className="py-6 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle size={28} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-black text-foreground text-base">Purchase Order Created</p>
                <p className="text-sm text-muted-foreground mt-1">
                  PO #{poSuccess} is pending. Go to the <span className="font-semibold text-foreground">Purchase Orders</span> page to mark it as Received once goods arrive — that will automatically update the stock.
                </p>
              </div>
              <button onClick={() => setPoTarget(null)} className="btn-primary w-full justify-center">
                Done
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {poError && (
                <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2">
                  {poError}
                </div>
              )}

              {/* Part summary (read-only) */}
              <div className="bg-muted/40 border border-border rounded-xl p-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Package size={14} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">{poTarget.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    SKU: {poTarget.sku} &nbsp;·&nbsp; Category: {poTarget.category} &nbsp;·&nbsp; Current stock: <span className={`font-semibold ${poTarget.quantity <= poTarget.minStock ? 'text-red-500' : 'text-foreground'}`}>{poTarget.quantity} {poTarget.unit}</span>
                  </p>
                </div>
              </div>

              {/* Vendor (read-only) */}
              <div>
                <label className="form-label">Vendor</label>
                <div className="form-input text-sm text-muted-foreground bg-muted/30 select-none">
                  {poTarget.supplier || '—'}
                </div>
              </div>

              <SectionDivider label="Order Details" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Quantity to Order</label>
                  <input
                    type="number"
                    min="1"
                    value={poForm.quantity}
                    onChange={e => setPoForm(f => ({ ...f, quantity: e.target.value }))}
                    className="form-input"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Min stock: {poTarget.minStock} {poTarget.unit}
                  </p>
                </div>
                <div>
                  <label className="form-label">Unit Cost (NPR)</label>
                  <input
                    type="number"
                    min="0"
                    value={poForm.unitCost}
                    onChange={e => setPoForm(f => ({ ...f, unitCost: e.target.value }))}
                    className="form-input"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Total: NPR {(Number(poForm.quantity) * Number(poForm.unitCost)).toLocaleString()}
                  </p>
                </div>
              </div>
              <div>
                <label className="form-label">Notes (optional)</label>
                <textarea
                  rows={2}
                  value={poForm.notes}
                  onChange={e => setPoForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder={`Restock order for ${poTarget.name}`}
                  className="form-input resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2 border-t border-border">
                <button onClick={() => setPoTarget(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleCreatePO} className="btn-primary flex-1 justify-center" disabled={poSaving}>
                  {poSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FileText size={15} />}
                  Create Purchase Order
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* ── Confirm Delete ────────────────────────────────────────────────── */}
      {confirm && (
        <ConfirmDialog
          title={`Delete "${confirm.name}"?`}
          description="This part will be permanently removed from inventory."
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
          danger
        />
>>>>>>> noble
      )}
    </div>
  );
}
