/**
 * CLPolicyDetailView.tsx
 * Specialized detail views for CL — Clinical Operations domain policies.
 * All 70 CL policies rendered with full structured content.
 * Architecture mirrors GVPolicyDetailView.tsx.
 */
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Printer, FileText, Shield, Search, CheckCircle, BookOpen,
  AlertTriangle, Settings, List, CheckSquare, Archive, Info,
  ChevronRight, ArrowLeft, Paperclip,
} from 'lucide-react';

// ─── ALL 70 CL POLICY IDS ─────────────────────────────────────────────────────
export const CL_POLICY_IDS: string[] = [
  'CL-CP-001','CL-CP-002','CL-CP-003','CL-CP-004','CL-CP-005',
  'CL-CP-006','CL-CP-007','CL-CP-008','CL-CP-009',
  'CL-SD-001','CL-SD-002','CL-SD-003','CL-SD-004','CL-SD-005',
  'CL-SD-006','CL-SD-007','CL-SD-008','CL-SD-009','CL-SD-010',
  'CL-SD-011','CL-SD-012','CL-SD-013','CL-SD-014','CL-SD-015',
  'CL-SD-016','CL-SD-017','CL-SD-018','CL-SD-019','CL-SD-020',
  'CL-SD-021','CL-SD-022','CL-SD-023','CL-SD-024','CL-SD-025',
  'CL-CA-001','CL-CA-002','CL-CA-003','CL-CA-004','CL-CA-005',
  'CL-CA-006','CL-CA-007',
  'CL-CD-001','CL-CD-002','CL-CD-003','CL-CD-004',
  'CL-PR-001','CL-PR-002','CL-PR-003','CL-PR-004','CL-PR-005','CL-PR-006',
  'CL-OA-001','CL-OA-002','CL-OA-003','CL-OA-004','CL-OA-005',
  'CL-OA-006','CL-OA-007','CL-OA-008','CL-OA-009','CL-OA-010',
  'CL-OA-011','CL-OA-012','CL-OA-013','CL-OA-014','CL-OA-015',
  'CL-OA-016','CL-OA-017','CL-OA-018','CL-OA-019',
];

// ─── SHARED HELPERS ───────────────────────────────────────────────────────────
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white shadow-sm rounded-xl p-6 mb-6 ${className}`}>{children}</div>
);

const SectionTitle = ({ icon: Icon, title, color = 'text-[#007970]' }: {
  icon?: React.ElementType; title: string; color?: string;
}) => (
  <h2 className={`font-montserrat text-2xl font-bold flex items-center mb-6 ${color}`}>
    {Icon && <Icon className="mr-3" size={28} />}
    {title}
  </h2>
);

const SimpleTable = ({ headers, rows }: {
  headers: string[]; rows: (string | React.ReactNode)[][];
}) => (
  <div className="overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm mb-6">
    <table className="w-full table-fixed text-left border-collapse">
      <thead>
        <tr className="bg-[#007970] text-white">
          {headers.map((h, i) => (
            <th key={i} className="p-4 font-montserrat font-bold text-sm tracking-wide border-b border-[#006059]">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {rows.map((row, i) => (
          <tr key={i} className="hover:bg-gray-50 transition-colors even:bg-gray-50/30">
            {row.map((cell, j) => (
              <td key={j} className="p-4 text-gray-700 text-sm align-top leading-relaxed whitespace-pre-line">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── CONTENT INTERFACE ────────────────────────────────────────────────────────
interface PolicyContent {
  id: string;
  title: string;
  domain: string;
  subdomain: string;
  tier: string;
  version: string;
  effective: string;
  approvedBy: string;
  lastReviewed: string;
  nextReviewDate: string;
  supersedes: string;
  ownerSteward: string;
  purpose: string;
  scopeItems: string[];
  definitions: { term: string; definition: string }[];
  statements: string[];
  procedures: string[][];
  documentationRows: string[][];
  complianceIndicators: string[][];
  commonFailures: string[][];
  surveyorItems: string[];
  federalRefs: string[][];
  crossRefs: string[][];
  trainingItems: string[];
}

// ─── HELPERS FOR CONTENT BUILDING ─────────────────────────────────────────────
function clBase(id: string, title: string, subdomain: string, tier = 'REQUIRED', _accessTier = 'Tier 2 — Restricted'): Partial<PolicyContent> {
  return {
    id, title,
    domain: 'CL — Clinical Operations',
    subdomain,
    tier,
    version: '1.0',
    effective: '2025-07-10',
    approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    lastReviewed: '2025-07-10',
    nextReviewDate: '2026-07-10',
    supersedes: 'N/A (Initial Version)',
    ownerSteward: 'Director of Nursing',
  };
}

function makeGenericCL(
  id: string, title: string, subdomain: string, tier: string,
  purpose: string,
  scopeItems: string[],
  definitions: { term: string; definition: string }[],
  statements: string[],
  procedures: string[][],
  documentationRows: string[][],
  complianceIndicators: string[][],
  commonFailures: string[][],
  surveyorItems: string[],
  federalRefs: string[][],
  crossRefs: string[][],
  trainingItems: string[],
): PolicyContent {
  return {
    ...clBase(id, title, subdomain, tier) as PolicyContent,
    purpose, scopeItems, definitions, statements, procedures,
    documentationRows, complianceIndicators, commonFailures,
    surveyorItems, federalRefs, crossRefs, trainingItems,
  };
}

// ─── CL-CP — CARE PLANNING ────────────────────────────────────────────────────

const CL_CP_001: PolicyContent = makeGenericCL(
  'CL-CP-001', 'Plan of Care Development & Approval', 'CP — Care Planning', 'REQUIRED',
  'This policy establishes requirements for the individualized Plan of Care (POC) development, physician order integration, and timely approval for each patient admitted to Care Indeed Home Health Care, Inc. The Plan of Care is the central care management tool mandated by 42 CFR 484.60 and must reflect the patient\'s individualized clinical needs, measurable goals, and physician-authorized services.',
  [
    'All registered nurses (RNs) and qualified therapists who initiate or contribute to Plans of Care',
    'The Director of Nursing responsible for clinical oversight of POC quality and timeliness',
    'All physicians and allowed practitioners whose orders authorize the services on the POC',
    'All home health aides and ancillary staff whose services are reflected in the POC',
    'All patients and authorized representatives who participate in POC development',
  ],
  [
    { term: 'Plan of Care (POC)', definition: 'A physician-authorized document specifying the patient\'s medical diagnoses, types of services and supplies needed, frequency and duration of care, safety measures, patient goals, and discharge planning.' },
    { term: '485 Form (CMS-485)', definition: 'The standardized Home Health Certification and Plan of Care form used to document and authenticate the POC for Medicare-certified home health patients.' },
    { term: 'Certification Period', definition: 'A 60-day episode of care for which a physician must certify continued eligibility and approve a Plan of Care.' },
    { term: 'Start of Care (SOC)', definition: 'The first billable visit at which skilled assessment and initial POC activities occur.' },
    { term: 'Interdisciplinary Team (IDT)', definition: 'The team of clinicians from all disciplines involved in a patient\'s care who contribute to and review the Plan of Care.' },
  ],
  [
    '4.1 Care Indeed Home Health Care, Inc. shall develop an individualized Plan of Care for every patient prior to the initiation of services, based upon a comprehensive assessment conducted per CL-CA-001.',
    '4.2 The Plan of Care shall be developed by or in consultation with the attending physician or allowed practitioner and shall be authorized before services begin or at the time of the initial visit per 42 CFR 484.60.',
    '4.3 The POC shall include all required elements: primary and secondary diagnoses, types of services, visit frequency, duration per certification period, safety measures, medications, patient goals with measurable outcomes, and functional status targets.',
    '4.4 The POC shall be reviewed and updated at least every 60 days (at each recertification) and whenever there is a significant change in the patient\'s condition or at the physician\'s direction.',
    '4.5 All disciplines providing services shall contribute their respective components to the POC, and the IDT shall communicate POC status at case conferences.',
    '4.6 A copy of the approved POC shall be maintained in the patient\'s clinical record and a copy provided to the patient or authorized representative.',
  ],
  [
    ['6.1.1', 'Admitting RN / Qualified Therapist', 'Complete the comprehensive assessment at the initial visit and use findings to initiate the Plan of Care. Ensure all required elements per 42 CFR 484.60(a) are addressed.', 'At SOC; POC initiated within 24 hours of SOC visit.'],
    ['6.1.2', 'Director of Nursing (DON)', 'Review and approve the draft POC for clinical completeness and appropriateness. Coordinate with the attending physician to obtain verbal authorization if the signed order has not yet been received.', 'Within 24 hours of POC initiation.'],
    ['6.1.3', 'Case Manager / Scheduler', 'Send the POC/CMS-485 to the attending physician for signature. Track unsigned orders per CL-CP-009 (Physician Order Signature Tracking).', 'Within 5 calendar days of POC initiation.'],
    ['6.1.4', 'Attending Physician', 'Review, sign, and return the Plan of Care to authorize services. Any changes or additional orders must be communicated to the DON within 24 hours.', 'Within 30 calendar days of POC receipt per CMS regulations.'],
    ['6.2.1', 'IDT', 'Conduct interdisciplinary case conferences at minimum every 30 days to review POC progress toward goals. Document conference in the clinical record with attendees, goals status, and any changes.', 'Minimum every 30 calendar days.'],
    ['6.2.2', 'RN / Case Manager', 'Update the POC when patient condition changes, physician orders are modified, or new services are added. Obtain new physician authorization for material changes.', 'Within 24 hours of any significant change.'],
    ['6.3.1', 'RN / Case Manager', 'Initiate recertification POC review during the 5th week of the current certification period to allow adequate time for physician signature before the period expires.', 'During week 5 of each 60-day certification period.'],
  ],
  [
    ['Plan of Care (CMS-485)', 'Physician-signed POC/485 for every patient, every certification period.', 'Admitting RN / DON', 'Clinical Record — POC section.', 'Initiated at SOC; signed copy obtained within 30 days.'],
    ['IDT Conference Notes', 'Documentation of interdisciplinary case conference attendance, topics, and decisions.', 'Case Manager', 'Clinical Record — Progress Notes.', 'Minimum every 30 days.'],
    ['POC Change Documentation', 'Record of all updates to the POC with orders and rationale.', 'RN / Case Manager', 'Clinical Record.', 'Within 24 hours of change.'],
    ['Physician Signature Tracking Log', 'Log of all unsigned POCs and orders with follow-up dates.', 'DON / Case Manager', 'Operations Log.', 'Reviewed daily; per CL-CP-009.'],
  ],
  [
    ['POC is individualized for each patient.', 'Record review: POC contains patient-specific diagnoses, goals, and frequencies.', '100% of active patients have a current, individualized POC.'],
    ['Physician signature obtained within required timeframe.', 'Audit of POC signature dates against SOC dates.', '95% of POCs signed within 30 calendar days of SOC.'],
    ['POC updated at recertification and with condition changes.', 'Review of recertification orders and POC revision dates.', '100% of recertifications reflected in updated POC.'],
    ['IDT case conferences documented per schedule.', 'Review of conference documentation frequency.', 'Monthly IDT conference documented for 90%+ of active patients.'],
  ],
  [
    ['No signed physician authorization on file.', 'CMS billing denial; potential fraud finding.', 'Implement physician signature tracking per CL-CP-009 with escalation at days 15, 22, and 29.'],
    ['POC not updated after condition change.', 'Services not aligned with current patient needs; surveyor citation.', 'Train all RNs to update POC within 24 hours of any significant change; DON reviews weekly.'],
    ['Goals not measurable on the POC.', 'OASIS goal alignment fails; star rating impact.', 'Provide training on goal-writing with measurable outcomes; DON reviews all initial POCs.'],
  ],
  [
    'Surveyors will review POCs for individualization — generic or template-only POCs are cited.',
    'Surveyors will verify physician authorization dates and cross-check against visit dates.',
    'Surveyors will assess whether IDT case conference documentation reflects active multi-disciplinary collaboration.',
    'Surveyors will check that recertification POCs were developed timely before period expiration.',
  ],
  [
    ['42 CFR 484.60', 'Condition of participation: Care planning, coordination of services, and quality of care', 'Primary regulatory authority for Plan of Care requirements.'],
    ['42 CFR 484.60(a)', 'Plan of care', 'Specifies required POC content elements and physician authorization.'],
    ['42 CFR 484.60(e)', 'Coordination of care', 'Requires IDT involvement in POC development and review.'],
    ['CMS OASIS Guidance Manual', 'Current edition', 'Assessment findings that drive POC development.'],
  ],
  [
    ['CL-CA-001', 'Patient Assessment — Comprehensive', 'Assessment findings drive POC development.'],
    ['CL-CP-002', 'Plan of Care Review & Update', 'Ongoing POC maintenance requirements.'],
    ['CL-CP-003', 'Physician Orders & Order Management', 'Order tracking related to POC authorization.'],
    ['CL-CP-008', 'Physician Recertification Timing Compliance', 'Recertification POC timeliness requirements.'],
    ['CL-CP-009', 'Physician Order Signature Tracking & Escalation', 'Signature follow-up process.'],
  ],
  [
    'All RNs and qualified therapists shall receive orientation to POC development requirements within 14 calendar days of hire and at each annual competency review.',
    'Annual review of POC quality shall be incorporated into the QAPI program per QA-PG-001.',
    'This policy shall be reviewed and approved annually by the Governing Body.',
  ],
);

const CL_CP_002: PolicyContent = makeGenericCL(
  'CL-CP-002', 'Plan of Care Review & Update', 'CP — Care Planning', 'REQUIRED',
  'This policy mandates periodic review, evaluation, and update of the Plan of Care at each recertification period and whenever a patient\'s condition, functional status, or physician orders change. Maintaining a current and accurate POC is essential to patient safety, billing compliance, and CMS survey readiness.',
  [
    'All RNs and therapists who function as case managers for home health patients',
    'The Director of Nursing responsible for POC quality oversight',
    'All attending physicians whose orders govern the POC',
    'All interdisciplinary team members contributing to POC updates',
  ],
  [
    { term: 'Recertification', definition: 'The process by which a physician certifies that a patient\'s continued skilled home health services are medically necessary for another 60-day period.' },
    { term: 'Significant Change in Condition (SCIC)', definition: 'A major decline or improvement in a patient\'s health status that requires a comprehensive reassessment and POC update.' },
    { term: 'OASIS Follow-Up', definition: 'An OASIS assessment required when a patient has a significant change in condition between recertification periods.' },
    { term: 'Resumption of Care (ROC)', definition: 'The resumption of home health services following an inpatient stay, requiring a new OASIS and updated POC.' },
  ],
  [
    '4.1 The Plan of Care shall be reviewed and evaluated for goal progress and clinical appropriateness prior to each 60-day recertification.',
    '4.2 A new or updated POC shall be developed and submitted for physician authorization prior to the start of each subsequent certification period.',
    '4.3 The POC shall be updated whenever a significant change in the patient\'s condition is identified, per 42 CFR 484.60(d).',
    '4.4 At Resumption of Care following an inpatient stay, a new OASIS assessment shall be conducted and the POC updated to reflect the patient\'s current status.',
    '4.5 All POC updates shall be reflected in a physician order and documented in the clinical record.',
  ],
  [
    ['6.1.1', 'Case Manager (RN/Therapist)', 'Initiate POC review during the 5th week of the current certification period. Evaluate goal attainment, functional status changes, service needs for the next period, and discharge potential.', 'Week 5 of current 60-day period.'],
    ['6.1.2', 'Case Manager', 'Prepare the recertification POC/CMS-485 with updated goals, frequencies, and clinical narrative for physician review and signature.', 'Completed and sent to physician during week 5.'],
    ['6.1.3', 'DON', 'Review all recertification POCs for clinical appropriateness and completeness before transmission to physician.', 'Within 48 hours of case manager submission.'],
    ['6.2.1', 'Field Clinician', 'Identify any significant change in patient condition during any visit. Complete OASIS follow-up if indicated. Notify the Case Manager and DON immediately of significant changes.', 'At time of identification; notification within 24 hours.'],
    ['6.2.2', 'Case Manager', 'Update the POC within 24 hours of a significant change. Obtain modified orders from the physician as needed. Document rationale for all changes in the clinical record.', 'Within 24 hours of change identification.'],
    ['6.3.1', 'Case Manager', 'At Resumption of Care: conduct OASIS ROC assessment, update the POC to reflect post-inpatient clinical status, and transmit updated POC to the physician for signature.', 'At the first ROC visit.'],
  ],
  [
    ['Recertification POC', 'Updated and physician-signed POC for each new certification period.', 'Case Manager / DON', 'Clinical Record.', 'Prior to period start; signed within 30 days.'],
    ['SCIC Documentation', 'Clinical notation of significant change with supporting observations and updated POC.', 'Field Clinician / Case Manager', 'Clinical Record.', 'Within 24 hours of identification.'],
    ['ROC Assessment & POC', 'OASIS ROC assessment with updated POC following inpatient stay.', 'Admitting RN', 'Clinical Record.', 'At first ROC visit.'],
  ],
  [
    ['Recertification POC timely developed.', 'Audit of recertification dates vs. POC preparation dates.', '100% of recertification POCs initiated in week 5 of each period.'],
    ['Significant changes result in POC update.', 'Review of clinical records for SCIC documentation with POC revision.', '100% of identified SCICs have documented POC updates within 24 hours.'],
    ['Physician authorization obtained for updated POC.', 'Audit of POC signature dates.', '95% of updated POCs signed within 30 days of transmission.'],
  ],
  [
    ['Recertification POC not developed until after period expiration.', 'Gap in authorization; billing denial; potential fraud exposure.', 'Build week 5 recertification initiation into case manager workflow and DON weekly audit.'],
    ['SCIC not identified or POC not updated.', 'Services inconsistent with current patient needs; safety risk.', 'Train all field staff to identify and report SCIC criteria; DON conducts weekly case conference.'],
  ],
  [
    'Surveyors will look for alignment between OASIS findings and POC service frequency orders.',
    'Surveyors will verify that recertification POCs were prepared and authorized before the new period started.',
    'Surveyors will check that identified SCICs resulted in timely POC updates and follow-up OASIS when required.',
  ],
  [
    ['42 CFR 484.60(a)-(d)', 'Plan of care', 'Mandates POC content, review frequency, and update requirements.'],
    ['42 CFR 484.55', 'Comprehensive assessment of patients', 'SCIC and ROC assessment triggers.'],
  ],
  [
    ['CL-CP-001', 'Plan of Care Development & Approval', 'Initial POC development standards.'],
    ['CL-CA-004', 'Recertification Assessment & Process', 'Assessment components at recertification.'],
    ['CL-CP-008', 'Physician Recertification Timing Compliance', 'Recertification timeliness compliance.'],
  ],
  [
    'All case managers shall receive competency review on recertification POC processes annually.',
    'SCIC identification criteria shall be reviewed at annual clinical competency modules.',
  ],
);

const CL_CP_003: PolicyContent = makeGenericCL(
  'CL-CP-003', 'Physician Orders & Order Management', 'CP — Care Planning', 'REQUIRED',
  'This policy defines the requirements for obtaining, documenting, managing, and tracking all physician and allowed practitioner orders related to home health patient care at Care Indeed Home Health Care, Inc. All services must be authorized by a physician order before being provided, and order management must meet CMS documentation standards.',
  [
    'All RNs, therapists, and other licensed clinicians receiving or acting on physician orders',
    'The Director of Nursing responsible for order tracking and compliance',
    'All attending physicians and allowed practitioners issuing orders',
    'The administrative staff responsible for order transmission and filing',
  ],
  [
    { term: 'Physician Order', definition: 'A written, verbal, or electronic directive from a licensed physician or allowed practitioner authorizing a specific clinical service, medication, treatment, or procedure.' },
    { term: 'Allowed Practitioner', definition: 'A nurse practitioner (NP), physician assistant (PA), or clinical nurse specialist (CNS) authorized under state law to certify and sign orders for home health services.' },
    { term: 'Verbal Order (VO)', definition: 'An oral order from a physician or allowed practitioner communicated directly to a licensed clinician and documented immediately in the clinical record pending authentication.' },
    { term: 'Order Set', definition: 'A pre-defined group of related orders typically used for standardized clinical situations.' },
  ],
  [
    '4.1 All skilled services provided by Care Indeed Home Health Care, Inc. shall be authorized by a current, valid physician or allowed practitioner order.',
    '4.2 Orders shall contain: patient name, date, service type, specific instructions, signature of the ordering provider, and date of signature.',
    '4.3 Verbal orders shall be managed per CL-CP-004 (Verbal Order Receipt & Authentication) and captured in writing immediately.',
    '4.4 Physician orders shall be transmitted, tracked, and filed per established procedures to ensure no services are provided without authorization.',
    '4.5 Unsigned orders are not considered valid. Services rendered under unsigned orders are non-billable until the order is authenticated.',
  ],
  [
    ['6.1.1', 'RN / Therapist', 'Generate all required orders from the POC and communications with the physician. Document new orders in the clinical record immediately with the source, date, and order content.', 'At time of order generation.'],
    ['6.1.2', 'Administrative Staff / Case Manager', 'Transmit orders to the attending physician for signature within 5 calendar days of generation. Use secure fax, secure email, or EHR portal per IT security policy.', 'Within 5 calendar days.'],
    ['6.1.3', 'DON / Case Manager', 'Track all pending unsigned orders per CL-CP-009 (Physician Order Signature Tracking). Escalate per that policy\'s follow-up timeline.', 'Per CL-CP-009 tracking protocol.'],
    ['6.1.4', 'Medical Records / Filing Staff', 'File all signed and unsigned orders in the patient clinical record in chronological order. Flag unsigned orders for follow-up action.', 'Within 24 hours of receipt.'],
    ['6.2.1', 'DON', 'Conduct monthly audit of orders to identify any unsigned orders exceeding 30 days. Report findings to Administrator and escalate per CL-CP-009.', 'Monthly.'],
  ],
  [
    ['Physician orders (all types)', 'Signed physician orders for all services, medications, and treatments.', 'RN / Administrative Staff', 'Clinical Record.', 'Generated at POC initiation; signature obtained within 30 days.'],
    ['Order Tracking Log', 'Log of all pending unsigned orders with follow-up dates.', 'DON / Case Manager', 'Operations Log (per CL-CP-009).', 'Daily.'],
  ],
  [
    ['All services have current valid orders.', 'Audit of clinical records for order coverage.', '100% of services performed under signed orders.'],
    ['Orders tracked per CL-CP-009.', 'Review of tracking log completeness.', 'All unsigned orders appearing in tracking log; no orders > 30 days unsigned without escalation documentation.'],
  ],
  [
    ['Services provided without valid physician order.', 'CMS billing denial; potential fraud finding.', 'Train all clinical staff: no service without a current order; DON conducts weekly new order review.'],
    ['Orders lost or not transmitted.', 'Missing documentation; audit finding.', 'Standardize order transmission process; confirm receipt within 5 days of transmission.'],
  ],
  [
    'Surveyors will verify that every service billed had a corresponding valid physician order.',
    'Surveyors will check for orders signed within required timeframes relative to the service provided.',
    'Surveyors will request the order tracking log or inquiry processes when orders are outstanding.',
  ],
  [
    ['42 CFR 484.60', 'Care planning, coordination of services, and quality of care', 'Physician orders must authorize all POC services.'],
    ['42 CFR 409.41', 'Requirements for home health services', 'Physician certification requirements.'],
  ],
  [
    ['CL-CP-004', 'Verbal Order Receipt & Authentication', 'Process for verbal orders.'],
    ['CL-CP-008', 'Physician Recertification Timing Compliance', 'Recertification order timeliness.'],
    ['CL-CP-009', 'Physician Order Signature Tracking & Escalation', 'Order signature tracking protocol.'],
  ],
  [
    'All clinical staff shall receive training on order management requirements at hire and annually.',
    'Order management shall be included in the QAPI audit calendar on a quarterly basis.',
  ],
);

const CL_CP_004: PolicyContent = makeGenericCL(
  'CL-CP-004', 'Verbal Order Receipt & Authentication', 'CP — Care Planning', 'REQUIRED',
  'This policy establishes protocols for receiving, reading back, documenting, and authenticating verbal orders from physicians and allowed practitioners. Verbal orders present a significant risk for miscommunication and must be managed under an explicit, consistent protocol to ensure patient safety and regulatory compliance.',
  [
    'All licensed RNs and therapists authorized to receive verbal orders',
    'All physicians and allowed practitioners who may issue verbal orders',
    'The Director of Nursing responsible for verbal order oversight',
    'Medical records staff responsible for verbal order filling and authentication tracking',
  ],
  [
    { term: 'Verbal Order', definition: 'An oral instruction from a physician or allowed practitioner communicated directly to a licensed clinician and requiring documentation and subsequent written authentication.' },
    { term: 'Read-Back', definition: 'The process by which the receiving clinician restates the entire verbal order to the ordering provider for confirmation before acting on it.' },
    { term: 'Authentication', definition: 'The process by which the ordering provider countersigns a verbal order in writing (or electronically), confirming its accuracy and authorizing it as a written record.' },
    { term: 'CPOE', definition: 'Computerized Provider Order Entry — an electronic system through which providers may enter orders directly, which is preferred over verbal orders.' },
  ],
  [
    '4.1 Verbal orders shall be accepted only by licensed RNs and qualified therapists. Unlicensed personnel and home health aides shall not accept verbal orders.',
    '4.2 All verbal orders shall be immediately documented in the clinical record at the time of receipt, including: date and time, content of the order, name of the ordering physician, and the name and credentials of the clinician receiving the order.',
    '4.3 The receiving clinician shall read back the complete verbal order to the ordering provider and obtain verbal confirmation before ending the call.',
    '4.4 Verbal orders shall be transmitted to the attending physician for written authentication within 48 hours. Authentication shall be obtained within 30 calendar days of the verbal order date.',
    '4.5 Verbal orders for new or changed medications shall prompt the receiving clinician to assess the patient for allergies and known interactions before acting on the order.',
  ],
  [
    ['6.1.1', 'Licensed Clinician (RN/Therapist)', 'Receive the verbal order. Simultaneously write or electronically document the full order content in the clinical record while speaking with the physician. Include: patient name, date/time, full order content, ordering provider name, and receiving clinician name/credentials.', 'At time of receipt — contemporaneously.'],
    ['6.1.2', 'Licensed Clinician', 'Read back the entire documented order to the physician before hanging up. Receive and document verbal confirmation. Note "read-back confirmed" in the order entry.', 'Immediately — before ending the call.'],
    ['6.1.3', 'Licensed Clinician', 'Flag verbal orders for authentication. Transmit to physician for written signature within 48 hours via secure fax, email, or EHR portal.', 'Within 48 hours of verbal order.'],
    ['6.1.4', 'DON / Administrative Staff', 'Track all verbal orders pending authentication. Escalate per CL-CP-009 if not authenticated within 30 days.', 'Per CL-CP-009 tracking protocol.'],
    ['6.2.1', 'DON', 'Conduct monthly audit of verbal order read-back documentation compliance. Review a random sample of verbal orders for completeness of documentation.', 'Monthly audit.'],
  ],
  [
    ['Verbal Order entries', 'Contemporaneous documentation in clinical record with date/time, content, ordering provider, receiving clinician, and read-back confirmation.', 'Receiving Clinician', 'Clinical Record.', 'At time of receipt.'],
    ['Verbal Order Authentication Log', 'Log of all verbal orders pending written authentication.', 'DON / Admin', 'Operations File.', 'Tracked continuously; 30-day threshold for authentication.'],
  ],
  [
    ['Verbal orders include read-back confirmation documentation.', 'Monthly audit of verbal order entries for read-back notation.', '95% of verbal orders contain documented read-back confirmation.'],
    ['Verbal orders authenticated within 30 days.', 'Audit of authentication dates.', '95% of verbal orders authenticated within 30 calendar days.'],
  ],
  [
    ['Verbal order not documented contemporaneously.', 'Medication error risk; documentation gap; surveyor citation.', 'Train all clinical staff: document during the call, not after.'],
    ['No read-back performed or documented.', 'Miscommunication risk; patient safety event; survey finding.', 'Make read-back a mandatory documented element; include in competency review.'],
    ['Verbal order not authenticated.', 'Non-billable service; audit finding.', 'Implement verbal order tracking log with 30-day authentication threshold.'],
  ],
  [
    'Surveyors will sample verbal orders and look for contemporaneous documentation with read-back confirmation.',
    'Surveyors will verify authentication dates for verbal orders relative to the date of service.',
    'Surveyors will check whether unlicensed personnel received any verbal orders.',
  ],
  [
    ['42 CFR 484.60', 'Care planning', 'All services must be physician-authorized; verbal orders are an authorization mechanism.'],
    ['Joint Commission NPSG.02.03.01', 'Read back of verbal orders', 'Best practice standard for verbal order read-back.'],
  ],
  [
    ['CL-CP-003', 'Physician Orders & Order Management', 'Parent policy for order management.'],
    ['CL-CP-009', 'Physician Order Signature Tracking & Escalation', 'Authentication follow-up process.'],
    ['CL-SD-012', 'Medication Management & Administration', 'Medication orders safety requirements.'],
  ],
  [
    'All RNs and therapists shall receive verbal order protocol training at hire and in annual competency review.',
    'Read-back and verbal order documentation shall be included in annual clinical competency modules.',
  ],
);

const CL_CP_005: PolicyContent = makeGenericCL(
  'CL-CP-005', 'Coordination of Care', 'CP — Care Planning', 'REQUIRED',
  'This policy mandates systematic coordination of services among all clinical disciplines and with external providers involved in a patient\'s care. Effective care coordination prevents gaps and redundancies in services, supports smooth transitions, and is a core CMS Condition of Participation under 42 CFR 484.60(e).',
  [
    'All home health disciplines providing services to any patient of Care Indeed Home Health Care, Inc.',
    'The Director of Nursing and Case Managers responsible for coordinating multi-disciplinary care',
    'Physicians, specialists, hospitals, and other external providers involved in the patient\'s care',
    'Patients and authorized representatives participating in care coordination',
  ],
  [
    { term: 'Coordination of Care', definition: 'The deliberate organization of patient care activities between two or more participants involved in a patient\'s care to facilitate the appropriate delivery of health care services.' },
    { term: 'Case Conference', definition: 'A structured meeting or communication among the interdisciplinary team members to review the patient\'s status, coordinate services, and update the Plan of Care.' },
    { term: 'Transition of Care', definition: 'The movement of a patient between health care practitioners or settings, including hospital discharge, SNF discharge, or referral to home health.' },
    { term: 'Care Transition Record', definition: 'Documentation summarizing a patient\'s clinical status, active orders, medications, and follow-up needs at the time of a care transition.' },
  ],
  [
    '4.1 Care Indeed Home Health Care, Inc. shall coordinate all services provided to a patient, including both home health disciplines and external providers, to prevent care gaps and ensure continuity per 42 CFR 484.60(e).',
    '4.2 An interdisciplinary case conference shall occur at minimum every 30 days for each active patient and more frequently as clinical needs require.',
    '4.3 At each transition of care (hospital admission, referral out, or re-admission), a complete transition record shall be transmitted to the receiving provider within 24 hours.',
    '4.4 The attending physician shall be notified of significant changes in patient status, hospitalization, or care transitions promptly, with documentation of the notification in the clinical record.',
    '4.5 Patient and caregiver participation in care coordination shall be documented, including their stated goals and concerns.',
  ],
  [
    ['6.1.1', 'Case Manager (RN/Therapist)', 'Coordinate with all disciplines (PT, OT, SLP, MSW, HHA) involved in the patient\'s care to ensure consistent, integrated delivery of services per the POC.', 'Ongoing; at each case conference.'],
    ['6.1.2', 'Case Manager', 'Conduct or facilitate interdisciplinary case conferences at minimum every 30 days. Document conference attendees, clinical review, and any POC updates.', 'Every 30 days minimum; document immediately.'],
    ['6.1.3', 'Case Manager / DON', 'Notify the attending physician of any hospitalization, significant change, or clinical event within 24 hours. Document notification in the clinical record.', 'Within 24 hours of event.'],
    ['6.1.4', 'Case Manager', 'Prepare and transmit a complete transition record to the receiving provider at any transfer or discharge. Include current medications, active orders, clinical summary, and follow-up needs.', 'Within 24 hours of transition.'],
    ['6.2.1', 'DON', 'Review case conference documentation completeness monthly. Identify cases where conferences are overdue and intervene with case managers.', 'Monthly audit.'],
  ],
  [
    ['Case Conference Notes', 'Documentation of interdisciplinary case conference with attendees, topics, and outcomes.', 'Case Manager', 'Clinical Record.', 'Every 30 days minimum.'],
    ['Physician Notification Records', 'Documentation of all physician notifications with date, method, and content.', 'Case Manager / Field Clinician', 'Clinical Record.', 'Within 24 hours of triggering event.'],
    ['Transition Records', 'Complete transition summary transmitted to receiving provider at each care transition.', 'Case Manager', 'Clinical Record; external transmission log.', 'Within 24 hours of transition.'],
  ],
  [
    ['Case conferences held every 30 days.', 'Audit of case conference dates in clinical records.', '90%+ of active patients have documented case conference every 30 days.'],
    ['Physician notifications documented within 24 hours.', 'Review of clinical records for notification entries.', '100% of hospitalizations and significant changes have documented physician notification.'],
    ['Transition records transmitted timely.', 'Audit of transition documentation and transmission logs.', '95% of transitions have complete record transmitted within 24 hours.'],
  ],
  [
    ['Case conference not documented or inconsistent.', 'Coordination gaps; surveyor finding related to care quality.', 'Build case conference calendar into scheduling system; DON audits monthly.'],
    ['Physician not notified of hospitalization.', 'Patient safety risk; breakdown in care continuity; billing exposure.', 'Train all staff: hospitalization notification is a same-day responsibility; document in chart.'],
  ],
  [
    'Surveyors will review case conference documentation frequency and content.',
    'Surveyors will look for evidence of active interdisciplinary coordination, not just single-discipline notes.',
    'Surveyors will check transition records at discharges and hospitalizations.',
    'Surveyors will inquire about care coordination with patients and caregivers during survey.',
  ],
  [
    ['42 CFR 484.60(e)', 'Coordination of services', 'Primary authority requiring coordination of all home health services.'],
    ['42 CFR 484.60(b)', 'Plan of care review', 'Interdisciplinary review requirements.'],
  ],
  [
    ['CL-CP-001', 'Plan of Care Development & Approval', 'POC drives the coordination requirements.'],
    ['CL-CP-007', 'Transfer & Referral Procedures', 'Transfer coordination documentation.'],
    ['CL-SD-001', 'Skilled Nursing Assessment & Services', 'RN coordination responsibilities.'],
  ],
  [
    'All clinical staff shall receive training on case conference protocols and documentation requirements at hire and annually.',
    'Coordination of care processes shall be reviewed via QAPI audit annually.',
  ],
);

const CL_CP_006: PolicyContent = makeGenericCL(
  'CL-CP-006', 'Discharge Planning & Criteria', 'CP — Care Planning', 'REQUIRED',
  'This policy establishes discharge criteria, planning processes, and documentation requirements for patient discharge from Care Indeed Home Health Care, Inc. home health services. Discharge must be based on meeting established clinical goals or identified criteria, and must be documented to support billing compliance and continuity of care.',
  [
    'All RNs and therapists functioning as case managers responsible for discharge planning',
    'The Director of Nursing responsible for discharge authorization and oversight',
    'The attending physician who must be notified and may authorize discharge',
    'Patients and authorized representatives who are engaged in discharge planning',
    'Social workers and community resource coordinators involved in post-discharge planning',
  ],
  [
    { term: 'Planned Discharge', definition: 'A discharge that occurs when the patient has met established goals or no longer meets homebound status or skilled care criteria, following a structured discharge planning process.' },
    { term: 'Unplanned Discharge', definition: 'A discharge that occurs due to patient or family refusal, hospitalization, or other unexpected event requiring non-standard discharge processing.' },
    { term: 'Homebound Status', definition: 'The clinical condition in which leaving home requires considerable effort — a prerequisite for Medicare home health eligibility as defined in CMS guidelines.' },
    { term: 'Discharge Summary', definition: 'A clinical document summarizing the patient\'s status at discharge, goals achieved, unmet needs, and post-discharge recommendations.' },
  ],
  [
    '4.1 Discharge planning shall begin at admission and continue throughout the episode of care with ongoing assessment of homebound status, goal progress, and anticipated discharge needs.',
    '4.2 Discharge criteria include: attainment of established functional goals, loss of homebound status, loss of skilled care need, patient/family refusal of services, or safety conditions that preclude safe delivery of home health services.',
    '4.3 A written discharge summary shall be completed and placed in the clinical record at discharge, documenting the reason for discharge, goal attainment status, patient/family education provided, and post-discharge resources arranged.',
    '4.4 The attending physician shall be notified of all discharges. Physician authorization is required for planned discharge and for abrupt discharge due to patient non-compliance or safety risk.',
    '4.5 Discharge OASIS shall be completed for all patients discharged per 42 CFR 484.55 requirements.',
  ],
  [
    ['6.1.1', 'Case Manager', 'Assess discharge readiness at every case conference. Document goal progress relative to discharge criteria in the clinical record.', 'Every case conference; minimum monthly.'],
    ['6.1.2', 'Case Manager / DON', 'When discharge criteria are met, initiate discharge planning including: post-discharge resource linkage, patient education on post-discharge self-management, and community referral as indicated.', 'Upon meeting discharge criteria.'],
    ['6.1.3', 'Case Manager', 'Notify attending physician of planned discharge and obtain verbal or written authorization. Document notification and authorization in the clinical record.', 'Minimum 24 hours before planned discharge.'],
    ['6.1.4', 'Discharging Clinician', 'Complete the Discharge OASIS assessment on the last skilled visit or within 48 hours of discharge. Complete the Discharge Summary document.', 'On discharge visit or within 48 hours.'],
    ['6.2.1', 'DON', 'Conduct monthly review of all discharges for completeness of documentation, timeliness of discharge OASIS, and physician notification records.', 'Monthly.'],
  ],
  [
    ['Discharge Summary', 'Clinical summary of discharge status, goal attainment, and post-discharge plan.', 'Discharging Clinician', 'Clinical Record.', 'Completed at or within 48 hours of discharge.'],
    ['Discharge OASIS', 'OASIS assessment at discharge time point.', 'Clinician', 'Clinical Record — OASIS section.', 'Completed at discharge visit or within 48 hours.'],
    ['Physician Notification Record', 'Documentation of physician notification of discharge.', 'Case Manager', 'Clinical Record.', 'At time of discharge notification.'],
  ],
  [
    ['Discharge OASIS completed timely.', 'Audit of discharge OASIS completion dates.', '100% of discharges have OASIS completed within required timeframe.'],
    ['Discharge summmary present in all discharge records.', 'Record review.', '100% of discharged patients have a discharge summary on file.'],
    ['Physician notified of all discharges.', 'Review of physician notification documentation.', '100% of discharges have documented physician notification.'],
  ],
  [
    ['Discharge OASIS not completed.', 'CMS OASIS transmission gap; data quality failure; potential survey finding.', 'Assign discharge OASIS to the discharging clinician; DON audits discharge records weekly.'],
    ['No discharge summary on file.', 'Incomplete clinical record; auditor finding.', 'Build discharge summary into EHR discharge workflow as a required completion step.'],
  ],
  [
    'Surveyors review discharge records to verify OASIS completion, physician notification, and discharge summary documentation.',
    'Surveyors may ask patients about their discharge experiences and post-discharge resource referrals.',
    'Surveyors will look for abrupt discharges that lacked physician notification or documentation.',
  ],
  [
    ['42 CFR 484.55', 'Comprehensive assessment of patients', 'Discharge OASIS requirements.'],
    ['42 CFR 484.60', 'Care planning, coordination of services', 'Discharge planning as part of ongoing care planning.'],
    ['42 CFR 409.44', 'Covered home health services', 'Homebound status criteria for discharge determination.'],
  ],
  [
    ['CL-CA-001', 'Patient Assessment — Comprehensive', 'Assessment drives discharge readiness.'],
    ['CL-CP-007', 'Transfer & Referral Procedures', 'Transfer vs. discharge distinction.'],
    ['CL-CA-005', 'Homebound Status Determination & Documentation', 'Homebound loss triggers discharge.'],
  ],
  [
    'All case managers shall receive training on discharge planning processes and documentation at hire and annually.',
    'Discharge documentation quality shall be included in the quarterly QAPI audit calendar.',
  ],
);

const CL_CP_007: PolicyContent = makeGenericCL(
  'CL-CP-007', 'Transfer & Referral Procedures', 'CP — Care Planning', 'REQUIRED',
  'This policy defines procedures for transferring patients to hospital, skilled nursing facilities, or other care settings, and for referring patients to additional community services. Clear transfer protocols ensure patient safety, continuity of care, and regulatory documentation compliance at Care Indeed Home Health Care, Inc.',
  [
    'All clinical staff who identify patient transfer needs during home visits',
    'Case Managers coordinating transfer activities',
    'The Director of Nursing overseeing all patient transfers',
    'Patients and authorized representatives involved in transfer decisions',
  ],
  [
    { term: 'Transfer', definition: 'The movement of a patient from home health to an inpatient facility (hospital, SNF, IRF) with expected return to home health services.' },
    { term: 'Referral', definition: 'The referral of a patient to another health care provider, community service, or agency for additional or alternative services.' },
    { term: 'Transfer OASIS', definition: 'An OASIS assessment completed when a patient is transferred to a hospital with expected return (code TRN) or to an inpatient facility without expectation of return (code DC).'},
    { term: 'Resumption of Care', definition: 'The re-initiation of home health services following an inpatient stay, requiring a new OASIS assessment.' },
  ],
  [
    '4.1 When a patient\'s condition warrants transfer to an inpatient facility, Care Indeed Home Health Care, Inc. staff shall initiate the transfer process, notify the attending physician, and communicate the patient\'s clinical status to the receiving facility.',
    '4.2 A transfer record shall be prepared for every transfer, including the patient\'s current clinical status, medications, active orders, and contact information for the attending physician.',
    '4.3 A Transfer OASIS shall be completed per 42 CFR 484.55 assessment requirements.',
    '4.4 When a patient returns from an inpatient stay, a Resumption of Care OASIS shall be completed at the first ROC visit.',
    '4.5 Referrals to community services or other providers shall be documented with the recipient\'s name, date, and reason for referral.',
  ],
  [
    ['6.1.1', 'Field Clinician', 'When patient condition warrants hospital transfer, assess clinical stability, initiate 911 if emergent. Notify DON and attending physician immediately. Document clinical status and actions in the clinical record.', 'Immediately upon identifying transfer need.'],
    ['6.1.2', 'Case Manager / DON', 'Prepare and transmit a complete Transfer Summary (current medications, active orders, wound/clinical status, physician name/number) to the receiving facility within 24 hours.', 'Within 24 hours of transfer.'],
    ['6.1.3', 'Discharging Clinician', 'Complete Transfer OASIS per applicable time-point requirements. If transfer with expected return, use TRN code. If no expected return, use DC code.', 'Within OASIS time-point requirements.'],
    ['6.1.4', 'Case Manager', 'Upon patient return from inpatient stay: contact patient/family within 24 hours of discharge from inpatient, schedule ROC visit, complete ROC OASIS at first visit.', 'ROC visit within 24 hours of hospital discharge.'],
    ['6.2.1', 'Case Manager / DON', 'Document all referrals in the clinical record with recipient, date, reason, and outcome. Follow up on referral outcomes at the next case conference.', 'At time of referral.'],
  ],
  [
    ['Transfer Summary', 'Complete clinical transfer summary transmitted to receiving facility.', 'Case Manager / DON', 'Clinical Record; external transmission log.', 'Within 24 hours of transfer.'],
    ['Transfer OASIS', 'OASIS at transfer time point per 42 CFR 484.55.', 'Clinician', 'Clinical Record.', 'Per OASIS time-point requirements.'],
    ['ROC OASIS', 'OASIS at Resumption of Care after inpatient stay.', 'Admitting RN', 'Clinical Record.', 'At first ROC visit.'],
    ['Referral Documentation', 'Record of all referrals with recipient, date, reason, and follow-up.', 'Case Manager', 'Clinical Record.', 'At time of referral.'],
  ],
  [
    ['Transfer OASIS completed timely.', 'Audit of transfer OASIS completion dates.', '100% of transfers have OASIS completed within required timeframe.'],
    ['Transfer summaries transmitted within 24 hours.', 'Audit of transfer summary transmission logs.', '95% of transfers have complete summary transmitted within 24 hours.'],
    ['ROC visit occurs within 24 hours of hospital discharge.', 'Audit of ROC visit dates vs. hospital discharge dates.', '90%+ of ROC visits scheduled within 24 hours of hospital discharge.'],
  ],
  [
    ['Transfer OASIS not completed.', 'OASIS transmission gap; data quality issue.', 'Assign transfer OASIS to the case manager as a required transfer step; DON monitors weekly.'],
    ['Transfer summary not sent to receiving facility.', 'Patient safety risk at transition; regulatory finding.', 'Build transfer summary into clinical workflow; confirm receipt within 24 hours.'],
  ],
  [
    'Surveyors will review transfer records for completeness of transfer summaries and OASIS documentation.',
    'Surveyors will look for ROC OASIS completion within required timeframes.',
    'Surveyors may contact receiving facilities to verify information transmitted at transfer.',
  ],
  [
    ['42 CFR 484.55', 'Comprehensive assessment of patients', 'Transfer and ROC OASIS requirements.'],
    ['42 CFR 484.60(e)', 'Coordination of services', 'Care coordination at transfers.'],
  ],
  [
    ['CL-CP-005', 'Coordination of Care', 'Coordination at transitions of care.'],
    ['CL-CP-006', 'Discharge Planning & Criteria', 'Discharge vs. transfer distinction.'],
    ['CL-OA-001', 'OASIS Completion Timeliness & Accountability', 'Transfer OASIS timeliness standards.'],
  ],
  [
    'All clinical staff shall receive training on transfer procedures and OASIS time-point requirements at hire and annually.',
    'Transfer documentation quality shall be audited quarterly under the QAPI program.',
  ],
);

const CL_CP_008: PolicyContent = makeGenericCL(
  'CL-CP-008', 'Physician Recertification Timing Compliance', 'CP — Care Planning', 'REQUIRED',
  'This policy enforces the 60-day recertification timeline with defined escalation protocols, tracking mechanisms, and accountability measures to prevent lapses in physician certification of continued eligibility. Failure to obtain timely recertification results in uncovered services, billing denials, potential overpayment liability, and CMS citation at Care Indeed Home Health Care, Inc.',
  [
    'All Case Managers responsible for tracking recertification timelines',
    'The Director of Nursing responsible for recertification oversight',
    'The Billing/Compliance department monitoring certification period adherence',
    'All attending physicians responsible for recertifying continued eligibility',
  ],
  [
    { term: '60-Day Certification Period', definition: 'The maximum period covered by a single physician certification of eligibility for Medicare home health benefits.' },
    { term: 'Recertification', definition: 'The physician\'s authorization of an additional 60-day period of home health services based on ongoing skilled need and homebound status.' },
    { term: 'Recertification Window', definition: 'The period during which the recertification POC must be completed — generally the last 5 days of the current period and up to immediately before the new period begins.' },
    { term: 'Lapsed Certification', definition: 'A situation where services are provided after the prior certification period expires without valid physician recertification on file.' },
  ],
  [
    '4.1 Care Indeed Home Health Care, Inc. shall maintain a tracking system for all certification period expiration dates and initiate recertification activities during week 5 of each current period.',
    '4.2 The recertification POC shall be completed and transmitted to the attending physician for signature no later than day 56 of the current period to allow for the 30-day signature window.',
    '4.3 Services shall not continue into a new certification period unless a valid recertification has been initiated (verbal order or transmitted POC with pending signature), with documentation in the clinical record.',
    '4.4 Any lapsed certification shall trigger immediate clinical and billing review and notification to the Compliance Officer.',
    '4.5 Escalation steps as defined in this policy shall be followed when the physician has not signed the recertification POC within established timeframes.',
  ],
  [
    ['6.1.1', 'Case Manager', 'Review the certification expiration calendar weekly. No later than day 42 (week 6), initiate clinical review for recertification need: assess goal progress, functional status, continued skilled need, and homebound status.', 'Day 42 of each certification period.'],
    ['6.1.2', 'Case Manager / DON', 'By day 49 (week 7): complete the recertification POC/485 and transmit to the attending physician for signature. Flag as urgent in the tracking log.', 'By day 49.'],
    ['6.1.3', 'Case Manager', 'Day 52 (8 days before expiration): if no physician response, conduct first follow-up call. Document call date, time, person reached, and outcome.', 'Day 52.'],
    ['6.1.4', 'DON', 'Day 56 (4 days before expiration): escalate to DON. DON personally contacts physician or physician office. Document escalation contact.', 'Day 56.'],
    ['6.1.5', 'Administrator / Compliance Officer', 'Day 59 (1 day before expiration): if still unsigned, Administrator and Compliance Officer are notified. Evaluate whether to continue or suspend services pending signature.', 'Day 59.'],
    ['6.2.1', 'Billing Department', 'Review recertification status for all pending claims before submission. No claim shall be submitted for a new period without documented recertification initiation and tracking.', 'Prior to any new-period billing submission.'],
  ],
  [
    ['Recertification Tracking Log', 'Log of all active patients with certification expiration dates and recertification status.', 'Case Manager / DON', 'Operations Tracking System.', 'Weekly review; updated daily.'],
    ['Recertification POC/485', 'Physician-signed recertification for each new 60-day period.', 'Case Manager / Physician', 'Clinical Record.', 'Transmitted by day 49; signed within 30 days.'],
    ['Escalation Documentation', 'Record of all follow-up contacts and escalation steps per timeline.', 'Case Manager / DON', 'Clinical Record and Tracking Log.', 'At each escalation touchpoint.'],
  ],
  [
    ['Recertifications transmitted by day 49.', 'Audit of recertification transmission dates.', '100% of recertifications transmitted by day 49 of current period.'],
    ['No lapsed certifications.', 'Monthly audit of certification expiration dates vs. new period initiation.', 'Zero unresolved lapsed certifications per quarterly QAPI review.'],
    ['Escalation documented per timeline.', 'Audit of escalation documentation completeness.', '100% of unsigned POCs at day 52 have documented follow-up.'],
  ],
  [
    ['Services continue past certification period expiration.', 'Billing for uncertified services — fraud risk; overpayment demand.', 'Implement real-time certification tracking with day 42 and day 49 workflow triggers.'],
    ['No escalation when physician non-responsive.', 'Lapsed certification goes unresolved.', 'Mandate escalation protocol; DON receives daily flag of all periods within 10 days of expiration.'],
  ],
  [
    'Surveyors will verify that every service episode has a valid physician certification covering all dates of service.',
    'Surveyors will review the recertification process when lapsed certifications are identified.',
    'Surveyors will check whether the agency has a systematic tracking process for certification periods.',
  ],
  [
    ['42 CFR 409.42', 'Conditions for payment — certification requirement', 'Medicare payment requires valid certification for each period.'],
    ['42 CFR 424.22', 'Requirements for home health services', 'Physician certification and recertification requirements.'],
  ],
  [
    ['CL-CP-001', 'Plan of Care Development & Approval', 'POC and recertification are integrated.'],
    ['CL-CP-002', 'Plan of Care Review & Update', 'Recertification POC update process.'],
    ['CL-CP-009', 'Physician Order Signature Tracking & Escalation', 'Signature escalation process.'],
  ],
  [
    'All case managers shall receive training on recertification timing requirements at hire and annually.',
    'Recertification timeliness shall be reviewed in the quarterly QAPI compliance audit.',
  ],
);

const CL_CP_009: PolicyContent = makeGenericCL(
  'CL-CP-009', 'Physician Order Signature Tracking & Escalation', 'CP — Care Planning', 'REQUIRED',
  'This policy establishes a systematic tracking process for all pending physician signatures on orders and Plans of Care, with defined follow-up intervals, escalation tiers, and documentation of all outreach attempts. Unsigned orders create billing, documentation, and compliance vulnerabilities that require active, structured management at Care Indeed Home Health Care, Inc.',
  [
    'All case managers and administrative staff responsible for transmitting orders for physician signature',
    'The Director of Nursing responsible for oversight of unsigned order status',
    'The Compliance Officer and Billing department monitoring order signature compliance',
    'All attending physicians and office staff who must sign and return orders',
  ],
  [
    { term: 'Pending Order', definition: 'A physician order that has been transmitted to the physician but has not yet been signed and returned.' },
    { term: 'Order Signature Tracking Log', definition: 'An operational log recording all pending unsigned orders with patient name, order type, transmission date, follow-up dates, and status.' },
    { term: 'Escalation', definition: 'The process of elevating an unresolved operational issue to a higher authority level for resolution.' },
    { term: 'Authentication', definition: 'The physician\'s written or electronic signature confirming the accuracy and authorization of a previously issued verbal order.' },
  ],
  [
    '4.1 Care Indeed Home Health Care, Inc. shall maintain a daily Order Signature Tracking Log listing all orders transmitted but not yet signed and returned.',
    '4.2 Follow-up on unsigned orders shall occur at day 15, day 22, day 26, and day 29 of the 30-day signature window.',
    '4.3 Any order unsigned at day 30 shall be escalated to the DON who shall personally contact the physician or physician designee.',
    '4.4 Billing shall not be submitted for services where the authorizing order or POC remains unsigned beyond 30 days without documented escalation and resolution.',
    '4.5 The DON shall report all orders unsigned beyond 30 days to the Compliance Officer monthly.',
  ],
  [
    ['6.1.1', 'Administrative Staff / Case Manager', 'Log all orders in the Signature Tracking Log upon transmission. Record: patient name, order type, transmission date, physician name, contact information, and transmission method.', 'At time of transmission.'],
    ['6.1.2', 'Case Manager', 'Day 15 follow-up: call physician office, document call date, person reached, and outcome. Note "first follow-up" in tracking log.', 'Day 15 from transmission.'],
    ['6.1.3', 'Case Manager', 'Day 22 follow-up: second call to physician. Escalate to case manager supervisor if physician office non-responsive. Document all attempts.', 'Day 22 from transmission.'],
    ['6.1.4', 'DON', 'Day 26+: DON directly contacts the physician. If physician cannot be reached, contact alternative physician as clinically appropriate. Document personally.', 'Day 26 from transmission.'],
    ['6.1.5', 'Compliance Officer / Administrator', 'Day 30: Order unsigned — Compliance Officer informed. Evaluate whether clinical necessity can be documented through alternative means. Consider whether services must be suspended until signature obtained.', 'Day 30 from transmission.'],
    ['6.2.1', 'DON', 'Provide monthly report to Administrator and Compliance Officer of all orders outstanding at 30+ days, reasons documented, and resolution status.', 'Monthly.'],
  ],
  [
    ['Order Signature Tracking Log', 'Log of all pending orders with transmission dates, follow-up contacts, and status.', 'Admin Staff / Case Manager', 'Operations Tracking System.', 'Daily updates; reviewed by DON weekly.'],
    ['Monthly Unsigned Order Report', 'Monthly summary of all orders outstanding > 30 days.', 'DON', 'Compliance File.', 'Monthly; presented to Compliance Officer.'],
  ],
  [
    ['All orders entered in tracking log at transmission.', 'Audit of tracking log for all orders transmitted.', '100% of transmitted orders logged.'],
    ['Follow-up documented at day 15 and day 22.', 'Audit of follow-up documentation in tracking log.', '100% of unsigned orders have documented day-15 and day-22 follow-up.'],
    ['Orders unsigned at day 30 escalated to Compliance.', 'Review of monthly unsigned order report.', '100% of 30+-day unsigned orders reported to Compliance monthly.'],
  ],
  [
    ['No tracking system exists.', 'Unsigned orders proliferate; billing exposure; audit finding.', 'Implement the Order Signature Tracking Log immediately; assign daily maintenance to designated administrative staff.'],
    ['Follow-up not documented.', 'No evidence of diligent follow-up creates fraud vulnerability.', 'Train all case managers: all follow-up contacts must be logged on the date they occur.'],
  ],
  [
    'Surveyors will request evidence of systematic physician order tracking processes.',
    'Surveyors will cross-reference order signature dates against billing submission dates.',
    'Surveyors with compliance concerns will look for documentation showing escalation attempts.',
  ],
  [
    ['42 CFR 409.41', 'Physician certification', 'Services must have physician authorization; unsigned orders are a billing risk.'],
    ['42 CFR 484.60(a)', 'Plan of care', 'POC must be physician-authorized.'],
  ],
  [
    ['CL-CP-003', 'Physician Orders & Order Management', 'Parent order management policy.'],
    ['CL-CP-004', 'Verbal Order Receipt & Authentication', 'Verbal order authentication tracking.'],
    ['CL-CP-008', 'Physician Recertification Timing Compliance', 'Recertification order escalation context.'],
  ],
  [
    'All case managers and administrative staff responsible for order management shall receive training on the tracking log and escalation process at hire.',
    'Monthly unsigned order statistics shall be reviewed in the QAPI program.',
  ],
);

// ─── HELPER: GENERIC CL CONTENT BUILDER ───────────────────────────────────────
function makeSimpleCL(
  id: string, title: string, subdomain: string, tier: string, purpose: string,
): PolicyContent {
  const subdomainLabel: Record<string, string> = {
    'SD': 'SD — Skilled Services Delivery',
    'CA': 'CA — Clinical Assessment',
    'CD': 'CD — Clinical Documentation',
    'PR': 'PR — Patient Rights & Safety',
    'OA': 'OA — OASIS & Assessment Tools',
    'CP': 'CP — Care Planning',
  };
  const code = id.split('-')[1];
  const subdLabel = subdomainLabel[code] || subdomain;
  return {
    id, title,
    domain: 'CL — Clinical Operations',
    subdomain: subdLabel,
    tier, version: '1.0', effective: '2025-07-10',
    approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    lastReviewed: '2025-07-10', nextReviewDate: '2026-07-10',
    supersedes: 'N/A (Initial Version)',
    ownerSteward: 'Director of Nursing',
    purpose,
    scopeItems: [
      'All clinical staff providing services covered by this policy',
      'The Director of Nursing responsible for implementation and compliance oversight',
      'The attending physician whose orders authorize applicable services',
      'Patients and authorized representatives involved in care activities governed by this policy',
    ],
    definitions: [
      { term: 'Policy', definition: 'A formal statement of an organizational principle, rule, or course of action governing operations within its stated scope.' },
      { term: 'Procedure', definition: 'A specific operational method for implementing the requirements of this policy.' },
      { term: 'Compliance', definition: 'Adherence to applicable federal regulations, state law, and agency policy standards.' },
    ],
    statements: [
      `4.1 Care Indeed Home Health Care, Inc. shall implement and maintain practices for ${title} in compliance with applicable CMS Conditions of Participation and California state requirements.`,
      '4.2 All applicable clinical staff shall adhere to the requirements, procedures, and documentation standards established in this policy.',
      '4.3 The Director of Nursing shall be responsible for overseeing implementation and monitoring compliance with this policy through regular supervision and audit activities.',
      '4.4 This policy shall be reviewed annually by the Director of Nursing and approved by the Governing Body, and updated whenever material regulatory changes occur.',
      '4.5 Non-compliance with this policy shall be addressed through the corrective action and performance improvement processes established in the QAPI program.',
    ],
    procedures: [
      ['6.1.1', 'Director of Nursing', `Implement and oversee the requirements of this policy across all clinical operations. Establish internal standard operating procedures as needed to operationalize each requirement.`, 'Continuously; reviewed quarterly.'],
      ['6.1.2', 'Field Clinicians', 'Follow all procedures established under this policy during patient care activities. Document all activities per agency documentation standards.', 'At time of service delivery.'],
      ['6.2.1', 'Director of Nursing', 'Conduct quarterly audits of compliance with this policy. Report findings to the Administrator and incorporate into the QAPI program.', 'Quarterly.'],
      ['6.2.2', 'Governing Body', 'Review and approve this policy annually at the first quarterly meeting or upon any material regulatory change.', 'Annually.'],
    ],
    documentationRows: [
      ['Policy document', 'Current approved version of this policy with effective date.', 'Director of Nursing (maintenance); Governing Body (approval)', 'Policy manual; agency intranet.', 'Annual review and approval.'],
      ['Compliance audit records', 'Results of quarterly compliance audits conducted under this policy.', 'Director of Nursing', 'QAPI file.', 'Quarterly; retained 7 years.'],
      ['Staff training records', 'Documentation of all staff training on this policy.', 'Director of Nursing / HR', 'Personnel file.', 'At hire and annually.'],
    ],
    complianceIndicators: [
      ['Policy is current and approved.', 'Review of policy for version, date, and Governing Body approval signature.', 'Annual Governing Body approval documented.'],
      ['Audit findings are tracked and resolved.', 'Review of QAPI audit records for corrective action completion.', '100% of audit findings addressed within defined corrective action timeframes.'],
      ['Staff are trained on policy requirements.', 'Review of personnel training records.', '100% of applicable staff have documented training completion.'],
    ],
    commonFailures: [
      ['Policy not reviewed or updated annually.', 'Outdated requirements; regulatory gap.', 'Build annual policy review into the governance calendar.'],
      ['Staff unaware of policy requirements.', 'Non-compliance due to lack of training.', 'Include in new hire orientation and annual clinical competency modules.'],
      ['Audit findings not addressed.', 'Repeated deficiencies; potential survey citation.', 'Incorporate into QAPI performance improvement cycle with defined corrective action timelines.'],
    ],
    surveyorItems: [
      `Surveyors may request documentation showing compliance with ${title} requirements.`,
      'Surveyors may assess clinical staff knowledge of this policy\'s key requirements during interview.',
      'Surveyors will review clinical records for documentation of activities governed by this policy.',
    ],
    federalRefs: [
      ['42 CFR 484', 'Home Health Services CoPs', 'Federal Conditions of Participation applicable to home health agencies.'],
      ['42 CFR 484.60', 'Care planning, coordination of services, and quality of care', 'Clinical operations framework.'],
    ],
    crossRefs: [
      ['CL-CA-001', 'Patient Assessment — Comprehensive', 'Assessment informs activities governed by this policy.'],
      ['QA-PG-001', 'QAPI Program Establishment & Governance', 'Quality oversight of clinical operations policies.'],
    ],
    trainingItems: [
      `All clinical staff within the scope of this policy shall receive orientation to its requirements within 14 calendar days of hire.`,
      'Annual refresher training shall be incorporated into the clinical competency review calendar.',
      'Significant policy updates shall be communicated to affected staff within 7 calendar days of approval.',
    ],
  };
}

// ─── CL-SD — SKILLED SERVICES DELIVERY ───────────────────────────────────────
const CL_SD_001 = makeSimpleCL('CL-SD-001','Skilled Nursing Assessment & Services','SD — Skilled Services Delivery','REQUIRED',
  'This policy defines the scope, frequency, and documentation requirements for skilled nursing visits and assessments at Care Indeed Home Health Care, Inc. Skilled nursing services are the core of Medicare home health and must be delivered, documented, and supervised to meet 42 CFR 484 Conditions of Participation and satisfy the skilled care standard for billing compliance.');
const CL_SD_002 = makeSimpleCL('CL-SD-002','Physical Therapy Services','SD — Skilled Services Delivery','REQUIRED',
  'This policy establishes clinical standards, documentation requirements, and discharge criteria for physical therapy services at Care Indeed Home Health Care, Inc. PT services must meet the skilled care standard, be ordered by a physician, and be directed toward measurable functional goals with evidence of therapeutic progress to remain billable.');
const CL_SD_003 = makeSimpleCL('CL-SD-003','Occupational Therapy Services','SD — Skilled Services Delivery','REQUIRED',
  'This policy establishes clinical standards, documentation requirements, and discharge criteria for occupational therapy services at Care Indeed Home Health Care, Inc. OT services must address functional independence in activities of daily living and instrumental ADLs within the physician-approved Plan of Care.');
const CL_SD_004 = makeSimpleCL('CL-SD-004','Speech-Language Pathology Services','SD — Skilled Services Delivery','REQUIRED',
  'This policy establishes clinical standards, documentation requirements, and discharge criteria for speech-language pathology services at Care Indeed Home Health Care, Inc. SLP services address communication, swallowing, and cognitive disorders requiring the skills of a qualified speech-language pathologist.');
const CL_SD_005 = makeSimpleCL('CL-SD-005','Medical Social Work Services','SD — Skilled Services Delivery','REQUIRED',
  'This policy defines the scope, referral criteria, and documentation requirements for medical social work services at Care Indeed Home Health Care, Inc. Medical social work services address psychosocial barriers to goal attainment, community resource access, advance planning, and caregiver support.');
const CL_SD_006 = makeSimpleCL('CL-SD-006','Home Health Aide Services & Supervision','SD — Skilled Services Delivery','REQUIRED',
  'This policy establishes service delivery standards, supervision requirements, and competency validation for home health aides per 42 CFR 484.80. HHA services must be directed by a registered nurse or therapist, delivered per a written assignment, and supervised at minimum every 14 calendar days.');
const CL_SD_007 = makeSimpleCL('CL-SD-007','Home Health Aide Competency Evaluation','SD — Skilled Services Delivery','REQUIRED',
  'This policy defines initial and ongoing competency evaluation requirements for home health aides including skills validation, return demonstration, and documentation at Care Indeed Home Health Care, Inc. No HHA may provide patient care without demonstrated competency in required skills per 42 CFR 484.80(b).');
const CL_SD_008 = makeSimpleCL('CL-SD-008','Clinical Supervision & Oversight','SD — Skilled Services Delivery','REQUIRED',
  'This policy defines requirements for clinical supervision of professional staff and oversight of all clinical services at Care Indeed Home Health Care, Inc. Clinical supervision ensures quality of care, staff competency, and regulatory compliance as required by 42 CFR 484.105(c).');
const CL_SD_009 = makeSimpleCL('CL-SD-009','Telehealth & Remote Monitoring Services','SD — Skilled Services Delivery','RECOMMENDED',
  'This policy establishes standards for the delivery, documentation, and oversight of telehealth and remote patient monitoring services at Care Indeed Home Health Care, Inc. Telehealth services supplement but do not replace required skilled visits under the Medicare home health benefit.');
const CL_SD_010 = makeSimpleCL('CL-SD-010','IV Therapy & Infusion Services','SD — Skilled Services Delivery','ESSENTIAL',
  'This policy defines clinical standards, clinician competency requirements, and documentation for intravenous therapy and infusion services delivered in the home setting by Care Indeed Home Health Care, Inc. IV therapy services require RN-level competency validation and physician order specificity.');
const CL_SD_011 = makeSimpleCL('CL-SD-011','Wound Care Assessment & Management','SD — Skilled Services Delivery','ESSENTIAL',
  'This policy defines assessment, classification, treatment protocol, and documentation standards for wound care services at Care Indeed Home Health Care, Inc. Wound care is one of the most common skilled nursing services and must be documented with wound measurements, staging, and progress narrative at each visit.');
const CL_SD_012 = makeSimpleCL('CL-SD-012','Medication Management & Administration','SD — Skilled Services Delivery','REQUIRED',
  'This policy establishes standards for medication administration, storage, reconciliation, and adverse reaction reporting at Care Indeed Home Health Care, Inc. All medications administered by agency clinicians must be order-based, documented per visit, and aligned with the patient\'s current medication profile.');
const CL_SD_013 = makeSimpleCL('CL-SD-013','Medication Reconciliation at Transitions','SD — Skilled Services Delivery','REQUIRED',
  'This policy mandates medication reconciliation at every transition of care including Start of Care, Transfer, Resumption of Care, and Discharge. Accurate medication reconciliation prevents adverse drug events and supports accurate OASIS documentation.');
const CL_SD_014 = makeSimpleCL('CL-SD-014','Pain Assessment & Management','SD — Skilled Services Delivery','REQUIRED',
  'This policy defines requirements for pain screening, assessment, reassessment, and individualized pain management planning at Care Indeed Home Health Care, Inc. Pain management is an OASIS-measured outcome and a Conditions of Participation care quality requirement.');
const CL_SD_015 = makeSimpleCL('CL-SD-015','Fall Risk Assessment & Prevention','SD — Skilled Services Delivery','REQUIRED',
  'This policy establishes fall risk screening, assessment, intervention planning, and documentation requirements at Care Indeed Home Health Care, Inc. Falls are the leading cause of injury in the home health population and a CMS OASIS quality measure.');
const CL_SD_016 = makeSimpleCL('CL-SD-016','Infection Prevention & Control','SD — Skilled Services Delivery','REQUIRED',
  'This policy defines the agency\'s infection prevention and control program including surveillance, standard precautions, isolation practices, and reporting per 42 CFR 484.70. All clinical staff must follow standard precautions at every patient encounter.');
const CL_SD_017 = makeSimpleCL('CL-SD-017','Patient Education & Self-Management','SD — Skilled Services Delivery','ESSENTIAL',
  'This policy requires individualized patient and caregiver education with documented learning assessments, teaching methods, and verifiable outcomes at Care Indeed Home Health Care, Inc. Patient education is an OASIS outcome measure and a core component of care quality.');
const CL_SD_018 = makeSimpleCL('CL-SD-018','Diabetic Management & Monitoring','SD — Skilled Services Delivery','ESSENTIAL',
  'This policy establishes assessment, education, monitoring, and documentation standards for diabetic patient management at Care Indeed Home Health Care, Inc. Diabetes is among the most prevalent diagnoses in the home health population and requires consistent, proactive monitoring to prevent complications.');
const CL_SD_019 = makeSimpleCL('CL-SD-019','Cardiac Care & Monitoring','SD — Skilled Services Delivery','ESSENTIAL',
  'This policy defines assessment, intervention, and monitoring standards for patients with cardiac conditions including CHF, post-MI, and cardiac arrhythmia at Care Indeed Home Health Care, Inc. Cardiac patients are at high risk for acute exacerbation and hospitalization, requiring vigilant daily monitoring protocols.');
const CL_SD_020 = makeSimpleCL('CL-SD-020','Respiratory Care & Management','SD — Skilled Services Delivery','ESSENTIAL',
  'This policy establishes standards for respiratory assessment, oxygen therapy management, inhalation medication delivery, and pulmonary care documentation at Care Indeed Home Health Care, Inc. Respiratory conditions including COPD, asthma, and COVID-19 sequelae require standardized monitoring and intervention protocols.');
const CL_SD_021 = makeSimpleCL('CL-SD-021','Pediatric Home Health Services','SD — Skilled Services Delivery','RECOMMENDED',
  'This policy defines age-appropriate assessment, service delivery, and family engagement standards for pediatric patients receiving home health services at Care Indeed Home Health Care, Inc. Pediatric home health requires specialized competencies, family-centered care approaches, and growth-and-development-sensitive assessment tools.');
const CL_SD_022 = makeSimpleCL('CL-SD-022','Behavioral Health Screening & Referral','SD — Skilled Services Delivery','ESSENTIAL',
  'This policy mandates behavioral health screening at Start of Care and as indicated throughout the episode, with defined referral pathways and documentation requirements at Care Indeed Home Health Care, Inc. Behavioral health conditions including depression and anxiety are prevalent in the home health population and directly affect clinical outcomes.');
const CL_SD_023 = makeSimpleCL('CL-SD-023','Palliative & End-of-Life Care','SD — Skilled Services Delivery','ESSENTIAL',
  'This policy establishes standards for palliative care delivery, advance directive discussions, symptom management, and hospice referral coordination at Care Indeed Home Health Care, Inc. Palliative care requires a holistic, interdisciplinary approach that honors patient goals and quality of life.');
const CL_SD_024 = makeSimpleCL('CL-SD-024','Missed Visit & Rescheduling','SD — Skilled Services Delivery','ESSENTIAL',
  'This policy establishes protocols for managing, documenting, and reporting missed visits and rescheduling at Care Indeed Home Health Care, Inc. Missed visits must be tracked for compliance with ordered visit frequencies and must never result in undocumented gaps in skilled care delivery.');
const CL_SD_025 = makeSimpleCL('CL-SD-025','Ordered Visit Frequency Compliance & Monitoring','SD — Skilled Services Delivery','REQUIRED',
  'This policy requires systematic monitoring of actual visit delivery against physician-ordered frequency and disciplines, with defined variance thresholds, documentation requirements, and corrective action triggers at Care Indeed Home Health Care, Inc. Visit frequency compliance directly affects billing compliance and quality of care outcomes.');

// ─── CL-CA — CLINICAL ASSESSMENT ─────────────────────────────────────────────
const CL_CA_001 = makeSimpleCL('CL-CA-001','Patient Assessment — Comprehensive','CA — Clinical Assessment','REQUIRED',
  'This policy mandates completion of a comprehensive patient assessment at all required OASIS time points including Start of Care, Resumption of Care, Recertification, Follow-Up, and Discharge. The comprehensive assessment is the foundation of the Plan of Care and must include all OASIS data elements per 42 CFR 484.55.');
const CL_CA_002 = makeSimpleCL('CL-CA-002','OASIS Data Collection & Accuracy','CA — Clinical Assessment','REQUIRED',
  'This policy establishes standards for accurate, timely, and complete OASIS data collection in compliance with CMS requirements. OASIS accuracy directly affects the agency\'s public quality reporting, value-based purchasing performance, and billing compliance at Care Indeed Home Health Care, Inc.');
const CL_CA_003 = makeSimpleCL('CL-CA-003','OASIS Transmission & Correction','CA — Clinical Assessment','REQUIRED',
  'This policy defines requirements and timeframes for OASIS data transmission to CMS and procedures for identifying, correcting, and resubmitting erroneous data. Timely and accurate OASIS transmission is required by 42 CFR 484.45 and affects quality measure public reporting at Care Indeed Home Health Care, Inc.');
const CL_CA_004 = makeSimpleCL('CL-CA-004','Recertification Assessment & Process','CA — Clinical Assessment','REQUIRED',
  'This policy defines the assessment, documentation, and physician approval process for recertification of home health eligibility at Care Indeed Home Health Care, Inc. The recertification assessment confirms continued skilled care need and homebound status for the next 60-day period.');
const CL_CA_005 = makeSimpleCL('CL-CA-005','Homebound Status Determination & Documentation','CA — Clinical Assessment','REQUIRED',
  'This policy establishes criteria and documentation requirements for determining and verifying patient homebound status per CMS guidelines. Homebound status is a prerequisite for Medicare home health eligibility and must be clearly documented at every OASIS time point and throughout the clinical record.');
const CL_CA_006 = makeSimpleCL('CL-CA-006','Face-to-Face Encounter Compliance','CA — Clinical Assessment','REQUIRED',
  'This policy defines requirements for physician or allowed practitioner face-to-face encounters per 42 CFR 484.55. The face-to-face encounter requirement must be met within defined timeframes relative to the start of the home health episode and must be documented with clinical findings supporting home health eligibility.');
const CL_CA_007 = makeSimpleCL('CL-CA-007','Face-to-Face Encounter Tracking & Expiration Monitoring','CA — Clinical Assessment','REQUIRED',
  'This policy defines the operational tracking system for face-to-face encounter documentation including status dashboards, expiration alerts, escalation timelines, and accountability to prevent lapses resulting in claim denials at Care Indeed Home Health Care, Inc. F2F compliance is among the highest-risk billing issues in home health.');

// ─── CL-CD — CLINICAL DOCUMENTATION ──────────────────────────────────────────
const CL_CD_001 = makeSimpleCL('CL-CD-001','Clinical Documentation Standards','CD — Clinical Documentation','REQUIRED',
  'This policy establishes minimum standards for clinical documentation content, timeliness, accuracy, and authentication at Care Indeed Home Health Care, Inc. Clinical documentation is the primary evidence of service delivery and must support both billing compliance and patient safety.');
const CL_CD_002 = makeSimpleCL('CL-CD-002','Clinical Record Content & Organization','CD — Clinical Documentation','REQUIRED',
  'This policy defines minimum required content, organization standards, and retention requirements for patient clinical records at Care Indeed Home Health Care, Inc. The clinical record is the single source of truth for patient care delivery and must be organized, complete, and retrievable within required timeframes per 42 CFR 484.110.');
const CL_CD_003 = makeSimpleCL('CL-CD-003','Clinical Record Authentication & Signature Requirements','CD — Clinical Documentation','REQUIRED',
  'This policy establishes requirements for authenticating all clinical record entries including acceptable signature formats, electronic signature standards, timeliness of authentication, and co-signature requirements for supervised staff at Care Indeed Home Health Care, Inc.');
const CL_CD_004 = makeSimpleCL('CL-CD-004','Timely Documentation Completion & Lock Requirements','CD — Clinical Documentation','REQUIRED',
  'This policy mandates specific timeframes for clinical documentation completion and record locking following each encounter, with escalation protocols for overdue entries and supervisory review requirements. Timely documentation is essential for OASIS accuracy, billing compliance, and coordinated care at Care Indeed Home Health Care, Inc.');

// ─── CL-PR — PATIENT RIGHTS & SAFETY ─────────────────────────────────────────
const CL_PR_001 = makeSimpleCL('CL-PR-001','Patient Rights & Responsibilities','PR — Patient Rights & Safety','REQUIRED',
  'This policy ensures patient rights and responsibilities are communicated, documented, and protected per 42 CFR 484.50. Patients of Care Indeed Home Health Care, Inc. have the right to be informed of and exercise their rights during care, and these rights must be communicated in writing at the start of care and at any time upon request.');
const CL_PR_002 = makeSimpleCL('CL-PR-002','Advance Directive Compliance','PR — Patient Rights & Safety','REQUIRED',
  'This policy defines requirements for identifying, documenting, and honoring patient advance directives per federal and state law. Care Indeed Home Health Care, Inc. shall inquire about advance directives at the start of every home health episode and ensure all directives are accessible to clinicians at point of care.');
const CL_PR_003 = makeSimpleCL('CL-PR-003','Informed Consent','PR — Patient Rights & Safety','REQUIRED',
  'This policy establishes requirements for obtaining and documenting informed consent for all home health services at Care Indeed Home Health Care, Inc. Informed consent must be obtained from the patient or authorized representative before initiating services, with documentation that risks, benefits, and alternatives were explained.');
const CL_PR_004 = makeSimpleCL('CL-PR-004','Restraint & Seclusion Prohibition','PR — Patient Rights & Safety','REQUIRED',
  'This policy prohibits the use of physical or chemical restraints or seclusion in the home health setting and defines protocols for managing unsafe patient situations while preserving patient rights at Care Indeed Home Health Care, Inc. The use of restraints in home health is prohibited under 42 CFR 484.50.');
const CL_PR_005 = makeSimpleCL('CL-PR-005','Emergency Preparedness — Clinical','PR — Patient Rights & Safety','REQUIRED',
  'This policy establishes clinical protocols for patient care continuity during declared emergencies, disasters, and public health emergencies per 42 CFR 484.102. Care Indeed Home Health Care, Inc. shall identify high-risk patients and implement individualized emergency plans to protect continuity of clinical services during emergencies.');
const CL_PR_006 = makeSimpleCL('CL-PR-006','Abuse, Neglect & Exploitation Reporting','PR — Patient Rights & Safety','REQUIRED',
  'This policy mandates identification, reporting, and documentation of suspected abuse, neglect, or exploitation per California state mandatory reporting law and federal requirements at Care Indeed Home Health Care, Inc. All agency personnel are mandated reporters and must report suspected abuse immediately upon identification.');

// ─── CL-OA — OASIS & ASSESSMENT TOOLS ────────────────────────────────────────
const CL_OA_001 = makeSimpleCL('CL-OA-001','OASIS Completion Timeliness & Accountability','OA — OASIS & Assessment Tools','REQUIRED',
  'This policy defines required timeframes for OASIS completion at each assessment time point and establishes accountability for late or incomplete assessments at Care Indeed Home Health Care, Inc. OASIS data must be completed, reviewed, and locked within CMS-mandated windows to ensure accurate transmission and quality reporting.');
const CL_OA_002 = makeSimpleCL('CL-OA-002','OASIS Quality Review & Error Correction','OA — OASIS & Assessment Tools','REQUIRED',
  'This policy establishes a structured quality review process for completed OASIS assessments and defines the error correction and resubmission process at Care Indeed Home Health Care, Inc. Pre-transmission quality review prevents erroneous data from affecting quality scores and billing compliance.');
const CL_OA_003 = makeSimpleCL('CL-OA-003','OASIS Clinician Authorization & Competency','OA — OASIS & Assessment Tools','REQUIRED',
  'This policy restricts OASIS completion to clinicians who have demonstrated competency through validated assessment and maintains a current authorization roster at Care Indeed Home Health Care, Inc. OASIS must be completed only by licensed RNs, PTs, and SLPs who have completed CMS-recognized OASIS training.');
const CL_OA_004 = makeSimpleCL('CL-OA-004','OASIS Item-Level Guidance Compliance','OA — OASIS & Assessment Tools','REQUIRED',
  'This policy requires all OASIS responses to align with the current CMS OASIS Guidance Manual and prohibits agency-created coding interpretations that conflict with CMS guidance. Item-level guidance compliance ensures consistent data collection and prevents improper coding that inflates or deflates quality scores.');
const CL_OA_005 = makeSimpleCL('CL-OA-005','OASIS Data Integrity & Security','OA — OASIS & Assessment Tools','REQUIRED',
  'This policy establishes controls to ensure OASIS data is accurate, complete, securely transmitted, and protected from unauthorized access or modification at Care Indeed Home Health Care, Inc. OASIS data integrity is required by CMS and is essential for accurate public quality reporting under the Home Health Compare program.');
const CL_OA_006 = makeGenericCL(
  'CL-OA-006', 'Documentation Hierarchy and Evidence Source Prioritization',
  'OA — OASIS & Assessment Governance', 'REQUIRED',
  // PURPOSE
  'This policy establishes the priority ranking of evidence sources that authorized OASIS assessors and all clinical documentation authors at Care Indeed Home Health Care, Inc. must apply when making clinical coding decisions, completing OASIS assessments, and creating or resolving discrepancies in clinical documentation. When the same patient\'s clinical status is described differently across multiple concurrent documentation sources — referral discharge summaries, prior agency records, therapy evaluations, nursing visit notes, and patient self-report — the assessor must follow a defined, defensible, clinically sound hierarchy that places the highest weight on contemporaneous direct clinical observation and the lowest weight on unverified secondary sources. The absence of a documented evidence hierarchy creates three failure modes: financial motivation influencing source selection, inconsistency across assessors distorting quality measures, and elimination of the audit trail needed for clinical and regulatory review. This policy implements 42 CFR § 484.55(b) and the CMS OASIS-E2 Guidance Manual\'s foundational principle that OASIS responses must be grounded in clinical evidence collected during the assessment encounter.',
  // SCOPE
  [
    'All registered nurses (RNs) authorized to conduct comprehensive OASIS assessments per CL-OA-003',
    'The OASIS Quality Reviewer who validates evidence source use during quality reviews',
    'The Director of Nursing / Clinical Manager who oversees assessment accuracy and compliance',
    'All clinical disciplines who contribute clinical information to the assessing RN during the assessment process',
    'The Compliance Officer who reviews evidence source selection in the context of audits or compliance investigations',
  ],
  // DEFINITIONS
  [
    { term: 'Evidence Source', definition: 'Any document, observation, test result, or verbal report that provides clinical information relevant to an OASIS coding decision or a clinical documentation entry.' },
    { term: 'Documentation Hierarchy', definition: 'The priority ranking system established by this policy that governs the relative weight assigned to different categories of evidence sources when making OASIS coding decisions and resolving source conflicts.' },
    { term: 'Direct Clinical Observation', definition: 'The assessing RN\'s own first-hand observation of the patient performing an activity, exhibiting a symptom, or demonstrating a functional level during the assessment encounter. The highest-weight evidence source (Level 1).' },
    { term: 'Physical Examination Finding', definition: 'A clinical finding obtained through hands-on physical examination by the assessing RN during the assessment encounter — including auscultation, palpation, range of motion testing, strength testing, and neurological assessment (Level 2).' },
    { term: 'Standardized Tool Administration', definition: 'A validated assessment instrument administered by the assessing RN during the assessment encounter in strict accordance with the validated protocol — including BIMS, PHQ-2/PHQ-9, MAHC-10, and other CMS-required tools (Level 3).' },
    { term: 'Patient Self-Report', definition: 'Information provided verbally by the patient about their own symptoms, functional abilities, medication use, or history. A primary but subjective source that requires corroboration for OASIS items requiring objective verification (Level 4 with corroboration; Level 5 without).' },
    { term: 'Caregiver Report', definition: 'Information provided verbally by a caregiver about the patient\'s functional abilities, symptoms, or history. Treated as corroborative with patient self-report rather than as an independent primary source (Level 5).' },
    { term: 'External Clinical Documentation', definition: 'Documentation generated by healthcare providers or facilities outside Care Indeed Home Health Care, Inc. — including hospital discharge summaries, SNF discharge records, physician office notes, specialist reports, and prior home health agency records (Level 6).' },
    { term: 'Inference', definition: 'A coding decision based on logical extrapolation from available evidence rather than on direct clinical observation, patient report, or documented clinical findings. The lowest-weight evidence basis; requires explicit documentation of the inferential reasoning (Level 6).' },
    { term: 'Evidence Traceability', definition: 'The ability of a reviewer to identify, in the clinical record, the specific documentation or observation that supported a given OASIS coding decision. Required for all OASIS responses per Section 4.4.' },
  ],
  // POLICY STATEMENTS
  [
    '4.1 All OASIS coding decisions at Care Indeed Home Health Care, Inc. shall be grounded in evidence drawn from the highest available level of the Documentation Hierarchy defined in Section 6. When evidence from a higher-level source is available and applicable, it shall govern the coding decision over evidence from a lower-level source.',
    '4.2 No OASIS item response shall be selected on the basis of a lower-level evidence source when a higher-level source provides directly applicable clinical information for that item during the applicable look-back period.',
    '4.3 When evidence sources conflict — when a higher-level source and a lower-level source describe the patient\'s status differently — the assessor shall apply the evidence hierarchy, document the conflicting sources in the assessment narrative, explain why the higher-level source was selected, and initiate the conflicting source reconciliation process per CL-OA-008 if the conflict has clinical implications beyond the immediate coding decision.',
    '4.4 The evidence source used to support every OASIS coding decision shall be identifiable in the assessment narrative documentation. An OASIS response that cannot be traced to a specific, documentable evidence source is an unsupported response, regardless of its clinical plausibility.',
    '4.5 Financial considerations — including PDGM payment group optimization, episode management, or revenue targets — shall not influence evidence source selection. Selecting a lower-level evidence source because it produces a more favorable payment outcome, when a higher-level source is available, constitutes data manipulation and a potential violation of the False Claims Act.',
    '4.6 The Documentation Hierarchy applies to all clinical documentation decisions, not exclusively to OASIS coding. When a clinician must choose between conflicting sources to document a clinical finding in a visit note, plan of care, or assessment narrative, the same hierarchy applies.',
    '4.7 The Director of Nursing shall incorporate evidence source documentation into the monthly OASIS quality audit per CL-OA-002, verifying that audited assessments contain traceable evidence references for high-risk item categories.',
  ],
  // PROCEDURES
  [
    ['7.1.1', 'Assessing RN', 'Before beginning the OASIS assessment, review all available pre-visit documentation (referral records, prior notes, medication lists) to identify the items that will be assessed. Do not pre-populate any OASIS response based on pre-visit documentation alone — this is Level 6 evidence for items requiring Level 1 or 2.', 'Before each assessment visit.'],
    ['7.1.2', 'Assessing RN', 'During the assessment visit, structure the clinical encounter to generate direct observation and physical examination evidence for all GG functional items and examination-dependent items. Ask the patient to perform activities rather than asking whether they can perform them; remove wound dressings to directly observe all wounds; conduct a full physical examination; administer all required standardized tools per validated protocol.', 'During the assessment visit.'],
    ['7.1.3', 'Assessing RN', 'When direct observation of a specific activity is clinically unsafe, practically impossible, or refused by the patient, document the reason and note the evidence level being used as the substitute. Notify the Director of Nursing if the inability to obtain Level 1 or 2 evidence affects a high-risk OASIS item (GG items, wound items).', 'At the time of the assessment; notification within 24 hours.'],
    ['7.1.4', 'Assessing RN', 'After completing the assessment visit, complete the narrative documentation before coding the OASIS responses. The narrative shall precede the OASIS responses — do not reverse-engineer narrative to match OASIS responses that were pre-populated from external sources.', 'Within the required documentation timeframe per CL-OA-001.'],
    ['7.2.1', 'Assessing RN', 'For each OASIS item being coded, the assessment narrative shall contain documentation that a reviewer can verify. For Level 1 items: describe what was observed in specific, objective terms. For Level 2: document the specific examination finding. For Level 3: document individual item scores and total. For Level 4–6: document the source, information provided, and any corroborating or conflicting information.', 'In the assessment narrative; concurrent with or before OASIS coding.'],
    ['7.2.2', 'Assessing RN', 'When using Level 5 or 6 evidence for an item where higher-level evidence would normally be expected, include the notation: "Level [X] evidence used for [OASIS item] because [specific reason higher-level evidence was not available]. Evidence basis: [description of evidence]."', 'In the assessment narrative.'],
    ['7.2.3', 'Assessing RN', 'Never document an evidence source that was not actually used. If the wound assessment was done from a prior note (Level 6) rather than direct wound observation (Level 1), do not document a wound description in language suggesting direct observation occurred. This constitutes falsification of medical records regardless of whether the coded OASIS response happens to be accurate.', 'At all times.'],
    ['7.3.1', 'OASIS Quality Reviewer', 'During each Level 2 quality review per CL-OA-002, assess evidence traceability for all GG functional items and wound items. For each reviewed item, verify: (a) the narrative contains documentation at the appropriate evidence level; (b) the coded OASIS response is consistent with the documented evidence; (c) no lower-level evidence source was used when higher-level evidence was documented.', 'Within the timeline specified in CL-OA-002.'],
    ['7.3.2', 'Director of Nursing', 'During monthly OASIS accuracy audits per CL-OA-002, include evidence traceability as a specific audit category. Calculate the percentage of audited assessments where every reviewed OASIS item has traceable, appropriate-level evidence documentation. Report as a separate metric in the OASIS Accuracy Dashboard.', 'Monthly.'],
    ['7.3.3', 'Director of Nursing', 'When an audited assessment reveals Level 6 evidence used for GG functional items without documented clinical justification, treat this as Priority 1 requiring individual coaching within 7 calendar days and targeted retraining within 14 calendar days. Report to Compliance Officer if the pattern appears across multiple assessors.', 'Coaching within 7 calendar days; Compliance Officer notification for patterns.'],
  ],
  // DOCUMENTATION REQUIREMENTS
  [
    ['Evidence-level documentation — GG functional items', 'Narrative with specific observation descriptions per Level 1 standards', 'Assessing RN', 'EHR — Assessment module and visit note', 'Concurrent with OASIS completion; retained minimum 7 years'],
    ['Evidence-level documentation — wound items', 'Direct wound observation documentation per Level 1 and 2 standards', 'Assessing RN', 'EHR — Assessment module; Wound documentation module', 'At each applicable time point; retained minimum 7 years'],
    ['Standardized tool results with item-level scores', 'PHQ-2/PHQ-9, BIMS, MAHC-10 (as applicable) with each component score', 'Assessing RN', 'EHR — Assessment module', 'At each applicable time point; retained minimum 7 years'],
    ['Level 5 or 6 evidence notation', 'Explicit documentation of evidence level and reason when lower-level sources are used', 'Assessing RN', 'EHR — Assessment narrative', 'At the time of each such use; retained minimum 7 years'],
    ['Monthly evidence traceability audit results', 'Audit findings including evidence traceability metric', 'Director of Nursing', 'OASIS Accuracy Dashboard; Director of Nursing supervisory file', 'Monthly; retained minimum 7 years'],
    ['Policy acknowledgment', 'Signed acknowledgment — Appendix A', 'Each individual; Administrator (collection)', 'Policy acknowledgment file', 'Within 14 calendar days of effective date, revision, or hire'],
  ],
  // COMPLIANCE INDICATORS
  [
    ['GG functional items coded from Level 1 direct observation when the patient was present and capable', 'Monthly OASIS audit — cross-reference GG responses with assessment narrative observation documentation', '≥95% of GG items with documented direct observation or clinically justified exception'],
    ['Wound items coded from direct wound observation', 'Monthly OASIS audit — verify narrative contains wound description at Level 1 standard', '≥98% of wound items coded from direct observation at the assessment encounter'],
    ['Standardized tool scores documented at item level', 'Monthly audit of BIMS and PHQ-2/PHQ-9 documentation', '≥98% of tool administrations with item-level scores documented'],
    ['Level 5/6 evidence uses documented with explicit notation', 'Audit of assessments where Level 5/6 evidence was the primary source', '≥95% of Level 5/6 uses with explicit evidence level notation'],
    ['No evidence of revenue-motivated source selection', 'Compliance Officer quarterly review of coding patterns', 'Zero confirmed instances'],
  ],
  // COMMON FAILURES
  [
    ['SOC GG items coded from hospital discharge functional description without SOC direct observation', 'ADR denial; OASIS inaccuracy; potential upcoding', 'Train all assessors on the non-transferability of discharge status to SOC status; require GG observation documentation in EHR before OASIS can be locked'],
    ['Wound items coded from prior visit notes at RECERT without current wound observation', 'OASIS inaccuracy at RECERT; quality measure distortion', 'Include wound observation confirmation as mandatory pre-lock checklist item per CL-OA-019'],
    ['BIMS coded from clinical impression rather than formal tool administration', 'M1700 inaccuracy; behavioral health PDGM classification error', 'Annual BIMS competency demonstration required; OASIS Quality Reviewer verifies item-level score documentation'],
    ['Assessment narrative describes patient performing activity but GG response does not reflect the described performance', 'Internal inconsistency between Level 1 observation and OASIS coding', 'Director of Nursing monthly audit includes narrative-to-GG cross-reference as a required audit step'],
    ['Caregiver report used as primary evidence for GG items without documentation that direct observation was not feasible', 'Level 5 used for Level 1 item without justification; surveyor citation risk', 'Train assessors on the requirement to attempt direct observation before defaulting to caregiver report; document refusal or clinical contraindication'],
  ],
  // SURVEYOR ITEMS
  [
    'CMS OASIS validation surveyors will independently assess patients in the survey sample and compare their clinical findings to the submitted OASIS data. The most common discrepancy linked to evidence hierarchy violations is GG functional items coded at a higher level of dependence than the patient\'s direct performance demonstrates.',
    'Surveyors will ask the assessing RN to describe the evidence basis for GG responses. If the assessor cannot identify a specific direct observation or examination finding — and the narrative does not document one — the assessment will be cited as inaccurate.',
    'ADR auditors from the MAC will specifically examine assessment narratives for the presence of specific, objective clinical descriptions that corroborate OASIS responses. Generic narratives without specific observation detail do not adequately support GG functional item responses.',
    'Auditors are trained to recognize when narratives have been copied from external sources (hospital discharge language appearing in the SOC narrative) or when narrative descriptions are generic and non-specific.',
    'An agency that cannot demonstrate a systematic evidence traceability review process has no structural mechanism for preventing evidence hierarchy violations — this will be noted as a quality governance deficiency.',
  ],
  // FEDERAL REFS
  [
    ['42 CFR § 484.55(b)', 'Standard: Content of the comprehensive assessment', 'Requires the assessment to accurately reflect the patient\'s current health status — the foundational basis for the evidence hierarchy'],
    ['42 CFR § 484.55(a)(1)', 'Standard: Completion of the comprehensive assessment', 'Assessment must be based on the assessing clinician\'s direct clinical evaluation'],
    ['42 CFR § 484.20', 'Reporting OASIS information', 'Accurate data reporting obligation dependent on appropriate evidence use'],
    ['CMS OASIS-E2 Guidance Manual', 'Item-specific instructions for data collection', 'Defines primary and secondary sources for each item category; governs where this policy does not specify'],
  ],
  // CROSS-REFS
  [
    ['CL-CA-001', 'Patient Assessment — Comprehensive', 'Parent policy; this policy governs the evidence standard for all assessment activities'],
    ['CL-CA-002', 'OASIS Data Collection & Accuracy', 'Accuracy standards that depend on appropriate evidence source use'],
    ['CL-OA-002', 'OASIS Quality Review & Error Correction', 'Quality review process that validates evidence hierarchy compliance'],
    ['CL-OA-003', 'OASIS Clinician Authorization & Competency', 'Assessor competency includes evidence hierarchy application'],
    ['CL-OA-004', 'OASIS Item-Level Guidance Compliance', 'CMS guidance governs evidence requirements for specific items'],
    ['CL-OA-007', 'Evidence-Based OASIS Coding Substantiation', 'Substantiation standards for evidence-supported coding'],
    ['CL-OA-008', 'Conflicting Documentation Source Resolution', 'Escalation path when evidence hierarchy does not resolve conflicting sources'],
    ['CL-OA-009', 'Point-in-Time Assessment at Start of Care', 'Point-in-time requirement reinforces prioritization of current assessment encounter evidence'],
    ['CL-OA-010', 'CMS Look-Back Period Compliance', 'Look-back requirements interact with evidence source currency'],
    ['CL-OA-011', 'Standardized Assessment Tool Administration', 'Level 3 evidence validity depends on validated administration'],
    ['CL-OA-012', 'Clinical Reasoning Documentation', 'Documentation required when clinical judgment supplements the hierarchy'],
    ['CL-OA-013', 'Cross-Document Verification', 'Cross-document verification applies the hierarchy across all available sources'],
    ['CL-OA-019', 'Pre-Submission Quality Review', 'Pre-submission review validates evidence traceability for each high-risk item'],
  ],
  // TRAINING
  [
    'All authorized OASIS assessors shall receive training on the Documentation Hierarchy and the six evidence levels at initial OASIS Competency Program authorization per CL-OA-003 and at each annual re-competency, including practical exercises requiring evidence level classification for sample clinical scenarios.',
    'Training shall address the specific prohibition on financial motivation in evidence source selection, including documentation of the consequences under the False Claims Act and the reporting obligation to the Compliance Officer per CO-CP-006.',
    'The Director of Nursing shall incorporate evidence hierarchy application into the monthly OASIS quality audit feedback provided to individual assessors, using specific audited examples to reinforce correct and incorrect evidence source selection.',
    'All personnel within scope shall sign the Policy Acknowledgment Form (Appendix A) within 14 calendar days of the effective date, any revision, or hire/appointment.',
  ],
);
const CL_OA_007 = makeSimpleCL('CL-OA-007','Evidence-Based OASIS Coding Substantiation','OA — OASIS & Assessment Tools','REQUIRED',
  'This policy requires that all OASIS item responses be supported by verifiable, contemporaneous clinical documentation within the medical record with a traceable evidentiary basis. Unsupported OASIS coding is a compliance risk and a quality data integrity failure at Care Indeed Home Health Care, Inc.');
const CL_OA_008 = makeSimpleCL('CL-OA-008','Conflicting Documentation Source Resolution','OA — OASIS & Assessment Tools','REQUIRED',
  'This policy establishes standardized reconciliation processes when documentation from referring facilities, prior care settings, or internal records contains conflicting clinical information at Care Indeed Home Health Care, Inc. Conflicting documentation must be reconciled before OASIS coding using the documentation hierarchy in CL-OA-006.');
const CL_OA_009 = makeSimpleCL('CL-OA-009','Point-in-Time Assessment at Start of Care','OA — OASIS & Assessment Tools','REQUIRED',
  'This policy requires that all SOC and ROC assessments reflect the patient\'s status at the time of the assessment encounter, not prior clinical records or pre-existing diagnoses. Point-in-time accuracy is a fundamental OASIS coding requirement that ensures the agency\'s quality measures reflect actual patient status at care initiation.');
const CL_OA_010 = makeSimpleCL('CL-OA-010','CMS Look-Back Period Compliance for Assessment Items','OA — OASIS & Assessment Tools','REQUIRED',
  'This policy requires that all OASIS items with CMS-defined look-back periods be coded using only information falling within the specified timeframe. Look-back period compliance is a specific OASIS requirement where coding information from outside the defined timeframe is a coding error regardless of clinical context.');
const CL_OA_011 = makeSimpleCL('CL-OA-011','Standardized Assessment Tool Administration and Validity','OA — OASIS & Assessment Tools','REQUIRED',
  'This policy requires CMS-mandated standardized tools including BIMS, PHQ-2/PHQ-9, and MAHC-10 to be administered according to validated protocols at Care Indeed Home Health Care, Inc. Deviation from validated administration methods invalidates the tool and produces inaccurate data that affects care planning and quality scores.');
const CL_OA_012 = makeSimpleCL('CL-OA-012','Clinical Reasoning Documentation for Coding Decisions','OA — OASIS & Assessment Tools','REQUIRED',
  'This policy requires that when a coding decision involves clinical judgment beyond direct observation, the clinician must document the reasoning supporting the selected response. Clinical reasoning documentation is a surveyor expectation and a defense against allegations of unsupported or inflated OASIS coding at Care Indeed Home Health Care, Inc.');
const CL_OA_013 = makeSimpleCL('CL-OA-013','Cross-Document Verification Prior to Assessment Finalization','OA — OASIS & Assessment Tools','REQUIRED',
  'This policy requires that prior to finalizing any comprehensive assessment, the assessing clinician reconcile findings against all available documentation sources to ensure accuracy and internal consistency at Care Indeed Home Health Care, Inc. Cross-document verification prevents both unsupported coding and overlooked clinical findings.');
const CL_OA_014 = makeSimpleCL('CL-OA-014','Medication Reconciliation — Prescribed Regimen vs. Actual Patient Behavior','OA — OASIS & Assessment Tools','REQUIRED',
  'This policy requires that medication-related assessment items distinguish between the prescribed regimen and actual medication-taking behavior at Care Indeed Home Health Care, Inc. OASIS medication items must reflect actual patient adherence, not just physician orders, for accurate quality reporting.');
const CL_OA_015 = makeSimpleCL('CL-OA-015','Assessment Completion Timeframe Compliance','OA — OASIS & Assessment Tools','REQUIRED',
  'This policy requires that all comprehensive assessments be completed and locked within CMS-defined timeframes including the five-day SOC window. Assessment timeliness compliance is tracked by Care Indeed Home Health Care, Inc. through a monitoring process with defined escalation for at-risk timelines.');
const CL_OA_016 = makeSimpleCL('CL-OA-016','Scoring Methodology Integrity for Multi-Item Assessments','OA — OASIS & Assessment Tools','ESSENTIAL',
  'This policy requires that for OASIS items derived from multi-component standardized tools (e.g., GG items, BIMS), individual item scores be correctly calculated before determining the OASIS response code. Calculation errors on multi-component items are a systemic quality data risk at Care Indeed Home Health Care, Inc.');
const CL_OA_017 = makeSimpleCL('CL-OA-017','Contemporaneous Documentation Requirement','OA — OASIS & Assessment Tools','REQUIRED',
  'This policy requires all clinical findings, observations, and assessment data to be documented at or near the time of encounter. Contemporaneous documentation is the highest-quality evidence source and is required for OASIS accuracy and clinical record integrity at Care Indeed Home Health Care, Inc.');
const CL_OA_018 = makeSimpleCL('CL-OA-018','Clinician Competency Validation for OASIS Assessment','OA — OASIS & Assessment Tools','REQUIRED',
  'This policy requires that the agency maintain a validated competency assessment process for all clinicians authorized to complete OASIS assessments. OASIS competency must be assessed initially and periodically to ensure consistent and accurate data collection at Care Indeed Home Health Care, Inc.');
const CL_OA_019 = makeSimpleCL('CL-OA-019','Pre-Submission Quality Review for Comprehensive Assessments','OA — OASIS & Assessment Tools','ESSENTIAL',
  'This policy requires a structured quality review process to verify internal consistency across related OASIS items prior to submission at Care Indeed Home Health Care, Inc. Pre-submission review by a qualified reviewer catches coding inconsistencies before they affect public quality reporting and value-based purchasing scores.');

// ─── POLICY MAP ───────────────────────────────────────────────────────────────
const POLICY_MAP: Record<string, PolicyContent> = {
  'CL-CP-001': CL_CP_001, 'CL-CP-002': CL_CP_002, 'CL-CP-003': CL_CP_003,
  'CL-CP-004': CL_CP_004, 'CL-CP-005': CL_CP_005, 'CL-CP-006': CL_CP_006,
  'CL-CP-007': CL_CP_007, 'CL-CP-008': CL_CP_008, 'CL-CP-009': CL_CP_009,
  'CL-SD-001': CL_SD_001, 'CL-SD-002': CL_SD_002, 'CL-SD-003': CL_SD_003,
  'CL-SD-004': CL_SD_004, 'CL-SD-005': CL_SD_005, 'CL-SD-006': CL_SD_006,
  'CL-SD-007': CL_SD_007, 'CL-SD-008': CL_SD_008, 'CL-SD-009': CL_SD_009,
  'CL-SD-010': CL_SD_010, 'CL-SD-011': CL_SD_011, 'CL-SD-012': CL_SD_012,
  'CL-SD-013': CL_SD_013, 'CL-SD-014': CL_SD_014, 'CL-SD-015': CL_SD_015,
  'CL-SD-016': CL_SD_016, 'CL-SD-017': CL_SD_017, 'CL-SD-018': CL_SD_018,
  'CL-SD-019': CL_SD_019, 'CL-SD-020': CL_SD_020, 'CL-SD-021': CL_SD_021,
  'CL-SD-022': CL_SD_022, 'CL-SD-023': CL_SD_023, 'CL-SD-024': CL_SD_024,
  'CL-SD-025': CL_SD_025,
  'CL-CA-001': CL_CA_001, 'CL-CA-002': CL_CA_002, 'CL-CA-003': CL_CA_003,
  'CL-CA-004': CL_CA_004, 'CL-CA-005': CL_CA_005, 'CL-CA-006': CL_CA_006,
  'CL-CA-007': CL_CA_007,
  'CL-CD-001': CL_CD_001, 'CL-CD-002': CL_CD_002, 'CL-CD-003': CL_CD_003,
  'CL-CD-004': CL_CD_004,
  'CL-PR-001': CL_PR_001, 'CL-PR-002': CL_PR_002, 'CL-PR-003': CL_PR_003,
  'CL-PR-004': CL_PR_004, 'CL-PR-005': CL_PR_005, 'CL-PR-006': CL_PR_006,
  'CL-OA-001': CL_OA_001, 'CL-OA-002': CL_OA_002, 'CL-OA-003': CL_OA_003,
  'CL-OA-004': CL_OA_004, 'CL-OA-005': CL_OA_005, 'CL-OA-006': CL_OA_006,
  'CL-OA-007': CL_OA_007, 'CL-OA-008': CL_OA_008, 'CL-OA-009': CL_OA_009,
  'CL-OA-010': CL_OA_010, 'CL-OA-011': CL_OA_011, 'CL-OA-012': CL_OA_012,
  'CL-OA-013': CL_OA_013, 'CL-OA-014': CL_OA_014, 'CL-OA-015': CL_OA_015,
  'CL-OA-016': CL_OA_016, 'CL-OA-017': CL_OA_017, 'CL-OA-018': CL_OA_018,
  'CL-OA-019': CL_OA_019,
};

// ─── TABS ─────────────────────────────────────────────────────────────────────
const NAV_TABS = [
  { id: 'overview',       label: 'Overview & Definitions',  Icon: Info },
  { id: 'policy',         label: 'Policy Statements',       Icon: Shield },
  { id: 'procedures',     label: 'Procedures',              Icon: Settings },
  { id: 'documentation',  label: 'Documentation',           Icon: FileText },
  { id: 'compliance',     label: 'Compliance & Audit',      Icon: CheckSquare },
  { id: 'references',     label: 'References & Admin',      Icon: Archive },
  { id: 'appendices',     label: 'Appendices (Forms)',      Icon: Paperclip },
] as const;

type TabId = typeof NAV_TABS[number]['id'];

// ─── TAB VIEWS ────────────────────────────────────────────────────────────────

function ViewOverview({ pc }: { pc: PolicyContent }) {
  return (
    <div className="space-y-6 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <SectionTitle icon={Shield} title="2. Purpose" />
          <p className="text-gray-700 leading-relaxed text-[15px]">{pc.purpose}</p>
        </Card>
        <Card>
          <SectionTitle icon={Search} title="3. Scope" />
          <p className="text-gray-700 mb-4 font-bold">This policy applies to:</p>
          <ul className="space-y-3">
            {pc.scopeItems.map((item, i) => (
              <li key={i} className="flex items-start">
                <CheckCircle className="text-[#007970] mr-3 mt-0.5 flex-shrink-0" size={18} />
                <span className="text-gray-700 text-[15px]">{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <Card>
        <SectionTitle icon={BookOpen} title="5. Definitions" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pc.definitions.map((def, i) => (
            <div key={i} className="bg-gray-50 border border-gray-200 p-5 rounded-xl shadow-sm">
              <h4 className="font-montserrat font-extrabold text-[#007970] mb-2">{def.term}</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{def.definition}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ViewPolicy({ pc }: { pc: PolicyContent }) {
  return (
    <div className="pb-12">
      <Card>
        <SectionTitle icon={List} title="4. Policy Statement" />
        <div className="space-y-4">
          {pc.statements.map((stmt, i) => (
            <div key={i} className="flex items-start bg-gray-50 border border-gray-200 p-5 rounded-xl shadow-sm">
              <div className="bg-[#007970] text-white rounded-full w-10 h-10 flex items-center justify-center font-bold font-montserrat flex-shrink-0 mr-5 shadow-inner text-sm">
                4.{i + 1}
              </div>
              <p className="text-gray-800 leading-relaxed pt-2 text-[15px]">{stmt.substring(stmt.indexOf(' ') + 1)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ViewProcedures({ pc }: { pc: PolicyContent }) {
  return (
    <div className="pb-12">
      <Card>
        <SectionTitle icon={Settings} title="6. Procedures" />
        <SimpleTable
          headers={['Step', 'Responsible Party', 'Action', 'Timeframe']}
          rows={pc.procedures}
        />
      </Card>
    </div>
  );
}

function ViewDocumentation({ pc }: { pc: PolicyContent }) {
  return (
    <div className="pb-12">
      <Card>
        <SectionTitle icon={FileText} title="7. Documentation Requirements" />
        <SimpleTable
          headers={['Requirement', 'Document / Record', 'Responsible Party', 'Location', 'Timeframe']}
          rows={pc.documentationRows}
        />
      </Card>
    </div>
  );
}

function ViewCompliance({ pc }: { pc: PolicyContent }) {
  return (
    <div className="space-y-6 pb-12">
      <Card>
        <SectionTitle icon={CheckSquare} title="8.1 How Compliance Is Measured" />
        <SimpleTable
          headers={['Compliance Indicator', 'Measurement Method', 'Acceptable Standard']}
          rows={pc.complianceIndicators}
        />
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <SectionTitle icon={Search} title="8.2 Surveyor Expectations" />
          <ul className="space-y-4">
            {pc.surveyorItems.map((item, i) => (
              <li key={i} className="text-[15px] text-[#1F1C1B] font-roboto flex items-start">
                <ChevronRight className="text-[#007970] mt-0.5 mr-2 flex-shrink-0" />
                {i + 1}. {item}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <SectionTitle icon={AlertTriangle} title="8.3 Common Failure Points" color="text-[#C74600]" />
          <div className="space-y-3">
            {pc.commonFailures.map((item, i) => (
              <div key={i} className="bg-red-50 border border-red-100 p-4 rounded-xl shadow-sm">
                <p className="font-bold text-red-900 text-[15px] mb-2">{item[0]}</p>
                <p className="text-sm text-red-700 mb-2"><strong>Risk:</strong> {item[1]}</p>
                <p className="text-sm text-gray-800 bg-white p-2 rounded-lg border border-red-100 shadow-inner"><strong>Mitigation:</strong> {item[2]}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ViewReferences({ pc }: { pc: PolicyContent }) {
  return (
    <div className="space-y-6 pb-12">
      <Card>
        <SectionTitle icon={Archive} title="9. Federal Regulatory References" />
        <SimpleTable
          headers={['Citation', 'Title', 'Relevance to This Policy']}
          rows={pc.federalRefs}
        />
      </Card>
      <Card>
        <SectionTitle icon={Archive} title="10. Cross-Referenced Agency Policies" />
        <SimpleTable
          headers={['Policy ID', 'Title', 'Relationship to This Policy']}
          rows={pc.crossRefs}
        />
      </Card>
      <Card>
        <SectionTitle icon={CheckSquare} title="11. Training & Version Control" />
        <ul className="space-y-4 mb-6">
          {pc.trainingItems.map((item, i) => (
            <li key={i} className="flex items-start bg-gray-50 border border-gray-200 p-4 rounded-xl">
              <span className="text-[#007970] font-bold mr-3 text-sm">11.{i + 1}</span>
              <p className="text-[15px] text-gray-700 leading-relaxed">{item}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function ViewAppendices({ pc }: { pc: PolicyContent }) {
  return (
    <div className="pb-12">
      <Card>
        <SectionTitle icon={Paperclip} title="Appendices & Forms" />
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <Paperclip className="mx-auto mb-4 text-gray-300" size={48} />
          <p className="text-lg font-montserrat font-bold text-gray-500 mb-2">Clinical Forms Library</p>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Standardized clinical forms and appendices for {pc.id} are provided as separate controlled documents
            within the clinical records management system. Contact the Director of Nursing for access.
          </p>
        </div>
      </Card>
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export function CLPolicyDetailView() {
  const { policyId } = useParams<{ policyId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const pc = policyId ? POLICY_MAP[policyId] : undefined;

  if (!pc) {
    return (
      <div className="rounded-xl border border-[#D70101]/30 bg-[#D70101]/5 p-6 text-sm text-[#D70101] font-roboto">
        Policy content not yet available for this policy ID.
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':      return <ViewOverview pc={pc} />;
      case 'policy':        return <ViewPolicy pc={pc} />;
      case 'procedures':    return <ViewProcedures pc={pc} />;
      case 'documentation': return <ViewDocumentation pc={pc} />;
      case 'compliance':    return <ViewCompliance pc={pc} />;
      case 'references':    return <ViewReferences pc={pc} />;
      case 'appendices':    return <ViewAppendices pc={pc} />;
      default:              return <ViewOverview pc={pc} />;
    }
  };

  const tierColor = pc.tier === 'REQUIRED' ? 'bg-[#D70101]'
    : pc.tier === 'ESSENTIAL' ? 'bg-[#C74600]'
    : 'bg-[#007970]';

  return (
    <div className="space-y-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

      {/* HEADER */}
      <div className="bg-[#007970] text-white relative p-8">
        <div className="flex items-start justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-montserrat font-bold text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={13} /> Back to Library
          </button>
          <button
            onClick={() => window.open(`/print/${pc.id}`, '_blank', 'noopener,noreferrer')}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors border border-white/20"
          >
            <Printer size={16} />
            Print / Export PDF
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-montserrat font-bold">{pc.id}</span>
          <span className={`rounded-md ${tierColor} px-2.5 py-1 text-[10px] font-montserrat font-bold uppercase tracking-wider`}>
            DRAFT
          </span>
          <span className="rounded-md bg-white/10 border border-white/30 px-2.5 py-1 text-[10px] font-montserrat font-bold uppercase tracking-wider">{pc.tier}</span>
        </div>

        <h1 className="font-montserrat text-3xl font-extrabold leading-tight mb-3">{pc.title}</h1>
        <p className="text-white/70 text-sm font-roboto">{pc.domain} · {pc.subdomain}</p>

        {/* POLICY METADATA */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-roboto">
          {[
            { label: 'Version', value: `v${pc.version}` },
            { label: 'Effective', value: pc.effective },
            { label: 'Next Review', value: pc.nextReviewDate },
            { label: 'Owner / Steward', value: pc.ownerSteward },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/10 rounded-lg px-3 py-2">
              <p className="text-white/50 font-montserrat font-bold uppercase tracking-widest text-[9px] mb-0.5">{label}</p>
              <p className="text-white font-bold">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* TAB BAR */}
      <div className="border-b border-gray-200 bg-white px-6 overflow-x-auto">
        <nav className="flex gap-1 -mb-px min-w-max">
          {NAV_TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as TabId)}
              className={`flex items-center gap-2 px-4 py-4 text-sm font-montserrat font-bold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-[#007970] text-[#007970]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* CONTENT */}
      <div className="bg-[#F0F4F8] p-6 min-h-[400px]">
        {renderContent()}
      </div>

      {/* FOOTER */}
      <div className="px-8 py-4 bg-white border-t border-gray-100 flex gap-6 text-xs text-gray-400 font-roboto">
        <span>Approved by: {pc.approvedBy}</span>
        <span>·</span>
        <span>Last Reviewed: {pc.lastReviewed}</span>
        <span>·</span>
        <span>Supersedes: {pc.supersedes}</span>
      </div>
    </div>
  );
}
