/**
 * V3CESSeedPreview.tsx
 *
 * Early visual preview of the high-fidelity V3 CES seed data.
 * Route (temporary): can be mounted from /ui-staging or a dedicated story route.
 *
 * Shows:
 *  - Active sprint header (from seed)
 *  - ACHC Surveyor alignment table
 *  - Current sprint Execution Units as glass cards (mimics board columns)
 *
 * This is the first consumable output of the seeding effort.
 *
 * V3_SYNTHETIC_FALLBACK: this route is seed-preview only. Cards do not open
 * task/workflow interiors in Phase 2.
 */

import { useState } from 'react';
import {
  V3_SprintContextSeed,
  V3_AchcSurveyorAlignmentSeed,
  V3_ExecutionUnitsSeed,
  V3_ViewModeSeed,
  type ViewMode,
} from '@/policy/ces/data/V3_CES_SeedData';
import type { ExecutionUnit, ComplianceState } from '@/policy/ces/types';

// Re-use the same visual tokens as the main V3 staging shell for consistency
const V3 = {
  baseBg: '#05060A',
  glass2: 'rgba(255,255,255,0.04)',
  glass3: 'rgba(255,255,255,0.015)',
  teal: '#007970',
  tealLight: '#00D1C1',
  orange: '#E07B2C',
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  borderDefault: 'rgba(255,255,255,0.15)',
  borderHighlight: 'rgba(255,255,255,0.33)',
};

const STATE_COLORS: Record<ComplianceState, { bg: string; fg: string; border: string }> = {
  upcoming:           { bg: 'rgba(100,116,139,0.15)', fg: '#64748B', border: 'rgba(100,116,139,0.3)' },
  ready:              { bg: 'rgba(0,121,112,0.15)',   fg: '#00D1C1', border: 'rgba(0,121,112,0.3)' },
  in_progress:        { bg: 'rgba(0,121,112,0.22)',   fg: '#00D1C1', border: 'rgba(0,121,112,0.4)' },
  awaiting_signature: { bg: 'rgba(224,123,44,0.15)',  fg: '#E07B2C', border: 'rgba(224,123,44,0.3)' },
  blocked:            { bg: 'rgba(239,68,68,0.15)',   fg: '#EF4444', border: 'rgba(239,68,68,0.3)' },
  completed:          { bg: 'rgba(16,185,129,0.15)',  fg: '#10B981', border: 'rgba(16,185,129,0.3)' },
};

function ExecutionUnitCard({ unit }: { unit: ExecutionUnit }) {
  const c = STATE_COLORS[unit.complianceState];
  const evidence = unit.evidenceStatus;
  const complete = evidence.requiredFormsComplete + evidence.signaturesComplete;
  const total = evidence.requiredFormsTotal + evidence.signaturesRequired;
  const pct = total > 0 ? Math.round((complete / total) * 100) : 0;

  return (
    <div style={{
      background: V3.glass2,
      border: `1px solid ${V3.borderDefault}`,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: c.fg, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {unit.complianceState.replace('_', ' ')}
        </div>
        <div style={{ fontSize: 10, color: V3.textTertiary }}>{unit.domain.toUpperCase()}</div>
      </div>

      <div style={{ fontSize: 14, fontWeight: 600, color: V3.textPrimary, lineHeight: 1.3, marginBottom: 10 }}>
        {unit.title}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 11, color: V3.textSecondary, marginBottom: 10 }}>
        <span>Owner: <strong style={{ color: V3.textPrimary }}>{unit.owner.initials}</strong> — {unit.owner.role}</span>
        <span>Due: {unit.dueDate}</span>
      </div>

      {/* Evidence mini bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 999 }}>
          <div style={{ width: `${pct}%`, height: 4, background: V3.tealLight, borderRadius: 999 }} />
        </div>
        <div style={{ fontSize: 10, color: V3.textTertiary, minWidth: 42, textAlign: 'right' }}>
          {pct}%
        </div>
      </div>

      {unit.blockedReason && (
        <div style={{ marginTop: 8, fontSize: 11, color: '#FCA5A5', background: 'rgba(239,68,68,0.1)', padding: '4px 8px', borderRadius: 6 }}>
          Blocked: {unit.blockedReason.label}
        </div>
      )}
      <div style={{ marginTop: 10, fontSize: 10.5, color: V3.textTertiary }}>
        BLOCKED_PENDING_PHASE_4 — task/workflow interiors are not wired in this seed preview.
      </div>
    </div>
  );
}

export function V3CESSeedPreview() {
  const [viewMode, setViewMode] = useState<ViewMode>('internal');
  const [selectedState, setSelectedState] = useState<ComplianceState | 'all'>('all');

  const units = V3_ExecutionUnitsSeed
    .filter(u => V3_ViewModeSeed[viewMode].visibleUnits.includes(u.id))
    .filter(u => selectedState === 'all' || u.complianceState === selectedState);

  const achc = V3_AchcSurveyorAlignmentSeed;
  const sprint = V3_SprintContextSeed;

  return (
    <div style={{ padding: 24, background: V3.baseBg, minHeight: '100vh', color: V3.textPrimary, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: '2px', color: V3.textTertiary, marginBottom: 4 }}>V3_SYNTHETIC_FALLBACK — CES SEED PREVIEW ONLY</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>
            CES Seed Preview — {sprint.activeSprintLabel}
          </h1>
          <p style={{ color: V3.textSecondary, marginTop: 6 }}>
            Seeded data preview generated from the V3 seeding blueprint. It does not prove workflow wiring or production parity.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div style={{ display: 'inline-flex', background: V3.glass3, border: `1px solid ${V3.borderDefault}`, borderRadius: 999, padding: 3, marginBottom: 20 }}>
          {(['internal', 'surveyor'] as const).map(m => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              style={{
                padding: '6px 18px',
                borderRadius: 999,
                border: 'none',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                background: viewMode === m ? V3.teal : 'transparent',
                color: viewMode === m ? '#000' : V3.textSecondary,
              }}
            >
              {m === 'internal' ? 'Internal Staff View' : 'ACHC Surveyor View'}
            </button>
          ))}
        </div>

        {/* Sprint Banner */}
        <div style={{
          background: V3.glass2, border: `1px solid ${V3.borderDefault}`, borderRadius: 12,
          padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16
        }}>
          <div>
            <div style={{ fontSize: 12, color: V3.textTertiary }}>ACTIVE SPRINT</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{sprint.activeSprint.id} — {sprint.activeSprintLabel}</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right', fontSize: 12, color: V3.textSecondary }}>
            {sprint.activeSprint.startDate} → {sprint.activeSprint.endDate}
          </div>
        </div>

        {/* ACHC Surveyor Alignment (only relevant in surveyor mode, but always shown for now) */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: V3.textTertiary, marginBottom: 8, letterSpacing: '0.5px' }}>
            ACHC SURVEYOR ALIGNMENT — {achc.overallReadiness}% OVERALL READINESS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            {achc.standards.map(std => (
              <div key={std.id} style={{ background: V3.glass3, border: `1px solid ${V3.borderDefault}`, borderRadius: 10, padding: 12, fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 600 }}>{std.id}</div>
                  <div style={{
                    color: std.alignment === 'MET' ? '#10B981' : std.alignment === 'GAP' ? '#EF4444' : '#E07B2C',
                    fontWeight: 600
                  }}>{std.alignment}</div>
                </div>
                <div style={{ color: V3.textSecondary, margin: '4px 0 8px' }}>{std.title}</div>
                <div style={{ fontSize: 11, color: V3.textTertiary }}>
                  {std.evidenceCount} evidence items • Last reviewed {std.lastReviewed}
                </div>
                {std.surveyorNotes && (
                  <div style={{ marginTop: 6, fontSize: 11, color: '#FCA5A5' }}>{std.surveyorNotes}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Execution Units for current view */}
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: V3.textTertiary, letterSpacing: '0.5px' }}>
            EXECUTION UNITS — {viewMode.toUpperCase()} VIEW ({units.length})
          </div>
          <select
            value={selectedState}
            onChange={e => setSelectedState(e.target.value as any)}
            style={{ background: V3.glass3, color: V3.textPrimary, border: `1px solid ${V3.borderDefault}`, borderRadius: 6, padding: '4px 8px', fontSize: 12 }}
          >
            <option value="all">All states</option>
            {['upcoming','ready','in_progress','awaiting_signature','blocked','completed'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
          {units.length === 0 && <div style={{ color: V3.textTertiary, padding: 20 }}>No units match the current filter.</div>}
          {units.map(u => (
            <ExecutionUnitCard key={u.id} unit={u} />
          ))}
        </div>

        <div style={{ marginTop: 32, fontSize: 11, color: V3.textTertiary, borderTop: `1px solid ${V3.borderDefault}`, paddingTop: 16 }}>
          V3_SYNTHETIC_FALLBACK seed module: <code>src/policy/ces/data/V3_CES_SeedData.ts</code>
        </div>
      </div>
    </div>
  );
}
