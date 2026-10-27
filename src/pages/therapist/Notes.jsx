import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, FileText, Lock, Share2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { noteApi, clientApi, schedulingApi } from '../../api/index.js';
import NoteEditor from '../../components/notes/NoteEditor.jsx';
import NoteList from '../../components/notes/NoteList.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function Notes() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [clients, setClients] = useState([]);
  const [sessions, setSessions] = useState([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('all'); // all | private | shared

  const loadData = async () => {
    try {
      const [notesData, clientsData, sessionsData] = await Promise.all([
        noteApi.getNotesForTherapist(user?.id || 'therapist_sharma'),
        clientApi.getClients(user?.id || 'therapist_sharma', { limit: 50 }),
        schedulingApi.getSessions(user?.id || 'therapist_sharma')
      ]);
      setNotes(notesData || []);
      setClients(clientsData.clients || []);
      setSessions(sessionsData || []);

      // Check if URL has query params for a specific session/client
      const queryClient = searchParams.get('client');
      const querySession = searchParams.get('session');
      if (queryClient || querySession) {
        setIsEditing(true);
        setSelectedNote({
          clientId: queryClient,
          sessionId: querySession,
          title: 'Consultation Clinical Note',
          type: 'freeform',
          visibility: 'private',
          content: { html: '<p>Documenting session insights...</p>' }
        });
      }
    } catch (err) {
      showToast('Error loading notes: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSaveNote = async (notePayload) => {
    try {
      await noteApi.saveNote({ ...notePayload, therapistId: user?.id || 'therapist_sharma' });
      setIsEditing(false);
      setSelectedNote(null);
      loadData();
    } catch (err) {
      showToast('Failed to save note: ' + err.message, 'error');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this clinical note?')) return;
    try {
      await noteApi.deleteNote(noteId);
      showToast('Note deleted', 'info');
      loadData();
    } catch (err) {
      showToast('Failed to delete note', 'error');
    }
  };

  const filteredNotes = notes.filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVisibility = visibilityFilter === 'all' || n.visibility === visibilityFilter;
    return matchesSearch && matchesVisibility;
  });

  if (loading) {
    return <Loader text="Loading clinical documentation..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Clinical Documentation & Notes</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Maintain HIPAA and Indian privacy-compliant SOAP/DAP clinical records and shared client reflection takeaways.
          </p>
        </div>

        {!isEditing && (
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setSelectedNote(null);
              setIsEditing(true);
            }}
            className="text-xs font-semibold"
          >
            Create New Note
          </Button>
        )}
      </div>

      {isEditing ? (
        <NoteEditor
          initialNote={selectedNote}
          clients={clients}
          sessions={sessions}
          onSaveNote={handleSaveNote}
          onCancel={() => {
            setIsEditing(false);
            setSelectedNote(null);
          }}
        />
      ) : (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200/80">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes by title..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700 outline-none"
              />
            </div>

            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setVisibilityFilter('all')}
                className={`px-3 py-1 font-semibold rounded-lg transition-colors ${
                  visibilityFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All Notes ({notes.length})
              </button>
              <button
                type="button"
                onClick={() => setVisibilityFilter('private')}
                className={`flex items-center gap-1 px-3 py-1 font-semibold rounded-lg transition-colors ${
                  visibilityFilter === 'private' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Lock className="w-3 h-3 text-slate-500" />
                <span>Private</span>
              </button>
              <button
                type="button"
                onClick={() => setVisibilityFilter('shared')}
                className={`flex items-center gap-1 px-3 py-1 font-semibold rounded-lg transition-colors ${
                  visibilityFilter === 'shared' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Share2 className="w-3 h-3 text-teal-700" />
                <span>Shared</span>
              </button>
            </div>
          </div>

          <NoteList
            notes={filteredNotes}
            clients={clients}
            onSelectNote={(note) => {
              setSelectedNote(note);
              setIsEditing(true);
            }}
            onDeleteNote={handleDeleteNote}
          />
        </div>
      )}
    </div>
  );
}
