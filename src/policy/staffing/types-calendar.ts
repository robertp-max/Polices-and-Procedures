// ============================================================
// STEP 2 — CALENDAR / SHIFT TYPES (isolated from Phase 1 types)
// Terminology: "Shift" for scheduled care events. "Competency"
// for secondary requirements — NEVER "Skill". The person
// receiving care is "Patient" — never "Client". No PHI fields.
// ============================================================
import type { AcuityLevel } from './types';

// Re-export so callers can import from one place.
export type { AcuityLevel };

export type ShiftStatus =
  | 'open'              // no clinician assigned yet
  | 'filled'            // clinician assigned
  | 'pending_coverage'  // open and approaching / needing coverage
  | 'cancelled';        // shift cancelled

export type ShiftDiscipline = 'RN' | 'LVN' | 'PT' | 'OT' | 'MSW' | 'HHA' | 'CNA';

export interface Shift {
  id: string;
  patientId: string;          // FK → Patient.id (must exist in mockPatients)
  clinicianId: string | null; // FK → Clinician.id when filled; null otherwise
  status: ShiftStatus;
  date: string;               // ISO YYYY-MM-DD
  startTime: string;          // HH:MM 24h
  endTime: string;            // HH:MM 24h
  requiredDiscipline: ShiftDiscipline;
  requiredCompetencies: string[]; // e.g. "Wound Care" — NEVER "Skill"
  acuityLevel?: AcuityLevel;
  priority?: 'standard' | 'elevated' | 'urgent';
  cancellationReason?: string; // only when status === 'cancelled'
  notes?: string;
}

export interface CalendarFilterState {
  status: ShiftStatus | 'all';
  discipline: ShiftDiscipline | 'all';
  dateFrom: string | null;    // ISO YYYY-MM-DD or null
  dateTo: string | null;
}

// View toggle: list (grouped cards), week (7-day grid), month (month grid)
export type CalendarView = 'list' | 'week' | 'month';
