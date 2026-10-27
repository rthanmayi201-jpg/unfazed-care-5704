import React, { useState } from 'react';
import { MapPin, ShieldCheck, Clock, Globe, Share2, Check, Calendar } from 'lucide-react';
import Avatar from '../common/Avatar.jsx';
import Button from '../common/Button.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function Hero({ therapist, onBookClick }) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    showToast('Profile link copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs relative overflow-hidden">
      {/* Subtle calm ambient gradient wash */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-50/60 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6 sm:gap-8 justify-between">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Avatar
            src={therapist.avatar}
            name={therapist.name}
            size="xl"
            className="w-24 h-24 sm:w-28 sm:h-28 ring-4 ring-teal-50 shadow-md"
          />

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {therapist.name}
              </h1>
              {therapist.rciNumber && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                  <span>{therapist.rciNumber}</span>
                </span>
              )}
            </div>

            <p className="text-sm sm:text-base font-medium text-teal-800 mb-2">
              {therapist.title}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              {therapist.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{therapist.location}</span>
                </div>
              )}
              {therapist.experienceYears && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{therapist.experienceYears}+ years clinical experience</span>
                </div>
              )}
              {therapist.languages && therapist.languages.length > 0 && (
                <div className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>{therapist.languages.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
          <Button
            variant="outline"
            size="md"
            icon={copied ? Check : Share2}
            onClick={handleShare}
            className="w-full sm:w-auto text-xs"
          >
            {copied ? 'Link Copied' : 'Share Profile'}
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={Calendar}
            onClick={onBookClick}
            className="w-full sm:w-auto font-semibold shadow-md shadow-teal-900/10 text-sm"
          >
            Book a Session
          </Button>
        </div>
      </div>
    </section>
  );
}
