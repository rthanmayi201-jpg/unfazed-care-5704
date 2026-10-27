import React, { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Settings2, Eye, Code, Save, Check } from 'lucide-react';
import Button from '../common/Button.jsx';
import { useToast } from '../../context/ToastContext.jsx';

const FIELD_TYPES = [
  { value: 'text', label: 'Single Line Text' },
  { value: 'textarea', label: 'Multi-line Paragraph' },
  { value: 'select', label: 'Dropdown Select' },
  { value: 'radio', label: 'Radio Options' },
  { value: 'checkbox', label: 'Multi-select Checkbox' },
  { value: 'date', label: 'Date Picker' }
];

export default function FormBuilder({ initialSchema = [], onSaveSchema }) {
  const { showToast } = useToast();
  const [fields, setFields] = useState(initialSchema);
  const [activeTab, setActiveTab] = useState('editor'); // editor | preview | json
  const [saving, setSaving] = useState(false);

  const addField = () => {
    const newField = {
      id: 'field_' + Date.now(),
      label: 'New Question',
      type: 'text',
      required: false,
      placeholder: '',
      options: ['Option 1', 'Option 2']
    };
    setFields([...fields, newField]);
  };

  const removeField = (index) => {
    setFields(fields.filter((_, idx) => idx !== index));
  };

  const moveField = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= fields.length) return;
    const updated = [...fields];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setFields(updated);
  };

  const updateField = (index, updates) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], ...updates };
    setFields(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (onSaveSchema) {
        await onSaveSchema(fields);
      }
      showToast('Custom intake questionnaire schema updated!', 'success');
    } catch (err) {
      showToast('Failed to save schema: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Custom Intake Form Builder</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Design tailored intake fields for your specialized therapy practice.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode switch */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'editor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Editor
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Preview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('json')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'json' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              JSON Schema
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={Save}
            loading={saving}
            onClick={handleSave}
            className="text-xs"
          >
            Save Template
          </Button>
        </div>
      </div>

      {activeTab === 'editor' && (
        <div className="space-y-4">
          {fields.map((field, idx) => (
            <div key={field.id} className="p-4 bg-[#FAF8F5] rounded-2xl border border-slate-200/70 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700">Question #{idx + 1}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveField(idx, -1)}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === fields.length - 1}
                    onClick={() => moveField(idx, 1)}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeField(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded ml-1"
                    title="Delete field"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Field Label / Question</label>
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => updateField(idx, { label: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Response Type</label>
                  <select
                    value={field.type}
                    onChange={(e) => updateField(idx, { type: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-700"
                  >
                    {FIELD_TYPES.map(ft => (
                      <option key={ft.value} value={ft.value}>{ft.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Options editor for select/radio/checkbox */}
              {['select', 'radio', 'checkbox'].includes(field.type) && (
                <div className="text-xs pt-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Options (comma separated)</label>
                  <input
                    type="text"
                    value={(field.options || []).join(', ')}
                    onChange={(e) => updateField(idx, { options: e.target.value.split(',').map(s => s.trim()) })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-700"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id={`req_${field.id}`}
                  checked={field.required}
                  onChange={(e) => updateField(idx, { required: e.target.checked })}
                  className="w-3.5 h-3.5 rounded text-teal-700 focus:ring-teal-700"
                />
                <label htmlFor={`req_${field.id}`} className="text-xs text-slate-600 cursor-pointer select-none">
                  Required response
                </label>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={addField}
            className="w-full text-xs py-2.5 border-dashed"
          >
            Add Another Intake Question
          </Button>
        </div>
      )}

      {/* Live Preview Renderer */}
      {activeTab === 'preview' && (
        <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-slate-200/70 space-y-4">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Client Interactive Form Preview
          </div>
          {fields.map((field) => (
            <div key={field.id} className="space-y-1.5 text-xs">
              <label className="block font-semibold text-slate-800">
                {field.label} {field.required && <span className="text-rose-600">*</span>}
              </label>

              {field.type === 'text' && (
                <input
                  type="text"
                  placeholder={field.placeholder || 'Type answer here...'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                />
              )}

              {field.type === 'textarea' && (
                <textarea
                  rows={3}
                  placeholder={field.placeholder || 'Provide details...'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                />
              )}

              {field.type === 'select' && (
                <select className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs">
                  <option value="">Select an option...</option>
                  {(field.options || []).map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              )}

              {field.type === 'radio' && (
                <div className="space-y-1.5 pl-1">
                  {(field.options || []).map((opt, i) => (
                    <label key={i} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input type="radio" name={field.id} className="text-teal-700" />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {field.type === 'checkbox' && (
                <div className="space-y-1.5 pl-1">
                  {(field.options || []).map((opt, i) => (
                    <label key={i} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input type="checkbox" className="text-teal-700 rounded" />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {field.type === 'date' && (
                <input
                  type="date"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* JSON Schema */}
      {activeTab === 'json' && (
        <pre className="p-4 bg-slate-900 text-teal-400 rounded-2xl text-xs font-mono overflow-x-auto max-h-96">
          {JSON.stringify(fields, null, 2)}
        </pre>
      )}
    </div>
  );
}
