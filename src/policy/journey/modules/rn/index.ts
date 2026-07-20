/** RN standalone corrected modules rendered inside the shared Journey player shell. */
import type { ComponentType } from 'react';
import RN001 from './RN-001';
import RN002 from './RN-002';
import RN003 from './RN-003';
import RN004 from './RN-004';
import RN005 from './RN-005';
import RN006 from './RN-006';
import RN007 from './RN-007';
import RN008 from './RN-008';
import RN009 from './RN-009';
import RN010 from './RN-010';
import RN011 from './RN-011';
import RN012 from './RN-012';
import RN013 from './RN-013';
import RN014 from './RN-014';
import RN015 from './RN-015';
import RNSUP from './RN-SUP';

export const RN_STANDALONE_MODULE_IDS = [
  'RN-001',
  'RN-002',
  'RN-003',
  'RN-004',
  'RN-005',
  'RN-006',
  'RN-007',
  'RN-008',
  'RN-009',
  'RN-010',
  'RN-011',
  'RN-012',
  'RN-013',
  'RN-014',
  'RN-015',
  'RN-SUP',
] as const;

export type RnStandaloneModuleId = (typeof RN_STANDALONE_MODULE_IDS)[number];

const REGISTRY: Record<RnStandaloneModuleId, ComponentType> = {
  'RN-001': RN001,
  'RN-002': RN002,
  'RN-003': RN003,
  'RN-004': RN004,
  'RN-005': RN005,
  'RN-006': RN006,
  'RN-007': RN007,
  'RN-008': RN008,
  'RN-009': RN009,
  'RN-010': RN010,
  'RN-011': RN011,
  'RN-012': RN012,
  'RN-013': RN013,
  'RN-014': RN014,
  'RN-015': RN015,
  'RN-SUP': RNSUP,
};

function normalizeRnId(moduleId: string): RnStandaloneModuleId | null {
  const id = moduleId.trim().toUpperCase();
  if (id === 'RN-SUP') return 'RN-SUP';
  const match = id.match(/^RN-?(0(?:0[1-9]|1[0-5]))$/);
  if (!match) return null;
  return `RN-${match[1]}` as RnStandaloneModuleId;
}

export function isRnStandaloneModule(moduleId: string | undefined | null): moduleId is RnStandaloneModuleId {
  return Boolean(moduleId && normalizeRnId(moduleId));
}

export function getRnStandaloneModule(moduleId: string): ComponentType | null {
  const id = normalizeRnId(moduleId);
  if (!id) return null;
  const component = REGISTRY[id];
  const resolved = (component as unknown as { default?: ComponentType })?.default ?? component;
  return typeof resolved === 'function' ? resolved : component;
}
