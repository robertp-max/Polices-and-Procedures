/**
 * Handbook release checklist (handbook plan §5) — projection of the controlled
 * source HANDBOOK_RELEASE_CHECKLIST.md. Every gate is OPEN: this app cannot
 * verify employer facts, reconcile policy freshness, or capture legal approvals,
 * so the handbook stays BLOCKED from effective / acknowledgment. Status is not
 * fabricated as closed.
 */

export type GateStatus =
  | "OPEN"
  | "IN_REVIEW"
  | "APPROVED"
  | "APPROVED_WITH_CONDITION"
  | "BLOCKED"
  | "NOT_APPLICABLE";

export interface ReleaseGate {
  n: number;
  category: string;
  requirement: string;
  owner: string;
  status: GateStatus;
}

export const HANDBOOK_RELEASE_GATES: ReleaseGate[] = [
  { n: 1, category: "Legal entity and locations", requirement: "Confirm exact legal employer(s), all California work locations, remote-worker locations, and local ordinance overlays.", owner: "HR / Legal", status: "OPEN" },
  { n: 2, category: "Headcount and coverage", requirement: "Confirm headcount for FEHA/CFRA/harassment/FMLA/Cal-WARN thresholds; identify integrated-employer issues.", owner: "HR", status: "OPEN" },
  { n: 3, category: "Wage orders", requirement: "Assign each role to the correct wage order and exemption; confirm home-care/personal-attendant/live-in rules.", owner: "Payroll / Legal", status: "OPEN" },
  { n: 4, category: "Health-care minimum wage", requirement: "Determine covered health-care facility/employer status and apply the correct July 2026 schedule.", owner: "Payroll", status: "OPEN" },
  { n: 5, category: "Paid sick leave plan", requirement: "Document accrual/frontload method, benefit year, cap, pay rate, local overlays, notice/paystub configuration.", owner: "HR / Payroll", status: "OPEN" },
  { n: 6, category: "PTO / vacation / holidays", requirement: "Confirm plan design, accrual, carryover, payout, eligibility, holidays, and premium-pay commitments.", owner: "HR / Payroll", status: "OPEN" },
  { n: 7, category: "Payroll", requirement: "Confirm payday, workday, workweek, timekeeping, meal/rest reporting, OT approval, final-pay, reimbursement rates.", owner: "Payroll", status: "OPEN" },
  { n: 8, category: "Benefits", requirement: "Replace summaries with current SPD-compatible language; confirm waiting/measurement periods, COBRA/Cal-COBRA.", owner: "HR / Benefits", status: "OPEN" },
  { n: 9, category: "Leave administration", requirement: "Validate CFRA/FMLA/PDL, bereavement, reproductive loss, violence-related, military, jury, school, organ, voting, local leaves.", owner: "HR", status: "OPEN" },
  { n: 10, category: "Contacts", requirement: "Insert HR, Payroll, Compliance hotline, Privacy/Security, Safety, workers' comp carrier/MPN, and on-call contacts.", owner: "HR / Ops", status: "OPEN" },
  { n: 11, category: "Screening", requirement: "Confirm E-Verify, Fair Chance exceptions, background vendor, adverse-action workflow, OIG/SAM cadence, exclusion sources.", owner: "HR / Compliance", status: "OPEN" },
  { n: 12, category: "Substance testing", requirement: "Identify roles and lawful test methods; update cannabis protections and safety-sensitive exceptions.", owner: "HR / Compliance", status: "OPEN" },
  { n: 13, category: "Safety plans", requirement: "Reconcile IIPP, workplace-violence, heat, BBP, ATD, emergency, vehicle, field-safety plans; confirm access + training cadence.", owner: "Safety", status: "OPEN" },
  { n: 14, category: "Clinical supplements", requirement: "Approve RN, LVN, HHA, PT/PTA, OT/COTA, SLP, MSW, DON, Administrator, and nonclinical role supplements.", owner: "DON / Clinical", status: "OPEN" },
  { n: 15, category: "HHA oversight", requirement: "Confirm 14/60-day/annual/semiannual supervision workflow, direct-observation records, 12-hour in-service, deficiency remediation.", owner: "DON / Clinical", status: "OPEN" },
  { n: 16, category: "Policy corpus review", requirement: "272 policies; 205 past next-review (73 cited by this handbook). Reapprove, update, or document authorized extension before release.", owner: "Policy Management", status: "OPEN" },
  { n: 17, category: "Forms and workflow wiring", requirement: "Verify every referenced form exists, has the correct title/version, and opens through the canonical Forms Library.", owner: "Policy Management", status: "OPEN" },
  { n: 18, category: "Privacy", requirement: "Confirm CCPA applicability, employee privacy/monitoring notices, BYOD/location tracking, retention, incident process.", owner: "Privacy / Security", status: "OPEN" },
  { n: 19, category: "Languages and accessibility", requirement: "Provide workplace translations; validate accessible tagged HTML/PDF, screen-reader behavior, alternate-format process.", owner: "HR / Compliance", status: "OPEN" },
  { n: 20, category: "Required notices", requirement: "Distribute the 2026 Workplace Know Your Rights notice; maintain posters/notices separately from the handbook.", owner: "HR", status: "OPEN" },
  { n: 21, category: "Approval and evidence", requirement: "Obtain counsel/HR/Payroll/Compliance/Safety/DON/Administrator/Governing Body approval; record version, hash, distribution, training, acknowledgments.", owner: "Governing Body", status: "OPEN" },
];

export interface ApprovalSlot {
  role: string;
  status: GateStatus;
  approver: string | null;
  date: string | null;
}

export const HANDBOOK_APPROVAL_BLOCK: ApprovalSlot[] = [
  { role: "California employment counsel", status: "OPEN", approver: null, date: null },
  { role: "Human Resources", status: "OPEN", approver: null, date: null },
  { role: "Payroll / wage-hour owner", status: "OPEN", approver: null, date: null },
  { role: "Compliance / Privacy / Security", status: "OPEN", approver: null, date: null },
  { role: "Safety / workers' compensation", status: "OPEN", approver: null, date: null },
  { role: "Director of Nursing / Clinical Manager", status: "OPEN", approver: null, date: null },
  { role: "Administrator", status: "OPEN", approver: null, date: null },
  { role: "Governing Body or delegated approving authority", status: "OPEN", approver: null, date: null },
];

const BLOCKING: GateStatus[] = ["OPEN", "IN_REVIEW", "BLOCKED"];

export function releaseIsBlocked(): boolean {
  return (
    HANDBOOK_RELEASE_GATES.some((g) => BLOCKING.includes(g.status)) ||
    HANDBOOK_APPROVAL_BLOCK.some((a) => a.status !== "APPROVED")
  );
}

export function gateCounts(): Record<GateStatus, number> {
  const counts = { OPEN: 0, IN_REVIEW: 0, APPROVED: 0, APPROVED_WITH_CONDITION: 0, BLOCKED: 0, NOT_APPLICABLE: 0 } as Record<GateStatus, number>;
  for (const g of HANDBOOK_RELEASE_GATES) counts[g.status]++;
  return counts;
}
