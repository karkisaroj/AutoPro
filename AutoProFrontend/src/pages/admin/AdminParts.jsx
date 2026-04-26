import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Trash2, AlertTriangle, Search, Check } from 'lucide-react';
import { getParts, createPart, updatePart, deletePart } from '../../services/partsService';
import { TableSkeleton, EmptyState, PageHeader, StatusBadge, ConfirmDialog, Spinner } from '../../components/ui/index';
import StatCard from '../../components/ui/StatCard';
import Modal from '../../components/ui/Modal';

const CATEGORIES = ['Engine', 'Brakes', 'Tyres', 'Electrical', 'Suspension', 'Fluids', 'Body Parts', 'Filters', 'Transmission', 'AC System'];
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
    const matchCat = catFilter === 'All' || p.category === catFilter;
    return matchSearch && matchCat;
  });

  const lowStock = parts.filter(p => p.quantity <= p.minStock);
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
  };

  const handleDelete = async () => {
    await deletePart(confirm.id);
    setParts(prev => prev.filter(p => p.id !== confirm.id));
    setConfirm(null);
  };

  const stats = [
    { label: 'Total Parts',   value: parts.length,          color: 'violet',  icon: Package      },
    { label: 'Low Stock Items',value: lowStock.length,      color: 'red',     icon: AlertTriangle},
    { label: 'Categories',    value: CATEGORIES.length,     color: 'blue',    icon: Package      },
    { label: 'Inv. Value',    value: 'NPR ' + (parts.reduce((a,p)=>a+p.price*p.quantity,0)/1000).toFixed(0)+'K', color:'emerald', icon: Package },
  ];

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        eyebrow="Inventory"
        title="Parts & Inventory"
        subtitle="Track spare parts, stock levels, and supplier information."
        actions={
          <button onClick={openAdd} className="btn-primary"><Plus size={15}/> Add Part</button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={i} {...s} loading={loading} />)}
      </div>

      {/* Low stock alert */}
      {!loading && lowStock.length > 0 && (
        <div className="dash-card border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/10 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800 dark:text-amber-400">Low Stock Alert:</p>
            <p className="text-sm text-amber-700 dark:text-amber-500">{lowStock.map(p => `${p.name} (${p.quantity} ${p.unit})`).join(' · ')}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="dash-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex flex-wrap items-center gap-3 justify-between">
          <h2 className="font-display font-bold text-foreground">Parts List</h2>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Category filter pills */}
            <div className="flex items-center gap-1 overflow-x-auto max-w-xs">
              {cats.map(c => (
                <button key={c} onClick={() => setCatFilter(c)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    catFilter === c ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-card-hover'
                  }`}>{c}</button>
              ))}
            </div>
            <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2 bg-muted/30">
              <Search size={14} className="text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search parts..." className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-44" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>{['Part Name', 'SKU', 'Category', 'Supplier', 'Price', 'Stock', 'Status', ''].map(h=><th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <TableSkeleton cols={8} rows={6} /> : filtered.length === 0 ? (
                <tr><td colSpan={8}><EmptyState icon={Package} title="No parts found" description="Add inventory or adjust your filters." /></td></tr>
              ) : filtered.map(p => {
                const isLow = p.quantity <= p.minStock;
                return (
                  <tr key={p.id}>
                    <td className="font-bold text-foreground text-sm">{p.name}</td>
                    <td className="font-mono text-xs text-muted-foreground">{p.sku}</td>
                    <td><span className="badge badge-blue">{p.category}</span></td>
                    <td className="text-xs text-muted-foreground">{p.supplier}</td>
                    <td className="font-bold">NPR {Number(p.price).toLocaleString()}</td>
                    <td>
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
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

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
                </select>
              </div>
              <div>
                <label className="form-label">Category</label>
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
              </button>
            </div>
          </div>
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog title={`Delete "${confirm.name}"?`} description="This part will be permanently removed from inventory." onConfirm={handleDelete} onCancel={()=>setConfirm(null)} danger/>
      )}
    </div>
  );
}
