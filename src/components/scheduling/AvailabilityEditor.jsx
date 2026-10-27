import React, { useState } from 'react';
import { Plus, Trash2, Clock, Check, Save } from 'lucide-react';
import Button from '../common/Button.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { COMMON_TIMEZONES } from '../../utils/timezone.js';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function AvailabilityEditor({ initialAvailability, bufferMinutes = 15, onSave }) {
  const { showToast } = useToast();
  const [weekly, setWeekly] = useState(initialAvailability?.weekly || {
    monday: [{ start: '10:00', end: '13:00' }, { start: '15:00', end: '19:00' }],
    tuesday: [{ start: '10:00', end: '13:00' }, { start: '15:00', end: '19:00' }],
    wednesday: [{ start: '10:00', end: '13:00' }, { start: '15:00', end: '19:00' }],
    thursday: [{ start: '10:00', end: '13:00' }, { start: '15:00', end: '19:00' }],
    friday: [{ start: '10:00', end: '13:00' }, { start: '14:00', end: '18:00' }],
    saturday: [{ start: '10:00', end: '15:00' }],
    sunday: []
  });

  const [buffer, setBuffer] = useState(bufferMinutes);
  const [saving, setSaving] = useState(false);

  const handleToggleDay = (day) => {
    setWeekly(prev => {
      const current = prev[day] || [];
      if (current.length > 0) {
        return { ...prev, [day]: [] };
      }
      return { ...prev, [day]: [{ start: '10:00', end: '18:00' }] };
    });
  };

  const handleAddRange = (day) => {
    setWeekly(prev => ({
      ...prev,
      [day]: [...(prev[day] || []), { start: '14:00', end: '18:00' }]
    }));
  };

  const handleRemoveRange = (day, idx) => {
    setWeekly(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== idx)
    }));
  };

  const handleRangeChange = (day, idx, field, value) => {
    setWeekly(prev => {
      const updated = [...(prev[day] || [])];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, [day]: updated };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (onSave) {
        await onSave({ weekly, bufferMinutes: buffer });
      }
      showToast('Weekly practice hours and buffers updated!', 'success');
    } catch (e) {
      showToast('Failed to save availability: ' + e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Recurring Weekly Working Hours</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Set recurring windows when clients can book therapy consultations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium text-slate-600">Buffer time:</span>
            <select
              value={buffer}
              onChange={(e) => setBuffer(Number(e.target.value))}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value={5}>5 mins</option>
              <option value={10}>10 mins</option>
              <option value={15}>15 mins</option>
              <option value={20}>20 mins</option>
              <option value={30}>30 mins</option>
            </select>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={Save}
            loading={saving}
            onClick={handleSave}
            className="text-xs"
          >
            Save Hours
          </Button>
        </div>
      </div>

      {/* Weekdays editor */}
      <div className="divide-y divide-slate-100">
        {DAYS.map((day) => {
          const ranges = weekly[day] || [];
          const isEnabled = ranges.length > 0;

          return (
            <div key={day} className="py-3.5 flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="w-36 flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id={`day_${day}`}
                  checked={isEnabled}
                  onChange={() => handleToggleDay(day)}
                  className="w-4 h-4 rounded text-teal-700 focus:ring-teal-700 cursor-pointer"
                />
                <label
                  htmlFor={`day_${day}`}
                  className={`text-xs font-semibold capitalize cursor-pointer select-none ${
                    isEnabled ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {day}
                </label>
              </div>

              <div className="flex-1 space-y-2">
                {!isEnabled ? (
                  <span className="text-xs text-slate-400 italic">Unavailable / Day Off</span>
                ) : (
                  ranges.map((range, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <input
                        type="time"
                        value={range.start}
                        onChange={(e) => handleRangeChange(day, idx, 'start', e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-medium focus:ring-1 focus:ring-teal-700"
                      />
                      <span className="text-slate-400 font-medium">to</span>
                      <input
                        type="time"
                        value={range.end}
                        onChange={(e) => handleRangeChange(day, idx, 'end', e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-medium focus:ring-1 focus:ring-teal-700"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveRange(day, idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                        aria-label="Remove range"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {isEnabled && (
                <div className="w-24 shrink-0 text-right">
                  <button
                    type="button"
                    onClick={() => handleAddRange(day)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-700 hover:text-teal-900 bg-teal-50 px-2 py-1 rounded-lg"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add split</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
