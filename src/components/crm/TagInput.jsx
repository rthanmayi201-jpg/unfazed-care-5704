import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

export default function TagInput({ tags = [], onChange, placeholder = 'Add clinical tag...' }) {
  const [inputVal, setInputVal] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmed = inputVal.trim().replace(/^,+|,+$/g, '');
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInputVal('');
    }
  };

  const removeTag = (indexToRemove) => {
    onChange(tags.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-teal-700">
      {tags.map((tag, idx) => (
        <span
          key={idx}
          className="inline-flex items-center gap-1 text-xs bg-teal-50 text-teal-800 font-medium px-2.5 py-1 rounded-lg border border-teal-200/60"
        >
          <span>{tag}</span>
          <button
            type="button"
            onClick={() => removeTag(idx)}
            className="text-teal-600 hover:text-teal-900 rounded-full"
            aria-label={`Remove tag ${tag}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] text-xs outline-none bg-transparent text-slate-700 py-1 px-1"
      />
    </div>
  );
}
