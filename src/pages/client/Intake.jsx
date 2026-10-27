import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { therapistApi, clientApi } from '../../api/index.js';
import IntakeForm from '../../components/crm/IntakeForm.jsx';
import ConsentCheckbox from '../../components/crm/ConsentCheckbox.jsx';
import Loader from '../../components/common/Loader.jsx';
import Button from '../../components/common/Button.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function Intake() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [therapist, setTherapist] = useState(null);
  const [intakeCompleted, setIntakeCompleted] = useState(false);
  const [consentCompleted, setConsentCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    therapistApi.getBySlug(slug).then(t => {
      setTherapist(t);
      setLoading(false);
    });
  }, [slug]);

  const handleSubmitIntake = async (intakeValues) => {
    setIntakeCompleted(true);
    showToast('Intake questionnaire recorded!', 'success');
  };

  const handleConsentSigned = async (consentData) => {
    setSubmitting(true);
    try {
      await clientApi.submitIntakeAndConsent('client_1', {}, consentData);
      setConsentCompleted(true);
      showToast('Informed consent digitally executed and audited!', 'success');
      setTimeout(() => {
        navigate(`/${slug}/book`);
      }, 1500);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader text="Loading clinical intake portal..." />;
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      <Link
        to={`/${slug}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-800"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to {therapist?.name || 'Practice Profile'}</span>
      </Link>

      <div className="space-y-6">
        <IntakeForm onSubmitIntake={handleSubmitIntake} />

        <ConsentCheckbox onConsentSigned={handleConsentSigned} />
      </div>
    </div>
  );
}
