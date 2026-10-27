import React from 'react';

export default function SoapTemplate({ data = {}, onChange }) {
  const updateField = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4 text-xs">
      {/* S */}
      <div className="p-3.5 bg-white rounded-xl border border-slate-200">
        <label className="block font-bold text-slate-800 mb-1">
          S — Subjective (Client's Reported Experience)
        </label>
        <p className="text-[11px] text-slate-400 mb-2">
          Chief complaint, symptoms, emotions, and personal disclosures reported by the client during this session.
        </p>
        <textarea
          rows={3}
          value={data.subjective || ''}
          onChange={(e) => updateField('subjective', e.target.value)}
          placeholder="Client disclosed feeling heightened anticipatory anxiety before work presentations..."
          className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-teal-700 outline-none leading-relaxed"
        />
      </div>

      {/* O */}
      <div className="p-3.5 bg-white rounded-xl border border-slate-200">
        <label className="block font-bold text-slate-800 mb-1">
          O — Objective (Clinical Observations)
        </label>
        <p className="text-[11px] text-slate-400 mb-2">
          Therapist's direct observations: affect, mood congruence, psychomotor speed, speech patterns, assessments.
        </p>
        <textarea
          rows={3}
          value={data.objective || ''}
          onChange={(e) => updateField('objective', e.target.value)}
          placeholder="Affect congruent, cooperative, eye contact steady. GAD-7 score measured at 9..."
          className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-teal-700 outline-none leading-relaxed"
        />
      </div>

      {/* A */}
      <div className="p-3.5 bg-white rounded-xl border border-slate-200">
        <label className="block font-bold text-slate-800 mb-1">
          A — Assessment (Clinical Formulation & Progress)
        </label>
        <p className="text-[11px] text-slate-400 mb-2">
          Diagnostic impressions, cognitive distortions identified, response to intervention, treatment progress.
        </p>
        <textarea
          rows={3}
          value={data.assessment || ''}
          onChange={(e) => updateField('assessment', e.target.value)}
          placeholder="Catastrophic thinking identified around social evaluation. Strong cognitive flexibility shown when reframing..."
          className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-teal-700 outline-none leading-relaxed"
        />
      </div>

      {/* P */}
      <div className="p-3.5 bg-white rounded-xl border border-slate-200">
        <label className="block font-bold text-slate-800 mb-1">
          P — Plan (Homework & Next Steps)
        </label>
        <p className="text-[11px] text-slate-400 mb-2">
          Action items, behavioral experiments, somatic grounding tasks, and next scheduled appointment.
        </p>
        <textarea
          rows={3}
          value={data.plan || ''}
          onChange={(e) => updateField('plan', e.target.value)}
          placeholder="Practice 4-7-8 breathing twice daily. Log thoughts using 3-column CBT worksheet. Next session on Tuesday."
          className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-teal-700 outline-none leading-relaxed"
        />
      </div>
    </div>
  );
}
