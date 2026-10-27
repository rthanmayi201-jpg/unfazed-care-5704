import React from 'react';
import { useEntitlement } from '../../hooks/useEntitlement.js';
import Badge from '../common/Badge.jsx';

export default function TierBadge({ showUpgradeLink = false, onUpgradeClick }) {
  const { currentTierDetails, userTierKey } = useEntitlement();

  const tierName = currentTierDetails?.name?.split(' ')[0] || userTierKey.toUpperCase();

  const badgeVariant = userTierKey === 'premium' ? 'premium' : userTierKey === 'pro' ? 'pro' : 'free';

  return (
    <div className="inline-flex items-center gap-1.5">
      <Badge variant={badgeVariant} size="xs" className="uppercase font-semibold">
        {tierName}
      </Badge>
      {showUpgradeLink && userTierKey !== 'premium' && (
        <button
          onClick={onUpgradeClick}
          className="text-[11px] text-purple-700 hover:text-purple-800 font-semibold underline underline-offset-2 ml-1"
        >
          Upgrade
        </button>
      )}
    </div>
  );
}
