import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Check, 
  Calendar, 
  ShieldCheck, 
  Receipt, 
  FileText, 
  Users, 
  Sparkles, 
  Clock, 
  Lock,
  Globe,
  CheckCircle2
} from 'lucide-react';
import { entitlementApi } from '../../api/index.js';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { FEATURE_KEYS } from '../../utils/constants.js';

export default function Landing() {
  const navigate = useNavigate();
  const [tierConfig, setTierConfig] = useState(null);

  useEffect(() => {
    entitlementApi.getTierConfig().then(cfg => setTierConfig(cfg));
  }, []);

  const tiers = tierConfig?.tiers || {};

  return (
    <div className="space-y-20 pb-20">
      
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-900 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-200/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
              <span>Built exclusively for mental health professionals in India</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-[1.12]">
              Run your private therapy practice on <span className="text-teal-800 underline decoration-teal-300 decoration-wavy decoration-2">one branded link</span>.
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
              Client scheduling, automated WhatsApp reminders, UPI & credit card payments, GST invoices, and HIPAA-grade SOAP notes—unified into a calm, trustworthy practice suite.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Button
                size="lg"
                onClick={() => navigate('/register')}
                className="font-bold text-sm shadow-md shadow-teal-900/10"
              >
                <span>Claim Your Branded Link Free</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>

              <Link to="/dr-sharma">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm">
                  View Live Demo Practice
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Zero setup fees</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Razorpay UPI & Cards</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>RCI & APA Compliant</span>
              </div>
            </div>
          </div>

          {/* Hero Studio Photography Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 shadow-2xl bg-white group">
              <img
                src="/src/assets/images/hero_therapy_calm_1792946458595.jpg"
                alt="Modern Serene Therapy Studio"
                referrerPolicy="no-referrer"
                className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-102 transition-transform duration-500"
              />
              <div className="p-5 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg">
                    unfazed.in/dr-sharma
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Bookings Open
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  Instant scheduling across IST, UAE, & global timezones for Indian therapists.
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Pillars */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <Badge variant="teal" size="sm" className="uppercase font-semibold">
            All-In-One Operating System
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Everything your clinical practice needs to thrive.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Eliminate fragmented WhatsApp scheduling, manual UPI screenshot reconciliation, and scattered paper intake forms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Intelligent Scheduling & Buffers</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Auto-converted slots for NRI clients across timezones, custom rest buffers, and automated cancellation waitlists.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Razorpay UPI & GST Invoicing</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Clients pay instantly via GPay, PhonePe, or cards. Automatic 18% GST tax invoices with SAC code 999312 and downloadable PDFs.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">SOAP / DAP Clinical Records</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Maintain private clinical notes or share reflection takeaways with clients. Complete separation guarantees client confidentiality.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <Badge variant="default" size="sm" className="uppercase font-semibold">Simple Workflow</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Set up in 5 minutes</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="text-2xl font-bold font-mono text-teal-800">01.</div>
            <h3 className="font-bold text-sm text-slate-900">Claim your branded link</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pick your personalized handle like <code>unfazed.in/dr-sharma</code> with instant uniqueness verification.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-2xl font-bold font-mono text-teal-800">02.</div>
            <h3 className="font-bold text-sm text-slate-900">Define hours & fees</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Set your consultation duration, consultation fees in INR, buffer intervals, and intake questions.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-2xl font-bold font-mono text-teal-800">03.</div>
            <h3 className="font-bold text-sm text-slate-900">Share & automate</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Clients book and pay automatically. Video links, calendar invites, and reminder pings fire without manual effort.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Tiers Section (Loaded Dynamically From Config!) */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <Badge variant="pro" size="sm" className="uppercase font-semibold">Simple Pricing</Badge>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Plans that grow with your practice
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            All prices and features are strictly evaluated from the central subscription config.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(tiers).map(([key, t]) => {
            const isPro = key === 'pro';
            return (
              <div
                key={key}
                className={`bg-white rounded-3xl p-6 sm:p-8 border flex flex-col justify-between ${
                  isPro ? 'border-teal-700 ring-2 ring-teal-700/20 shadow-lg' : 'border-slate-200/80 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-base text-slate-900">{t.name}</h3>
                    {isPro && (
                      <span className="text-[10px] font-bold bg-teal-700 text-white px-2 py-0.5 rounded-full uppercase">
                        Recommended
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
                      {t.priceINR === 0 ? 'Free' : formatCurrency(t.priceINR)}
                    </span>
                    <span className="text-xs text-slate-500 ml-1.5">/{t.billingCycle}</span>
                  </div>

                  <p className="text-xs text-slate-500 mb-6 leading-relaxed">{t.description}</p>

                  <div className="space-y-3 text-xs border-t border-slate-100 pt-5">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Check className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>Active Clients: <strong>{t.limits?.[FEATURE_KEYS.ACTIVE_CLIENT_CAP]}</strong></span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700">
                      <Check className={`w-4 h-4 ${t.features?.[FEATURE_KEYS.NOTE_TEMPLATES] ? 'text-teal-600' : 'text-slate-300'}`} />
                      <span className={t.features?.[FEATURE_KEYS.NOTE_TEMPLATES] ? '' : 'text-slate-400 line-through'}>
                        SOAP & DAP Structured Notes
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700">
                      <Check className={`w-4 h-4 ${t.features?.[FEATURE_KEYS.PACKAGES_BUILDER] ? 'text-teal-600' : 'text-slate-300'}`} />
                      <span className={t.features?.[FEATURE_KEYS.PACKAGES_BUILDER] ? '' : 'text-slate-400 line-through'}>
                        Multi-Session Packages
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700">
                      <Check className={`w-4 h-4 ${t.features?.[FEATURE_KEYS.CUSTOM_INTAKE_BUILDER] ? 'text-teal-600' : 'text-slate-300'}`} />
                      <span className={t.features?.[FEATURE_KEYS.CUSTOM_INTAKE_BUILDER] ? '' : 'text-slate-400 line-through'}>
                        Dynamic Intake Questionnaire
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700">
                      <Check className={`w-4 h-4 ${t.features?.[FEATURE_KEYS.ADVANCED_ANALYTICS] ? 'text-teal-600' : 'text-slate-300'}`} />
                      <span className={t.features?.[FEATURE_KEYS.ADVANCED_ANALYTICS] ? '' : 'text-slate-400 line-through'}>
                        Deep Cohort Analytics
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100">
                  <Button
                    variant={isPro ? 'primary' : 'outline'}
                    size="md"
                    onClick={() => navigate('/register')}
                    className="w-full text-xs font-bold"
                  >
                    Start with {t.name.split(' ')[0]}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          © 2026 Unfazed Technologies India Pvt. Ltd. · Designed for Licensed Mental Health Practitioners
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <Link to="/dr-sharma" className="hover:text-teal-800">Demo Therapist Profile</Link>
          <Link to="/login" className="hover:text-teal-800">Therapist Sign In</Link>
          <Link to="/register" className="hover:text-teal-800">Create Account</Link>
        </div>
      </footer>

    </div>
  );
}
