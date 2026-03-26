export const PLAN_LIMITS = {
  free: {
    maxLegacyShares: 1,
    canShareVaults: false,
    prioritySupport: false
  },
  premium: {
    maxLegacyShares: Infinity,
    canShareVaults: false,
    prioritySupport: true
  },
  premium_plus: {
    maxLegacyShares: Infinity,
    canShareVaults: true,
    prioritySupport: true
  }
};

export function getFeatureLimits(status = 'free') {
  return PLAN_LIMITS[status] || PLAN_LIMITS.free;
}
