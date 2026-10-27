import React from 'react';
import { Award, GraduationCap, HeartHandshake } from 'lucide-react';

export default function About({ therapist }) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-3">About My Practice</h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line">
          {therapist.bio || 'Dedicated to supporting mental wellness through compassionate, evidence-based therapy.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs sm:text-sm">
        {therapist.qualifications && (
          <div className="flex items-start gap-3 p-3.5 bg-[#FAF8F5] rounded-2xl border border-slate-200/60">
            <GraduationCap className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-800">Education & Degrees</div>
              <div className="text-slate-500 mt-0.5 text-xs">{therapist.qualifications}</div>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3 p-3.5 bg-[#FAF8F5] rounded-2xl border border-slate-200/60">
          <HeartHandshake className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-slate-800">Confidentiality Guarantee</div>
            <div className="text-slate-500 mt-0.5 text-xs">Strict adherence to Indian mental health ethics, secure video & privacy.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
