import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { therapistApi, schedulingApi, paymentApi } from '../../api/index.js';
import CheckoutForm from '../../components/payments/CheckoutForm.jsx';
import Loader from '../../components/common/Loader.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';

export default function Payment() {
  const { slug, sessionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [therapist, setTherapist] = useState(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [tData, sessionsData] = await Promise.all([
          therapistApi.getBySlug(slug),
          schedulingApi.getSessions()
        ]);
        if (mounted) {
          setTherapist(tData);
          const s = sessionsData.find(item => item.id === sessionId);
          setSession(s || {
            id: sessionId,
            serviceName: 'Individual Therapy Session',
            duration: 60,
            priceINR: 2500
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, [slug, sessionId]);

  if (loading) {
    return <Loader text="Preparing secure payment summary..." />;
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <Link
        to={`/${slug}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-800"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to practice</span>
      </Link>

      <CheckoutForm
        itemTitle={session?.serviceName || 'Therapy Consultation'}
        duration={session?.duration || 60}
        subtotal={session?.priceINR || 2500}
        onPaymentComplete={() => {
          setCompleted(true);
          setTimeout(() => navigate('/portal'), 2000);
        }}
      />
    </div>
  );
}
