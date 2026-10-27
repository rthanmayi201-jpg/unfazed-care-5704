import { FEATURE_KEYS } from './constants.js';

/**
 * Central entitlement evaluator
 * Tiers, caps, prices, and feature flags are strictly read from the fetched SubscriptionTierConfig.
 */
export function checkFeatureAccess(tierConfig, userTierKey, featureKey) {
  if (!tierConfig || !userTierKey) return false;
  const currentTier = tierConfig.tiers?.[userTierKey];
  if (!currentTier) return false;

  const features = currentTier.features || {};
  return Boolean(features[featureKey]);
}

export function getFeatureLimit(tierConfig, userTierKey, featureKey) {
  if (!tierConfig || !userTierKey) return 0;
  const currentTier = tierConfig.tiers?.[userTierKey];
  if (!currentTier) return 0;

  const limits = currentTier.limits || {};
  return limits[featureKey] !== undefined ? limits[featureKey] : Infinity;
}

export function isFeatureWithinLimit(tierConfig, userTierKey, featureKey, currentUsage) {
  const limit = getFeatureLimit(tierConfig, userTierKey, featureKey);
  if (limit === Infinity) return true;
  return Number(currentUsage) < limit;
}
