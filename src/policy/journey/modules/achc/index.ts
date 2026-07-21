/** ACHC annual-training PASS5 modules rendered inside the shared Journey player shell. */
import type { ComponentType } from 'react';
import ACHCARTM01 from './m01/ACHC-ART-M01';
import ACHCARTM02 from './m02/ACHC-ART-M02';
import ACHCARTM03 from './m03/ACHC-ART-M03';
import ACHCARTM04 from './m04/ACHC-ART-M04';
import ACHCARTM05 from './m05/ACHC-ART-M05';
import ACHCARTM06 from './m06/ACHC-ART-M06';
import ACHCARTM07 from './m07/ACHC-ART-M07';
import ACHCARTM08 from './m08/ACHC-ART-M08';
import ACHCARTM09 from './m09/ACHC-ART-M09';
import ACHCARTM10 from './m10/ACHC-ART-M10';
import ACHCARTM11 from './m11/ACHC-ART-M11';
import ACHCARTM12 from './m12/ACHC-ART-M12';

export const ACHC_STANDALONE_MODULE_IDS = [
  'ACHC-ART-M01',
  'ACHC-ART-M02',
  'ACHC-ART-M03',
  'ACHC-ART-M04',
  'ACHC-ART-M05',
  'ACHC-ART-M06',
  'ACHC-ART-M07',
  'ACHC-ART-M08',
  'ACHC-ART-M09',
  'ACHC-ART-M10',
  'ACHC-ART-M11',
  'ACHC-ART-M12',
] as const;

export type AchcStandaloneModuleId = (typeof ACHC_STANDALONE_MODULE_IDS)[number];

const REGISTRY: Record<AchcStandaloneModuleId, ComponentType> = {
  'ACHC-ART-M01': ACHCARTM01,
  'ACHC-ART-M02': ACHCARTM02,
  'ACHC-ART-M03': ACHCARTM03,
  'ACHC-ART-M04': ACHCARTM04,
  'ACHC-ART-M05': ACHCARTM05,
  'ACHC-ART-M06': ACHCARTM06,
  'ACHC-ART-M07': ACHCARTM07,
  'ACHC-ART-M08': ACHCARTM08,
  'ACHC-ART-M09': ACHCARTM09,
  'ACHC-ART-M10': ACHCARTM10,
  'ACHC-ART-M11': ACHCARTM11,
  'ACHC-ART-M12': ACHCARTM12,
};

function normalizeAchcId(moduleId: string): AchcStandaloneModuleId | null {
  const id = moduleId.trim().toUpperCase();
  const match = id.match(/^ACHC-?ART-?M(0[1-9]|1[0-2])$/);
  if (!match) return null;
  const normalized = `ACHC-ART-M${match[1]}` as AchcStandaloneModuleId;
  return normalized in REGISTRY ? normalized : null;
}

export function isAchcStandaloneModule(moduleId: string | undefined | null): moduleId is AchcStandaloneModuleId {
  return Boolean(moduleId && normalizeAchcId(moduleId));
}

export function getAchcStandaloneModule(moduleId: string): ComponentType | null {
  const id = normalizeAchcId(moduleId);
  if (!id) return null;
  const component = REGISTRY[id];
  const resolved = (component as unknown as { default?: ComponentType })?.default ?? component;
  return typeof resolved === 'function' ? resolved : component;
}
