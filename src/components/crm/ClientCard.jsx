import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Phone, Mail, ArrowRight } from 'lucide-react';
import Avatar from '../common/Avatar.jsx';
import Badge from '../common/Badge.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { format } from 'date-fns';

export default function ClientCard({ client }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <Avatar name={client.name} size="md" />
            <div>
              <Link to={`/clients/${client.id}`} className="font-bold text-sm text-slate-900 hover:text-teal-800 transition-colors">
                {client.name}
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <Mail className="w-3 h-3 text-slate-400" />
                <span className="truncate max-w-[140px]">{client.email}</span>
              </div>
            </div>
          </div>
          <Badge variant={client.status === 'active' ? 'confirmed' : client.status === 'new' ? 'pending' : 'cancelled'}>
            {client.status.toUpperCase()}
          </Badge>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {(client.tags || []).slice(0, 3).map((tag, i) => (
            <span key={i} className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-3 border-t border-slate-100">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Next Session</div>
            <div className="text-slate-800 font-medium mt-0.5">
              {client.nextSession ? format(new Date(client.nextSession), 'dd MMM, h:mm a') : 'None booked'}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Total Paid</div>
            <div className="text-slate-900 font-bold font-mono tabular-nums mt-0.5">
              {formatCurrency(client.totalPaid)}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-400">{client.sessionsCompleted} sessions completed</span>
        <Link to={`/clients/${client.id}`} className="font-semibold text-teal-800 hover:text-teal-900 flex items-center gap-1">
          <span>View Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
