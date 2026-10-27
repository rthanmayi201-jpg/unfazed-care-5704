import React, { useState } from 'react';
import { Sparkles, Check, ShieldCheck, Zap } from 'lucide-react';
import { useEntitlement } from '../../hooks/useEntitlement.js';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import Loader from '../../components/common/Loader.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { FEATURE_KEYS } from '../../utils/constants.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function Plans() {
  const { tierConfig, userTierKey, upgrade, loading } = useEntitlement();
  const { showToast } = useToast();
  const [upgradingKey, setUpgradingKey] = useState(null);

  if (loading || !tierConfig) {
    return <Loader text="Loading plan and subscription entitlements..." />;
  }

  const tiers = tierConfig.tiers || {};

  const handleUpgrade = async (key) => {
    setUpgradingKey(key);
    try {
      await upgrade(key);
      showToast(`Practice upgraded to ${tiers[key]?.name}!`, 'success', 'Plan Activated');
    } catch (err) {
      showToast('Upgrade simulation failed: ' + err.message, 'error');
    } finally {
      setUpgradingKey(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center space-y-2">
        <Badge variant="pro" size="sm" className="uppercase font-semibold">
          Transparent Practice Plans
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Scale Your Independent Private Practice
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          Dynamic entitlement caps and feature access adapt instantly. Simulated with Razorpay Test Mode.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {Object.entries(tiers).map(([key, t]) => {
          const isCurrent = userTierKey === key;
          const isPro = key === 'pro';
          const isPremium = key === 'premium';

          return (
            <div
              key={key}
              className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all ${
                isCurrent
                  ? 'bg-white border-2 border-teal-700 shadow-lg ring-4 ring-teal-50'
                  : isPro
                  ? 'bg-white border border-purple-200 shadow-md relative'
                  : 'bg-white border border-slate-200 shadow-xs'
              }`}
            >
              {isPro && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-700 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-xs">
                  Most Popular for Therapists
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-base text-slate-900">{t.name}</h3>
                  {isCurrent && (
                    <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60">
                      Current
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
                    {t.priceINR === 0 ? 'Free' : formatCurrency(t.priceINR)}
                  </span>
                  <span className="text-xs text-slate-500 ml-1.5">/{t.billingCycle}</span>
                </div>

                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  {t.description}
                </p>

                <div className="space-y-3 text-xs border-t border-slate-100 pt-5">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Check className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>
                      Active Client Cap: <strong>{t.limits?.[FEATURE_KEYS.ACTIVE_CLIENT_CAP] || 'Unlimited'}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700">
                    <Check className={`w-4 h-4 ${t.features?.[FEATURE_KEYS.NOTE_TEMPLATES] ? 'text-teal-600' : 'text-slate-300'}`} />
                    <span className={t.features?.[FEATURE_KEYS.NOTE_TEMPLATES] ? '' : 'text-slate-400 line-through'}>
                      SOAP & DAP Clinical Templates
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700">
                    <Check className={`w-4 h-4 ${t.features?.[FEATURE_KEYS.PACKAGES_BUILDER] ? 'text-teal-600' : 'text-slate-300'}`} />
                    <span className={t.features?.[FEATURE_KEYS.PACKAGES_BUILDER] ? '' : 'text-slate-400 line-through'}>
                      Session Packages Builder
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700">
                    <Check className={`w-4 h-4 ${t.features?.[FEATURE_KEYS.CUSTOM_INTAKE_BUILDER] ? 'text-teal-600' : 'text-slate-300'}`} />
                    <span className={t.features?.[FEATURE_KEYS.CUSTOM_INTAKE_BUILDER] ? '' : 'text-slate-400 line-through'}>
                      Custom Dynamic Intake Builder
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700">
                    <Check className={`w-4 h-4 ${t.features?.[FEATURE_KEYS.ADVANCED_ANALYTICS] ? 'text-teal-600' : 'text-slate-300'}`} />
                    <span className={t.features?.[FEATURE_KEYS.ADVANCED_ANALYTICS] ? '' : 'text-slate-400 line-through'}>
                      Deep Financial & Cohort Analytics
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100">
                {isCurrent ? (
                  <Button variant="outline" size="sm" className="w-full text-slate-400" disabled>
                    Active Plan
                  </Button>
                ) : (
                  <Button
                    variant={isPremium ? 'accent' : 'primary'}
                    size="sm"
                    loading={upgradingKey === key}
                    onClick={() => handleUpgrade(key)}
                    className="w-full text-xs font-bold"
                  >
                    <span>Switch to {t.name.split(' ')[0]}</span>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 text-xs text-slate-500 text-center flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
        <span>All plans include Razorpay UPI/Netbanking payments, encrypted Google Meet links, and automated WhatsApp/email reminders.</span>
      </div>
    </div>
  );
}
