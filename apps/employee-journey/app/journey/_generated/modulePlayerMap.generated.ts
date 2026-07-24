/* ═══════════════════════════════════════════════════════════════
   AUTO-GENERATED — DO NOT EDIT
   File: modulePlayerMap.generated.ts
   Generator: apps/employee-journey/scripts/generateJourneyMappings.ts
   Source branch: feature/governing-body-portal
   Schema version: 1.0.0
   Regenerate with: npm run journey:map:generate (from apps/employee-journey)
   playerType counts: {"CANONICAL_GENERIC_PLAYER":113,"STANDALONE_PLAYER":73,"UNAVAILABLE":16}
   EXTERNAL_CANONICAL_PLAYER and IDENTITY_MISMATCH are reserved enum members; 0 modules currently classify as either.
   ═══════════════════════════════════════════════════════════════ */

export type PlayerType = 'STANDALONE_PLAYER' | 'CANONICAL_GENERIC_PLAYER' | 'EXTERNAL_CANONICAL_PLAYER' | 'UNAVAILABLE' | 'IDENTITY_MISMATCH';

export interface ModulePlayerEntry {
  moduleId: string;
  playerType: PlayerType;
  playerAvailable: boolean;
  /** Same-tab main-app route (react-router), or null when unavailable. */
  launchRef: string | null;
  note: string;
}

export const MODULE_PLAYER_MAP: ModulePlayerEntry[] = [
  {
    "moduleId": "GAO-001",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/GAO-001",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "GAO-002",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/GAO-002",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "GAO-003",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/GAO-003",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "GAO-004",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/GAO-004",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "GAO-005",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/GAO-005",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "GAO-006",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/GAO-006",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "GAO-007",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/GAO-007",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "GAO-008",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/GAO-008",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "GAO-009",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/GAO-009",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "GAO-010",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/GAO-010",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "GAO-011",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/GAO-011",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "GAO-012",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/GAO-012",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "GAO-013",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/GAO-013",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "GAO-014",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/GAO-014",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "GAO-015",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/GAO-015",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "GAO-016",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/GAO-016",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "GAO-017",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/GAO-017",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "GAO-018",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/GAO-018",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "GAO-019",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/GAO-019",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "GAO-020",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/GAO-020",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "GAO-021",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/GAO-021",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "GAO-022",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/GAO-022",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "GAO-023",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/GAO-023",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "GAO-024",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/GAO-024",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "GAO-025",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/GAO-025",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "GAO-026",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/GAO-026",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "GAO-027",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/GAO-027",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "GAO-EXAM",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/GAO-EXAM",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "ADM-001",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/ADM-001",
    "note": "ADM standalone corrected module (src/policy/journey/modules/adm)."
  },
  {
    "moduleId": "ADM-002",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/ADM-002",
    "note": "ADM standalone corrected module (src/policy/journey/modules/adm)."
  },
  {
    "moduleId": "ADM-003",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/ADM-003",
    "note": "ADM standalone corrected module (src/policy/journey/modules/adm)."
  },
  {
    "moduleId": "ADM-004",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/ADM-004",
    "note": "ADM standalone corrected module (src/policy/journey/modules/adm)."
  },
  {
    "moduleId": "ADM-005",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/ADM-005",
    "note": "ADM standalone corrected module (src/policy/journey/modules/adm)."
  },
  {
    "moduleId": "ADM-006",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/ADM-006",
    "note": "ADM standalone corrected module (src/policy/journey/modules/adm)."
  },
  {
    "moduleId": "ADM-007",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/ADM-007",
    "note": "ADM standalone corrected module (src/policy/journey/modules/adm)."
  },
  {
    "moduleId": "ADM-008",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/ADM-008",
    "note": "ADM standalone corrected module (src/policy/journey/modules/adm)."
  },
  {
    "moduleId": "ADM-009",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/ADM-009",
    "note": "ADM standalone corrected module (src/policy/journey/modules/adm)."
  },
  {
    "moduleId": "ADM-010",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/ADM-010",
    "note": "ADM standalone corrected module (src/policy/journey/modules/adm)."
  },
  {
    "moduleId": "ADM-011",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/ADM-011",
    "note": "ADM standalone corrected module (src/policy/journey/modules/adm)."
  },
  {
    "moduleId": "ADM-012",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/ADM-012",
    "note": "ADM standalone corrected module (src/policy/journey/modules/adm)."
  },
  {
    "moduleId": "ADM-013",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/ADM-013",
    "note": "ADM standalone corrected module (src/policy/journey/modules/adm)."
  },
  {
    "moduleId": "ADM-014",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/ADM-014",
    "note": "ADM standalone corrected module (src/policy/journey/modules/adm)."
  },
  {
    "moduleId": "ADM-015",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/ADM-015",
    "note": "ADM standalone corrected module (src/policy/journey/modules/adm)."
  },
  {
    "moduleId": "DON-001",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/DON-001",
    "note": "DON standalone corrected module (src/policy/journey/modules/don)."
  },
  {
    "moduleId": "DON-002",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/DON-002",
    "note": "DON standalone corrected module (src/policy/journey/modules/don)."
  },
  {
    "moduleId": "DON-003",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/DON-003",
    "note": "DON standalone corrected module (src/policy/journey/modules/don)."
  },
  {
    "moduleId": "DON-004",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/DON-004",
    "note": "DON standalone corrected module (src/policy/journey/modules/don)."
  },
  {
    "moduleId": "DON-005",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/DON-005",
    "note": "DON standalone corrected module (src/policy/journey/modules/don)."
  },
  {
    "moduleId": "DON-006",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/DON-006",
    "note": "DON standalone corrected module (src/policy/journey/modules/don)."
  },
  {
    "moduleId": "DON-007",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/DON-007",
    "note": "DON standalone corrected module (src/policy/journey/modules/don)."
  },
  {
    "moduleId": "DON-008",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/DON-008",
    "note": "DON standalone corrected module (src/policy/journey/modules/don)."
  },
  {
    "moduleId": "DON-009",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/DON-009",
    "note": "DON standalone corrected module (src/policy/journey/modules/don)."
  },
  {
    "moduleId": "DON-010",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/DON-010",
    "note": "DON standalone corrected module (src/policy/journey/modules/don)."
  },
  {
    "moduleId": "DON-011",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/DON-011",
    "note": "DON standalone corrected module (src/policy/journey/modules/don)."
  },
  {
    "moduleId": "DON-012",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/DON-012",
    "note": "DON standalone corrected module (src/policy/journey/modules/don)."
  },
  {
    "moduleId": "DON-013",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/DON-013",
    "note": "DON standalone corrected module (src/policy/journey/modules/don)."
  },
  {
    "moduleId": "DON-014",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/DON-014",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "DON-015",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/DON-015",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "DON-016",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/DON-016",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "RN-001",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/RN-001",
    "note": "RN standalone corrected module (src/policy/journey/modules/rn)."
  },
  {
    "moduleId": "RN-002",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/RN-002",
    "note": "RN standalone corrected module (src/policy/journey/modules/rn)."
  },
  {
    "moduleId": "RN-003",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/RN-003",
    "note": "RN standalone corrected module (src/policy/journey/modules/rn)."
  },
  {
    "moduleId": "RN-004",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/RN-004",
    "note": "RN standalone corrected module (src/policy/journey/modules/rn)."
  },
  {
    "moduleId": "RN-005",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/RN-005",
    "note": "RN standalone corrected module (src/policy/journey/modules/rn)."
  },
  {
    "moduleId": "RN-006",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/RN-006",
    "note": "RN standalone corrected module (src/policy/journey/modules/rn)."
  },
  {
    "moduleId": "RN-007",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/RN-007",
    "note": "RN standalone corrected module (src/policy/journey/modules/rn)."
  },
  {
    "moduleId": "RN-008",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/RN-008",
    "note": "RN standalone corrected module (src/policy/journey/modules/rn)."
  },
  {
    "moduleId": "RN-009",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/RN-009",
    "note": "RN standalone corrected module (src/policy/journey/modules/rn)."
  },
  {
    "moduleId": "RN-010",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/RN-010",
    "note": "RN standalone corrected module (src/policy/journey/modules/rn)."
  },
  {
    "moduleId": "RN-011",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/RN-011",
    "note": "RN standalone corrected module (src/policy/journey/modules/rn)."
  },
  {
    "moduleId": "RN-012",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/RN-012",
    "note": "RN standalone corrected module (src/policy/journey/modules/rn)."
  },
  {
    "moduleId": "RN-013",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/RN-013",
    "note": "RN standalone corrected module (src/policy/journey/modules/rn)."
  },
  {
    "moduleId": "RN-014",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/RN-014",
    "note": "RN standalone corrected module (src/policy/journey/modules/rn)."
  },
  {
    "moduleId": "RN-015",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/RN-015",
    "note": "RN standalone corrected module (src/policy/journey/modules/rn)."
  },
  {
    "moduleId": "RN-SUP",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/RN-SUP",
    "note": "RN standalone corrected module (src/policy/journey/modules/rn)."
  },
  {
    "moduleId": "LVN-001",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/LVN-001",
    "note": "LVN standalone V5 module (src/policy/journey/modules/lvn)."
  },
  {
    "moduleId": "LVN-002",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/LVN-002",
    "note": "LVN standalone V5 module (src/policy/journey/modules/lvn)."
  },
  {
    "moduleId": "LVN-003",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/LVN-003",
    "note": "LVN standalone V5 module (src/policy/journey/modules/lvn)."
  },
  {
    "moduleId": "LVN-004",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/LVN-004",
    "note": "LVN standalone V5 module (src/policy/journey/modules/lvn)."
  },
  {
    "moduleId": "LVN-005",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/LVN-005",
    "note": "LVN standalone V5 module (src/policy/journey/modules/lvn)."
  },
  {
    "moduleId": "LVN-006",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/LVN-006",
    "note": "LVN standalone V5 module (src/policy/journey/modules/lvn)."
  },
  {
    "moduleId": "LVN-007",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/LVN-007",
    "note": "LVN standalone V5 module (src/policy/journey/modules/lvn)."
  },
  {
    "moduleId": "LVN-008",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/LVN-008",
    "note": "LVN standalone V5 module (src/policy/journey/modules/lvn)."
  },
  {
    "moduleId": "LVN-009",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/LVN-009",
    "note": "LVN standalone V5 module (src/policy/journey/modules/lvn)."
  },
  {
    "moduleId": "LVN-010",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/LVN-010",
    "note": "LVN standalone V5 module (src/policy/journey/modules/lvn)."
  },
  {
    "moduleId": "LVN-011",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/LVN-011",
    "note": "LVN standalone V5 module (src/policy/journey/modules/lvn)."
  },
  {
    "moduleId": "LVN-012",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/LVN-012",
    "note": "LVN standalone V5 module (src/policy/journey/modules/lvn)."
  },
  {
    "moduleId": "LVN-SUP",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/LVN-SUP",
    "note": "LVN standalone V5 module (src/policy/journey/modules/lvn)."
  },
  {
    "moduleId": "PT-001",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/PT-001",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "PT-002",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/PT-002",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "PT-003",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/PT-003",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "PT-004",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/PT-004",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "PT-005",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/PT-005",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "PT-006",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/PT-006",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "PT-007",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/PT-007",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "PT-008",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/PT-008",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "PT-009",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/PT-009",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "PT-010",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/PT-010",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "PT-SUP",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/PT-SUP",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "PTA-001",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/PTA-001",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "PTA-002",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/PTA-002",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "PTA-003",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/PTA-003",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "PTA-004",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/PTA-004",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "PTA-005",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/PTA-005",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "PTA-006",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/PTA-006",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "PTA-007",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/PTA-007",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "PTA-008",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/PTA-008",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "PTA-009",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/PTA-009",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "PTA-010",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/PTA-010",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "PTA-SUP",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/PTA-SUP",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "OT-001",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/OT-001",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "OT-002",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/OT-002",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "OT-003",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/OT-003",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "OT-004",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/OT-004",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "OT-005",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/OT-005",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "OT-006",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/OT-006",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "OT-007",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/OT-007",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "OT-008",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/OT-008",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "OT-009",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/OT-009",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "OT-010",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/OT-010",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "OT-SUP",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/OT-SUP",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "COTA-001",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/COTA-001",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "COTA-002",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/COTA-002",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "COTA-003",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/COTA-003",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "COTA-004",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/COTA-004",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "COTA-005",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/COTA-005",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "COTA-006",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/COTA-006",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "COTA-007",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/COTA-007",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "COTA-008",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/COTA-008",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "COTA-009",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/COTA-009",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "COTA-010",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/COTA-010",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "COTA-SUP",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/COTA-SUP",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "SLP-001",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/SLP-001",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "SLP-002",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/SLP-002",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "SLP-003",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/SLP-003",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "SLP-004",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/SLP-004",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "SLP-005",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/SLP-005",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "SLP-006",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/SLP-006",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "SLP-007",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/SLP-007",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "SLP-008",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/SLP-008",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "SLP-SUP",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/SLP-SUP",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "MSW-001",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/MSW-001",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "MSW-002",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/MSW-002",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "MSW-003",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/MSW-003",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "MSW-004",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/MSW-004",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "MSW-005",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/MSW-005",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "MSW-006",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/MSW-006",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "MSW-007",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/MSW-007",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "MSW-008",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/MSW-008",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "MSW-SUP",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/MSW-SUP",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "HHA-PRE-1",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/HHA-PRE-1",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "HHA-PRE-2",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/HHA-PRE-2",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "HHA-001",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/HHA-001",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "HHA-002",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/HHA-002",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "HHA-003",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/HHA-003",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "HHA-004",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/HHA-004",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "HHA-005",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/HHA-005",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "HHA-006",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/HHA-006",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "HHA-007",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/HHA-007",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "HHA-008",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/HHA-008",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "HHA-009",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/HHA-009",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "HHA-010",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/HHA-010",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "HHA-011",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/HHA-011",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "HHA-012",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/HHA-012",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "HHA-SUP",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/HHA-SUP",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "ANN-001",
    "playerType": "UNAVAILABLE",
    "playerAvailable": false,
    "launchRef": null,
    "note": "contentV2Adapter.ts courseModules filters out group===\"ANN\" (mappedCanonicalOnboardingModules excludes it) and no other registry covers this id; ModulePlayerScreen renders \"Module content unavailable\". Confirmed gap — not fixable from this app (main-app player wiring is out of scope for the journey pipeline)."
  },
  {
    "moduleId": "ANN-002",
    "playerType": "UNAVAILABLE",
    "playerAvailable": false,
    "launchRef": null,
    "note": "contentV2Adapter.ts courseModules filters out group===\"ANN\" (mappedCanonicalOnboardingModules excludes it) and no other registry covers this id; ModulePlayerScreen renders \"Module content unavailable\". Confirmed gap — not fixable from this app (main-app player wiring is out of scope for the journey pipeline)."
  },
  {
    "moduleId": "ANN-003",
    "playerType": "UNAVAILABLE",
    "playerAvailable": false,
    "launchRef": null,
    "note": "contentV2Adapter.ts courseModules filters out group===\"ANN\" (mappedCanonicalOnboardingModules excludes it) and no other registry covers this id; ModulePlayerScreen renders \"Module content unavailable\". Confirmed gap — not fixable from this app (main-app player wiring is out of scope for the journey pipeline)."
  },
  {
    "moduleId": "ANN-004",
    "playerType": "UNAVAILABLE",
    "playerAvailable": false,
    "launchRef": null,
    "note": "contentV2Adapter.ts courseModules filters out group===\"ANN\" (mappedCanonicalOnboardingModules excludes it) and no other registry covers this id; ModulePlayerScreen renders \"Module content unavailable\". Confirmed gap — not fixable from this app (main-app player wiring is out of scope for the journey pipeline)."
  },
  {
    "moduleId": "ANN-005",
    "playerType": "UNAVAILABLE",
    "playerAvailable": false,
    "launchRef": null,
    "note": "contentV2Adapter.ts courseModules filters out group===\"ANN\" (mappedCanonicalOnboardingModules excludes it) and no other registry covers this id; ModulePlayerScreen renders \"Module content unavailable\". Confirmed gap — not fixable from this app (main-app player wiring is out of scope for the journey pipeline)."
  },
  {
    "moduleId": "ANN-006",
    "playerType": "UNAVAILABLE",
    "playerAvailable": false,
    "launchRef": null,
    "note": "contentV2Adapter.ts courseModules filters out group===\"ANN\" (mappedCanonicalOnboardingModules excludes it) and no other registry covers this id; ModulePlayerScreen renders \"Module content unavailable\". Confirmed gap — not fixable from this app (main-app player wiring is out of scope for the journey pipeline)."
  },
  {
    "moduleId": "ANN-007",
    "playerType": "UNAVAILABLE",
    "playerAvailable": false,
    "launchRef": null,
    "note": "contentV2Adapter.ts courseModules filters out group===\"ANN\" (mappedCanonicalOnboardingModules excludes it) and no other registry covers this id; ModulePlayerScreen renders \"Module content unavailable\". Confirmed gap — not fixable from this app (main-app player wiring is out of scope for the journey pipeline)."
  },
  {
    "moduleId": "ANN-008",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/ANN-008",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "ANN-009",
    "playerType": "UNAVAILABLE",
    "playerAvailable": false,
    "launchRef": null,
    "note": "contentV2Adapter.ts courseModules filters out group===\"ANN\" (mappedCanonicalOnboardingModules excludes it) and no other registry covers this id; ModulePlayerScreen renders \"Module content unavailable\". Confirmed gap — not fixable from this app (main-app player wiring is out of scope for the journey pipeline)."
  },
  {
    "moduleId": "ANN-010",
    "playerType": "UNAVAILABLE",
    "playerAvailable": false,
    "launchRef": null,
    "note": "contentV2Adapter.ts courseModules filters out group===\"ANN\" (mappedCanonicalOnboardingModules excludes it) and no other registry covers this id; ModulePlayerScreen renders \"Module content unavailable\". Confirmed gap — not fixable from this app (main-app player wiring is out of scope for the journey pipeline)."
  },
  {
    "moduleId": "ANN-011",
    "playerType": "UNAVAILABLE",
    "playerAvailable": false,
    "launchRef": null,
    "note": "contentV2Adapter.ts courseModules filters out group===\"ANN\" (mappedCanonicalOnboardingModules excludes it) and no other registry covers this id; ModulePlayerScreen renders \"Module content unavailable\". Confirmed gap — not fixable from this app (main-app player wiring is out of scope for the journey pipeline)."
  },
  {
    "moduleId": "ANN-012",
    "playerType": "UNAVAILABLE",
    "playerAvailable": false,
    "launchRef": null,
    "note": "contentV2Adapter.ts courseModules filters out group===\"ANN\" (mappedCanonicalOnboardingModules excludes it) and no other registry covers this id; ModulePlayerScreen renders \"Module content unavailable\". Confirmed gap — not fixable from this app (main-app player wiring is out of scope for the journey pipeline)."
  },
  {
    "moduleId": "ANN-013",
    "playerType": "UNAVAILABLE",
    "playerAvailable": false,
    "launchRef": null,
    "note": "contentV2Adapter.ts courseModules filters out group===\"ANN\" (mappedCanonicalOnboardingModules excludes it) and no other registry covers this id; ModulePlayerScreen renders \"Module content unavailable\". Confirmed gap — not fixable from this app (main-app player wiring is out of scope for the journey pipeline)."
  },
  {
    "moduleId": "ANN-014",
    "playerType": "UNAVAILABLE",
    "playerAvailable": false,
    "launchRef": null,
    "note": "contentV2Adapter.ts courseModules filters out group===\"ANN\" (mappedCanonicalOnboardingModules excludes it) and no other registry covers this id; ModulePlayerScreen renders \"Module content unavailable\". Confirmed gap — not fixable from this app (main-app player wiring is out of scope for the journey pipeline)."
  },
  {
    "moduleId": "ANN-015",
    "playerType": "UNAVAILABLE",
    "playerAvailable": false,
    "launchRef": null,
    "note": "contentV2Adapter.ts courseModules filters out group===\"ANN\" (mappedCanonicalOnboardingModules excludes it) and no other registry covers this id; ModulePlayerScreen renders \"Module content unavailable\". Confirmed gap — not fixable from this app (main-app player wiring is out of scope for the journey pipeline)."
  },
  {
    "moduleId": "ANN-016",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/ANN-016",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "ANN-017",
    "playerType": "UNAVAILABLE",
    "playerAvailable": false,
    "launchRef": null,
    "note": "contentV2Adapter.ts courseModules filters out group===\"ANN\" (mappedCanonicalOnboardingModules excludes it) and no other registry covers this id; ModulePlayerScreen renders \"Module content unavailable\". Confirmed gap — not fixable from this app (main-app player wiring is out of scope for the journey pipeline)."
  },
  {
    "moduleId": "ANN-018",
    "playerType": "UNAVAILABLE",
    "playerAvailable": false,
    "launchRef": null,
    "note": "contentV2Adapter.ts courseModules filters out group===\"ANN\" (mappedCanonicalOnboardingModules excludes it) and no other registry covers this id; ModulePlayerScreen renders \"Module content unavailable\". Confirmed gap — not fixable from this app (main-app player wiring is out of scope for the journey pipeline)."
  },
  {
    "moduleId": "COMP-ANN-A",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/COMP-ANN-A",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "COMP-ANN-D",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/COMP-ANN-D",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "COMP-90DAY",
    "playerType": "CANONICAL_GENERIC_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/COMP-90DAY",
    "note": "Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts)."
  },
  {
    "moduleId": "ACHC-ART-M01",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/ACHC-ART-M01",
    "note": "ACHC standalone PASS5 module (src/policy/journey/modules/achc)."
  },
  {
    "moduleId": "ACHC-ART-M02",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/ACHC-ART-M02",
    "note": "ACHC standalone PASS5 module (src/policy/journey/modules/achc)."
  },
  {
    "moduleId": "ACHC-ART-M03",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/ACHC-ART-M03",
    "note": "ACHC standalone PASS5 module (src/policy/journey/modules/achc)."
  },
  {
    "moduleId": "ACHC-ART-M04",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/ACHC-ART-M04",
    "note": "ACHC standalone PASS5 module (src/policy/journey/modules/achc)."
  },
  {
    "moduleId": "ACHC-ART-M05",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/ACHC-ART-M05",
    "note": "ACHC standalone PASS5 module (src/policy/journey/modules/achc)."
  },
  {
    "moduleId": "ACHC-ART-M06",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/ACHC-ART-M06",
    "note": "ACHC standalone PASS5 module (src/policy/journey/modules/achc)."
  },
  {
    "moduleId": "ACHC-ART-M07",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/ACHC-ART-M07",
    "note": "ACHC standalone PASS5 module (src/policy/journey/modules/achc)."
  },
  {
    "moduleId": "ACHC-ART-M08",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/ACHC-ART-M08",
    "note": "ACHC standalone PASS5 module (src/policy/journey/modules/achc)."
  },
  {
    "moduleId": "ACHC-ART-M09",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/ACHC-ART-M09",
    "note": "ACHC standalone PASS5 module (src/policy/journey/modules/achc)."
  },
  {
    "moduleId": "ACHC-ART-M10",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/ACHC-ART-M10",
    "note": "ACHC standalone PASS5 module (src/policy/journey/modules/achc)."
  },
  {
    "moduleId": "ACHC-ART-M11",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/ACHC-ART-M11",
    "note": "ACHC standalone PASS5 module (src/policy/journey/modules/achc)."
  },
  {
    "moduleId": "ACHC-ART-M12",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/ACHC-ART-M12",
    "note": "ACHC standalone PASS5 module (src/policy/journey/modules/achc)."
  },
  {
    "moduleId": "cms-485",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/cms-485",
    "note": "AdvancedTrainingPlayer via isAdvancedModule/getAdvancedVariant."
  },
  {
    "moduleId": "qapi",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/qapi",
    "note": "AdvancedTrainingPlayer via isAdvancedModule/getAdvancedVariant."
  },
  {
    "moduleId": "oasis-e2-soc",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/oasis-e2-soc",
    "note": "OasisSocTrainingPanel (dispatched first, independent of advanced-training contract)."
  },
  {
    "moduleId": "documentation-matters",
    "playerType": "STANDALONE_PLAYER",
    "playerAvailable": true,
    "launchRef": "/journey/module/documentation-matters",
    "note": "AdvancedTrainingPlayer via isAdvancedModule/getAdvancedVariant."
  }
];

export function getModulePlayerEntry(id: string): ModulePlayerEntry | undefined {
  return MODULE_PLAYER_MAP.find((e) => e.moduleId === id);
}

