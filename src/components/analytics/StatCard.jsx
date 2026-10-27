import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subtext,
  change,
  isPositive = true,
  icon: Icon
}) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums tracking-tight">
          {value}
        </div>
        <div className="flex items-center gap-2 text-xs">
          {change && (
            <span className={`inline-flex items-center font-semibold ${isPositive ? 'text-teal-700' : 'text-rose-600'}`}>
              {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>{change}</span>
            </span>
          )}
          {subtext && <span className="text-slate-400">{subtext}</span>}
        </div>
      </div>
    </div>
  );
}
