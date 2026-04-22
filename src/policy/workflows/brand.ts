/* ══════════════════════════════════════════════════════════════════════
   CI brand tokens — Workflow Library.

   These are the ONLY colors the Workflow Library may use. Any other
   hue is a design-acceptance violation.
   ══════════════════════════════════════════════════════════════════════ */

import type { DomainCode, RiskBand } from '@/policy/types/workflow';

export const CI = {
  // Primary teal — active state, selected filter, link, brand divider
  teal: '#007970',
  tealHover: '#006B63',
  tealSoft: 'rgba(0,121,112,0.08)',
  tealRing: 'rgba(0,121,112,0.24)',

  // Deep primary — emphasis / dark surfaces
  deepTeal: '#004142',

  // Action orange — primary CTA / required asterisk / overdue chip
  orange: '#C74600',
  orangeHover: '#A63A00',
  orangeSoft: 'rgba(199,70,0,0.08)',

  // Neutrals
  ink: '#1F1C1B',
  inkSoft: '#524D4B',
  muted: '#747470',
  line: '#E5E4E3',
  lineSoft: '#EFEEEC',
  canvas: '#FAFBF8',
  paper: '#FFFFFF',
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
  low:                 { label: 'Low risk',         dot: '#34A37C', text: CI.inkSoft },
  moderate:            { label: 'Moderate risk',    dot: '#C8A96E', text: CI.inkSoft },
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
