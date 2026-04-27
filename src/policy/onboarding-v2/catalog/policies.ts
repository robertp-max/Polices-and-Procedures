import type { PolicyVersionRef } from '../types';

/** Hash placeholder — in production these are SHA-256 of the canonical policy render. */
function h(seed: string): string {
  let n = 0;
  for (let i = 0; i < seed.length; i++) n = (n * 131 + seed.charCodeAt(i)) >>> 0;
  return 'sha256:' + n.toString(16).padStart(8, '0') + '…';
}

export function policy(policyId: string, policyVersion: string): PolicyVersionRef {
  return { policyId, policyVersion, contentHash: h(`${policyId}@${policyVersion}`) };
}

/** Canonical policy version refs for the V2 catalog. */
export const POL = {
  EN_GB:        policy('EN-GB-001', '2026.04'),
  EN_CM_001:    policy('EN-CM-001', '2026.02'),
  EN_LC_001:    policy('EN-LC-001', '2026.02'),
  EN_TG_001:    policy('EN-TG-001', '2026.02'),
  CO_CP_001:    policy('CO-CP-001', '2026.03'),
  CO_RA_001:    policy('CO-RA-001', '2026.03'),
  CL_OA_006:    policy('CL-OA-006', '2026.02'),
  CL_484_80:    policy('CL-HHA-484.80', '2026.01'),
  CL_484_105:   policy('CL-CM-484.105', '2026.01'),
  IT_HIPAA_PRIV:policy('IT-HIPAA-PRIVACY', '2026.01'),
  IT_HIPAA_SEC: policy('IT-HIPAA-SECURITY', '2026.01'),
  IT_AUP:       policy('IT-AUP', '2026.01'),
  HR_BG:        policy('HR-BG-001', '2026.01'),
  RM_OS_001:    policy('RM-OS-001', '2026.02'),
  RM_EP_001:    policy('RM-EP-001', '2026.02'),
  FN_BC_001:    policy('FN-BC-001', '2026.02'),
  QA_QAPI:      policy('QA-PG-001', '2026.02'),
  OP_INTAKE:    policy('OP-IN-001', '2026.01'),
};
