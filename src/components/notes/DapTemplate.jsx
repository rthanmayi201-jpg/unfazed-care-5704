import React from 'react';

export default function DapTemplate({ data = {}, onChange }) {
  const updateField = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4 text-xs">
      {/* D */}
      <div className="p-3.5 bg-white rounded-xl border border-slate-200">
        <label className="block font-bold text-slate-800 mb-1">
          D — Data (Client Content & Session Interactions)
        </label>
        <p className="text-[11px] text-slate-400 mb-2">
          Specific topics addressed, events discussed, interventions utilized (e.g. psychoeducation, exposure).
        </p>
        <textarea
          rows={3}
          value={data.data || ''}
          onChange={(e) => updateField('data', e.target.value)}
          placeholder="Client discussed conflicts with manager. Roleplay conducted on setting professional boundaries..."
          className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-teal-700 outline-none leading-relaxed"
        />
      </div>

      {/* A */}
      <div className="p-3.5 bg-white rounded-xl border border-slate-200">
        <label className="block font-bold text-slate-800 mb-1">
          A — Assessment (Clinical Interpretation)
        </label>
        <p className="text-[11px] text-slate-400 mb-2">
          Therapist's clinical evaluation of client's emotional state, defense mechanisms, and readiness for change.
        </p>
        <textarea
          rows={3}
          value={data.assessment || ''}
          onChange={(e) => updateField('assessment', e.target.value)}
          placeholder="Client showed improved assertive communication in simulation. Underlying fear of abandonment remains present..."
          className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-teal-700 outline-none leading-relaxed"
        />
      </div>

      {/* P */}
      <div className="p-3.5 bg-white rounded-xl border border-slate-200">
        <label className="block font-bold text-slate-800 mb-1">
          P — Plan (Intervention Arc)
        </label>
        <p className="text-[11px] text-slate-400 mb-2">
          Between-session behavioral practice and future therapeutic targets.
        </p>
        <textarea
          rows={3}
          value={data.plan || ''}
          onChange={(e) => updateField('plan', e.target.value)}
          placeholder="Complete daily boundary journal. Read assigned article on assertive communication. Re-evaluate in 7 days."
          className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-teal-700 outline-none leading-relaxed"
        />
      </div>
    </div>
  );
}
