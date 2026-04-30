/* ══════════════════════════════════════════════════════════════════════
   CI brand tokens — Workflow Library.

   These are the ONLY colors the Workflow Library may use. Any other
   hue is a design-acceptance violation.
   ══════════════════════════════════════════════════════════════════════ */

import type { DomainCode, RiskBand } from '@/policy/types/workflow';

export const CI = {
  // Primary teal — active state, selected filter, link, brand divider
  teal: 'var(--ci-link)',
  tealHover: 'var(--ci-link-hover)',
  tealSoft: 'var(--ci-info-bg)',
  tealRing: 'var(--ci-focus-ring)',

  // Deep primary — emphasis / dark surfaces
  deepTeal: 'var(--ci-link-hover)',

  // Action orange — primary CTA / required asterisk / overdue chip
  orange: 'var(--ci-cta)',
  orangeHover: 'var(--ci-primary-600)',
  orangeSoft: 'var(--ci-warning-bg)',

  // Neutrals
  ink: 'var(--ci-text-primary)',
  inkSoft: 'var(--ci-text-muted-2)',
  muted: 'var(--ci-text-subtle)',
  line: 'var(--ci-border)',
  lineSoft: 'var(--ci-border-strong)',
  canvas: 'var(--ci-bg)',
  paper: 'var(--ci-surface)',
} as const;

export const DOMAIN_META: Record<DomainCode, {
  name: string;
  full: string;
  accent: string;
}> = {
  GV: { name: 'Governance',  full: 'GV — Governance & Administration',      accent: CI.deepTeal },
  CL: { name: 'Clinical',    full: 'CL — Clinical Operations',              accent: CI.teal },
  QA: { name: 'QAPI',        full: 'QA — Quality Assessment & PI',          accent: CI.teal },
  HR: { name: 'HR',          full: 'HR — Human Resources',                  accent: CI.teal },
  CO: { name: 'Compliance',  full: 'CO — Compliance & Regulatory',          accent: CI.teal },
  FN: { name: 'Finance',     full: 'FN — Finance & Revenue Cycle',          accent: CI.teal },
  OP: { name: 'Operations',  full: 'OP — Operations & Facilities',          accent: CI.teal },
  EN: { name: 'Enterprise',  full: 'EN — Enterprise / Strategic',           accent: CI.teal },
  IT: { name: 'IT',          full: 'IT — Information Technology',           accent: CI.teal },
  RM: { name: 'Risk',        full: 'RM — Risk Management',                  accent: CI.teal },
};

export const RISK_META: Record<RiskBand, { label: string; dot: string; text: string }> = {
  low:                 { label: 'Low risk',         dot: 'var(--ci-success-fg)', text: CI.inkSoft },
  moderate:            { label: 'Moderate risk',    dot: 'var(--ci-warning-fg)', text: CI.inkSoft },
  high:                { label: 'High risk',        dot: CI.orange, text: CI.orange },
  immediate_jeopardy:  { label: 'Immediate jeopardy', dot: CI.orange, text: CI.orange },
};

export const CADENCE_LABEL: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  semiannual: 'Semi-annual',
  annual: 'Annual',
  biennial: 'Biennial',
  episodic: 'Per episode',
  per_event: 'On trigger',
  on_demand: 'On demand',
};
