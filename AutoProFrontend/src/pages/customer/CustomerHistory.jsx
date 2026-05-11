import React, { useState, useEffect } from 'react';
import { FileText, ChevronDown, ChevronUp, Download, Search, TrendingUp, Tag, Receipt } from 'lucide-react';
import { PageHeader, StatusBadge, Spinner } from '../../components/ui/index';
import { useAuth } from '../../context/AuthContext';
import { getCustomerHistory } from '../../services/customerService';
import { downloadSaleInvoicePdf } from '../../services/salesService';

export default function CustomerHistory() {
  const { user } = useAuth();
  const [history,   setHistory]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [expanded,  setExpanded]  = useState(null);
  const [query,     setQuery]     = useState('');
  const [pdfLoading, setPdfLoading] = useState(null); // holds the sale id being downloaded

  useEffect(() => {
    if (!user?.profileId) { setLoading(false); return; }
    getCustomerHistory(user.profileId)
      .then(data => { setHistory(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  const filtered = history.filter(h =>
    String(h.id).includes(query) ||
    (h.staffName || '').toLowerCase().includes(query.toLowerCase()) ||
    (h.status || '').toLowerCase().includes(query.toLowerCase())
  );

  const handleDownload = async (id) => {
    setPdfLoading(id);
    try {
      await downloadSaleInvoicePdf(id);
    } catch {
      // ignore — browser already shows failed download
    } finally {
      setPdfLoading(null);
    }
  };

  const totalSpent    = history.reduce((s, h) => s + (h.total || 0), 0);
  const totalSaved    = history.reduce((s, h) => s + (h.loyaltyDiscount || 0), 0);

  if (loading) return (
    <div className="space-y-6">
      <PageHeader eyebrow="Customer" title="Service History" subtitle="All your past invoices and service records." />
      <Spinner />
    </div>
  );

  return (
    <div className="space-y-6 page-enter">
      <PageHeader eyebrow="Customer" title="Service History" subtitle="All your past invoices and service records." />

      {/* Totals strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Spent',  value: `NPR ${totalSpent.toLocaleString()}`, icon: TrendingUp, iconBg: 'from-blue-500 to-indigo-600'   },
          { label: 'Invoices',     value: history.length,                        icon: Receipt,    iconBg: 'from-violet-500 to-purple-600' },
          { label: 'Total Saved',  value: `NPR ${totalSaved.toLocaleString()}`,  icon: Tag,        iconBg: 'from-emerald-500 to-teal-600'  },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="dash-card p-4 text-center">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.iconBg} flex items-center justify-center mx-auto mb-2`}>
                <Icon size={14} className="text-white" />
              </div>
              <p className="text-xs text-muted-foreground font-semibold">{s.label}</p>
              <p className={`text-lg font-black mt-0.5 ${s.label === 'Total Saved' && totalSaved > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>{s.value}</p>
            </div>
          );
        })}
      </div>
      {totalSaved > 0 && (
        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl px-4 py-3">
          <Tag size={15} className="text-emerald-600 flex-shrink-0" />
          <p className="text-sm text-emerald-700 dark:text-emerald-400 font-semibold">
            You've saved <strong>NPR {totalSaved.toLocaleString()}</strong> through loyalty discounts across {history.filter(h => h.loyaltyDiscount > 0).length} purchase{history.filter(h => h.loyaltyDiscount > 0).length !== 1 ? 's' : ''}.
          </p>
        </div>
      )}

      {/* Search */}
      <div className="search-bar">
        <Search size={14} className="text-muted-foreground" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          placeholder="Search by invoice ID, staff name…"
        />
      </div>

      {/* Invoice List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="dash-card p-10 text-center">
            <FileText size={32} className="mx-auto text-muted-foreground mb-2" />
            <p className="font-bold text-foreground">No records found</p>
          </div>
        ) : filtered.map(h => {
          const open = expanded === h.id;
          return (
            <div key={h.id} className="dash-card overflow-hidden">
              <button
                className="w-full flex items-center gap-4 p-5 hover:bg-card-hover transition-colors text-left cursor-pointer"
                onClick={() => setExpanded(open ? null : h.id)}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
                  <FileText size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-foreground">Invoice #{h.id}</span>
                    {h.staffName && <span className="text-xs text-muted-foreground">· {h.staffName}</span>}
                  </div>
                  <div className="flex gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                    <span>{h.date}</span>
                    {h.paymentMethod && <span>Payment: {h.paymentMethod}</span>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-black text-foreground">NPR {(h.total || 0).toLocaleString()}</p>
                  {h.loyaltyDiscount > 0 && (
                    <p className="text-xs text-emerald-600 font-semibold">-NPR {h.loyaltyDiscount.toLocaleString()}</p>
                  )}
                  <StatusBadge status={h.status} />
                </div>
                <div className="ml-2 text-muted-foreground">
                  {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {open && (
                <div className="border-t border-border bg-background/60 px-5 py-4">
                  <table className="w-full data-table text-sm mb-4">
                    <thead>
                      <tr>{['Item', 'Qty', 'Unit Price', 'Total'].map(c => <th key={c}>{c}</th>)}</tr>
                    </thead>
                    <tbody>
                      {(h.items || []).map((it, i) => (
                        <tr key={i}>
                          <td>{it.partName}</td>
                          <td className="text-center">{it.quantity}</td>
                          <td>NPR {(it.unitPrice || 0).toLocaleString()}</td>
                          <td className="font-semibold text-foreground">NPR {(it.lineTotal || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-border">
                        <td colSpan={3} className="font-semibold pt-2">Subtotal</td>
                        <td className="font-semibold pt-2">NPR {(h.subtotal || 0).toLocaleString()}</td>
                      </tr>
                      {h.loyaltyDiscount > 0 && (
                        <tr>
                          <td colSpan={3} className="text-emerald-600 font-semibold">Loyalty Discount</td>
                          <td className="text-emerald-600 font-semibold">-NPR {h.loyaltyDiscount.toLocaleString()}</td>
                        </tr>
                      )}
                      {h.tax > 0 && (
                        <tr>
                          <td colSpan={3} className="text-muted-foreground">VAT (13%)</td>
                          <td className="text-muted-foreground">NPR {h.tax.toLocaleString()}</td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan={3} className="font-black text-foreground pt-1">Grand Total</td>
                        <td className="font-black text-foreground pt-1">NPR {(h.total || 0).toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                  <button
                    onClick={() => handleDownload(h.id)}
                    disabled={pdfLoading === h.id}
                    className="btn-secondary text-xs disabled:opacity-50 cursor-pointer"
                  >
                    {pdfLoading === h.id
                      ? <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      : <Download size={12} />
                    }
                    {pdfLoading === h.id ? 'Generating…' : 'Download Invoice'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
