import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';

export default function MessageBubble({ message, isMe }) {
  const timeFormatted = message.createdAt 
    ? format(new Date(message.createdAt), 'h:mm a')
    : '';

  return (
    <div className={`flex flex-col mb-3 ${isMe ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[82%] sm:max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
          isMe
            ? 'bg-teal-700 text-white rounded-br-xs'
            : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>

      <div className={`flex items-center gap-1 mt-1 text-[10px] text-slate-400 font-mono ${isMe ? 'pr-1' : 'pl-1'}`}>
        <span>{timeFormatted}</span>
        {isMe && (
          <span className="ml-0.5">
            {message.status === 'read' ? (
              <CheckCheck className="w-3.5 h-3.5 text-teal-600 inline" />
            ) : message.status === 'delivered' ? (
              <CheckCheck className="w-3.5 h-3.5 text-slate-400 inline" />
            ) : (
              <Check className="w-3.5 h-3.5 text-slate-300 inline" />
            )}
          </span>
        )}
      </div>
    </div>
  );
}
