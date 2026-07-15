/**
 * LVN standalone V5 modules (SC04-style full players).
 * Source of truth builds live in /LVN_V5_UPDATED; these are the app-wired copies.
 */
import type { ComponentType } from 'react';
import LVN001 from './LVN-001';
import LVN002 from './LVN-002';
import LVN003 from './LVN-003';
import LVN004 from './LVN-004';
import LVN005 from './LVN-005';
import LVN006 from './LVN-006';
import LVN007 from './LVN-007';
import LVN008 from './LVN-008';
import LVN009 from './LVN-009';
import LVN010 from './LVN-010';
import LVN011 from './LVN-011';
import LVN012 from './LVN-012';
import LVNSUP from './LVN-SUP';

export const LVN_STANDALONE_MODULE_IDS = [
  'LVN-001',
  'LVN-002',
  'LVN-003',
  'LVN-004',
  'LVN-005',
  'LVN-006',
  'LVN-007',
  'LVN-008',
  'LVN-009',
  'LVN-010',
  'LVN-011',
  'LVN-012',
  'LVN-SUP',
] as const;

export type LvnStandaloneModuleId = (typeof LVN_STANDALONE_MODULE_IDS)[number];

const REGISTRY: Record<LvnStandaloneModuleId, ComponentType> = {
  'LVN-001': LVN001,
  'LVN-002': LVN002,
  'LVN-003': LVN003,
  'LVN-004': LVN004,
  'LVN-005': LVN005,
  'LVN-006': LVN006,
  'LVN-007': LVN007,
  'LVN-008': LVN008,
  'LVN-009': LVN009,
  'LVN-010': LVN010,
  'LVN-011': LVN011,
  'LVN-012': LVN012,
  'LVN-SUP': LVNSUP,
};

function normalizeLvnId(moduleId: string): LvnStandaloneModuleId | null {
  const id = moduleId.trim().toUpperCase();
  if (id === 'LVN-SUP') return 'LVN-SUP';
  // Accept LVN-001 … LVN-012 (and rare LVN001 form)
  const m = id.match(/^LVN-?(0(?:0[1-9]|1[0-2]))$/);
  if (!m) return null;
  return `LVN-${m[1]}` as LvnStandaloneModuleId;
}

/** True for LVN-001…LVN-012 and LVN-SUP (V5 standalone players). */
export function isLvnStandaloneModule(moduleId: string | undefined | null): moduleId is LvnStandaloneModuleId {
  if (!moduleId) return false;
  return normalizeLvnId(moduleId) != null;
}

export function getLvnStandaloneModule(moduleId: string): ComponentType | null {
  const id = normalizeLvnId(moduleId);
  if (!id) return null;
  const Comp = REGISTRY[id];
  if (!Comp) return null;
  // Some interop shapes wrap default export
  const resolved = (Comp as unknown as { default?: ComponentType })?.default ?? Comp;
  return typeof resolved === 'function' ? resolved : Comp;
}
