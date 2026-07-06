/**
 * OASIS-E2 SOC module registration — OWNED BY THE OASIS MODULE.
 *
 * This deliberately does NOT go through the shared advanced-training
 * contract (isAdvancedModule / getAdvancedVariant): several agents edit
 * those shared files for other modules (CMS-485, QAPI, Documentation), and
 * a regression there previously broke this route with "Unknown module".
 * ModulePlayerScreen checks this module FIRST, so OASIS-E2 SOC keeps
 * working regardless of changes to the shared contract.
 */

export const OASIS_SOC_MODULE_IDS = ['oasis-e2-soc', 'rn-adv-03', 'gao-03'] as const;

export const OASIS_SOC_MODULE_TITLE = 'OASIS-E2 Start of Care Assessment';

export function isOasisSocModule(moduleId?: string | null): boolean {
  if (!moduleId) return false;
  return (OASIS_SOC_MODULE_IDS as readonly string[]).includes(moduleId.toLowerCase());
}
