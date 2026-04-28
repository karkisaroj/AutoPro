import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Download, Star, Search } from 'lucide-react';
import { PageHeader, StatusBadge } from '../../components/ui/index';

const HISTORY = [
  {
    id: 'INV-2026-031',
    date: '2026-03-10',
    service: 'Full Body Service',
    staff: 'Ramesh Karki',
    subtotal: 8500,
    discount: 850,
    total: 7650,
    status: 'Paid',
    items: [
      { desc: 'Engine Oil (4L)', qty: 1, unit: 2800, total: 2800 },
      { desc: 'Oil Filter',      qty: 1, unit: 500,  total: 500  },
      { desc: 'Air Filter',      qty: 1, unit: 800,  total: 800  },
      { desc: 'Labour Charge',   qty: 1, unit: 4400, total: 4400 },
    ],
    staffRating: 4,
  },
  {
    id: 'INV-2026-014',
    date: '2026-02-05',
    service: 'Brake Inspection',
    staff: 'Sita Rai',
    subtotal: 4200,
    discount: 0,
    total: 4200,
    status: 'Paid',
    items: [
      { desc: 'Brake Pads (front)',  qty: 2, unit: 1200, total: 2400 },
      { desc: 'Brake Fluid',        qty: 1, unit: 400,  total: 400  },
      { desc: 'Labour Charge',      qty: 1, unit: 1400, total: 1400 },
    ],
    staffRating: 5,
  },
  {
    id: 'INV-2025-098',
    date: '2025-12-18',
    service: 'Tyre Replacement',
    staff: 'Ramesh Karki',
    subtotal: 18000,
    discount: 1800,
    total: 16200,
    status: 'Paid',
    items: [
      { desc: 'Tyre (185/65 R15)', qty: 4, unit: 3800, total: 15200 },
      { desc: 'Balancing',         qty: 4, unit: 200,  total: 800   },
    ],
    staffRating: 3,
  },
];

function StarRating({ value }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={12} className={s <= value ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'} />
      ))}
    </div>
  );
}

export default function CustomerHistory() {
  const [expanded, setExpanded] = useState(null);
  const [query, setQuery]       = useState('');

  const filtered = HISTORY.filter(h =>
    h.service.toLowerCase().includes(query.toLowerCase()) ||
    h.id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <PageHeader eyebrow="Customer" title="Service History" subtitle="All your past services, invoices, and ratings." />
        <button className="btn-secondary">
          <Download size={14} /> Export PDF
        </button>
      </div>

      {/* Totals strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Spent',      value: `NPR ${HISTORY.reduce((s, h) => s + h.total, 0).toLocaleString()}` },
          { label: 'Services Count',   value: HISTORY.length                                                       },
          { label: 'Total Saved',      value: `NPR ${HISTORY.reduce((s, h) => s + h.discount, 0).toLocaleString()}` },
        ].map(s => (
          <div key={s.label} className="dash-card p-4 text-center">
            <p className="text-xs text-muted-foreground font-semibold">{s.label}</p>
            <p className="text-lg font-black text-foreground mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="search-bar">
        <Search size={14} className="text-muted-foreground" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          placeholder="Search by service name or invoice ID…"
        />
      </div>

      {/* Invoice List */}
      <div className="space-y-3">
        {filtered.map(h => {
          const open = expanded === h.id;
          return (
            <div key={h.id} className="dash-card overflow-hidden">
              <button
                className="w-full flex items-center gap-4 p-5 hover:bg-card-hover transition-colors text-left"
                onClick={() => setExpanded(open ? null : h.id)}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
                  <FileText size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-foreground">{h.service}</span>
                    <span className="text-xs text-muted-foreground font-mono">{h.id}</span>
                  </div>
                  <div className="flex gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                    <span>{h.date}</span>
                    <span>Staff: {h.staff}</span>
                    <StarRating value={h.staffRating} />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-black text-foreground">NPR {h.total.toLocaleString()}</p>
                  {h.discount > 0 && (
                    <p className="text-xs text-emerald-600 font-semibold">-NPR {h.discount.toLocaleString()}</p>
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
                      <tr>{['Item', 'Qty', 'Unit Price', 'Total'].map(h => <th key={h}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {h.items.map(it => (
                        <tr key={it.desc}>
                          <td>{it.desc}</td>
                          <td className="text-center">{it.qty}</td>
                          <td>NPR {it.unit.toLocaleString()}</td>
                          <td className="font-semibold text-foreground">NPR {it.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-border">
                        <td colSpan={3} className="font-semibold pt-2">Subtotal</td>
                        <td className="font-semibold pt-2">NPR {h.subtotal.toLocaleString()}</td>
                      </tr>
                      {h.discount > 0 && (
                        <tr>
                          <td colSpan={3} className="text-emerald-600 font-semibold">Loyalty Discount</td>
                          <td className="text-emerald-600 font-semibold">-NPR {h.discount.toLocaleString()}</td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan={3} className="font-black text-foreground pt-1">Grand Total</td>
                        <td className="font-black text-foreground pt-1">NPR {h.total.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                  <button className="btn-secondary text-xs">
                    <Download size={12} /> Download Invoice
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="dash-card p-10 text-center">
            <FileText size={32} className="mx-auto text-muted-foreground mb-2" />
            <p className="font-bold text-foreground">No records found</p>
          </div>
        )}
      </div>
    </div>
  );
}
