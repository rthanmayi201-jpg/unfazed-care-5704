import React from 'react';
import { Printer, Download, ArrowLeft, ShieldCheck } from 'lucide-react';
import { formatCurrency, numberToWordsINR } from '../../utils/formatCurrency.js';
import { format } from 'date-fns';
import Button from '../common/Button.jsx';

export default function InvoiceView({
  payment,
  therapist = {
    name: 'Dr. Neha Sharma',
    qualifications: 'M.Phil Clinical Psychology (RCI)',
    location: 'Bengaluru, Karnataka - 560038',
    gstin: '29AAACH7409R1ZZ'
  },
  onBack
}) {
  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = format(new Date(payment.createdAt || Date.now()), 'dd MMMM yyyy');

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Top action toolbar (hidden on print) */}
      <div className="no-print flex items-center justify-between">
        {onBack && (
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={onBack}>
            Back to Billing
          </Button>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="primary" size="sm" icon={Printer} onClick={handlePrint}>
            Print / Save PDF
          </Button>
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div
        id="printable-invoice"
        className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm text-slate-800 space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="text-2xl font-bold tracking-tight text-teal-900">TAX INVOICE</div>
            <div className="text-xs text-slate-500 mt-1">Under Section 31 of CGST Act, 2017</div>
            <div className="text-xs font-mono font-semibold text-slate-700 mt-2">
              Invoice No: {payment.invoiceNumber || 'INV-2026-1049'}
            </div>
            <div className="text-xs text-slate-500">Date of Issue: {formattedDate}</div>
          </div>

          <div className="text-left sm:text-right text-xs space-y-1 text-slate-600">
            <div className="font-bold text-slate-900 text-sm">{therapist.name}</div>
            <div>{therapist.qualifications}</div>
            <div>{therapist.location}</div>
            <div>GSTIN: <strong className="text-slate-800 font-mono">{therapist.gstin || '29AAACH7409R1ZZ'}</strong></div>
            <div>State Code: 29 (Karnataka)</div>
          </div>
        </div>

        {/* Bill to */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-slate-200/70 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Billed To (Client)</div>
            <div className="font-bold text-slate-900 text-sm">{payment.clientName || 'Aarav Mehta'}</div>
            <div className="text-slate-500">Service Recipient ID: #{payment.clientId || 'CL-901'}</div>
            <div className="text-slate-500">Place of Supply: Intra-state / Telehealth</div>
          </div>

          <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-slate-200/70 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Payment Metadata</div>
            <div>Transaction Ref: <span className="font-mono">{payment.gatewayTransactionId || 'pay_rzp_demo'}</span></div>
            <div>Payment Gateway: Razorpay India</div>
            <div>Payment Mode: {payment.paymentMethod || 'UPI / Netbanking'}</div>
            <div>Status: <span className="text-emerald-700 font-bold uppercase">{payment.status || 'PAID'}</span></div>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Description of Services</th>
                <th className="py-2.5 px-3 text-center">HSN/SAC</th>
                <th className="py-2.5 px-3 text-right">Taxable Value</th>
                <th className="py-2.5 px-3 text-right">CGST (9%)</th>
                <th className="py-2.5 px-3 text-right">SGST (9%)</th>
                <th className="py-2.5 px-3 text-right">Total (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="py-4 px-3 text-slate-800">
                  <div className="font-semibold text-slate-900">Psychotherapy & Mental Health Consultation</div>
                  <div className="text-[11px] text-slate-500">Professional clinical session via secure teleconsult</div>
                </td>
                <td className="py-4 px-3 text-center font-mono text-slate-600">999312</td>
                <td className="py-4 px-3 text-right font-mono tabular-nums">{formatCurrency(payment.subtotal)}</td>
                <td className="py-4 px-3 text-right font-mono tabular-nums">{formatCurrency(payment.cgst || payment.gstAmount / 2)}</td>
                <td className="py-4 px-3 text-right font-mono tabular-nums">{formatCurrency(payment.sgst || payment.gstAmount / 2)}</td>
                <td className="py-4 px-3 text-right font-bold text-slate-900 font-mono tabular-nums">{formatCurrency(payment.totalAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-slate-200">
          <div className="text-xs space-y-1 max-w-sm">
            <div className="font-semibold text-slate-700">Amount in Words:</div>
            <div className="italic text-slate-600 font-medium leading-relaxed">
              {numberToWordsINR(payment.totalAmount)}
            </div>
          </div>

          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Taxable Value:</span>
              <span className="font-mono tabular-nums">{formatCurrency(payment.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total GST (18%):</span>
              <span className="font-mono tabular-nums">{formatCurrency(payment.gstAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Invoice Amount:</span>
              <span className="font-mono tabular-nums">{formatCurrency(payment.totalAmount, true)}</span>
            </div>
          </div>
        </div>

        {/* Footer declaration */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <span>Computer-generated official invoice. Unfazed Health SaaS.</span>
          </div>
          <div>Authorized Signatory for {therapist.name}</div>
        </div>
      </div>
    </div>
  );
}
