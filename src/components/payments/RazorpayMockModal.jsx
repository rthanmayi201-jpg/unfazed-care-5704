import React, { useState } from 'react';
import { CreditCard, Smartphone, Building2, CheckCircle2, AlertCircle, Shield, X } from 'lucide-react';
import Button from '../common/Button.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';

export default function RazorpayMockModal({
  isOpen,
  onClose,
  amount,
  description = 'Therapy Session Booking',
  clientEmail = '',
  clientPhone = '',
  onSuccess,
  onFailure
}) {
  const [activeTab, setActiveTab] = useState('upi'); // upi | card | netbanking
  const [upiId, setUpiId] = useState('aarav@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePaySuccess = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      const fakePaymentId = 'pay_rzp_mock_' + Date.now();
      onSuccess({
        razorpay_payment_id: fakePaymentId,
        razorpay_order_id: 'order_mock_' + Date.now(),
        razorpay_signature: 'sig_mock_' + Math.random().toString(36).substring(7)
      });
      onClose();
    }, 1200);
  };

  const handleSimulateFailure = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onFailure(new Error('Transaction declined: Insufficient funds or bank server timeout.'));
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        
        {/* Razorpay Brand Header */}
        <div className="bg-[#0C2340] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3395FF] flex items-center justify-center font-bold text-white text-base">
              R
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight">Razorpay Test Checkout</div>
              <div className="text-[11px] text-slate-300">Unfazed Private Practice Gate</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount bar */}
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">{description}</div>
          <div className="text-base font-bold text-slate-900 font-mono tabular-nums">
            {formatCurrency(amount, true)}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-5">
          <div className="flex border-b border-slate-200 mb-4">
            <button
              onClick={() => setActiveTab('upi')}
              className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'upi' ? 'border-[#3395FF] text-[#0C2340]' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>UPI / QR</span>
            </button>
            <button
              onClick={() => setActiveTab('card')}
              className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'card' ? 'border-[#3395FF] text-[#0C2340]' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setActiveTab('netbanking')}
              className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'netbanking' ? 'border-[#3395FF] text-[#0C2340]' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Netbanking</span>
            </button>
          </div>

          {activeTab === 'upi' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Enter UPI ID / VPA</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#3395FF]"
                />
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Simulating instant Indian UPI payment via GPay / PhonePe / Paytm</span>
              </div>
            </div>
          )}

          {activeTab === 'card' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Card Number (Test)</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expiry</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CVV</label>
                  <input
                    type="password"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'netbanking' && (
            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-slate-700">Select Bank</label>
              <select className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white">
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>State Bank of India</option>
                <option>Axis Bank</option>
                <option>Kotak Mahindra Bank</option>
              </select>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-6 space-y-2">
            <button
              type="button"
              disabled={processing}
              onClick={handlePaySuccess}
              className="w-full py-2.5 px-4 bg-[#3395FF] hover:bg-[#2080eb] text-white rounded-xl font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
            >
              {processing ? (
                <span>Simulating Bank Approval...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pay {formatCurrency(amount, true)}</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={processing}
              onClick={handleSimulateFailure}
              className="w-full py-2 px-3 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Simulate Payment Failure</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
