import React from 'react';
import { Globe } from 'lucide-react';
import { COMMON_TIMEZONES, getLocalTimezone } from '../../utils/timezone.js';

export default function TimezoneSelect({ value, onChange, className = '' }) {
  const currentTz = value || getLocalTimezone();

  return (
    <div className={`flex items-center gap-2 text-xs text-slate-600 bg-white p-2 rounded-xl border border-slate-200 ${className}`}>
      <Globe className="w-4 h-4 text-teal-700 shrink-0" />
      <span className="font-medium shrink-0">Your Timezone:</span>
      <select
        value={currentTz}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent font-medium text-slate-800 text-xs focus:outline-none cursor-pointer w-full"
      >
        {COMMON_TIMEZONES.map((tz) => (
          <option key={tz.value} value={tz.value}>
            {tz.label}
          </option>
        ))}
      </select>
    </div>
  );
}
