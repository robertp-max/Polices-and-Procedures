import type { PolicyContent } from '../types';
import { allPoliciesContent, allPoliciesContentMap } from './allPoliciesContent.generated';

// GV-GB-001 is present in the approved raw policy packet but was omitted from the
// generated policy library. Keep the recovery explicit so the release audit can
// distinguish generated bodies from the one source-restored body.
export const governingBodyAuthorityPolicy: PolicyContent = {
  policyId: 'GV-GB-001',
  sourceType: 'controlled_raw_source_recovery',
  sourceRef: '07-ALL_POLICIES.md — Governing Body Authority & Responsibilities',
  sections: [
    {
      id: 'gv-gb-001-title',
      title: 'Governing Body Authority & Responsibilities',
      level: 1,
      order: 1,
      body: 'The Governing Body is the ultimate authority accountable for the operation, management, fiscal viability, and regulatory compliance of Care Indeed Home Health Care, Inc.',
    },
    {
      id: 'gv-gb-001-header',
      title: '1. Policy Header',
      level: 2,
      order: 2,
      body: '| Field | Value |\n| :---- | :---- |\n| Policy ID | GV-GB-001 |\n| Policy Title | Governing Body Authority & Responsibilities |\n| Classification Tier | REQUIRED |\n| Status | SOURCE RECOVERED — CONTROLLED APPROVAL METADATA PENDING RECONCILIATION |\n| Review Cycle | Annual and on material revision |\n| Access Tier | Tier 2 — Restricted |\n| Policy Owner / Steward | Governing Body Chair / Compliance Officer |\n| Source Version | 6.0 |\n| Source Effective Date | 2025-07-10 |\n| Controlling Authority | 42 CFR § 484.105 |',
    },
    {
      id: 'gv-gb-001-purpose',
      title: '2. Purpose',
      level: 2,
      order: 3,
      body: "This policy establishes the authority, composition, functions, and oversight responsibilities of the Governing Body of Care Indeed Home Health Care, Inc. It implements 42 CFR § 484.105, which requires the home health agency's governing body to assume full legal authority and responsibility for the agency's overall operation and management.",
    },
    {
      id: 'gv-gb-001-scope',
      title: '3. Scope',
      level: 2,
      order: 4,
      body: 'This policy applies to all voting and non-voting Governing Body members; the Agency Administrator; the Director of Nursing / Clinical Manager; the Compliance Officer; senior leaders who report to the Governing Body or Administrator; and contracted management entities performing governing-body functions. It does not apply to day-to-day staff except where Board decisions establish requirements governing their work.',
    },
    {
      id: 'gv-gb-001-statement',
      title: '4. Policy Statement',
      level: 2,
      order: 5,
      body: '4.1 Care Indeed Home Health Care, Inc. shall maintain a designated Governing Body with full legal authority and responsibility for agency operations, management, and regulatory compliance.\n\n4.2 The Governing Body shall ensure compliance with applicable federal, state, and local law, regulation, and licensure requirements.\n\n4.3 The Governing Body shall appoint a qualified Administrator authorized to manage daily operations on its behalf.\n\n4.4 The Governing Body shall ensure the appointment and continuing oversight of a qualified Clinical Manager responsible for clinical services.\n\n4.5 The Governing Body shall approve and oversee the scope of services, organizational structure, annual strategic plan, REQUIRED-tier policy framework, QAPI program, corporate compliance program, annual operating budget, and emergency preparedness plan.\n\n4.6 The Governing Body shall meet no less than quarterly and document its work in formal minutes.\n\n4.7 The Governing Body shall not delegate ultimate accountability for regulatory compliance, patient safety, or fiscal integrity.\n\n4.8 Members shall disclose and manage conflicts of interest.\n\n4.9 A substantive revision requires re-acknowledgment by all Governing Body members and senior leadership within 14 calendar days.',
    },
    {
      id: 'gv-gb-001-responsibilities',
      title: '6. Core Responsibilities',
      level: 2,
      order: 6,
      body: 'The Governing Body directly retains ultimate accountability for legal authority and agency operations; appointment and oversight of key personnel; policy and compliance oversight; QAPI oversight; financial oversight; emergency preparedness; valid meetings; conflict management; and escalation of exceptions that cannot be resolved within delegated authority.',
    },
    {
      id: 'gv-gb-001-survey',
      title: '8. Survey & Audit Expectations',
      level: 2,
      order: 7,
      body: 'Surveyors will look for evidence that the Governing Body exists and functions; appointed a qualified Administrator; oversees the Clinical Manager; reviewed, approved, and acted on QAPI data; approved policies through a controlled cycle; monitored financial viability; and maintained complete minutes showing attendance, quorum, deliberation, decisions, assignments, and follow-through. Passive receipt of reports without documented action is a common deficiency.',
    },
    {
      id: 'gv-gb-001-training',
      title: '10. Training & Acknowledgment',
      level: 2,
      order: 8,
      body: '10.1 Governing Body members shall receive orientation to this policy within 14 calendar days of appointment, covering authority, meeting and quorum requirements, conflicts, QAPI, compliance, financial oversight, and survey expectations.\n\n10.2 Members and in-scope senior leaders shall acknowledge the policy within 14 calendar days of its effective date, any revision, or appointment.\n\n10.3 The Administrator shall report missed acknowledgments to the Chair within 7 calendar days after the deadline; the Chair shall impose a 7-day mandatory completion deadline.\n\n10.4 Annual refresher training shall occur at the first quarterly meeting of each calendar year and be documented in the minutes.',
    },
    {
      id: 'gv-gb-001-version',
      title: '11. Version Control',
      level: 2,
      order: 9,
      body: 'Only the current approved version is valid. Superseded versions must be archived and marked not for use. Substantive revisions require Governing Body approval in the minutes, re-acknowledgment within 14 calendar days, and an enterprise-policy-index update. Non-substantive revisions may be approved by the Administrator with notice to the Governing Body at its next regular meeting.',
    },
    {
      id: 'gv-gb-001-record',
      title: 'Appendices & Required Record',
      level: 2,
      order: 10,
      body: 'The controlled source includes the Governing Body membership roster, conflict-of-interest disclosure, policy acknowledgment, meeting-minutes template, quarterly oversight checklist, and annual calendar of required Governing Body actions. These records must remain traceable to the meeting, decision, accountable owner, deadline, and evidence of follow-through.',
    },
  ],
};

export const governingBodyPolicyContentMap = new Map(allPoliciesContentMap);
governingBodyPolicyContentMap.set(governingBodyAuthorityPolicy.policyId, governingBodyAuthorityPolicy);

export const governingBodyPolicyContents = [
  ...allPoliciesContent,
  governingBodyAuthorityPolicy,
];
