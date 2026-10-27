import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Check, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  QrCode, 
  Save, 
  FileCheck, 
  Bell, 
  Globe,
  AlertCircle,
  Database,
  Terminal,
  CheckCircle2,
  Play,
  Key,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { therapistApi, clientApi, authApi, supabaseApi } from '../../api/index.js';
import Button from '../../components/common/Button.jsx';
import Avatar from '../../components/common/Avatar.jsx';
import Loader from '../../components/common/Loader.jsx';
import FormBuilder from '../../components/crm/FormBuilder.jsx';
import FeatureGate from '../../components/entitlement/FeatureGate.jsx';
import { isValidSlug } from '../../utils/generateSlug.js';
import { SPECIALIZATIONS_LIST, LANGUAGES_LIST, FEATURE_KEYS } from '../../utils/constants.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [intakeSchema, setIntakeSchema] = useState([]);
  const [activeTab, setActiveTab] = useState('profile'); // profile | slug | intake | notifications
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Profile Form State
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [rciNumber, setRciNumber] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [location, setLocation] = useState('');
  const [selectedSpecializations, setSelectedSpecializations] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  // Slug State with Live Uniqueness Check
  const [slug, setSlug] = useState('');
  const [slugError, setSlugError] = useState('');
  const [isSlugChecking, setIsSlugChecking] = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState(true);

  // Notification Preferences
  const [notifWhatsApp, setNotifWhatsApp] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);

  // Supabase Database Integration State
  const initialSbConfig = supabaseApi.getConfig();
  const [sbUrl, setSbUrl] = useState(initialSbConfig.url);
  const [sbKey, setSbKey] = useState(initialSbConfig.key);
  const [showSbKey, setShowSbKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isCustomConfig, setIsCustomConfig] = useState(initialSbConfig.isCustom);
  const [copiedSql, setCopiedSql] = useState(false);
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [supabaseTestStatus, setSupabaseTestStatus] = useState(null);
  const [supabaseLiveBookings, setSupabaseLiveBookings] = useState([]);
  const [loadingSupabaseBookings, setLoadingSupabaseBookings] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadSettingsData() {
      try {
        const [pData, sData] = await Promise.all([
          therapistApi.getProfile(user?.id || 'therapist_sharma'),
          clientApi.getIntakeTemplate(user?.id || 'therapist_sharma')
        ]);
        if (mounted) {
          setProfile(pData);
          setIntakeSchema(sData || []);
          setName(pData.name || '');
          setTitle(pData.title || '');
          setBio(pData.bio || '');
          setRciNumber(pData.rciNumber || '');
          setQualifications(pData.qualifications || '');
          setLocation(pData.location || '');
          setSelectedSpecializations(pData.specializations || []);
          setSelectedLanguages(pData.languages || []);
          setSlug(pData.slug || '');
          setNotifWhatsApp(pData.notificationPreferences?.whatsapp !== false);
          setNotifEmail(pData.notificationPreferences?.email !== false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadSettingsData();
    return () => { mounted = false; };
  }, [user]);

  // Live Slug Validator
  const handleSlugChange = async (val) => {
    const cleaned = val.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(cleaned);

    if (!isValidSlug(cleaned)) {
      setSlugError('Must be at least 3 characters and contain only lowercase letters, numbers, and hyphens (no reserved terms).');
      setIsSlugAvailable(false);
      return;
    }

    setSlugError('');
    setIsSlugChecking(true);
    try {
      const available = await authApi.checkSlug(cleaned, user?.id || 'therapist_sharma');
      setIsSlugAvailable(available);
      if (!available) {
        setSlugError('This link slug is already taken. Please choose another.');
      }
    } finally {
      setIsSlugChecking(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updated = await therapistApi.updateProfile(user?.id || 'therapist_sharma', {
        name,
        title,
        bio,
        rciNumber,
        qualifications,
        location,
        specializations: selectedSpecializations,
        languages: selectedLanguages
      });
      updateUser({ name, title });
      showToast('Profile information successfully saved!', 'success');
    } catch (err) {
      showToast('Error saving profile: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSlug = async () => {
    if (!isSlugAvailable || slugError) return;
    setSaving(true);
    try {
      await therapistApi.updateProfile(user?.id || 'therapist_sharma', { slug });
      updateUser({ slug });
      showToast('Your branded link has been updated!', 'success');
    } catch (err) {
      showToast('Error updating link: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      await therapistApi.updateProfile(user?.id || 'therapist_sharma', {
        notificationPreferences: { whatsapp: notifWhatsApp, email: notifEmail }
      });
      showToast('Notification channels updated!', 'success');
    } finally {
      setSaving(false);
    }
  };

  const publicUrl = `${window.location.origin}/${slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    showToast('Branded link copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const SUPABASE_SQL_QUERY = `-- ========================================================
-- Unfazed Therapist Practice Management - Supabase Schema
-- Run this in your Supabase SQL Editor (SQL Editor -> New query)
-- ========================================================

-- 1. Create the 'appointments' table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    client_name TEXT NOT NULL,
    client_email TEXT,
    client_phone TEXT,
    therapist_id TEXT NOT NULL DEFAULT 'therapist_sharma',
    service_id TEXT,
    service_name TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    price_inr NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_status TEXT NOT NULL DEFAULT 'paid',
    payment_method TEXT DEFAULT 'razorpay',
    status TEXT NOT NULL DEFAULT 'confirmed',
    meet_link TEXT,
    notes TEXT
);

-- 2. Create the 'bookings' alias table for compatibility
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    client_name TEXT NOT NULL,
    client_email TEXT,
    client_phone TEXT,
    therapist_id TEXT NOT NULL DEFAULT 'therapist_sharma',
    service_id TEXT,
    service_name TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    price_inr NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_status TEXT NOT NULL DEFAULT 'paid',
    payment_method TEXT DEFAULT 'razorpay',
    status TEXT NOT NULL DEFAULT 'confirmed',
    meet_link TEXT,
    notes TEXT
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 4. Create policies so your website can insert appointments anonymously using publishable key
DROP POLICY IF EXISTS "Allow anonymous booking submissions" ON public.appointments;
CREATE POLICY "Allow anonymous booking submissions"
    ON public.appointments
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow reading appointments" ON public.appointments;
CREATE POLICY "Allow reading appointments"
    ON public.appointments
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Policies for bookings table
DROP POLICY IF EXISTS "Allow anonymous booking submissions on bookings" ON public.bookings;
CREATE POLICY "Allow anonymous booking submissions on bookings"
    ON public.bookings
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow reading bookings" ON public.bookings;
CREATE POLICY "Allow reading bookings"
    ON public.bookings
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- 5. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_appointments_therapist_time 
    ON public.appointments (therapist_id, start_time DESC);

CREATE INDEX IF NOT EXISTS idx_appointments_created_at 
    ON public.appointments (created_at DESC);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_QUERY);
    setCopiedSql(true);
    showToast('SQL setup query copied to clipboard! Paste it into your Supabase SQL Editor.', 'success', 'Query Copied');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(sbUrl);
    setCopiedUrl(true);
    showToast('Supabase URL copied to clipboard!', 'success');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(sbKey);
    setCopiedKey(true);
    showToast('Supabase Key copied to clipboard!', 'success');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSaveSbCredentials = () => {
    if (!sbUrl.trim() || !sbKey.trim()) {
      showToast('Please enter both Supabase URL and API Key', 'error');
      return;
    }
    const res = supabaseApi.setConfig(sbUrl.trim(), sbKey.trim());
    if (res.success) {
      const fresh = supabaseApi.getConfig();
      setSbUrl(fresh.url);
      setSbKey(fresh.key);
      setIsCustomConfig(true);
      showToast('Supabase credentials successfully saved & connected!', 'success', 'Connected');
      refreshSupabaseBookings();
    } else {
      showToast('Failed to save credentials: ' + res.error, 'error');
    }
  };

  const handleResetSbCredentials = () => {
    supabaseApi.resetConfig();
    const fresh = supabaseApi.getConfig();
    setSbUrl(fresh.url);
    setSbKey(fresh.key);
    setIsCustomConfig(false);
    showToast('Reset to default project credentials (jinlmpvhullytpjbcdcn)', 'info', 'Reset Complete');
    refreshSupabaseBookings();
  };

  const handleTestSupabaseInsert = async () => {
    setTestingSupabase(true);
    setSupabaseTestStatus(null);
    try {
      const testBooking = {
        clientName: 'Test Client (From Practice Settings)',
        clientEmail: 'test.client@example.com',
        clientPhone: '+91 99999 88888',
        therapistId: user?.id || 'therapist_sharma',
        serviceName: 'Psychotherapy Diagnostic Test',
        duration: 50,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 50 * 60000).toISOString(),
        priceINR: 1500,
        paymentStatus: 'paid',
        paymentDetails: { method: 'upi_test' },
        status: 'confirmed'
      };
      const res = await supabaseApi.saveAppointment(testBooking);
      if (res.success) {
        setSupabaseTestStatus({
          success: true,
          message: `Record successfully created in Supabase table "${res.table}"!`,
          data: res.data
        });
        showToast(`Saved to Supabase "${res.table}"! Check your Supabase table view.`, 'success');
        refreshSupabaseBookings();
      } else {
        setSupabaseTestStatus({
          success: false,
          message: res.error || 'Failed to insert. Make sure you executed the SQL query in Supabase first.'
        });
        showToast('Supabase insert failed. Did you run the SQL query?', 'error');
      }
    } catch (err) {
      setSupabaseTestStatus({ success: false, message: err.message });
      showToast(err.message, 'error');
    } finally {
      setTestingSupabase(false);
    }
  };

  const refreshSupabaseBookings = async () => {
    setLoadingSupabaseBookings(true);
    try {
      const records = await supabaseApi.getAppointments(10);
      setSupabaseLiveBookings(records || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSupabaseBookings(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'database') {
      refreshSupabaseBookings();
    }
  }, [activeTab]);

  if (loading) {
    return <Loader text="Loading practice configuration..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Practice Settings & Branding</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Customize your clinical bio, edit your branded link, configure automated dispatch channels, and design intake forms.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs">
        {[
          { key: 'profile', label: 'Clinical Profile' },
          { key: 'slug', label: 'Branded Link & QR' },
          { key: 'intake', label: 'Custom Intake Builder' },
          { key: 'notifications', label: 'Notification Channels' },
          { key: 'database', label: '⚡ Supabase Database' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 font-semibold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-teal-700 text-teal-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Professional Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Professional Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">RCI Registration Number</label>
              <input
                type="text"
                value={rciNumber}
                onChange={(e) => setRciNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Location / Clinic Address</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Bio & Therapy Philosophy</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Qualifications & Academic Degrees</label>
            <input
              type="text"
              value={qualifications}
              onChange={(e) => setQualifications(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700"
            />
          </div>

          {/* Languages Multi-Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Consultation Languages</label>
            <div className="flex flex-wrap gap-2 text-xs">
              {LANGUAGES_LIST.map((lang) => {
                const isSelected = selectedLanguages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setSelectedLanguages(prev => 
                        isSelected ? prev.filter(l => l !== lang) : [...prev, lang]
                      );
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-teal-700 text-white border-teal-800'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Specializations Multi-Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Areas of Clinical Specialization</label>
            <div className="flex flex-wrap gap-2 text-xs">
              {SPECIALIZATIONS_LIST.map((spec) => {
                const isSelected = selectedSpecializations.includes(spec);
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => {
                      setSelectedSpecializations(prev => 
                        isSelected ? prev.filter(s => s !== spec) : [...prev, spec]
                      );
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-teal-700 text-white border-teal-800'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {spec}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button
              variant="primary"
              size="md"
              icon={Save}
              loading={saving}
              onClick={handleSaveProfile}
              className="text-xs font-semibold"
            >
              Save Profile Changes
            </Button>
          </div>
        </div>
      )}

      {/* Tab 2: Slug & QR Card */}
      {activeTab === 'slug' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Edit Branded Link Handle</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Your branded link is your public storefront on Unfazed. Live uniqueness validation ensures no conflicts.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Custom URL Slug</label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-[#FAF8F5] overflow-hidden focus-within:ring-2 focus-within:ring-teal-700">
                <span className="px-3 text-xs text-slate-400 font-mono select-none">
                  unfazed.in/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className="flex-1 py-2 pr-3 bg-transparent text-xs font-mono font-bold text-slate-800 outline-none"
                />
              </div>

              {slugError ? (
                <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{slugError}</span>
                </p>
              ) : isSlugAvailable ? (
                <p className="text-xs text-teal-700 flex items-center gap-1 mt-1 font-medium">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>unfazed.in/{slug} is available!</span>
                </p>
              ) : null}
            </div>

            <Button
              variant="primary"
              size="sm"
              loading={saving || isSlugChecking}
              disabled={Boolean(slugError) || !isSlugAvailable}
              onClick={handleSaveSlug}
              className="text-xs font-semibold"
            >
              Update Branded Link
            </Button>
          </div>

          {/* Share Card & QR Preview */}
          <div className="bg-gradient-to-br from-teal-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-200 uppercase tracking-wider">Public Share Card</span>
                <a
                  href={`/${slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-300 hover:text-white"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="p-4 bg-white/10 rounded-2xl border border-white/15 space-y-2">
                <div className="flex items-center gap-3">
                  <Avatar src={profile?.avatar} name={name} size="md" />
                  <div>
                    <div className="font-bold text-sm text-white">{name}</div>
                    <div className="text-xs text-teal-200">{title}</div>
                  </div>
                </div>
                <div className="text-xs font-mono text-teal-300 break-all pt-1">
                  unfazed.in/{slug}
                </div>
              </div>

              {/* QR Code Mock Preview */}
              <div className="p-4 bg-white rounded-2xl flex items-center gap-4 text-slate-800">
                <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center text-white shrink-0">
                  <QrCode className="w-10 h-10" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-900">Direct Booking QR</div>
                  <div className="text-slate-500 mt-0.5">Print or display on your clinic desk or business card.</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleCopyLink}
              className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Public Link!' : 'Copy Practice Link'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Custom Intake Form Builder (Gated) */}
      {activeTab === 'intake' && (
        <FeatureGate
          featureKey={FEATURE_KEYS.CUSTOM_INTAKE_BUILDER}
          featureName="Custom Dynamic Intake Form Builder"
          showInlineLock={true}
        >
          <FormBuilder
            initialSchema={intakeSchema}
            onSaveSchema={async (newSchema) => {
              await clientApi.saveIntakeTemplate(user?.id || 'therapist_sharma', newSchema);
              setIntakeSchema(newSchema);
            }}
          />
        </FeatureGate>
      )}

      {/* Tab 4: Notifications */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 max-w-xl">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Automated Dispatch Preferences</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select which channels automatically receive 24-hr session reminders, waitlist alerts, and payment receipts.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <label className="flex items-start gap-3 p-4 bg-[#FAF8F5] rounded-2xl border border-slate-200/70 cursor-pointer">
              <input
                type="checkbox"
                checked={notifWhatsApp}
                onChange={(e) => setNotifWhatsApp(e.target.checked)}
                className="w-4 h-4 rounded text-teal-700 focus:ring-teal-700 mt-0.5"
              />
              <div>
                <span className="font-bold text-slate-900 block">WhatsApp Notifications (Primary)</span>
                <span className="text-slate-500 leading-relaxed block mt-0.5">
                  Sends instant booking confirmations, Google Meet links, and 24h reminders directly to Indian mobile numbers via WhatsApp.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 bg-[#FAF8F5] rounded-2xl border border-slate-200/70 cursor-pointer">
              <input
                type="checkbox"
                checked={notifEmail}
                onChange={(e) => setNotifEmail(e.target.checked)}
                className="w-4 h-4 rounded text-teal-700 focus:ring-teal-700 mt-0.5"
              />
              <div>
                <span className="font-bold text-slate-900 block">Email Notifications & Invoices</span>
                <span className="text-slate-500 leading-relaxed block mt-0.5">
                  Sends printable GST tax invoices, calendar invite .ics attachments, and intake forms.
                </span>
              </div>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button
              variant="primary"
              size="sm"
              icon={Save}
              loading={saving}
              onClick={handleSaveNotifications}
              className="text-xs font-semibold"
            >
              Save Notification Preferences
            </Button>
          </div>
        </div>
      )}

      {/* Tab 5: Supabase Database Integration */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Status Header */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center shrink-0">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">Supabase Backend Connected</h2>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Active & Configured
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Whenever clients book appointments through your practice link, their details are automatically saved into your Supabase database.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Play}
                  loading={testingSupabase}
                  onClick={handleTestSupabaseInsert}
                  className="text-xs font-semibold"
                >
                  Send Test Booking
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={copiedSql ? Check : Copy}
                  onClick={handleCopySql}
                  className="text-xs font-semibold"
                >
                  {copiedSql ? 'Copied SQL!' : 'Copy SQL Setup Query'}
                </Button>
              </div>
            </div>

            {/* Test Status Banner */}
            {supabaseTestStatus && (
              <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                supabaseTestStatus.success 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                {supabaseTestStatus.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">{supabaseTestStatus.success ? 'Database Sync Verified!' : 'Sync Issue'}</div>
                  <div className="mt-0.5">{supabaseTestStatus.message}</div>
                  {supabaseTestStatus.success && (
                    <div className="mt-2 text-[11px] font-mono bg-white/80 p-2 rounded-lg border border-emerald-200 text-slate-700">
                      Inserted ID: {supabaseTestStatus.data?.id} · Client: {supabaseTestStatus.data?.client_name}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Interactive Supabase Credentials Configuration Form */}
            <div className="p-6 bg-[#FAF8F5] rounded-3xl border border-slate-200/90 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-100/80 text-teal-800 flex items-center justify-center">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Supabase Connection Credentials</h3>
                    <p className="text-[11px] text-slate-500">
                      Add or modify your Supabase Project URL and Publishable API Key below.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isCustomConfig && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      Custom Credentials Active
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleResetSbCredentials}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-slate-200 transition-colors"
                    title="Reset to default project credentials"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset to Default</span>
                  </button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Save}
                    onClick={handleSaveSbCredentials}
                    className="text-xs font-semibold"
                  >
                    Save & Apply
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                {/* Supabase URL */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700">Supabase Project URL</label>
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold inline-flex items-center gap-1"
                    >
                      {copiedUrl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={sbUrl}
                    onChange={(e) => setSbUrl(e.target.value)}
                    placeholder="https://your-project-id.supabase.co"
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700 shadow-2xs"
                  />
                  <p className="text-[10px] text-slate-400">
                    Find this in your Supabase Dashboard: Settings &rarr; API &rarr; Project URL
                  </p>
                </div>

                {/* Supabase API Key */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700">Supabase Publishable / Anon Key</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowSbKey(!showSbKey)}
                        className="text-[11px] text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1"
                      >
                        {showSbKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showSbKey ? 'Hide' : 'Show'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyKey}
                        className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold inline-flex items-center gap-1"
                      >
                        {copiedKey ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type={showSbKey ? 'text' : 'password'}
                      value={sbKey}
                      onChange={(e) => setSbKey(e.target.value)}
                      placeholder="sb_publishable_... or eyJhbGciOi..."
                      className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700 shadow-2xs pr-10"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Find this in your Supabase Dashboard: Settings &rarr; API &rarr; Project API keys (anon public)
                  </p>
                </div>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="p-5 bg-teal-50/60 rounded-2xl border border-teal-200/80 space-y-3 text-xs">
              <div className="font-bold text-teal-950 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-teal-800" />
                <span>How to run the SQL query in Supabase (1-minute setup):</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-teal-900/90 leading-relaxed text-xs">
                <li>Log in to your <strong>Supabase Dashboard</strong> at <a href="https://supabase.com/dashboard/project/jinlmpvhullytpjbcdcn" target="_blank" rel="noreferrer" className="underline font-semibold hover:text-teal-950">supabase.com/dashboard/project/jinlmpvhullytpjbcdcn <ExternalLink className="w-3 h-3 inline" /></a></li>
                <li>In the left sidebar, click on <strong>SQL Editor</strong>.</li>
                <li>Click <strong>New Query</strong>, paste the query below, and click <strong>Run</strong> (or press Ctrl + Enter / Cmd + Enter).</li>
                <li>That's it! Your <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-[11px]">appointments</code> table and Row Level Security permissions are ready.</li>
              </ol>
            </div>

            {/* SQL Query Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-teal-700" />
                  <span>SQL Query (Creates tables & RLS policies)</span>
                </label>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 hover:text-teal-950 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200"
                >
                  {copiedSql ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSql ? 'Copied to Clipboard' : 'Copy Query'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-72 leading-relaxed selection:bg-teal-700">
                  {SUPABASE_SQL_QUERY}
                </pre>
              </div>
            </div>

            {/* Live Synced Bookings in Supabase */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Live Synced Appointments from Supabase
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Real-time records stored in your cloud database table.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  loading={loadingSupabaseBookings}
                  onClick={refreshSupabaseBookings}
                  className="text-[11px]"
                >
                  Refresh Data
                </Button>
              </div>

              {loadingSupabaseBookings ? (
                <div className="py-6 text-center text-xs text-slate-400">Fetching records from Supabase...</div>
              ) : supabaseLiveBookings.length === 0 ? (
                <div className="p-6 bg-[#FAF8F5] rounded-2xl border border-slate-200 text-center space-y-2">
                  <p className="text-xs font-semibold text-slate-600">No appointments in Supabase table yet</p>
                  <p className="text-[11px] text-slate-400">
                    Click <strong>"Send Test Booking"</strong> above or book an appointment on your public profile to see records appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F5] border-b border-slate-200 text-slate-500 font-semibold">
                      <tr>
                        <th className="px-4 py-2.5">Client Name</th>
                        <th className="px-4 py-2.5">Service</th>
                        <th className="px-4 py-2.5">Date & Time</th>
                        <th className="px-4 py-2.5">Amount</th>
                        <th className="px-4 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {supabaseLiveBookings.map((b, idx) => (
                        <tr key={b.id || idx} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-bold text-slate-900">{b.client_name}</td>
                          <td className="px-4 py-3 text-slate-600">{b.service_name}</td>
                          <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                            {b.start_time ? new Date(b.start_time).toLocaleString('en-IN') : '-'}
                          </td>
                          <td className="px-4 py-3 font-bold text-teal-900 font-mono">₹{b.price_inr}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                              {b.status || 'confirmed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
