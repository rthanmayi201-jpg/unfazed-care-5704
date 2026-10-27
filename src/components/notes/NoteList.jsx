import React from 'react';
import { Lock, Share2, FileText, Calendar, Edit3, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import Badge from '../common/Badge.jsx';

export default function NoteList({
  notes = [],
  clients = [],
  onSelectNote,
  onDeleteNote,
  isClientView = false
}) {
  const getClientName = (clientId) => {
    const c = clients.find(item => item.id === clientId);
    return c ? c.name : 'Client';
  };

  if (!notes.length) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 text-center text-xs text-slate-400">
        No clinical notes recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => {
        const isPrivate = note.visibility === 'private';
        return (
          <div
            key={note.id}
            className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-teal-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-sm text-slate-900">{note.title}</span>
                
                {/* Visibility Badge */}
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                  isPrivate
                    ? 'bg-slate-100 text-slate-700 border border-slate-200'
                    : 'bg-teal-50 text-teal-800 border border-teal-200/60'
                }`}>
                  {isPrivate ? <Lock className="w-3 h-3 text-slate-500" /> : <Share2 className="w-3 h-3 text-teal-700" />}
                  <span>{isPrivate ? 'Private' : 'Shared with Client'}</span>
                </span>

                {/* Template format tag */}
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                  {note.type}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                {!isClientView && (
                  <span>Client: <strong className="text-slate-700">{getClientName(note.clientId)}</strong></span>
                )}
                <span>Updated: {format(new Date(note.updatedAt), 'dd MMM yyyy, h:mm a')}</span>
              </div>

              {/* Snippet preview */}
              <div className="text-xs text-slate-600 line-clamp-2 pt-1 leading-relaxed">
                {note.type === 'freeform' ? (
                  <div dangerouslySetInnerHTML={{ __html: note.content?.html?.slice(0, 160) + '...' }} />
                ) : note.type === 'soap' ? (
                  <span><strong>Subjective:</strong> {note.content?.subjective?.slice(0, 140)}...</span>
                ) : (
                  <span><strong>Data:</strong> {note.content?.data?.slice(0, 140)}...</span>
                )}
              </div>
            </div>

            {/* Actions */}
            {!isClientView && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onSelectNote(note)}
                  className="p-2 text-slate-600 hover:text-teal-800 hover:bg-slate-50 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                {onDeleteNote && (
                  <button
                    type="button"
                    onClick={() => onDeleteNote(note.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    aria-label="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
