/** Administrator standalone corrected modules rendered inside the shared Journey player shell. */
import type { ComponentType } from 'react';
import ADM001 from './ADM-001';
import ADM002 from './ADM-002';
import ADM003 from './ADM-003';
import ADM004 from './ADM-004';
import ADM005 from './ADM-005';
import ADM006 from './ADM-006';
import ADM007 from './ADM-007';
import ADM008 from './ADM-008';
import ADM009 from './ADM-009';
import ADM010 from './ADM-010';
import ADM011 from './ADM-011';
import ADM012 from './ADM-012';
import ADM013 from './ADM-013';
import ADM014 from './ADM-014';
import ADM015 from './ADM-015';

export const ADM_STANDALONE_MODULE_IDS = [
  'ADM-001',
  'ADM-002',
  'ADM-003',
  'ADM-004',
  'ADM-005',
  'ADM-006',
  'ADM-007',
  'ADM-008',
  'ADM-009',
  'ADM-010',
  'ADM-011',
  'ADM-012',
  'ADM-013',
  'ADM-014',
  'ADM-015',
] as const;

export type AdmStandaloneModuleId = (typeof ADM_STANDALONE_MODULE_IDS)[number];

const REGISTRY: Record<AdmStandaloneModuleId, ComponentType> = {
  'ADM-001': ADM001,
  'ADM-002': ADM002,
  'ADM-003': ADM003,
  'ADM-004': ADM004,
  'ADM-005': ADM005,
  'ADM-006': ADM006,
  'ADM-007': ADM007,
  'ADM-008': ADM008,
  'ADM-009': ADM009,
  'ADM-010': ADM010,
  'ADM-011': ADM011,
  'ADM-012': ADM012,
  'ADM-013': ADM013,
  'ADM-014': ADM014,
  'ADM-015': ADM015,
};

function normalizeAdmId(moduleId: string): AdmStandaloneModuleId | null {
  const id = moduleId.trim().toUpperCase();
  const match = id.match(/^ADM-?(0(?:0[1-9]|1[0-5]))$/);
  if (!match) return null;
  return `ADM-${match[1]}` as AdmStandaloneModuleId;
}

export function isAdmStandaloneModule(moduleId: string | undefined | null): moduleId is AdmStandaloneModuleId {
  return Boolean(moduleId && normalizeAdmId(moduleId));
}

export function getAdmStandaloneModule(moduleId: string): ComponentType | null {
  const id = normalizeAdmId(moduleId);
  if (!id) return null;
  const component = REGISTRY[id];
  const resolved = (component as unknown as { default?: ComponentType })?.default ?? component;
  return typeof resolved === 'function' ? resolved : component;
}
