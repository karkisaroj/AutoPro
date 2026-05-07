import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Send, Check, X, Tag, TrendingUp, Clock, Search, ChevronDown, FileText, Package } from 'lucide-react';
import { getSales, createSale, sendInvoiceEmail, downloadSaleInvoicePdf } from '../../services/salesService';
import { getParts } from '../../services/partsService';
import { getCustomers } from '../../services/customerService';
import { PageHeader, StatusBadge, Spinner, Avatar } from '../../components/ui/index';
import StatCard from '../../components/ui/StatCard';

const TODAY = new Date().toISOString().split('T')[0];
const PAYMENT_METHODS = ['Cash', 'Card', 'Credit'];

export default function StaffSales() {
  const [invoices, setInvoices]           = useState([]);
  const [parts, setParts]                 = useState([]);
  const [customers, setCustomers]         = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showNew, setShowNew]             = useState(false);
  const [showEmail, setShowEmail]         = useState(null);
  const [emailSending, setEmailSending]   = useState(false);
  const [toast, setToast]                 = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  /* Form state */
  const [customerSearch, setCustomerSearch]     = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustDrop, setShowCustDrop]         = useState(false);
  const [partsSearch, setPartsSearch]           = useState('');
  const [paymentMethod, setPaymentMethod]       = useState('Cash');
  const [saving, setSaving]                     = useState(false);
  const custRef = useRef(null);

  useEffect(() => {
    Promise.all([getSales(), getParts(1, 1000).then(r => r.data), getCustomers()]).then(([s, p, c]) => {
      setInvoices(s);
      setParts(p.map(pt => ({ ...pt, qty: 0 })));
      setCustomers(c);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  /* Close customer dropdown on outside click */
  useEffect(() => {
    const handler = (e) => { if (custRef.current && !custRef.current.contains(e.target)) setShowCustDrop(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch)
  );

  const filteredParts = parts.filter(p =>
    p.name.toLowerCase().includes(partsSearch.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(partsSearch.toLowerCase())
  );

  const selectCustomer = (c) => {
    setSelectedCustomer(c);
    setCustomerSearch(c.name);
    setShowCustDrop(false);
  };

  const updateQty = (partId, delta) => {
    setParts(prev => prev.map(p => {
      if (p.id !== partId) return p;
      const newQty = Math.max(0, Math.min(p.qty + delta, p.quantity));
      return { ...p, qty: newQty };
    }));
  };

  const cartItems = parts.filter(p => p.qty > 0);
  const subtotal    = cartItems.reduce((s, p) => s + p.price * p.qty, 0);
  const loyaltyDisc = subtotal >= 5000 ? Math.round(subtotal * 0.1) : 0;
  const vat         = Math.round((subtotal - loyaltyDisc) * 0.13);
  const total       = subtotal - loyaltyDisc + vat;

  const resetForm = () => {
    setSelectedCustomer(null);
    setCustomerSearch('');
    setPartsSearch('');
    setParts(prev => prev.map(p => ({ ...p, qty: 0 })));
    setPaymentMethod('Cash');
  };

  const saveInvoice = async () => {
    if (!selectedCustomer || cartItems.length === 0) return;
    setSaving(true);
    try {
      const created = await createSale({
        customerId: selectedCustomer.id,
        paymentMethod,
        items: cartItems.map(p => ({ partId: p.id, qty: p.qty })),
      });
      setInvoices(prev => [created, ...prev]);
      setShowNew(false);
      resetForm();
      setToast({ type: 'success', msg: `Sale completed — invoice generated for ${selectedCustomer.name}!` });
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPdf = async (inv) => {
    setDownloadingId(inv.id);
    try {
      await downloadSaleInvoicePdf(inv.id);
    } catch {
      setToast({ type: 'error', msg: 'Failed to download invoice.' });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleSendEmail = async (inv) => {
    setEmailSending(true);
    try {
      await sendInvoiceEmail(inv.id);
      setToast({ type: 'success', msg: 'Invoice email sent successfully!' });
    } catch {
      setToast({ type: 'error', msg: 'Failed to send email. Check SMTP configuration.' });
    } finally {
      setEmailSending(false);
      setShowEmail(null);
    }
  };

  /* Stats */
  const paid    = invoices.filter(i => i.status === 'Paid');
  const pending = invoices.filter(i => i.status === 'Pending');
  const todayRev = paid.filter(i => i.date === TODAY).reduce((s, i) => s + i.total, 0);

  const stats = [
    { label: "Today's Revenue",  value: `NPR ${todayRev.toLocaleString()}`, color: 'blue',    icon: TrendingUp   },
    { label: 'Paid Invoices',    value: paid.length.toString(),              color: 'emerald', icon: Check        },
    { label: 'Pending Invoices', value: pending.length.toString(),           color: 'amber',   icon: Clock        },
    { label: 'Total Sales',      value: invoices.length.toString(),          color: 'violet',  icon: ShoppingCart },
  ];

  if (loading) return (
    <div className="space-y-6">
      <PageHeader eyebrow="Staff" title="Sales & Invoices" subtitle="Sell parts and manage invoices." />
      <Spinner />
    </div>
  );

  return (
    <div className="space-y-6 page-enter">
      {toast && (
        <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold border ${
          toast.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300'
            : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300'
        }`}>
          {toast.type === 'success' ? <Check size={15} /> : <X size={15} />}
          {toast.msg}
        </div>
      )}

      <PageHeader
        eyebrow="Staff"
        title="Sales & Invoices"
        subtitle="Sell parts to customers and generate invoices."
        actions={
          <button onClick={() => setShowNew(true)} className="btn-primary">
            <ShoppingCart size={16} /> Sell Parts
          </button>
        }
      />

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
        {invoices.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-2 text-muted-foreground">
            <ShoppingCart size={32} className="opacity-30" />
            <p className="text-sm font-semibold">No invoices yet</p>
            <p className="text-xs">Sell parts to a customer to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>{['Invoice', 'Customer', 'Date', 'Subtotal', 'Discount', 'VAT', 'Total', 'Status', 'Invoice', 'Email'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id}>
                    <td className="font-mono text-xs text-muted-foreground">#{inv.id}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Avatar name={inv.customerName} size="sm" color="blue" />
                        <span className="font-semibold text-foreground text-xs">{inv.customerName}</span>
                      </div>
                    </td>
                    <td className="text-xs">{inv.date}</td>
                    <td className="text-xs text-muted-foreground">NPR {inv.subtotal?.toLocaleString()}</td>
                    <td>
                      {inv.loyaltyDiscount > 0
                        ? <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs"><Tag size={10} /> NPR {inv.loyaltyDiscount.toLocaleString()}</span>
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="text-xs text-muted-foreground">NPR {inv.tax?.toLocaleString() ?? 0}</td>
                    <td className="font-bold text-foreground">NPR {inv.total.toLocaleString()}</td>
                    <td><StatusBadge status={inv.status} /></td>
                    <td>
                      <button
                        onClick={() => handleDownloadPdf(inv)}
                        disabled={downloadingId === inv.id}
                        className="flex items-center gap-1 text-violet-600 dark:text-violet-400 text-xs font-bold hover:underline disabled:opacity-40"
                      >
                        {downloadingId === inv.id
                          ? <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                          : <FileText size={11} />}
                        Invoice
                      </button>
                    </td>
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
        )}
      </div>

      {/* ── Sell Parts Modal ── */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowNew(false); resetForm(); }} />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10">

            {/* Modal header */}
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ShoppingCart size={17} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-display font-black text-foreground leading-tight">Sell Parts</h3>
                  <p className="text-xs text-muted-foreground">Select customer, parts, and payment method</p>
                </div>
              </div>
              <button onClick={() => { setShowNew(false); resetForm(); }} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">

              {/* — Customer — */}
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Customer</p>
                <div className="relative" ref={custRef}>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={customerSearch}
                      onChange={e => { setCustomerSearch(e.target.value); setSelectedCustomer(null); setShowCustDrop(true); }}
                      onFocus={() => setShowCustDrop(true)}
                      placeholder="Search by name or phone…"
                      className="form-input pl-9"
                    />
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  {showCustDrop && filteredCustomers.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-xl shadow-xl max-h-48 overflow-y-auto">
                      {filteredCustomers.slice(0, 8).map(c => (
                        <button
                          key={c.id}
                          onClick={() => selectCustomer(c)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 text-left transition-colors"
                        >
                          <Avatar name={c.name} size="sm" color="blue" />
                          <div>
                            <p className="text-sm font-semibold text-foreground">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.phone} · {c.tier}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedCustomer && (
                  <div className="mt-2 flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl px-3 py-2">
                    <Check size={13} className="text-emerald-600 flex-shrink-0" />
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                      {selectedCustomer.name}
                    </p>
                    <span className="text-emerald-600/60 text-xs">·</span>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      Spent NPR {selectedCustomer.totalSpent?.toLocaleString()} · {selectedCustomer.tier}
                    </p>
                  </div>
                )}
              </div>

              {/* — Parts — */}
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Parts {cartItems.length > 0 && <span className="ml-1 text-primary">{cartItems.length} selected</span>}
                </p>
                <div className="relative mb-2">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={partsSearch}
                    onChange={e => setPartsSearch(e.target.value)}
                    placeholder="Filter by name or category…"
                    className="form-input pl-9 py-2 text-xs"
                  />
                </div>
                <div className="border border-border rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/60 sticky top-0">
                      <tr>
                        {['Part', 'Stock', 'Price', 'Qty'].map(h => (
                          <th key={h} className="text-left px-4 py-2 text-[11px] font-bold text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredParts.length === 0 ? (
                        <tr><td colSpan={4} className="text-center text-xs text-muted-foreground py-6">No parts match your search</td></tr>
                      ) : filteredParts.map(p => (
                        <tr key={p.id} className={`border-t border-border transition-colors ${p.qty > 0 ? 'bg-emerald-50 dark:bg-emerald-900/10' : 'hover:bg-muted/20'}`}>
                          <td className="px-4 py-2.5">
                            <p className="font-semibold text-foreground text-xs">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground">{p.category}</p>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={`text-xs font-medium ${p.quantity === 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                              {p.quantity}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-xs font-semibold text-foreground">NPR {p.price?.toLocaleString()}</td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => updateQty(p.id, -1)} disabled={p.qty === 0}
                                className="w-6 h-6 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-bold text-sm flex items-center justify-center disabled:opacity-30 cursor-pointer">−</button>
                              <span className="w-5 text-center text-xs font-bold text-foreground">{p.qty}</span>
                              <button onClick={() => updateQty(p.id, 1)} disabled={p.qty >= p.quantity}
                                className="w-6 h-6 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-sm flex items-center justify-center disabled:opacity-30 cursor-pointer">+</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* — Cart summary — */}
              {cartItems.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Cart</p>
                  <div className="space-y-1.5">
                    {cartItems.map(p => (
                      <div key={p.id} className="flex items-center justify-between bg-muted/30 border border-border rounded-xl px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Package size={12} className="text-muted-foreground flex-shrink-0" />
                          <span className="text-xs font-medium text-foreground">{p.name}</span>
                          <span className="text-[10px] text-muted-foreground bg-muted rounded-md px-1.5 py-0.5">×{p.qty}</span>
                        </div>
                        <span className="text-xs font-bold text-foreground">NPR {(p.price * p.qty).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* — Payment method — */}
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Payment Method</p>
                <div className="flex gap-2">
                  {PAYMENT_METHODS.map(m => (
                    <button
                      key={m}
                      onClick={() => setPaymentMethod(m)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors cursor-pointer ${
                        paymentMethod === m
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-card text-muted-foreground border-border hover:bg-muted'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* — Price summary — */}
              {cartItems.length > 0 && (
                <div className="bg-muted/30 border border-border rounded-xl px-4 py-3 space-y-1.5">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</span>
                    <span>NPR {subtotal.toLocaleString()}</span>
                  </div>
                  {loyaltyDisc > 0 && (
                    <div className="flex justify-between text-sm font-semibold text-emerald-600">
                      <span className="flex items-center gap-1"><Tag size={11} /> Loyalty Discount (10%)</span>
                      <span>− NPR {loyaltyDisc.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>VAT (13%)</span>
                    <span>NPR {vat.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-black text-foreground text-base pt-2 border-t border-border">
                    <span>Total</span>
                    <span>NPR {total.toLocaleString()}</span>
                  </div>
                  {subtotal >= 5000 && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-0.5">
                      10% loyalty discount applied (subtotal &gt; NPR 5,000)
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={() => { setShowNew(false); resetForm(); }} className="btn-secondary flex-1">Cancel</button>
                <button
                  onClick={saveInvoice}
                  disabled={!selectedCustomer || cartItems.length === 0 || saving}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {saving
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Check size={16} />}
                  Confirm Sell
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
              <p><span className="text-muted-foreground">Subject:</span> Invoice #{showEmail.id} — AutoPro Garage</p>
              <p className="text-muted-foreground text-xs mt-2">Invoice for NPR {showEmail.total?.toLocaleString()} will be sent to the customer's registered email.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowEmail(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleSendEmail(showEmail)} disabled={emailSending} className="btn-primary flex-1 disabled:opacity-50">
                {emailSending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={16} />}
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
