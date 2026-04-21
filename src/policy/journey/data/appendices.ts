/* ═══════════════════════════════════════════════════════════════
   APPENDIX F — Pre-Employment Screening Checklist (HR-TA-001)
   This is the HARD STOP. Every line must be PASS or N/A and the
   form must be signed by HR Director before ANY work is permitted.
   ═══════════════════════════════════════════════════════════════ */

import type { AppendixFItem } from '@/policy/journey/types/journey';

export const APPENDIX_F_TEMPLATE: AppendixFItem[] = [
  { id: 1, label: 'Criminal background check completed & CLEARED',                  policyRef: 'HR-TA-002',         status: 'PENDING' },
  { id: 2, label: 'OIG LEIE screening CLEARED',                                       policyRef: 'HR-TA-003',         status: 'PENDING' },
  { id: 3, label: 'SAM screening CLEARED',                                            policyRef: 'HR-TA-003',         status: 'PENDING' },
  { id: 4, label: 'Primary source licensure verification completed',                  policyRef: 'HR-TA-004',         status: 'PENDING' },
  { id: 5, label: 'License expiration tracked (min 30 days remaining at hire)',        policyRef: 'HR-TA-004 §6.2',    status: 'PENDING' },
  { id: 6, label: 'Reference #1 verified',                                            policyRef: 'HR-TA-001 §6.4.3(d)', status: 'PENDING' },
  { id: 7, label: 'Reference #2 verified',                                            policyRef: 'HR-TA-001 §6.4.3(d)', status: 'PENDING' },
  { id: 8, label: 'I-9 completed',                                                    policyRef: 'HR-TA-001 §6.4.3(e)', status: 'PENDING' },
  { id: 9, label: 'Health screening completed',                                       policyRef: 'HR-WM-003',         status: 'PENDING' },
  { id: 10, label: 'Required immunizations verified',                                 policyRef: 'HR-WM-003',         status: 'PENDING' },
  { id: 11, label: 'Drug screening completed (if applicable)',                        policyRef: 'HR-ER-005',         status: 'PENDING' },
  { id: 12, label: 'TB test / respiratory fit-test (if applicable)',                  policyRef: 'HR-WM-003',         status: 'PENDING' },
  { id: 13, label: 'Driving record check (if driving required)',                      policyRef: 'RM-SS-003',         status: 'PENDING' },
  { id: 14, label: 'Signed offer letter on file',                                     policyRef: 'HR-TA-001',         status: 'PENDING' },
  { id: 15, label: 'Job description acknowledgment signed',                           policyRef: 'HR-TA-006',         status: 'PENDING' },
];

/* Appendix D — HR-TA-005 General Orientation Quiz item bank (abridged demo). */
export const GAO_EXAM_ITEMS: { q: string; options: string[]; correct: number; policyRef: string }[] = [
  {
    q: 'A patient asks you not to document a change in condition. You must:',
    options: [
      'Honor the request — it is the patient’s right',
      'Document accurately and completely per CL-CD-001; explain documentation is a regulatory requirement',
      'Document only in a personal notebook',
      'Ask the supervisor to decide next shift',
    ],
    correct: 1,
    policyRef: 'CL-CD-001',
  },
  {
    q: 'You suspect elder abuse during a home visit. Within what timeframe must you report?',
    options: ['Within 7 days', 'Before end of shift', 'Immediately to APS and internally per CL-PR-006', 'Only if the patient requests'],
    correct: 2,
    policyRef: 'CL-PR-006',
  },
  {
    q: 'Minimum necessary access under HIPAA means:',
    options: [
      'View only the information needed for your role',
      'View everything to stay informed',
      'Share PHI freely within the agency',
      'Access only during business hours',
    ],
    correct: 0,
    policyRef: 'CO-HP-001',
  },
  {
    q: 'Which status code confirms Appendix F passed and work may begin?',
    options: ['PENDING', 'PASS or N/A, HR Director signed', 'FAIL', 'WAIVED by supervisor'],
    correct: 1,
    policyRef: 'HR-TA-001 §6.4.4',
  },
  {
    q: 'Hand hygiene in the home setting must be performed:',
    options: [
      'Before donning PPE only',
      'Before and after patient contact, after PPE removal, after contact with environment',
      'Only when hands look soiled',
      'At start and end of visit',
    ],
    correct: 1,
    policyRef: 'CL-SD-016',
  },
];
