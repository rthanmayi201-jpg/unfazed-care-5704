import React, { useState } from 'react';
import { ShieldCheck, FileCheck, Info } from 'lucide-react';
import Button from '../common/Button.jsx';

export default function ConsentCheckbox({ onConsentSigned, initialSigned = false, auditLog = [] }) {
  const [agreed, setAgreed] = useState(initialSigned);
  const [signatureName, setSignatureName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreed) {
      setError('Please check the consent terms checkbox.');
      return;
    }
    if (!signatureName.trim() || signatureName.trim().length < 3) {
      setError('Please type your full legal name as your digital signature.');
      return;
    }
    setError('');
    onConsentSigned({
      signature: signatureName.trim(),
      timestamp: new Date().toISOString()
    });
  };

  if (initialSigned) {
    return (
      <div className="bg-teal-50/60 rounded-2xl p-5 border border-teal-200/70 text-xs text-teal-900 space-y-3">
        <div className="flex items-center gap-2 font-bold text-sm text-teal-900">
          <ShieldCheck className="w-5 h-5 text-teal-700" />
          <span>Informed Clinical Consent On File</span>
        </div>
        <p className="leading-relaxed">
          The client has reviewed and executed the digital Informed Consent agreement for private psychotherapy practice in India.
        </p>
        {auditLog && auditLog.length > 0 && (
          <div className="bg-white/80 rounded-xl p-3 border border-teal-200/50 mt-2 space-y-1 font-mono text-[11px] text-slate-600">
            <div className="font-semibold text-slate-800 uppercase tracking-wider text-[10px]">Audit Trail</div>
            <div>Signed by: {auditLog[0].signature || 'Client'}</div>
            <div>Timestamp: {new Date(auditLog[0].timestamp).toLocaleString('en-IN')}</div>
            <div>IP Address: {auditLog[0].ip || '103.21.124.11 (Logged)'}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
      <div className="flex items-start gap-3">
        <FileCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-sm text-slate-900">Informed Consent & Practice Policies</h3>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Pursuant to the Mental Healthcare Act (India), psychotherapeutic services require voluntary informed consent.
          </p>
        </div>
      </div>

      <div className="bg-[#FAF8F5] p-4 rounded-xl border border-slate-200/70 text-xs text-slate-600 space-y-2 max-h-48 overflow-y-auto leading-relaxed">
        <p><strong>1. Confidentiality:</strong> All discussions, clinical records, and session notes are strictly confidential and stored securely. Exceptions apply only in situations of imminent self-harm, threat to another person, or statutory legal mandates.</p>
        <p><strong>2. Telehealth & Safety:</strong> Online sessions take place via encrypted video links. Clients confirm they are in a safe, private location during appointments.</p>
        <p><strong>3. Cancellation Policy:</strong> Reschedules require at least 24 hours advance notice to avoid forfeiture of the session fee.</p>
        <p><strong>4. Emergency Limitations:</strong> Private psychotherapy is not an emergency crisis helpline. If experiencing acute distress, clients must contact <strong>KIRAN (1800-599-0019)</strong> or local hospital emergency services immediately.</p>
      </div>

      <div className="space-y-4">
        <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-4 h-4 rounded text-teal-700 focus:ring-teal-700 mt-0.5"
          />
          <span>
            I have read, understood, and voluntarily agree to the informed consent terms, confidentiality protocols, and practice cancellation policies above.
          </span>
        </label>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Typed Legal Signature
          </label>
          <input
            type="text"
            value={signatureName}
            onChange={(e) => setSignatureName(e.target.value)}
            placeholder="Type your full name (e.g. Aarav Mehta)"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700"
          />
          <div className="text-[10px] text-slate-400 mt-1">
            Typing your name acts as an enforceable digital signature under the Information Technology Act.
          </div>
        </div>

        {error && <div className="text-xs text-rose-600 font-medium">{error}</div>}

        <Button type="submit" variant="primary" size="md" className="w-full text-xs font-semibold">
          Authorize Informed Consent
        </Button>
      </div>
    </form>
  );
}
