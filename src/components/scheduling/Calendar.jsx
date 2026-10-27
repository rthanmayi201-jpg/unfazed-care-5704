import React, { useState } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Video, CheckCircle2, UserX, XCircle, FileEdit, Clock, Calendar as CalIcon, User } from 'lucide-react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import Badge from '../common/Badge.jsx';
import { SESSION_STATUS } from '../../utils/constants.js';

const locales = {
  'en-US': enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales
});

export default function TherapistCalendar({
  sessions = [],
  onUpdateStatus,
  onWriteNote
}) {
  const [selectedSession, setSelectedSession] = useState(null);

  // Convert sessions to RBC events format
  const events = sessions.map((s) => ({
    id: s.id,
    title: `${s.clientName} - ${s.serviceName || 'Session'}`,
    start: new Date(s.startTime),
    end: new Date(s.endTime),
    resource: s
  }));

  const eventPropGetter = (event) => {
    const status = event.resource.status;
    let className = 'status-confirmed';
    if (status === SESSION_STATUS.COMPLETED) className = 'status-completed';
    if (status === SESSION_STATUS.CANCELLED) className = 'status-cancelled';
    if (status === SESSION_STATUS.NO_SHOW) className = 'status-no-show';

    return {
      className: `${className} cursor-pointer text-xs`
    };
  };

  const handleSelectEvent = (event) => {
    setSelectedSession(event.resource);
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Therapy Appointments & Blocks</h2>
          <p className="text-xs text-slate-500">Click any session block to review details or update attendance status.</p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-700" /> Confirmed
          </span>
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600" /> Completed
          </span>
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" /> No-Show
          </span>
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Cancelled
          </span>
        </div>
      </div>

      <div className="h-[650px]">
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView="week"
          views={['month', 'week', 'day']}
          step={30}
          timeslots={2}
          eventPropGetter={eventPropGetter}
          onSelectEvent={handleSelectEvent}
          className="rounded-2xl"
        />
      </div>

      {/* Session Details Modal */}
      {selectedSession && (
        <Modal
          isOpen={Boolean(selectedSession)}
          onClose={() => setSelectedSession(null)}
          title="Session Details"
          subtitle={`Appointment ID: #${selectedSession.id}`}
        >
          <div className="space-y-5 text-xs sm:text-sm">
            <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-slate-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-800" />
                  <span className="font-bold text-slate-900 text-sm">{selectedSession.clientName}</span>
                </div>
                <Badge variant={selectedSession.status} size="sm">
                  {selectedSession.status.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-200/60">
                <div className="flex items-center gap-1.5">
                  <CalIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>{format(new Date(selectedSession.startTime), 'EEEE, dd MMM yyyy')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono tabular-nums">
                    {format(new Date(selectedSession.startTime), 'h:mm a')} - {format(new Date(selectedSession.endTime), 'h:mm a')}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-500">
                Service: <strong className="text-slate-700">{selectedSession.serviceName}</strong> ({selectedSession.duration} mins)
              </div>
            </div>

            {/* Google Meet Link */}
            {selectedSession.meetLink && selectedSession.status !== SESSION_STATUS.CANCELLED && (
              <a
                href={selectedSession.meetLink}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 p-3 bg-teal-50 hover:bg-teal-100 text-teal-900 font-semibold rounded-xl border border-teal-200 transition-colors"
              >
                <Video className="w-4 h-4 text-teal-700" />
                <span>Join Secure Video Consultation (Google Meet)</span>
              </a>
            )}

            {/* Quick Actions */}
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Update Appointment Status
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateStatus(selectedSession.id, SESSION_STATUS.COMPLETED);
                    setSelectedSession(prev => ({ ...prev, status: SESSION_STATUS.COMPLETED }));
                  }}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-sky-200 bg-sky-50/60 hover:bg-sky-100 text-sky-800 transition-colors text-xs font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 mb-1 text-sky-700" />
                  <span>Completed</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onUpdateStatus(selectedSession.id, SESSION_STATUS.NO_SHOW);
                    setSelectedSession(prev => ({ ...prev, status: SESSION_STATUS.NO_SHOW }));
                  }}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-800 transition-colors text-xs font-medium"
                >
                  <UserX className="w-4 h-4 mb-1 text-rose-700" />
                  <span>No-Show</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onUpdateStatus(selectedSession.id, SESSION_STATUS.CANCELLED);
                    setSelectedSession(prev => ({ ...prev, status: SESSION_STATUS.CANCELLED }));
                  }}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors text-xs font-medium"
                >
                  <XCircle className="w-4 h-4 mb-1 text-slate-500" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>

            {/* Clinical Note Link */}
            {onWriteNote && (
              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  icon={FileEdit}
                  onClick={() => {
                    onWriteNote(selectedSession);
                    setSelectedSession(null);
                  }}
                  className="text-xs"
                >
                  Document Session Notes
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
