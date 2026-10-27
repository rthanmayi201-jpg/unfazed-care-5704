import React from 'react';

export function Loader({ text = 'Loading data...', size = 'md' }) {
  const spinnerSizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-7 h-7 border-3',
    lg: 'w-10 h-10 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
      <div 
        className={`${spinnerSizes[size] || spinnerSizes.md} border-teal-200 border-t-teal-700 rounded-full animate-spin`} 
      />
      {text && <p className="text-xs font-medium tracking-wide text-slate-500">{text}</p>}
    </div>
  );
}

export function SkeletonRow({ cols = 4, className = 'h-10' }) {
  return (
    <div className={`grid grid-cols-${cols} gap-4 w-full animate-pulse bg-slate-100 rounded-lg ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-200/80 animate-pulse space-y-4">
      <div className="h-4 bg-slate-200 rounded w-1/3" />
      <div className="h-8 bg-slate-100 rounded w-1/2" />
      <div className="h-3 bg-slate-100 rounded w-3/4" />
    </div>
  );
}

export default Loader;
