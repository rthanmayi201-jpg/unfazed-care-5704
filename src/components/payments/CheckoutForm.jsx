import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Sparkles, Tag } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { GST_RATE, PLATFORM_FEE_PERCENT } from '../../utils/constants.js';
import Button from '../common/Button.jsx';
import RazorpayMockModal from './RazorpayMockModal.jsx';

export default function CheckoutForm({
  itemTitle = 'Individual Therapy Consultation',
  duration = 60,
  subtotal = 2500,
  clientPackage = null,
  onPaymentComplete,
  onPackageRedeem
}) {
  const [usePackage, setUsePackage] = useState(false);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [webhookPending, setWebhookPending] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success' | 'failed' | null
  const [errorMsg, setErrorMsg] = useState('');

  const gstAmount = Math.round(subtotal * GST_RATE);
  const totalAmount = usePackage ? 0 : subtotal + gstAmount;

  const handleStartCheckout = () => {
    if (usePackage) {
      if (onPackageRedeem) {
        onPackageRedeem();
      }
      return;
    }

    // Open Razorpay Mock checkout
    setIsRazorpayModalOpen(true);
  };

  const handlePaymentSuccess = (paymentDetails) => {
    setWebhookPending(true);

    // Simulate webhook confirmation delay (1.5 seconds)
    setTimeout(() => {
      setWebhookPending(false);
      setPaymentStatus('success');
      if (onPaymentComplete) {
        onPaymentComplete(paymentDetails);
      }
    }, 1500);
  };

  const handlePaymentFailure = (error) => {
    setErrorMsg(error.message || 'Payment was unsuccessful');
    setPaymentStatus('failed');
  };

  if (webhookPending) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center mx-auto text-teal-800 animate-pulse">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Verifying Bank Settlement Webhook</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          Receiving cryptographic confirmation from Razorpay webhook listener... Your session slot is held.
        </p>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="bg-white rounded-3xl p-8 border border-teal-200 shadow-xs text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Payment & Session Confirmed!</h3>
        <p className="text-xs text-slate-600 max-w-sm mx-auto">
          Receipt and appointment link dispatched to your WhatsApp and email.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
      <div>
        <h2 className="text-base font-bold text-slate-900 tracking-tight">Order Summary & Payment</h2>
        <p className="text-xs text-slate-500 mt-0.5">Secure clinical checkout with Indian GST compliance.</p>
      </div>

      {/* Package redemption banner if client holds an active package */}
      {clientPackage && clientPackage.remainingSessions > 0 && (
        <div className="p-4 bg-teal-50/80 rounded-2xl border border-teal-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-700" />
              <span>You have an active {clientPackage.title}</span>
            </span>
            <span className="text-[11px] bg-teal-700 text-white font-semibold px-2 py-0.5 rounded-full">
              {clientPackage.remainingSessions} sessions left
            </span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs font-medium text-teal-900">
            <input
              type="checkbox"
              checked={usePackage}
              onChange={(e) => setUsePackage(e.target.checked)}
              className="w-4 h-4 rounded text-teal-700 focus:ring-teal-700"
            />
            <span>Redeem 1 session from this package (₹0 due today)</span>
          </label>
        </div>
      )}

      {/* Line Item Breakdown */}
      <div className="space-y-3 text-xs border-y border-slate-100 py-4">
        <div className="flex items-center justify-between text-slate-700">
          <span>{itemTitle} ({duration} mins)</span>
          <span className="font-semibold font-mono tabular-nums">{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex items-center justify-between text-slate-500">
          <span>Applicable GST (18% SAC 999312)</span>
          <span className="font-mono tabular-nums">{usePackage ? '₹0' : formatCurrency(gstAmount)}</span>
        </div>

        {usePackage && (
          <div className="flex items-center justify-between text-teal-800 font-medium">
            <span>Package Credit Applied</span>
            <span className="font-mono tabular-nums">-{formatCurrency(subtotal + gstAmount)}</span>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-slate-900">
          <span>Total Amount Payable</span>
          <span className="text-base text-teal-900 font-mono tabular-nums">
            {formatCurrency(totalAmount, true)}
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="space-y-3">
        <Button
          variant="primary"
          size="md"
          onClick={handleStartCheckout}
          className="w-full text-xs font-bold"
        >
          {usePackage ? 'Confirm Booking via Package Credit' : `Pay & Confirm Appointment (${formatCurrency(totalAmount, true)})`}
        </Button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
          <span>Processed securely with 256-bit bank grade encryption.</span>
        </div>
      </div>

      {/* Razorpay Mock Modal */}
      <RazorpayMockModal
        isOpen={isRazorpayModalOpen}
        onClose={() => setIsRazorpayModalOpen(false)}
        amount={totalAmount}
        description={itemTitle}
        onSuccess={handlePaymentSuccess}
        onFailure={handlePaymentFailure}
      />
    </div>
  );
}
