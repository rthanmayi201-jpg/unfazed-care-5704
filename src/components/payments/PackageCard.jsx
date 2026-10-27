import React from 'react';
import { Package, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency.js';
import Button from '../common/Button.jsx';

export default function PackageCard({ pkg, onBuy, clientPackage = null }) {
  const isOwned = Boolean(clientPackage && clientPackage.remainingSessions > 0);

  return (
    <div className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between ${
      isOwned ? 'border-teal-400 ring-2 ring-teal-500/20' : 'border-slate-200/80 shadow-xs hover:border-teal-300'
    }`}>
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-xs">
              {pkg.sessionsCount}x
            </span>
            <h3 className="font-bold text-base text-slate-900">{pkg.title}</h3>
          </div>

          {pkg.discountPercent > 0 && (
            <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60 whitespace-nowrap">
              Save {pkg.discountPercent}%
            </span>
          )}
        </div>

        <p className="text-xs text-slate-500 mb-5 leading-relaxed">
          {pkg.description}
        </p>

        <div className="space-y-2 text-xs text-slate-600 bg-[#FAF8F5] p-3.5 rounded-2xl border border-slate-200/60 mb-5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Total Sessions:</span>
            <span className="font-semibold text-slate-800">{pkg.sessionsCount} Sessions</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Rate per session:</span>
            <span className="font-mono tabular-nums text-slate-800">{formatCurrency(pkg.perSessionRate)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Validity period:</span>
            <span className="text-slate-800 font-medium">{pkg.validityDays} Days</span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase font-semibold text-slate-400">Bundle Price</div>
          <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
            {formatCurrency(pkg.totalPriceINR)}
          </div>
        </div>

        {isOwned ? (
          <div className="text-right">
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200/70">
              {clientPackage.remainingSessions} left
            </span>
          </div>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onBuy(pkg)}
            className="text-xs font-semibold"
          >
            <span>Purchase Bundle</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
