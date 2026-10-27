import React from 'react';

export default function TypingIndicator({ senderName = 'Therapist' }) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 pl-2">
      <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
        <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce" />
      </div>
      <span className="text-[11px] italic">{senderName} is typing...</span>
    </div>
  );
}
