/* ═══════════════════════════════════════════════════════════════
   AUTO-GENERATED — DO NOT EDIT
   File: advancedAssignmentMap.generated.ts
   Generator: apps/employee-journey/scripts/generateJourneyMappings.ts
   Source branch: feature/governing-body-portal
   Schema version: 1.0.0
   Regenerate with: npm run journey:map:generate (from apps/employee-journey)
   ADVANCED_PORTAL_MINIMUM_AUDIENCE = [PT, RN, DON, ADM] applied as a MINIMUM floor, unioned with each module's canonical modules.ts roles (never dropping canonical OT/SLP where required).
   cms-485: canonical=[RN,DON] ownerAdded=[PT,ADM] scopeWarning=true
   qapi: canonical=[RN,DON] ownerAdded=[PT,ADM] scopeWarning=true
   oasis-e2-soc: canonical=[RN,DON,PT,OT,SLP] ownerAdded=[ADM] scopeWarning=true
   documentation-matters: canonical=[DON,RN,LVN,PT,PTA,OT,COTA,SLP,MSW,HHA] ownerAdded=[ADM] scopeWarning=true
   ═══════════════════════════════════════════════════════════════ */

import type { JourneyRole } from './sharedTypes.generated';

export const ADVANCED_PORTAL_MINIMUM_AUDIENCE: JourneyRole[] = ["PT","RN","DON","ADM"];

export interface AdvancedModuleAudience {
  moduleId: string;
  title: string;
  canonical: JourneyRole[];
  ownerAdded: JourneyRole[];
  effective: JourneyRole[];
  scopeWarning: boolean;
}

export const ADVANCED_ASSIGNMENT_MAP: AdvancedModuleAudience[] = [
  {
    "moduleId": "cms-485",
    "title": "CMS-485 Plan of Care and Compliance Integration",
    "canonical": [
      "RN",
      "DON"
    ],
    "ownerAdded": [
      "PT",
      "ADM"
    ],
    "effective": [
      "RN",
      "DON",
      "PT",
      "ADM"
    ],
    "scopeWarning": true
  },
  {
    "moduleId": "qapi",
    "title": "Quality Assessment and Performance Improvement Training",
    "canonical": [
      "RN",
      "DON"
    ],
    "ownerAdded": [
      "PT",
      "ADM"
    ],
    "effective": [
      "RN",
      "DON",
      "PT",
      "ADM"
    ],
    "scopeWarning": true
  },
  {
    "moduleId": "oasis-e2-soc",
    "title": "OASIS-E2 Start of Care Assessment",
    "canonical": [
      "RN",
      "DON",
      "PT",
      "OT",
      "SLP"
    ],
    "ownerAdded": [
      "ADM"
    ],
    "effective": [
      "RN",
      "DON",
      "PT",
      "OT",
      "SLP",
      "ADM"
    ],
    "scopeWarning": true
  },
  {
    "moduleId": "documentation-matters",
    "title": "CMS Documentation Matters / Documentation Defensibility",
    "canonical": [
      "DON",
      "RN",
      "LVN",
      "PT",
      "PTA",
      "OT",
      "COTA",
      "SLP",
      "MSW",
      "HHA"
    ],
    "ownerAdded": [
      "ADM"
    ],
    "effective": [
      "DON",
      "RN",
      "LVN",
      "PT",
      "PTA",
      "OT",
      "COTA",
      "SLP",
      "MSW",
      "HHA",
      "ADM"
    ],
    "scopeWarning": true
  }
];

