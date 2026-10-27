import React, { useState, useEffect } from 'react';
import { Bell, Smartphone, Mail, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { notificationService } from '../../utils/notificationService.js';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import { format } from 'date-fns';
import { useToast } from '../../context/ToastContext.jsx';

export default function Notifications() {
  const { showToast } = useToast();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(notificationService.getHistory());
  }, []);

  const handleClear = () => {
    notificationService.clearAll();
    setHistory([]);
    showToast('Notification log cleared', 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Practice Notification Dispatch Log</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time audit log of automated WhatsApp messages, email receipts, and calendar invites.
          </p>
        </div>

        {history.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            icon={Trash2}
            onClick={handleClear}
            className="text-xs"
          >
            Clear Log
          </Button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {history.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No notifications logged yet. New booking and payment alerts will stream here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-slate-200 text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Notification Summary</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 capitalize">{item.type}</span>
                    </td>
                    <td className="py-3 px-4 max-w-sm text-slate-700 leading-relaxed">
                      <div className="font-semibold text-slate-800">{item.title}</div>
                      <div className="text-[11px] text-slate-500">{item.message}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-mono uppercase text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {item.channel === 'whatsapp' ? <Smartphone className="w-3 h-3 text-emerald-600" /> : <Mail className="w-3 h-3 text-sky-600" />}
                        <span>{item.channel}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {item.recipient}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="paid">{item.status.toUpperCase()}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px] tabular-nums">
                      {format(new Date(item.timestamp), 'dd MMM, h:mm a')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
