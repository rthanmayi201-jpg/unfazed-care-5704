import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Receipt, Search, ArrowUpDown, FileText, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { paymentApi, therapistApi } from '../../api/index.js';
import InvoiceView from '../../components/payments/InvoiceView.jsx';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { format } from 'date-fns';
import { useToast } from '../../context/ToastContext.jsx';

export default function Billing() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [therapist, setTherapist] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const loadBillingData = async () => {
    try {
      const [payData, tData] = await Promise.all([
        paymentApi.getPayments(user?.id || 'therapist_sharma'),
        therapistApi.getProfile(user?.id || 'therapist_sharma')
      ]);
      setPayments(payData || []);
      setTherapist(tData);

      const invoiceQuery = searchParams.get('invoice');
      if (invoiceQuery) {
        const found = payData.find(p => p.id === invoiceQuery || p.invoiceNumber === invoiceQuery);
        if (found) setSelectedInvoice(found);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBillingData();
  }, [user]);

  // Export CSV Handler
  const handleExportCSV = () => {
    if (!payments.length) return;
    const headers = ['Invoice Number', 'Client Name', 'Date', 'Transaction ID', 'Method', 'Subtotal (INR)', 'GST 18% (INR)', 'Platform Fee (INR)', 'Net Payout (INR)', 'Status'];
    const rows = payments.map(p => [
      p.invoiceNumber,
      `"${p.clientName}"`,
      format(new Date(p.createdAt), 'yyyy-MM-dd'),
      p.gatewayTransactionId,
      p.paymentMethod,
      p.subtotal,
      p.gstAmount,
      p.platformFee,
      p.netPayout,
      p.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `unfazed_billing_ledger_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Billing ledger exported to CSV!', 'success');
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch = p.clientName.toLowerCase().includes(search.toLowerCase()) || p.invoiceNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <Loader text="Loading billing ledgers and GST statements..." />;
  }

  if (selectedInvoice) {
    return (
      <InvoiceView
        payment={selectedInvoice}
        therapist={therapist}
        onBack={() => setSelectedInvoice(null)}
      />
    );
  }

  const totalCollected = payments.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.subtotal, 0);
  const totalGST = payments.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.gstAmount, 0);
  const totalNet = payments.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.netPayout, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Billing & GST Invoices</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Reconcile consultations, tax distributions (CGST + SGST), Razorpay gateway payouts, and tax receipts.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={Download}
          onClick={handleExportCSV}
          className="text-xs font-semibold"
        >
          Export CSV Ledger
        </Button>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Gross Billed Revenue</div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-1">{formatCurrency(totalCollected)}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">GST Collected (18% SAC 999312)</div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-1">{formatCurrency(totalGST)}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider">Net Payout to Bank</div>
          <div className="text-xl font-bold text-teal-900 font-mono tabular-nums mt-1">{formatCurrency(totalNet)}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client or invoice number..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700 outline-none"
          />
        </div>

        <div className="flex items-center p-1 bg-slate-100 rounded-xl">
          {['all', 'paid', 'refunded', 'pending'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 font-semibold rounded-lg capitalize transition-colors ${
                statusFilter === st ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-slate-200 text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Gateway Txn</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-right">GST (18%)</th>
                <th className="py-3 px-4 text-right">Platform Fee</th>
                <th className="py-3 px-4 text-right">Net Payout</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-teal-900">{p.invoiceNumber}</td>
                  <td className="py-3 px-4 text-slate-900 font-semibold">{p.clientName}</td>
                  <td className="py-3 px-4 text-slate-500">{format(new Date(p.createdAt), 'dd MMM yyyy')}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{p.gatewayTransactionId}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">{formatCurrency(p.subtotal)}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">{formatCurrency(p.gstAmount)}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-400">{formatCurrency(p.platformFee)}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900">{formatCurrency(p.netPayout)}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={p.status}>{p.status.toUpperCase()}</Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedInvoice(p)}
                      className="text-xs text-teal-800 hover:text-teal-900 hover:underline font-semibold"
                    >
                      Tax Invoice
                    </button>
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
