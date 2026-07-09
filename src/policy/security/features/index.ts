export * from './types';
export * from './catalog';
export * from './featureAccess';
export * from './useFeatureAccess';
// Phase 2E: FeatureGate / PermissionGate / FeatureRouteGuard / RolloutPhaseBadge
// were re-exported but never shipped. Removed so the barrel type-checks.
// Prefer canViewFeature / useFeatureAccess until real gate components land.
