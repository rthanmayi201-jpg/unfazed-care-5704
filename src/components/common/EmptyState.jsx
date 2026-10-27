import React from 'react';
import Button from './Button.jsx';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-2xl border border-slate-200/80 max-w-lg mx-auto ${className}`}>
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mb-4 shadow-xs">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-800 tracking-tight">{title}</h3>
      {description && (
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <div className="mt-5">
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
}
