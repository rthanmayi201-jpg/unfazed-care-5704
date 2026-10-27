import React, { useState } from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { useEntitlement } from '../../hooks/useEntitlement.js';
import UpgradePrompt from './UpgradePrompt.jsx';
import Button from '../common/Button.jsx';

export default function FeatureGate({
  featureKey,
  featureName = 'This feature',
  currentUsage = null,
  fallback = null,
  showInlineLock = false,
  children
}) {
  const { canAccess, isWithinLimit, loading } = useEntitlement();
  const [showPrompt, setShowPrompt] = useState(false);

  if (loading) {
    return <div className="opacity-50 pointer-events-none">{children}</div>;
  }

  const hasAccess = canAccess(featureKey);
  const withinLimit = currentUsage !== null ? isWithinLimit(featureKey, currentUsage) : true;
  const isAllowed = hasAccess && withinLimit;

  if (isAllowed) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showInlineLock) {
    return (
      <>
        <div className="relative rounded-2xl border border-dashed border-purple-200 bg-purple-50/30 p-6 text-center">
          <div className="mx-auto w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 mb-2.5">
            <Lock className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold text-slate-800">{featureName} is locked</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
            Upgrade your practice plan to unlock {featureName.toLowerCase()} and scale your workflows.
          </p>
          <Button
            variant="secondary"
            size="sm"
            icon={Sparkles}
            onClick={() => setShowPrompt(true)}
            className="text-xs text-purple-900 border-purple-200"
          >
            Compare & Upgrade Plan
          </Button>
        </div>
        <UpgradePrompt
          isOpen={showPrompt}
          onClose={() => setShowPrompt(false)}
          featureName={featureName}
          featureKey={featureKey}
        />
      </>
    );
  }

  // Wrapped children with click interceptor
  return (
    <>
      <div 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowPrompt(true);
        }}
        className="cursor-pointer group relative"
      >
        <div className="pointer-events-none opacity-60 filter grayscale-30">
          {children}
        </div>
        <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-slate-900/10 rounded-xl flex items-center justify-center transition-all">
          <div className="bg-white/95 px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 text-xs font-semibold text-purple-800 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-purple-600" />
            <span>Upgrade to unlock {featureName}</span>
          </div>
        </div>
      </div>
      <UpgradePrompt
        isOpen={showPrompt}
        onClose={() => setShowPrompt(false)}
        featureName={featureName}
        featureKey={featureKey}
      />
    </>
  );
}
