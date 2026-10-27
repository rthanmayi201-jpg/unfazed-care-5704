import React from 'react';
import { useForm } from 'react-hook-form';
import Button from '../common/Button.jsx';
import { UserCheck, AlertCircle } from 'lucide-react';

export default function IntakeForm({ onSubmitIntake, defaultValues = {}, isSubmitting = false }) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      fullName: defaultValues.name || '',
      phone: defaultValues.phone || '',
      age: defaultValues.age || '',
      city: defaultValues.city || '',
      occupation: defaultValues.occupation || '',
      presentingConcern: defaultValues.presentingConcern || '',
      severityScore: defaultValues.severityScore || '5',
      symptomDuration: defaultValues.symptomDuration || '1-3 months',
      priorTherapy: defaultValues.priorTherapy || 'no',
      currentMedications: defaultValues.currentMedications || 'None',
      emergencyName: defaultValues.emergencyContact?.name || '',
      emergencyRelation: defaultValues.emergencyContact?.relation || '',
      emergencyPhone: defaultValues.emergencyContact?.phone || '',
      preferredContact: defaultValues.preferredContact || 'whatsapp'
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmitIntake)} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
      <div className="pb-4 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Clinical Intake Questionnaire</h2>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          Please complete this confidential background intake prior to your first session. Your answers help your psychologist prepare an individualized care plan.
        </p>
      </div>

      {/* Demographics */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800">1. Demographics & Contact</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              {...register('fullName', { required: 'Full name is required' })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700"
            />
            {errors.fullName && <p className="text-[11px] text-rose-600 mt-0.5">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Phone Number *</label>
            <input
              type="tel"
              {...register('phone', { required: 'Phone number is required' })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700"
            />
            {errors.phone && <p className="text-[11px] text-rose-600 mt-0.5">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Age / Date of Birth</label>
            <input
              type="text"
              placeholder="e.g. 29"
              {...register('age')}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Current City (India / Abroad)</label>
            <input
              type="text"
              placeholder="e.g. Bengaluru, Karnataka"
              {...register('city')}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700"
            />
          </div>
        </div>
      </div>

      {/* Presenting Concerns */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800">2. Presenting Concerns & History</h3>
        
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            What brings you to therapy at this time? *
          </label>
          <textarea
            rows={4}
            {...register('presentingConcern', { required: 'Please describe what you would like support with' })}
            placeholder="Describe your current symptoms, recent stressors, emotional challenges, or goals..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700"
          />
          {errors.presentingConcern && (
            <p className="text-[11px] text-rose-600 mt-0.5">{errors.presentingConcern.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Distress Level (1 = Mild, 10 = Severe)
            </label>
            <select
              {...register('severityScore')}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <option key={n} value={n}>{n} {n >= 8 ? '(High Distress)' : n <= 3 ? '(Manageable)' : '(Moderate)'}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              How long have you felt this way?
            </label>
            <select
              {...register('symptomDuration')}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700"
            >
              <option value="Less than 2 weeks">Less than 2 weeks</option>
              <option value="1-3 months">1-3 months</option>
              <option value="6-12 months">6-12 months</option>
              <option value="Over a year">Over a year (Chronic)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Have you engaged in psychotherapy before?
            </label>
            <select
              {...register('priorTherapy')}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700"
            >
              <option value="no">No, this is my first time</option>
              <option value="yes_helpful">Yes, found it helpful</option>
              <option value="yes_unhelpful">Yes, had mixed experience</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Psychiatric / Chronic Medications
            </label>
            <input
              type="text"
              placeholder="e.g. Escitalopram 10mg / None"
              {...register('currentMedications')}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700"
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800">3. Emergency Contact (Mandatory Safety Policy)</h3>
        <p className="text-[11px] text-slate-500">
          This contact is only contacted in critical emergency situations involving imminent physical danger.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Name *</label>
            <input
              type="text"
              placeholder="e.g. Kavita Mehta"
              {...register('emergencyName', { required: 'Emergency contact name is required' })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700"
            />
            {errors.emergencyName && <p className="text-[11px] text-rose-600 mt-0.5">{errors.emergencyName.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship *</label>
            <input
              type="text"
              placeholder="e.g. Spouse / Sibling / Friend"
              {...register('emergencyRelation', { required: 'Relationship is required' })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700"
            />
            {errors.emergencyRelation && <p className="text-[11px] text-rose-600 mt-0.5">{errors.emergencyRelation.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Phone *</label>
            <input
              type="tel"
              placeholder="+91 98765..."
              {...register('emergencyPhone', { required: 'Emergency phone is required' })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700"
            />
            {errors.emergencyPhone && <p className="text-[11px] text-rose-600 mt-0.5">{errors.emergencyPhone.message}</p>}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isSubmitting}
          className="text-xs font-semibold"
        >
          Submit Clinical Intake
        </Button>
      </div>
    </form>
  );
}
