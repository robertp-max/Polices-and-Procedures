/**
 * Public surface for the access subsystem.
 */
export { decide, type AccessRequest, type AccessDecision, CANONICAL_ACTIONS } from './pdp.js';
export { requirePermission, authorize, type ResourceLoader, type PepOptions } from './pep.js';
export { ROLE_BUNDLES, ACCESS_POLICY_VERSION, effectivePermissions, type PermissionBundle } from './bundles.js';
export { SOD_RULES, type SodRule } from './sod.js';
export { evaluateAbac, type ConstraintViolation } from './attributes.js';
