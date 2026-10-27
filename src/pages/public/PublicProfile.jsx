import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { therapistApi, paymentApi } from '../../api/index.js';
import Hero from '../../components/profile/Hero.jsx';
import About from '../../components/profile/About.jsx';
import SpecializationChips from '../../components/profile/SpecializationChips.jsx';
import ServiceCard from '../../components/profile/ServiceCard.jsx';
import PackageCard from '../../components/payments/PackageCard.jsx';
import Loader from '../../components/common/Loader.jsx';
import Button from '../../components/common/Button.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { ShieldCheck, Heart, Award, Sparkles, MessageCircle } from 'lucide-react';

export default function PublicProfile() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [therapist, setTherapist] = useState(null);
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const t = await therapistApi.getBySlug(slug);
        if (mounted) {
          if (!t) {
            navigate('/404', { replace: true });
            return;
          }
          setTherapist(t);
          const pkgData = await paymentApi.getPackages(t.id);
          setPackages(pkgData || []);
        }
      } catch (err) {
        navigate('/404', { replace: true });
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, [slug, navigate]);

  if (loading) {
    return <Loader text="Connecting to therapist practice link..." />;
  }

  if (!therapist) return null;

  return (
    <>
      <Helmet>
        <title>{`${therapist.name} | Licensed Clinical Psychologist`}</title>
        <meta name="description" content={therapist.bio?.slice(0, 155)} />
        <meta property="og:title" content={`${therapist.name} - Private Therapy Consultations`} />
        <meta property="og:description" content={therapist.bio?.slice(0, 155)} />
        <meta property="og:type" content="profile" />
        <meta property="og:image" content={therapist.avatar} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${therapist.name} - Book Session`} />
        <meta name="twitter:description" content={therapist.bio?.slice(0, 155)} />
      </Helmet>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-10">
        
        {/* Profile Hero */}
        <Hero
          therapist={therapist}
          onBookClick={() => navigate(`/${slug}/book`)}
        />

        {/* About & Credentials */}
        <About therapist={therapist} />

        {/* Specializations & Clinical Focus */}
        <SpecializationChips specializations={therapist.specializations || []} />

        {/* Consultation Services */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Available Consultation Formats</h2>
              <p className="text-xs text-slate-500">All sessions take place via private, encrypted video links.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(therapist.services || []).map((srv) => (
              <ServiceCard
                key={srv.id}
                service={srv}
                onSelect={() => navigate(`/${slug}/book`)}
              />
            ))}
          </div>
        </section>

        {/* Session Package Bundles */}
        {packages.length > 0 && (
          <section className="space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Multi-Session Treatment Arcs</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Discounted Session Packages</h2>
              <p className="text-xs text-slate-500">Commit to your personal mental health journey with discounted prepaid bundles.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {packages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  onBuy={() => navigate(`/${slug}/book`)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Trust & Ethics Guarantee */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-600">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0" />
            <div>
              <div className="font-bold text-slate-900 mb-1">RCI Code of Ethics</div>
              <p className="text-slate-500 leading-relaxed">Full compliance with Indian Rehabilitation Council and APA clinical standards.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-teal-700 shrink-0" />
            <div>
              <div className="font-bold text-slate-900 mb-1">Unconditional Safety</div>
              <p className="text-slate-500 leading-relaxed">Affirmative, non-judgmental space for queer, neurodivergent, and all cultural backgrounds.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-teal-700 shrink-0" />
            <div>
              <div className="font-bold text-slate-900 mb-1">Secure Indian Payments</div>
              <p className="text-slate-500 leading-relaxed">Instant GST invoices, UPI, Cards, and Netbanking powered by Razorpay.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-6 text-xs text-slate-400 space-y-2">
          <div>
            Powered by{' '}
            <a href="/" className="font-semibold text-slate-700 hover:text-teal-900">
              Unfazed
            </a>{' '}
            · Private Practice Platform for Therapists in India
          </div>
          <div className="text-[11px] text-slate-400">
            Emergency Crisis helpline (KIRAN): 1800-599-0019 (24/7 Toll-Free)
          </div>
        </footer>

      </div>
    </>
  );
}
