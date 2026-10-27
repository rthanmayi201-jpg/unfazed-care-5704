import React, { useState } from 'react';
import { Clock, Sun, Sunset, Moon, BellRing } from 'lucide-react';
import { formatInTz } from '../../utils/timezone.js';
import Button from '../common/Button.jsx';
import Modal from '../common/Modal.jsx';

export default function SlotPicker({
  slots = [],
  selectedSlot,
  onSelectSlot,
  therapistTz = 'Asia/Kolkata',
  clientTz = 'Asia/Kolkata',
  selectedDate,
  onWaitlistSubmitted
}) {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [wlName, setWlName] = useState('');
  const [wlEmail, setWlEmail] = useState('');
  const [wlPhone, setWlPhone] = useState('');
  const [wlSubmitted, setWlSubmitted] = useState(false);

  // Group slots into Morning, Afternoon, Evening based on client timezone
  const morning = [];
  const afternoon = [];
  const evening = [];

  slots.forEach((slot) => {
    const hour = parseInt(formatInTz(slot.start, 'H', clientTz), 10);
    const clientFormatted = formatInTz(slot.start, 'h:mm a', clientTz);
    const therapistFormatted = formatInTz(slot.start, 'h:mm a', therapistTz);
    
    const enriched = {
      ...slot,
      displayTime: clientFormatted,
      dualTime: therapistTz !== clientTz ? `${therapistFormatted} IST` : null
    };

    if (hour < 12) {
      morning.push(enriched);
    } else if (hour < 17) {
      afternoon.push(enriched);
    } else {
      evening.push(enriched);
    }
  });

  const handleWaitlistSubmit = (e) => {
    e.preventDefault();
    if (!wlName || !wlEmail) return;
    if (onWaitlistSubmitted) {
      onWaitlistSubmitted({ name: wlName, email: wlEmail, phone: wlPhone, date: selectedDate });
    }
    setWlSubmitted(true);
    setTimeout(() => {
      setWaitlistOpen(false);
      setWlSubmitted(false);
    }, 1800);
  };

  if (!slots.length) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 text-center">
        <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-3">
          <Clock className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800">No Open Slots on this Date</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          All appointments for this day are currently booked or the therapist is unavailable.
        </p>
        <div className="mt-4">
          <Button
            variant="secondary"
            size="sm"
            icon={BellRing}
            onClick={() => setWaitlistOpen(true)}
            className="text-xs"
          >
            Join Cancellation Waitlist
          </Button>
        </div>

        {/* Waitlist Modal */}
        <Modal
          isOpen={waitlistOpen}
          onClose={() => setWaitlistOpen(false)}
          title="Join Waitlist"
          subtitle={`Get automatically notified via WhatsApp & Email if a client reschedules or cancels.`}
        >
          {wlSubmitted ? (
            <div className="text-center py-6 text-teal-800 font-medium text-sm">
              ✓ You are on the waitlist! We will notify you immediately if a slot opens up.
            </div>
          ) : (
            <form onSubmit={handleWaitlistSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={wlName}
                  onChange={(e) => setWlName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={wlEmail}
                  onChange={(e) => setWlEmail(e.target.value)}
                  placeholder="priya@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">WhatsApp Phone Number</label>
                <input
                  type="tel"
                  value={wlPhone}
                  onChange={(e) => setWlPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700"
                />
              </div>
              <Button type="submit" variant="primary" size="md" className="w-full">
                Confirm Waitlist Request
              </Button>
            </form>
          )}
        </Modal>
      </div>
    );
  }

  const renderSlotGroup = (title, icon, group) => {
    if (!group.length) return null;
    return (
      <div className="mb-4 last:mb-0">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2">
          {icon}
          <span>{title}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {group.map((s) => {
            const isSelected = selectedSlot?.start === s.start;
            return (
              <button
                key={s.start}
                type="button"
                onClick={() => onSelectSlot(s)}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all text-center flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-teal-700 text-white border-teal-800 shadow-sm'
                    : 'bg-white hover:bg-teal-50/70 border-slate-200 text-slate-700'
                }`}
              >
                <span className="font-semibold text-sm tabular-nums">{s.displayTime}</span>
                {s.dualTime && (
                  <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                    {s.dualTime}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
        <div className="text-xs font-semibold text-slate-800">
          Available Consultation Slots
        </div>
        {therapistTz !== clientTz && (
          <span className="text-[11px] text-teal-800 font-medium">
            Times converted to your local time
          </span>
        )}
      </div>

      {renderSlotGroup('Morning', <Sun className="w-3.5 h-3.5 text-amber-500" />, morning)}
      {renderSlotGroup('Afternoon', <Sunset className="w-3.5 h-3.5 text-orange-500" />, afternoon)}
      {renderSlotGroup('Evening', <Moon className="w-3.5 h-3.5 text-indigo-500" />, evening)}
    </div>
  );
}
