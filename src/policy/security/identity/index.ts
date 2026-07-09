export * from './types';
export * from './permissionCatalog';
export * from './userGroups';
export * from './roleAssignments';
export * from './separationOfDuties';
export * from './demoUsers';
export * from './identityNormalization';
export * from './authorize';
export * from './access';
// Phase 2E: AccessDeniedPage / AdminRouteGuard / PageAccessRouteGuard / PageAccessMatrix
// were re-exported here but never shipped as modules. Removed so the barrel type-checks.
// Wire guards in a later pass when real components land (or Phase 2F).
export * from './pageAccessTypes';
export * from './pageRegistry';
export * from './pageAccessStore';
export * from './pageAccess';
// Phase 2A — user setup assignments (journey-shaped fields on identity User)
export * from './userSetupAssignments';
// Phase 2E audit helpers first (types/label); store re-exports a subset carefully.
export * from './userSetupAudit';
export * from './userAssignmentsStore';
