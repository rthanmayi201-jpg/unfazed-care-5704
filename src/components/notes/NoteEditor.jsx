import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo, 
  Lock, 
  Share2, 
  Save, 
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';
import Button from '../common/Button.jsx';
import SoapTemplate from './SoapTemplate.jsx';
import DapTemplate from './DapTemplate.jsx';
import UpgradePrompt from '../entitlement/UpgradePrompt.jsx';
import { useEntitlement } from '../../hooks/useEntitlement.js';
import { useToast } from '../../context/ToastContext.jsx';
import { FEATURE_KEYS, NOTE_TYPES } from '../../utils/constants.js';

export default function NoteEditor({
  initialNote = null,
  clients = [],
  sessions = [],
  onSaveNote,
  onCancel
}) {
  const { canAccess } = useEntitlement();
  const { showToast } = useToast();

  const [title, setTitle] = useState(initialNote?.title || 'Session Clinical Note');
  const [clientId, setClientId] = useState(initialNote?.clientId || (clients[0]?.id || ''));
  const [sessionId, setSessionId] = useState(initialNote?.sessionId || '');
  const [visibility, setVisibility] = useState(initialNote?.visibility || 'private'); // 'private' | 'shared'
  const [noteType, setNoteType] = useState(initialNote?.type || NOTE_TYPES.FREEFORM);
  const [soapData, setSoapData] = useState(initialNote?.type === 'soap' ? initialNote.content : {});
  const [dapData, setDapData] = useState(initialNote?.type === 'dap' ? initialNote.content : {});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(initialNote?.updatedAt || null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  // TipTap Rich Text Editor for Freeform notes
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialNote?.type === 'freeform' ? initialNote?.content?.html || '<p>Record clinical observations, therapeutic interventions, and client breakthroughs...</p>' : '<p>Session notes...</p>'
  });

  const canUseTemplates = canAccess(FEATURE_KEYS.NOTE_TEMPLATES);

  const handleSelectNoteType = (type) => {
    if ((type === NOTE_TYPES.SOAP || type === NOTE_TYPES.DAP) && !canUseTemplates) {
      setUpgradeModalOpen(true);
      return;
    }
    setNoteType(type);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showToast('Please provide a note title', 'error');
      return;
    }

    setIsSaving(true);
    try {
      let content = {};
      if (noteType === NOTE_TYPES.FREEFORM) {
        content = { html: editor ? editor.getHTML() : '' };
      } else if (noteType === NOTE_TYPES.SOAP) {
        content = soapData;
      } else if (noteType === NOTE_TYPES.DAP) {
        content = dapData;
      }

      const notePayload = {
        id: initialNote?.id,
        title,
        clientId,
        sessionId: sessionId || null,
        type: noteType,
        visibility,
        content
      };

      await onSaveNote(notePayload);
      setLastSaved(new Date().toISOString());
      showToast('Clinical documentation saved successfully!', 'success');
    } catch (err) {
      showToast('Failed to save note: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
      
      {/* Top Header & Visibility Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title (e.g., Session 4: CBT Cognitive Restructuring)"
            className="text-lg font-bold text-slate-900 tracking-tight w-full outline-none hover:bg-slate-50 p-1 rounded-lg border border-transparent focus:border-slate-200"
          />
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
            {lastSaved ? (
              <span className="flex items-center gap-1 text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                <span>Last saved {new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </span>
            ) : (
              <span>Draft unsaved</span>
            )}
          </div>
        </div>

        {/* Private vs Shared Visibility Segment */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setVisibility('private')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                visibility === 'private'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Private (Therapist Only)</span>
            </button>

            <button
              type="button"
              onClick={() => setVisibility('shared')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                visibility === 'shared'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Shared with Client</span>
            </button>
          </div>
        </div>
      </div>

      {/* Client and Session Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Select Client</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-700"
          >
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Link to Scheduled Session (Optional)</label>
          <select
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-700"
          >
            <option value="">General Practice Note (Unlinked)</option>
            {sessions.slice(0, 10).map(s => (
              <option key={s.id} value={s.id}>
                {s.clientName} - {new Date(s.startTime).toLocaleDateString('en-IN')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Note Template Type Selection */}
      <div className="flex items-center gap-2 text-xs pt-2">
        <span className="font-semibold text-slate-500 mr-1">Documentation Format:</span>
        <button
          type="button"
          onClick={() => handleSelectNoteType(NOTE_TYPES.FREEFORM)}
          className={`px-3 py-1.5 rounded-xl border font-medium transition-colors ${
            noteType === NOTE_TYPES.FREEFORM
              ? 'bg-teal-800 text-white border-teal-800'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Freeform Rich Text
        </button>

        <button
          type="button"
          onClick={() => handleSelectNoteType(NOTE_TYPES.SOAP)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-medium transition-colors ${
            noteType === NOTE_TYPES.SOAP
              ? 'bg-teal-800 text-white border-teal-800'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {!canUseTemplates && <Lock className="w-3 h-3 text-purple-600" />}
          <span>SOAP Template</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectNoteType(NOTE_TYPES.DAP)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-medium transition-colors ${
            noteType === NOTE_TYPES.DAP
              ? 'bg-teal-800 text-white border-teal-800'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {!canUseTemplates && <Lock className="w-3 h-3 text-purple-600" />}
          <span>DAP Template</span>
        </button>
      </div>

      {/* Active Editor Surface */}
      {noteType === NOTE_TYPES.FREEFORM && editor && (
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
          {/* TipTap Toolbar */}
          <div className="bg-[#FAF8F5] p-2 border-b border-slate-200 flex flex-wrap items-center gap-1 text-slate-600">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1.5 rounded hover:bg-slate-200 ${editor.isActive('bold') ? 'bg-slate-200 text-teal-900 font-bold' : ''}`}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1.5 rounded hover:bg-slate-200 ${editor.isActive('italic') ? 'bg-slate-200 text-teal-900' : ''}`}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-1.5 rounded hover:bg-slate-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-slate-200 text-teal-900' : ''}`}
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-1.5 rounded hover:bg-slate-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 text-teal-900' : ''}`}
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-1.5 rounded hover:bg-slate-200 ${editor.isActive('bulletList') ? 'bg-slate-200 text-teal-900' : ''}`}
              title="Bullet list"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-1.5 rounded hover:bg-slate-200 ${editor.isActive('orderedList') ? 'bg-slate-200 text-teal-900' : ''}`}
              title="Numbered list"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-1.5 rounded hover:bg-slate-200 ${editor.isActive('blockquote') ? 'bg-slate-200 text-teal-900' : ''}`}
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-slate-300 mx-1" />
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              className="p-1.5 rounded hover:bg-slate-200 text-slate-500"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              className="p-1.5 rounded hover:bg-slate-200 text-slate-500"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 sm:p-5">
            <EditorContent editor={editor} />
          </div>
        </div>
      )}

      {noteType === NOTE_TYPES.SOAP && (
        <SoapTemplate data={soapData} onChange={setSoapData} />
      )}

      {noteType === NOTE_TYPES.DAP && (
        <DapTemplate data={dapData} onChange={setDapData} />
      )}

      {/* Bottom Save Bar */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="text-xs text-slate-500">
          {visibility === 'private' ? (
            <span className="flex items-center gap-1.5 text-slate-600">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Visible strictly to you. Never exported to the client portal.</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-teal-800 font-medium">
              <Share2 className="w-3.5 h-3.5 text-teal-700" />
              <span>Shared note: client can read takeaways in their secure client portal.</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel} className="text-xs">
              Cancel
            </Button>
          )}
          <Button
            variant="primary"
            size="md"
            icon={Save}
            loading={isSaving}
            onClick={handleSave}
            className="text-xs font-semibold"
          >
            Save Clinical Note
          </Button>
        </div>
      </div>

      <UpgradePrompt
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        featureName="SOAP & DAP Structured Clinical Templates"
        featureKey={FEATURE_KEYS.NOTE_TEMPLATES}
      />
    </div>
  );
}
