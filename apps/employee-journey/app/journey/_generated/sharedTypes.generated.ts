/* ═══════════════════════════════════════════════════════════════
   AUTO-GENERATED — DO NOT EDIT
   File: sharedTypes.generated.ts
   Generator: apps/employee-journey/scripts/generateJourneyMappings.ts
   Source branch: feature/governing-body-portal
   Schema version: 1.0.0
   Regenerate with: npm run journey:map:generate (from apps/employee-journey)
   Mirrors src/policy/journey/types/journey.ts (JourneyRole, EvidenceAppendix)
   and src/policy/data/formsLibraryContent.ts (FormField/FormSection/FormContent/etc).
   Kept in sync manually when the canonical shapes change (they are stable enums/interfaces).
   ═══════════════════════════════════════════════════════════════ */

export type JourneyRole = 'ADM' | 'DON' | 'RN' | 'LVN' | 'PT' | 'PTA' | 'OT' | 'COTA' | 'SLP' | 'MSW' | 'HHA';

export type EvidenceAppendix =
  | 'F' | 'A' | 'B'
  | 'HRTA005_A' | 'HRTA005_B' | 'HRTA005_D' | 'HRTA005_E'
  | 'HRTD003_A' | 'HRTD003_C' | 'HRTD003_D' | 'HRTD003_E'
  | 'HRER001_C' | 'HRTD001_B' | 'HRTD005_B'
  | 'NONE';

export type FieldType = 'text' | 'date' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'number' | 'signature' | 'email' | 'tel';

export interface FormField {
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  col?: 1 | 2 | 3 | 4;
  placeholder?: string;
  help?: string;
}

export type SectionLayout = 'grid' | 'table' | 'checklist' | 'attestation' | 'narrative' | 'matrix' | 'signature' | 'image';

export interface FormSection {
  title: string;
  description?: string;
  layout: SectionLayout;
  fields?: FormField[];
  columns?: string[];
  rowCount?: number;
  items?: string[];
  body?: string;
  acknowledgments?: string[];
  matrixRows?: string[];
  matrixCols?: string[];
  sectionAck?: boolean;
  image?: { src: string; alt?: string; caption?: string };
}

export interface FormSignerSlot {
  field_id: string;
  role: string;
  tier: number;
  required: boolean;
  resolver: string | { role_id: string };
  sequence_group: number;
}

export interface SignatureBlock {
  role: string;
  includeName?: boolean;
  includeTitle?: boolean;
  includeDate?: boolean;
}

export interface FormContent {
  id: string;
  title: string;
  type: string;
  domainCode: string;
  policies: string[];
  purpose: string;
  instructions: string;
  version: string;
  effectiveDate: string;
  revisionDate: string;
  orientation: 'portrait' | 'landscape';
  sections: FormSection[];
  signatures?: SignatureBlock[];
  signerSlots?: FormSignerSlot[];
  footerNotes?: string[];
}

