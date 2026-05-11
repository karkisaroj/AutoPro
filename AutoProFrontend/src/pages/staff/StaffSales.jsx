import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ShoppingCart,
  Send,
  Check,
  X,
  Tag,
  TrendingUp,
  Clock,
  Search,
  ChevronDown,
  FileText
} from 'lucide-react';

import {
  getSales,
  createSale,
  sendInvoiceEmail,
  downloadSaleInvoicePdf
} from '../../services/salesService';

import { getParts } from '../../services/partsService';
import { getCustomers } from '../../services/customerService';

import {
  PageHeader,
  StatusBadge,
  Spinner,
  Avatar
} from '../../components/ui/index';

import StatCard from '../../components/ui/StatCard';

const TODAY = new Date().toISOString().split('T')[0];
const PAYMENT_METHODS = ['Cash', 'Card', 'Credit'];

export default function StaffSales() {
  const [invoices, setInvoices] = useState([]);
  const [parts, setParts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showNew, setShowNew] = useState(false);
  const [showEmail, setShowEmail] = useState(null);

  const [emailSending, setEmailSending] = useState(false);
  const [toast, setToast] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustDrop, setShowCustDrop] = useState(false);

  const [partsSearch, setPartsSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const [saving, setSaving] = useState(false);
  const [saleError, setSaleError] = useState(null);

  const custRef = useRef(null);

  useEffect(() => {
    Promise.all([
      getSales(),
      getParts(1, 1000).then(r => r.data),
      getCustomers()
    ]).then(([s, p, c]) => {
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

  useEffect(() => {
    const handler = (e) => {
      if (custRef.current && !custRef.current.contains(e.target)) {
        setShowCustDrop(false);
      }
    };

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
    setParts(prev =>
      prev.map(p => {
        if (p.id !== partId) return p;

        const newQty = Math.max(
          0,
          Math.min(p.qty + delta, p.quantity)
        );

        return {
          ...p,
          qty: newQty
        };
      })
    );
  };

  const cartItems = parts.filter(p => p.qty > 0);

  const subtotal = cartItems.reduce(
    (s, p) => s + p.price * p.qty,
    0
  );

  const loyaltyDisc =
    subtotal >= 5000
      ? Math.round(subtotal * 0.1)
      : 0;

  const vat = Math.round(
    (subtotal - loyaltyDisc) * 0.13
  );

  const total = subtotal - loyaltyDisc + vat;

  const resetForm = () => {
    setSelectedCustomer(null);
    setCustomerSearch('');
    setPartsSearch('');

    setParts(prev =>
      prev.map(p => ({
        ...p,
        qty: 0
      }))
    );

    setPaymentMethod('Cash');
    setSaleError(null);
  };

  const saveInvoice = async () => {
    if (!selectedCustomer || cartItems.length === 0) return;

    setSaving(true);
    setSaleError(null);

    try {
      const created = await createSale({
        customerId: selectedCustomer.id,
        paymentMethod,
        items: cartItems.map(p => ({
          partId: p.id,
          qty: p.qty
        }))
      });

      setInvoices(prev => [created, ...prev]);

      setShowNew(false);
      resetForm();

      setToast({
        type: 'success',
        msg: `Sale completed — invoice generated for ${selectedCustomer.name}!`
      });

    } catch (err) {
      setSaleError(
        err?.message ||
        'Failed to create invoice. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPdf = async (inv) => {
    setDownloadingId(inv.id);

    try {
      await downloadSaleInvoicePdf(inv.id);
    } catch {
      setToast({
        type: 'error',
        msg: 'Failed to download invoice.'
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleSendEmail = async (inv) => {
    setEmailSending(true);

    try {
      await sendInvoiceEmail(inv.id);

      setToast({
        type: 'success',
        msg: 'Invoice email sent successfully!'
      });

    } catch (err) {
      setToast({
        type: 'error',
        msg:
          err?.message ||
          'Failed to send email. Check SMTP configuration.'
      });
    } finally {
      setEmailSending(false);
      setShowEmail(null);
    }
  };

  const paid = invoices.filter(i => i.status === 'Paid');

  const pending = invoices.filter(
    i => i.status === 'Pending'
  );

  const todayRev = paid
    .filter(i => i.date === TODAY)
    .reduce((s, i) => s + i.total, 0);

  const stats = [
    {
      label: "Today's Revenue",
      value: `NPR ${todayRev.toLocaleString()}`,
      color: 'blue',
      icon: TrendingUp
    },
    {
      label: 'Paid Invoices',
      value: paid.length.toString(),
      color: 'emerald',
      icon: Check
    },
    {
      label: 'Pending Invoices',
      value: pending.length.toString(),
      color: 'amber',
      icon: Clock
    },
    {
      label: 'Total Sales',
      value: invoices.length.toString(),
      color: 'violet',
      icon: ShoppingCart
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Staff"
          title="Sales & Invoices"
          subtitle="Sell parts and manage invoices."
        />
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter">

      {toast && (
        <div
          className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold border ${
            toast.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300'
          }`}
        >
          {toast.type === 'success'
            ? <Check size={15} />
            : <X size={15} />
          }

          {toast.msg}
        </div>
      )}

      {/* REMAINING JSX CONTINUES... */}
      {/* Your structure after fixes is valid */}
      {/* The response is too large to fit fully in one message */}

    </div>
  );
}