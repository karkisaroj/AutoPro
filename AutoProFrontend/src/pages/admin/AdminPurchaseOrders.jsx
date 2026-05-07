import React, { useState, useEffect } from 'react';
import { ShoppingCart, FileText, Download, CheckCircle, Clock, Package, TrendingUp } from 'lucide-react';
import { getPurchaseOrders, updatePurchaseOrderStatus, downloadPurchaseOrderPdf } from '../../services/partsService';
import { PageHeader, Spinner, StatusBadge, EmptyState, TableSkeleton } from '../../components/ui/index';
import StatCard from '../../components/ui/StatCard';

const STATUS_TABS = ['All', 'Pending', 'Received'];

export default function AdminPurchaseOrders() {
  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState('All');
  const [receiving, setReceiving] = useState(null); // id being marked received
  const [pdfLoading, setPdfLoading] = useState(null); // id being downloaded

  useEffect(() => {
    getPurchaseOrders().then(data => { setOrders(data); setLoading(false); });
  }, []);

  const filtered = tab === 'All' ? orders : orders.filter(o => o.status === tab);

  const pending    = orders.filter(o => o.status === 'Pending');
  const received   = orders.filter(o => o.status === 'Received');
  const totalSpend = orders.filter(o => o.status === 'Received').reduce((s, o) => s + o.total, 0);

  const handleMarkReceived = async (id) => {
    setReceiving(id);
    try {
      await updatePurchaseOrderStatus(id, 'Received');
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Received' } : o));
    } finally {
      setReceiving(null);
    }
  };

  const handleDownloadPdf = async (id) => {
    setPdfLoading(id);
    try {
      await downloadPurchaseOrderPdf(id);
    } finally {
      setPdfLoading(null);
    }
  };

  if (loading) return (
    <div className="space-y-6">
      <PageHeader eyebrow="Procurement" title="Purchase Orders" subtitle="Loading purchase orders…" />
      <Spinner />
    </div>
  );

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        eyebrow="Procurement"
        title="Purchase Orders"
        subtitle="Track vendor invoices, manage deliveries, and update stock."
        actions={
          <div className="flex rounded-xl border border-border overflow-hidden">
            {STATUS_TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  tab === t
                    ? 'bg-primary text-white'
                    : 'bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                {t}
                {t === 'Pending'  && pending.length  > 0 && (
                  <span className="ml-1.5 bg-amber-500 text-white text-[9px] font-black rounded-full px-1.5 py-0.5">{pending.length}</span>
                )}
              </button>
            ))}
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Orders"    value={orders.length.toString()}    color="violet"  icon={ShoppingCart} />
        <StatCard label="Pending"         value={pending.length.toString()}   color="amber"   icon={Clock}        />
        <StatCard label="Received"        value={received.length.toString()}  color="emerald" icon={CheckCircle}  />
        <StatCard label="Total Spend"     value={`NPR ${(totalSpend / 1000).toFixed(0)}K`} color="blue" icon={TrendingUp} />
      </div>

      {/* Pending notice */}
      {pending.length > 0 && tab !== 'Received' && (
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4">
          <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
            <Clock size={15} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-amber-700 dark:text-amber-400 text-sm">
              {pending.length} order{pending.length !== 1 ? 's' : ''} awaiting delivery
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-300 mt-0.5">
              Click <span className="font-semibold">Mark as Received</span> once goods arrive — this will automatically update part stock levels.
            </p>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="dash-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-display font-bold text-foreground">
            {tab === 'All' ? 'All Purchase Orders' : `${tab} Orders`}
            <span className="ml-2 text-sm font-normal text-muted-foreground">({filtered.length})</span>
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                {['PO #', 'Vendor', 'Date', 'Items', 'Total', 'Status', 'Actions'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? <TableSkeleton cols={7} rows={5} /> : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={ShoppingCart}
                      title={tab === 'All' ? 'No purchase orders yet' : `No ${tab.toLowerCase()} orders`}
                      description={tab === 'All'
                        ? 'Go to Parts & Stock and click "Generate PO" on any part to create one.'
                        : `There are no ${tab.toLowerCase()} orders at this time.`}
                    />
                  </td>
                </tr>
              ) : filtered.map(o => (
                <tr key={o.id}>
                  <td>
                    <p className="font-black text-foreground text-sm">PO #{o.id}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{o.date}</p>
                  </td>
                  <td>
                    <p className="font-semibold text-foreground text-sm">{o.vendor}</p>
                  </td>
                  <td className="text-xs text-muted-foreground">{o.date}</td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <Package size={12} className="text-muted-foreground" />
                      <span className="text-sm font-semibold text-foreground">{o.items}</span>
                      <span className="text-xs text-muted-foreground">item{o.items !== 1 ? 's' : ''}</span>
                    </div>
                  </td>
                  <td>
                    <span className="font-black text-foreground">NPR {Number(o.total).toLocaleString()}</span>
                  </td>
                  <td>
                    <StatusBadge status={o.status === 'Pending' ? 'Pending' : 'Received'} />
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      {o.status === 'Pending' && (
                        <button
                          onClick={() => handleMarkReceived(o.id)}
                          disabled={receiving === o.id}
                          className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-white bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-600 dark:hover:bg-emerald-600 rounded-lg px-2.5 py-1.5 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {receiving === o.id
                            ? <span className="w-3 h-3 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
                            : <CheckCircle size={12} />
                          }
                          {receiving === o.id ? 'Saving…' : 'Mark Received'}
                        </button>
                      )}
                      <button
                        onClick={() => handleDownloadPdf(o.id)}
                        disabled={pdfLoading === o.id}
                        className="flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-white bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-600 dark:hover:bg-violet-600 rounded-lg px-2.5 py-1.5 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        title="Download Invoice PDF"
                      >
                        {pdfLoading === o.id
                          ? <span className="w-3 h-3 border-2 border-violet-600/30 border-t-violet-600 rounded-full animate-spin" />
                          : <Download size={12} />
                        }
                        Invoice
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
