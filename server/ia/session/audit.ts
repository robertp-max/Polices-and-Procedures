/**
 * Brad Audit Log — Per-response traceability.
 *
 * Answers the survey defense question:
 *   "Why did Brad tell the user to do that?"
 *
 * Appends to JSONL format (one JSON object per line) for easy
 * grep, streaming, and log-aggregator ingestion.
 *
 * Enable: set BRAD_AUDIT_LOG=true
 * Location: server/ia/session/data/audit.jsonl (or BRAD_AUDIT_DIR)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import type { BradMode, BradUrgency, IncidentType } from './types.js';
import type { StructuredResponse, OperationalGap, RegulatoryAlert } from '../types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const AUDIT_ENABLED = process.env['BRAD_AUDIT_LOG'] === 'true';
const AUDIT_DIR = process.env['BRAD_AUDIT_DIR'] ?? path.join(__dirname, 'data');
const AUDIT_FILE = path.join(AUDIT_DIR, 'audit.jsonl');

export interface AuditEntry {
  entryId: string;
  timestamp: string;
  threadId: string;
  responseId: string;
  mode: BradMode;
  urgency: BradUrgency;
  incidentType: IncidentType | null;
  /** Sanitized user input — PHI should not be present but truncated for safety */
  userInputSummary: string;
  inputsUsed: {
    /** Policy IDs from citations */
    policies: string[];
    /** Operational gap IDs used */
    operationalGapIds: string[];
    /** Regulatory alert IDs used */
    regulatoryAlertIds: string[];
  };
  /** Key directives issued in directAnswer (first 300 chars) */
  directiveSummary: string;
  riskLevel: string;
  confidence: string;
  systemConfidenceScore: number;
  requiresFollowUp: boolean;
  lifeSafetyFlag: boolean;
  /** Was the emergency prepend applied deterministically? */
  emergencyEnforced: boolean;
  /** Case closure status */
  caseStatus: string;
  dataQuality: {
    phase1Active: boolean;
    phase2Active: boolean;
    phase3Active: boolean;
    allSeedData: boolean;
  };
}

function ensureDir(dir: string): void {
  try { fs.mkdirSync(dir, { recursive: true }); } catch { /* exists */ }
}

class AuditLogger {
  append(entry: AuditEntry): void {
    if (!AUDIT_ENABLED) return;
    try {
      ensureDir(AUDIT_DIR);
      const line = JSON.stringify(entry) + '\n';
      fs.appendFileSync(AUDIT_FILE, line, 'utf-8');
    } catch (e) {
      console.warn('[brad:audit] Failed to write audit entry:', (e as Error).message);
    }
  }

  /** Read recent entries (last N lines). Returns empty if not enabled. */
  readRecent(n = 50): AuditEntry[] {
    if (!AUDIT_ENABLED) return [];
    try {
      if (!fs.existsSync(AUDIT_FILE)) return [];
      const content = fs.readFileSync(AUDIT_FILE, 'utf-8');
      const lines = content.trim().split('\n').filter(Boolean);
      return lines.slice(-n).map(l => JSON.parse(l) as AuditEntry).reverse();
    } catch { return []; }
  }
}

export const auditLog = new AuditLogger();

/** Build and append an audit entry for a completed chat turn. */
export function recordAuditEntry(args: {
  threadId: string;
  mode: BradMode;
  urgency: BradUrgency;
  incidentType: IncidentType | null;
  userInput: string;
  response: StructuredResponse;
  operationalGaps: OperationalGap[];
  regulatoryAlerts: RegulatoryAlert[];
  lifeSafetyFlag: boolean;
  emergencyEnforced: boolean;
  caseStatus: string;
}): void {
  const entry: AuditEntry = {
    entryId: randomUUID(),
    timestamp: new Date().toISOString(),
    threadId: args.threadId,
    responseId: args.response.id,
    mode: args.mode,
    urgency: args.urgency,
    incidentType: args.incidentType,
    // Sanitize: truncate to 200 chars, avoid raw PHI in log
    userInputSummary: args.userInput.slice(0, 200),
    inputsUsed: {
      policies: (args.response.citations ?? []).map(c => c.policyId).filter(Boolean).slice(0, 10),
      operationalGapIds: args.operationalGaps.slice(0, 5).map(g => g.id),
      regulatoryAlertIds: args.regulatoryAlerts.slice(0, 3).map(r => r.updateId),
    },
    directiveSummary: args.response.directAnswer.slice(0, 300),
    riskLevel: args.response.riskLevel,
    confidence: args.response.confidence,
    systemConfidenceScore: args.response.systemConfidenceScore ?? 0,
    requiresFollowUp: !!(
      args.response.riskLevel === 'critical' ||
      args.response.riskLevel === 'high' ||
      args.lifeSafetyFlag ||
      args.mode === 'incident_reporting' ||
      args.mode === 'qapi_followup'
    ),
    lifeSafetyFlag: args.lifeSafetyFlag,
    emergencyEnforced: args.emergencyEnforced,
    caseStatus: args.caseStatus,
    dataQuality: {
      phase1Active: (args.response.phaseStatus?.phase1.available) ?? false,
      phase2Active: (args.response.phaseStatus?.phase2.available) ?? false,
      phase3Active: (args.response.phaseStatus?.phase3.available) ?? false,
      allSeedData: !!(args.operationalGaps.length > 0 || args.regulatoryAlerts.length > 0),
    },
  };
  auditLog.append(entry);
}
