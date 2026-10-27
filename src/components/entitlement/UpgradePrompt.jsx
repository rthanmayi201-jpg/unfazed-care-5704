import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { useEntitlement } from '../../hooks/useEntitlement.js';
import { useToast } from '../../context/ToastContext.jsx';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { FEATURE_KEYS } from '../../utils/constants.js';

export default function UpgradePrompt({
  isOpen,
  onClose,
  featureName = 'This feature',
  featureKey = null
}) {
  const { tierConfig, userTierKey, upgrade } = useEntitlement();
  const { showToast } = useToast();
  const [upgrading, setUpgrading] = useState(false);
  const [selectedTier, setSelectedTier] = useState('pro');

  if (!tierConfig) return null;

  const tiers = tierConfig.tiers || {};

  const handleSimulateUpgrade = async (targetTierKey) => {
    setUpgrading(true);
    try {
      await upgrade(targetTierKey);
      showToast(`Practice upgraded successfully to ${tiers[targetTierKey]?.name}!`, 'success', 'Plan Upgraded');
      onClose();
    } catch (err) {
      showToast('Upgrade simulation failed: ' + err.message, 'error');
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      title="Unlock Practice Power"
      subtitle={`${featureName} requires a plan upgrade. Compare tiers and activate instantly.`}
    >
      <div className="space-y-6">
        {/* Tier comparison grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.entries(tiers).map(([key, t]) => {
            const isCurrent = userTierKey === key;
            const isPro = key === 'pro';
            const isPremium = key === 'premium';

            return (
              <div
                key={key}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'border-teal-700 bg-teal-50/40 ring-1 ring-teal-700'
                    : isPro
                    ? 'border-purple-200 bg-purple-50/20'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-slate-800">{t.name}</span>
                    {isCurrent && (
                      <span className="text-[10px] bg-teal-700 text-white px-2 py-0.5 rounded-full font-bold">
                        Active
                      </span>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <span className="text-xl font-bold text-slate-900 font-mono tabular-nums">
                      {t.priceINR === 0 ? 'Free' : formatCurrency(t.priceINR)}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">/{t.billingCycle}</span>
                  </div>

                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">{t.description}</p>

                  <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>
                        Active Clients: <strong>{t.limits?.[FEATURE_KEYS.ACTIVE_CLIENT_CAP] || 'Unlimited'}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Check className={`w-3.5 h-3.5 ${t.features?.[FEATURE_KEYS.NOTE_TEMPLATES] ? 'text-teal-600' : 'text-slate-300'}`} />
                      <span className={t.features?.[FEATURE_KEYS.NOTE_TEMPLATES] ? '' : 'text-slate-400 line-through'}>
                        SOAP & DAP Notes
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Check className={`w-3.5 h-3.5 ${t.features?.[FEATURE_KEYS.PACKAGES_BUILDER] ? 'text-teal-600' : 'text-slate-300'}`} />
                      <span className={t.features?.[FEATURE_KEYS.PACKAGES_BUILDER] ? '' : 'text-slate-400 line-through'}>
                        Session Packages
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Check className={`w-3.5 h-3.5 ${t.features?.[FEATURE_KEYS.CUSTOM_INTAKE_BUILDER] ? 'text-teal-600' : 'text-slate-300'}`} />
                      <span className={t.features?.[FEATURE_KEYS.CUSTOM_INTAKE_BUILDER] ? '' : 'text-slate-400 line-through'}>
                        Custom Intake Builder
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Check className={`w-3.5 h-3.5 ${t.features?.[FEATURE_KEYS.ADVANCED_ANALYTICS] ? 'text-teal-600' : 'text-slate-300'}`} />
                      <span className={t.features?.[FEATURE_KEYS.ADVANCED_ANALYTICS] ? '' : 'text-slate-400 line-through'}>
                        Deep Analytics & Trends
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3">
                  {isCurrent ? (
                    <Button variant="outline" size="sm" className="w-full text-slate-400" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      variant={isPremium ? 'accent' : 'primary'}
                      size="sm"
                      loading={upgrading}
                      className="w-full text-xs"
                      onClick={() => handleSimulateUpgrade(key)}
                    >
                      <span>Upgrade to {t.name.split(' ')[0]}</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Instant sandbox activation via Razorpay test mock. Cancel or downgrade anytime.</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Maybe Later
          </Button>
        </div>
      </div>
    </Modal>
  );
}
