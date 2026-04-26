import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Send, Check, X, Tag, TrendingUp, Clock } from 'lucide-react';
import { getSales, createSale } from '../../services/salesService';
import { PageHeader, StatusBadge, Spinner, Avatar } from '../../components/ui/index';
import StatCard from '../../components/ui/StatCard';

const PARTS_CATALOG = [
  { id: 'PT-001', name: 'Brake Pad Set (Toyota)',      price: 2800  },
  { id: 'PT-002', name: 'Engine Oil 5W-30 (5L)',       price: 1200  },
  { id: 'PT-003', name: 'Air Filter (Honda City)',     price: 650   },
  { id: 'PT-004', name: 'Shock Absorber Front (KIA)',  price: 9500  },
  { id: 'PT-005', name: 'Alternator 12V Universal',    price: 7200  },
  { id: 'PT-006', name: 'Spark Plug Set NGK',          price: 1800  },
  { id: 'PT-007', name: 'Tyre 185/65 R15 Yokohama',   price: 12500 },
  { id: 'PT-008', name: 'AC Compressor Belt',          price: 3200  },
];

const TODAY = new Date().toISOString().split('T')[0];

export default function StaffSales() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showNew, setShowNew]   = useState(false);
  const [showEmail, setShowEmail] = useState(null);

  /* Form state */
  const [customer, setCustomer]         = useState('');
  const [email, setEmail]               = useState('');
  const [cart, setCart]                 = useState([]);
  const [selectedPart, setSelectedPart] = useState('');
  const [selectedQty, setSelectedQty]   = useState(1);

  useEffect(() => {
    getSales().then(data => { setInvoices(data); setLoading(false); });
  }, []);

  /* Cart helpers */
  const addToCart = () => {
    const part = PARTS_CATALOG.find(p => p.id === selectedPart);
    if (!part) return;
    setCart(prev => {
      const existing = prev.find(i => i.id === part.id);
      if (existing) return prev.map(i => i.id === part.id ? { ...i, qty: i.qty + selectedQty } : i);
      return [...prev, { id: part.id, name: part.name, qty: selectedQty, price: part.price }];
    });
    setSelectedPart(''); setSelectedQty(1);
  };

  const subtotal       = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const loyaltyDisc    = subtotal >= 5000 ? Math.round(subtotal * 0.1) : 0;
  const total          = subtotal - loyaltyDisc;

  const saveInvoice = () => {
    if (!customer || cart.length === 0) return;
    const newSale = {
      customerName: customer,
      email,
      items: cart.map(i => ({ description: i.name, qty: i.qty, unitPrice: i.price, total: i.qty * i.price })),
      subtotal, loyaltyDiscount: loyaltyDisc, total,
      paymentMethod: 'Cash', status: 'Paid', staffName: 'Manisha Thapa',
    };
    createSale(newSale).then(s => {
      setInvoices(prev => [s, ...prev]);
      setShowNew(false); setCustomer(''); setEmail(''); setCart([]);
    });
  };

  /* Stats */
  const paid    = invoices.filter(i => i.status === 'Paid');
  const pending = invoices.filter(i => i.status === 'Pending');
  const todayRev = paid.filter(i => i.date === TODAY).reduce((s, i) => s + i.total, 0);

  const stats = [
    { label: "Today's Revenue",  value: `NPR ${todayRev.toLocaleString()}`, color: 'blue',    icon: TrendingUp  },
    { label: 'Paid Invoices',    value: paid.length.toString(),              color: 'emerald', icon: Check       },
    { label: 'Pending Invoices', value: pending.length.toString(),           color: 'amber',   icon: Clock       },
    { label: 'Total Sales',      value: invoices.length.toString(),          color: 'violet',  icon: ShoppingCart},
  ];

  if (loading) return (
    <div className="space-y-6">
      <PageHeader eyebrow="Staff" title="Sales & Invoices" subtitle="Create and manage sales invoices." />
      <Spinner />
    </div>
  );

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <PageHeader eyebrow="Staff" title="Sales & Invoices" subtitle="Create and manage sales invoices." />
        <button onClick={() => setShowNew(true)} className="btn-primary">
          <Plus size={16} /> New Sale
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* Invoices table */}
      <div className="dash-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <ShoppingCart size={16} className="text-primary" />
          <h2 className="font-display font-bold text-foreground">Invoice History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>{['Invoice', 'Customer', 'Date', 'Amount', 'Discount', 'Status', 'Email'].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td className="font-mono text-xs text-muted-foreground">{inv.id}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar name={inv.customerName} size="sm" color="blue" />
                      <span className="font-semibold text-foreground text-xs">{inv.customerName}</span>
                    </div>
                  </td>
                  <td className="text-xs">{inv.date}</td>
                  <td className="font-bold text-foreground">NPR {inv.total.toLocaleString()}</td>
                  <td>
                    {inv.loyaltyDiscount > 0
                      ? <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs"><Tag size={10} /> NPR {inv.loyaltyDiscount.toLocaleString()}</span>
                      : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td><StatusBadge status={inv.status} /></td>
                  <td>
                    <button
                      onClick={() => setShowEmail(inv)}
                      className="flex items-center gap-1 text-primary text-xs font-bold hover:underline"
                    >
                      <Send size={11} /> Send
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── New Sale Modal ── */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowNew(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10">
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-display font-black text-foreground">Create New Sale</h3>
              <button onClick={() => setShowNew(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-5">
              {/* Customer info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Customer Name</label>
                  <input value={customer} onChange={e => setCustomer(e.target.value)} placeholder="Ram Bahadur" className="form-input" />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} placeholder="ram@gmail.com" className="form-input" />
                </div>
              </div>

              {/* Add Parts */}
              <div>
                <label className="form-label">Add Parts / Services</label>
                <div className="flex gap-2">
                  <select value={selectedPart} onChange={e => setSelectedPart(e.target.value)} className="form-select flex-1">
                    <option value="">— Select item —</option>
                    {PARTS_CATALOG.map(p => <option key={p.id} value={p.id}>{p.name} (NPR {p.price.toLocaleString()})</option>)}
                  </select>
                  <input type="number" min={1} value={selectedQty} onChange={e => setSelectedQty(+e.target.value)}
                    className="form-input w-16 text-center" />
                  <button onClick={addToCart} className="btn-primary px-3 py-2"><Plus size={16} /></button>
                </div>
              </div>

              {/* Cart */}
              {cart.length > 0 && (
                <div className="border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>{['Part', 'Qty', 'Unit Price', 'Subtotal', ''].map(h => <th key={h} className="text-left px-4 py-2 text-xs font-bold text-muted-foreground">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {cart.map(item => (
                        <tr key={item.id} className="border-t border-border">
                          <td className="px-4 py-2 font-medium text-foreground text-xs">{item.name}</td>
                          <td className="px-4 py-2 text-center text-foreground">{item.qty}</td>
                          <td className="px-4 py-2 text-muted-foreground">NPR {item.price.toLocaleString()}</td>
                          <td className="px-4 py-2 font-bold text-foreground">NPR {(item.qty * item.price).toLocaleString()}</td>
                          <td className="px-4 py-2">
                            <button onClick={() => setCart(c => c.filter(i => i.id !== item.id))} className="text-danger hover:opacity-80">
                              <X size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-4 py-3 bg-muted/30 border-t border-border space-y-1">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Subtotal</span><span>NPR {subtotal.toLocaleString()}</span>
                    </div>
                    {loyaltyDisc > 0 && (
                      <div className="flex justify-between text-sm font-semibold text-emerald-600">
                        <span className="flex items-center gap-1"><Tag size={11} /> Loyalty Discount (10%)</span>
                        <span>- NPR {loyaltyDisc.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-black text-foreground text-base pt-1 border-t border-border">
                      <span>Total</span><span>NPR {total.toLocaleString()}</span>
                    </div>
                    {subtotal >= 5000 && <p className="text-xs text-emerald-600 italic">🎉 10% loyalty discount applied (spend &gt; NPR 5,000)</p>}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowNew(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={saveInvoice} disabled={!customer || cart.length === 0}
                  className="btn-primary flex-1 disabled:opacity-50">
                  <Check size={16} /> Create Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Email Modal ── */}
      {showEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowEmail(null)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-display font-black text-foreground">Send Invoice Email</h3>
              <button onClick={() => setShowEmail(null)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="bg-muted rounded-xl p-4 text-sm space-y-2 mb-4">
              <p><span className="text-muted-foreground">To:</span> <strong className="text-foreground">{showEmail.customerName}</strong></p>
              <p><span className="text-muted-foreground">Subject:</span> Invoice {showEmail.id} — AutoPro Garage</p>
              <p className="text-muted-foreground text-xs mt-2">Invoice for NPR {showEmail.total?.toLocaleString()} will be sent as PDF attachment.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowEmail(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => setShowEmail(null)} className="btn-primary flex-1">
                <Send size={16} /> Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
