import React from 'react';

export default function SpecializationChips({ specializations = [] }) {
  if (!specializations.length) return null;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
      <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-4">Areas of Focus & Clinical Expertise</h2>
      <div className="flex flex-wrap gap-2">
        {specializations.map((item, index) => (
          <span
            key={index}
            className="text-xs sm:text-sm font-medium text-slate-700 bg-slate-50 hover:bg-teal-50 hover:text-teal-900 border border-slate-200/80 rounded-xl px-3.5 py-1.5 transition-colors"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
