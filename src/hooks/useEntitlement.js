import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { entitlementApi } from '../api/index.js';
import { checkFeatureAccess, getFeatureLimit, isFeatureWithinLimit } from '../utils/entitlement.js';

export function useEntitlement() {
  const { user, updateUser } = useAuth();
  const [tierConfig, setTierConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchConfig = useCallback(async () => {
    try {
      const config = await entitlementApi.getTierConfig();
      setTierConfig(config);
    } catch (err) {
      console.error('Failed to load tier config', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const userTierKey = user?.tier || 'free';

  const canAccess = useCallback((featureKey) => {
    return checkFeatureAccess(tierConfig, userTierKey, featureKey);
  }, [tierConfig, userTierKey]);

  const getLimit = useCallback((featureKey) => {
    return getFeatureLimit(tierConfig, userTierKey, featureKey);
  }, [tierConfig, userTierKey]);

  const isWithinLimit = useCallback((featureKey, currentUsage) => {
    return isFeatureWithinLimit(tierConfig, userTierKey, featureKey, currentUsage);
  }, [tierConfig, userTierKey]);

  const upgrade = async (targetTierKey) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const updated = await entitlementApi.upgradeTier(user.id, targetTierKey);
      updateUser({ tier: targetTierKey });
      return updated;
    } finally {
      setLoading(false);
    }
  };

  const currentTierDetails = tierConfig?.tiers?.[userTierKey] || null;

  return {
    tierConfig,
    userTierKey,
    currentTierDetails,
    canAccess,
    getLimit,
    isWithinLimit,
    upgrade,
    loading,
    refreshConfig: fetchConfig
  };
}
