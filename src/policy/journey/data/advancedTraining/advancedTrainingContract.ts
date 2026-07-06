/**
 * Advanced Training Data Contract
 * Extends Journey for GAO-01..04 with domain-specific UI variants.
 * Preserves full compatibility with ModuleDef, journeyStore, gating, evidence.
 */

import type { ModuleDef } from '../lessonModel';

export type AdvancedTrainingCode = 'RN-ADV-01' | 'RN-ADV-02' | 'RN-ADV-03' | 'RN-ADV-04';

export type AdvancedTrainingDomain =
  | 'CMS_485'
  | 'QAPI'
  | 'OASIS_E2'
  | 'DOCUMENTATION';

export type AdvancedTrainingVariant =
  | 'plan_of_care'
  | 'qapi_board'
  | 'oasis_lab'
  | 'documentation_lab';

export type AssessmentType = 'quiz' | 'simulator' | 'case_lab' | 'hybrid';

export interface AdvancedTrainingModule {
  id: string;                    // "RN-ADV-01", "RN-ADV-02", "RN-ADV-03", "RN-ADV-04" (legacy aliases cms-485 etc supported)
  code: AdvancedTrainingCode;
  title: string;
  subtitle: string;
  durationMinutes: number;
  questionCount: number;
  domain: AdvancedTrainingDomain;
  uiVariant: AdvancedTrainingVariant;
  assessmentType: AssessmentType;
  passThreshold: number;
  completionGate: string;
  policyRefs: string[];
  workflowId: string;
  eventId: string;
  roleTargets: string[];
  reportsTo?: string;
  prerequisiteModuleIds?: string[];
  narrationMapStatus: 'verified' | 'needs_review' | 'missing';
  evidenceOutput: string[];
  moduleDef: ModuleDef;          // Full compatibility with existing Journey
}

export const ADVANCED_MODULE_IDS = ['RN-ADV-01', 'RN-ADV-02', 'RN-ADV-03', 'RN-ADV-04'] as const;

export function isAdvancedModule(moduleId: string): boolean {
  const lower = moduleId.toLowerCase();
  return ADVANCED_MODULE_IDS.includes(moduleId as any)
    || ['rn-adv-01', 'rn-adv-02', 'rn-adv-03', 'rn-adv-04', 'cms-485', 'qapi', 'oasis-e2-soc', 'documentation-matters', 'gao-01', 'gao-02', 'gao-03', 'gao-04'].includes(lower);
}

export function getAdvancedVariant(moduleId: string): AdvancedTrainingVariant | null {
  const lower = moduleId.toLowerCase();
  if (lower === 'rn-adv-01' || lower === 'cms-485' || lower === 'gao-01') return 'plan_of_care';
  if (lower === 'rn-adv-02' || lower === 'qapi' || lower === 'gao-02') return 'qapi_board';
  if (lower === 'rn-adv-03' || lower === 'oasis-e2-soc' || lower === 'gao-03') return 'oasis_lab';
  if (lower === 'rn-adv-04' || lower === 'documentation-matters' || lower === 'gao-04') return 'documentation_lab';
  return null;
}

// Shared evidence artifact contract for traceability
export interface AdvancedCompletionEvidence {
  policyId: string;
  workflowId: string;
  eventId: string;
  moduleId: string;
  learnerId: string;
  timestamp: string;
  score: number;
  passThreshold: number;
  passed: boolean;
  artifactType: string; // e.g. 'poc-simulator-cases', 'qapi-pip-evidence', 'oasis-item-coding', 'doc-defensibility-scenarios'
  details: Record<string, any>;
  noPhi: true;
}
