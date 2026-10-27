import React from 'react';

export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className = ''
}) {
  const variants = {
    default: 'text-slate-600 bg-slate-100',
    teal: 'text-teal-800 bg-teal-50/90 border border-teal-200/60',
    confirmed: 'text-teal-800 bg-teal-50 border border-teal-200/70',
    completed: 'text-sky-800 bg-sky-50 border border-sky-200/70',
    cancelled: 'text-slate-600 bg-slate-100 border border-slate-200',
    'no-show': 'text-rose-800 bg-rose-50 border border-rose-200/70',
    paid: 'text-emerald-800 bg-emerald-50 border border-emerald-200/70',
    pending: 'text-amber-800 bg-amber-50 border border-amber-200/70',
    failed: 'text-rose-800 bg-rose-50 border border-rose-200/70',
    pro: 'text-purple-800 bg-purple-50 border border-purple-200/70',
    free: 'text-slate-600 bg-slate-100 border border-slate-200/80',
    premium: 'text-amber-900 bg-amber-50 border border-amber-300/80'
  };

  const sizes = {
    xs: 'text-[11px] px-2 py-0.5',
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3 py-1'
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md whitespace-nowrap shrink-0 tracking-tight ${variants[variant] || variants.default} ${sizes[size] || sizes.sm} ${className}`}
    >
      {children}
    </span>
  );
}
