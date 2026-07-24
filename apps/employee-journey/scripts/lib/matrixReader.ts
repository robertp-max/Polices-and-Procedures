/* ═══════════════════════════════════════════════════════════════
   matrixReader.ts — typed reader for the xlsx-derived *.aoa.json matrix
   sheets under REVIEW_OUTPUTS/employee-journey-mapping/_sources/matrix/.

   Every sheet follows the same shape:
     row 0 = sheet title
     row 1 = note
     row 2 = column headers
     row 3+ = data rows

   This module trims/normalizes cell values and returns typed record
   arrays. It performs NO business logic — that lives in
   generateJourneyMappings.ts. Column order is resolved by HEADER NAME
   (not position) so the reader tolerates column reordering in the
   source workbook.
   ═══════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';

export type AoaSheet = (string | number | boolean | null)[][];

export interface ParsedSheet {
  title: string;
  note: string;
  headers: string[];
  rows: Record<string, string | number | boolean | null>[];
  rawRows: AoaSheet;
  /** 0-based index into the ORIGINAL aoa array for each data row (for traceability). */
  rowIndexes: number[];
}

function cell(v: string | number | boolean | null): string | number | boolean | null {
  if (typeof v === 'string') {
    const t = v.trim();
    return t.length === 0 ? '' : t;
  }
  return v ?? '';
}

export function readAoaJson(filePath: string): AoaSheet {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw) as AoaSheet;
}

/** Generic sheet parser: row0=title, row1=note, row2=headers, row3+=data. */
export function parseSheet(aoa: AoaSheet): ParsedSheet {
  const title = String(aoa[0]?.[0] ?? '');
  const note = String(aoa[1]?.[0] ?? '');
  const headers = (aoa[2] ?? []).map((h) => String(h ?? '').trim());
  const rows: Record<string, string | number | boolean | null>[] = [];
  const rowIndexes: number[] = [];
  for (let i = 3; i < aoa.length; i++) {
    const raw = aoa[i];
    if (!raw || raw.every((v) => v === null || v === undefined || v === '')) continue;
    const obj: Record<string, string | number | boolean | null> = {};
    headers.forEach((h, idx) => {
      if (!h) return;
      obj[h] = cell(raw[idx] ?? null);
    });
    rows.push(obj);
    rowIndexes.push(i);
  }
  return { title, note, headers, rows, rawRows: aoa, rowIndexes };
}

export function loadSheet(matrixDir: string, fileBase: string): ParsedSheet {
  const p = path.join(matrixDir, `${fileBase}.aoa.json`);
  return parseSheet(readAoaJson(p));
}

/* ─────────────────────────────────────────────────────────────────
   TYPED RECORD SHAPES
   ───────────────────────────────────────────────────────────────── */

export interface CourseCatalogRow {
  courseId: string;
  pathway: string;
  courseTitle: string;
  assignmentMode: string;
  trigger: string;
  initialDue: string;
  recurrence: string;
  passScore: number;
  additionalValidation: string;
  policyRows: number;
  sourceStatus: string;
  releaseStatus: string;
  ownerApproval: string;
  implementationNotes: string;
  sourceMatrixRow: number;
}

export interface PolicyAssignmentRow {
  courseId: string;
  pathway: string;
  policyId: string;
  policyTitle: string;
  assignmentType: string; // Core | Conditional | Hold
  readFullPolicy: string; // Yes
  scoredQuiz: string; // "Yes — bundled"
  quizBundle: string; // course title
  assessmentAddOn: string;
  initialDue: string;
  recurrence: string;
  releaseStatus: string;
  scopeRationale: string;
  internalSource: string;
  externalAuthorityUrl: string;
  sourceNotes: string;
  sourceMatrixRow: number;
}

export const ROLE_MATRIX_COLUMNS = [
  'General', 'LVN', 'RN', 'HHA', 'PT', 'PTA', 'OT', 'COTA', 'SLP', 'MSW', 'ADM', 'DON', 'GB',
] as const;
export type RoleMatrixColumn = (typeof ROLE_MATRIX_COLUMNS)[number];
export type RoleMatrixCellValue = 'G' | 'R' | 'C' | 'H' | '';

export interface RolePolicyMatrixRow {
  policyId: string;
  policyTitle: string;
  cells: Record<RoleMatrixColumn, RoleMatrixCellValue>;
  sourceStatusNote: string;
  sourceMatrixRow: number;
}

export interface PathwaySummaryRow {
  pathway: string;
  type: string;
  generalInherited: number;
  roleSpecific: number;
  recommendedTotal: number;
  coursesWithHold: number;
  deployableNow: number;
  previewTarget: number;
  variance: number;
  policyAssignmentRows: number;
  notes: string;
  sourceMatrixRow: number;
}

export interface ReleaseBlockerRow {
  severity: string;
  issue: string;
  evidence: string;
  affectedCourses: string;
  requiredAction: string;
  owner: string;
  releaseAcceptance: string;
  authoritySource: string;
  sourceMatrixRow: number;
}

export interface AllPolicyReviewRow {
  policyId: string;
  policyTitle: string;
  classification: string;
  status: string;
  owner: string;
  scopeExcerpt: string;
  lmsDecision: string;
  assignedPathways: string;
  quizBundleIds: string;
  decisionRationale: string;
  sourceQuality: string;
  internalSource: string;
  externalAuthorityUrl: string;
  sourceMatrixRow: number;
}

export interface SourcesMethodRow {
  sourceType: string;
  topic: string;
  sourceUrl: string;
  howUsed: string;
  sourceMatrixRow: number;
}

function asNumber(v: unknown): number {
  if (typeof v === 'number') return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function asStr(v: unknown): string {
  return v === null || v === undefined ? '' : String(v);
}

export function readCourseCatalog(matrixDir: string): CourseCatalogRow[] {
  const sheet = loadSheet(matrixDir, 'Course_Catalog');
  return sheet.rows.map((r, i) => ({
    courseId: asStr(r['Course ID']),
    pathway: asStr(r['Pathway']),
    courseTitle: asStr(r['Course title']),
    assignmentMode: asStr(r['Assignment mode']),
    trigger: asStr(r['Trigger']),
    initialDue: asStr(r['Initial due']),
    recurrence: asStr(r['Recurrence']),
    passScore: asNumber(r['Pass score']),
    additionalValidation: asStr(r['Additional validation']),
    policyRows: asNumber(r['Policy rows']),
    sourceStatus: asStr(r['Source status']),
    releaseStatus: asStr(r['Release status']),
    ownerApproval: asStr(r['Owner approval']),
    implementationNotes: asStr(r['Implementation notes']),
    sourceMatrixRow: sheet.rowIndexes[i],
  }));
}

export function readPolicyAssignments(matrixDir: string): PolicyAssignmentRow[] {
  const sheet = loadSheet(matrixDir, 'Policy_Assignments');
  return sheet.rows.map((r, i) => ({
    courseId: asStr(r['Course ID']),
    pathway: asStr(r['Pathway']),
    policyId: asStr(r['Policy ID']),
    policyTitle: asStr(r['Policy title']),
    assignmentType: asStr(r['Assignment type']),
    readFullPolicy: asStr(r['Read full policy']),
    scoredQuiz: asStr(r['Scored quiz']),
    quizBundle: asStr(r['Quiz bundle']),
    assessmentAddOn: asStr(r['Assessment add-on']),
    initialDue: asStr(r['Initial due']),
    recurrence: asStr(r['Recurrence']),
    releaseStatus: asStr(r['Release status']),
    scopeRationale: asStr(r['Scope rationale']),
    internalSource: asStr(r['Internal source']),
    externalAuthorityUrl: asStr(r['External authority URL']),
    sourceNotes: asStr(r['Source notes']),
    sourceMatrixRow: sheet.rowIndexes[i],
  }));
}

export function readRolePolicyMatrix(matrixDir: string): RolePolicyMatrixRow[] {
  const sheet = loadSheet(matrixDir, 'Role_Policy_Matrix');
  return sheet.rows.map((r, i) => {
    const cells = {} as Record<RoleMatrixColumn, RoleMatrixCellValue>;
    for (const col of ROLE_MATRIX_COLUMNS) {
      const v = asStr(r[col]).trim().toUpperCase();
      cells[col] = (v === 'G' || v === 'R' || v === 'C' || v === 'H' ? v : '') as RoleMatrixCellValue;
    }
    return {
      policyId: asStr(r['Policy ID']),
      policyTitle: asStr(r['Policy title']),
      cells,
      sourceStatusNote: asStr(r['Source / status note']),
      sourceMatrixRow: sheet.rowIndexes[i],
    };
  });
}

export function readPathwaySummary(matrixDir: string): PathwaySummaryRow[] {
  const sheet = loadSheet(matrixDir, 'Pathway_Summary');
  return sheet.rows.map((r, i) => ({
    pathway: asStr(r['Pathway']),
    type: asStr(r['Type']),
    generalInherited: asNumber(r['General inherited']),
    roleSpecific: asNumber(r['Role-specific']),
    recommendedTotal: asNumber(r['Recommended total']),
    coursesWithHold: asNumber(r['Courses with hold']),
    deployableNow: asNumber(r['Deployable now']),
    previewTarget: asNumber(r['Preview target']),
    variance: asNumber(r['Variance']),
    policyAssignmentRows: asNumber(r['Policy assignment rows']),
    notes: asStr(r['Notes']),
    sourceMatrixRow: sheet.rowIndexes[i],
  }));
}

export function readReleaseBlockers(matrixDir: string): ReleaseBlockerRow[] {
  const sheet = loadSheet(matrixDir, 'Release_Blockers');
  return sheet.rows.map((r, i) => ({
    severity: asStr(r['Severity']),
    issue: asStr(r['Issue']),
    evidence: asStr(r['Evidence']),
    affectedCourses: asStr(r['Affected courses']),
    requiredAction: asStr(r['Required action']),
    owner: asStr(r['Owner']),
    releaseAcceptance: asStr(r['Release acceptance']),
    authoritySource: asStr(r['Authority / source']),
    sourceMatrixRow: sheet.rowIndexes[i],
  }));
}

export function readAllPolicyReview(matrixDir: string): AllPolicyReviewRow[] {
  const sheet = loadSheet(matrixDir, 'All_Policy_Review');
  return sheet.rows.map((r, i) => ({
    policyId: asStr(r['Policy ID']),
    policyTitle: asStr(r['Policy title']),
    classification: asStr(r['Classification']),
    status: asStr(r['Status']),
    owner: asStr(r['Owner']),
    scopeExcerpt: asStr(r['Scope excerpt']),
    lmsDecision: asStr(r['LMS decision']),
    assignedPathways: asStr(r['Assigned pathways']),
    quizBundleIds: asStr(r['Quiz bundle IDs']),
    decisionRationale: asStr(r['Decision rationale']),
    sourceQuality: asStr(r['Source quality']),
    internalSource: asStr(r['Internal source']),
    externalAuthorityUrl: asStr(r['External authority URL']),
    sourceMatrixRow: sheet.rowIndexes[i],
  }));
}

export function readSourcesMethod(matrixDir: string): SourcesMethodRow[] {
  const sheet = loadSheet(matrixDir, 'Sources_Method');
  return sheet.rows.map((r, i) => ({
    sourceType: asStr(r['Source type']),
    topic: asStr(r['Topic']),
    sourceUrl: asStr(r['Source / URL']),
    howUsed: asStr(r['How it was used']),
    sourceMatrixRow: sheet.rowIndexes[i],
  }));
}
