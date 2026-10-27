import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency.js';
import Button from '../common/Button.jsx';

export default function ServiceCard({ service, onSelect }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="font-bold text-base text-slate-900 group-hover:text-teal-900 transition-colors">
            {service.name}
          </h3>
          <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium whitespace-nowrap bg-slate-50 px-2 py-1 rounded-md border border-slate-200/60">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{service.duration} mins</span>
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
          {service.description || 'Structured 1-on-1 psychotherapy consultation.'}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div>
          <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Session Fee</div>
          <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
            {formatCurrency(service.priceINR)}
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onSelect(service)}
          className="text-xs font-semibold"
        >
          <span>Book Slot</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
