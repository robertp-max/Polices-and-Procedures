/** Director of Nursing standalone corrected modules rendered inside the shared Journey player shell. */
import type { ComponentType } from 'react';
import DON001 from './DON-001';
import DON002 from './DON-002';
import DON003 from './DON-003';
import DON004 from './DON-004';
import DON005 from './DON-005';
import DON006 from './DON-006';
import DON007 from './DON-007';
import DON008 from './DON-008';
import DON009 from './DON-009';
import DON010 from './DON-010';
import DON011 from './DON-011';
import DON012 from './DON-012';
import DON013 from './DON-013';
import DON014 from './DON-014';
import DON015 from './DON-015';
import DON016 from './DON-016';
import DON017 from './DON-017';
import DON018 from './DON-018';
import DON019 from './DON-019';
import DON020 from './DON-020';
import DON021 from './DON-021';

export const DON_STANDALONE_MODULE_IDS = [
  'DON-001',
  'DON-002',
  'DON-003',
  'DON-004',
  'DON-005',
  'DON-006',
  'DON-007',
  'DON-008',
  'DON-009',
  'DON-010',
  'DON-011',
  'DON-012',
  'DON-013',
  'DON-014',
  'DON-015',
  'DON-016',
  'DON-017',
  'DON-018',
  'DON-019',
  'DON-020',
  'DON-021',
] as const;

export type DonStandaloneModuleId = (typeof DON_STANDALONE_MODULE_IDS)[number];

const REGISTRY: Record<DonStandaloneModuleId, ComponentType> = {
  'DON-001': DON001,
  'DON-002': DON002,
  'DON-003': DON003,
  'DON-004': DON004,
  'DON-005': DON005,
  'DON-006': DON006,
  'DON-007': DON007,
  'DON-008': DON008,
  'DON-009': DON009,
  'DON-010': DON010,
  'DON-011': DON011,
  'DON-012': DON012,
  'DON-013': DON013,
  'DON-014': DON014,
  'DON-015': DON015,
  'DON-016': DON016,
  'DON-017': DON017,
  'DON-018': DON018,
  'DON-019': DON019,
  'DON-020': DON020,
  'DON-021': DON021,
};

function normalizeDonId(moduleId: string): DonStandaloneModuleId | null {
  const id = moduleId.trim().toUpperCase();
  const match = id.match(/^DON-?(0(?:0[1-9]|1\d|2[0-1]))$/);
  if (!match) return null;
  return `DON-${match[1]}` as DonStandaloneModuleId;
}

export function isDonStandaloneModule(moduleId: string | undefined | null): moduleId is DonStandaloneModuleId {
  return Boolean(moduleId && normalizeDonId(moduleId));
}

export function getDonStandaloneModule(moduleId: string): ComponentType | null {
  const id = normalizeDonId(moduleId);
  if (!id) return null;
  const component = REGISTRY[id];
  const resolved = (component as unknown as { default?: ComponentType })?.default ?? component;
  return typeof resolved === 'function' ? resolved : component;
}
