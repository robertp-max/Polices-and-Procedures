import { useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormViewer } from '@/policy/components/FormViewer';
import { CI, DOMAIN_META, RISK_META, CADENCE_LABEL } from '../brand';
import { getWorkflow } from '@/policy/data/workflows.generated';
import { formTitle } from '@/policy/data/formTitles.generated';
import type { Workflow } from '@/policy/types/workflow';

/* ══════════════════════════════════════════════════════════════════
   WorkflowDetailView — single-card tabbed workflow.

   Tabs: Process · Steps · Forms · Approvals · Escalation · Audit
   - No nested cards with shadows.
   - Hairline dividers only.
   - Each tab fits the viewport without scrolling at 100% zoom; the
     "Steps" tab uses a virtualized list.
   ══════════════════════════════════════════════════════════════════ */

type TabId = 'process' | 'steps' | 'forms' | 'approvals' | 'escalation' | 'audit';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'process',    label: 'Process' },
  { id: 'steps',      label: 'Steps' },
  { id: 'forms',      label: 'Forms' },
  { id: 'approvals',  label: 'Approvals' },
  { id: 'escalation', label: 'Escalation' },
  { id: 'audit',      label: 'Audit' },
];

export function WorkflowDetailView() {
  const { workflowId } = useParams<{ workflowId: string }>();
  const navigate = useNavigate();
  const wf = useMemo(() => (workflowId ? getWorkflow(workflowId) : null), [workflowId]);
  const [tab, setTab] = useState<TabId>('process');

  if (!wf) {
    return (
      <div className="h-full flex items-center justify-center" style={{ padding: 32 }}>
        <div style={{ fontFamily: 'Roboto, sans-serif', color: CI.muted, fontSize: 13 }}>
          Workflow {workflowId} not found.
        </div>
      </div>
    );
  }

  const domain = DOMAIN_META[wf.domain];
  const risk = RISK_META[wf.metrics.declaredRisk];

  return (
    <div className="h-full flex flex-col" style={{ padding: '24px 32px 20px 32px' }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <button
            onClick={() => navigate('/workflows')}
            style={{
              fontFamily: 'Roboto, sans-serif', fontSize: 12,
              color: CI.teal, marginBottom: 8,
            }}
          >
            ← Workflows
          </button>
          <div className="flex items-center gap-3" style={{ marginBottom: 6 }}>
            <span
              style={{
                fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 600,
                letterSpacing: 1.2, textTransform: 'uppercase', color: CI.teal,
                padding: '3px 10px', border: `1px solid ${CI.line}`, borderRadius: 4,
              }}
            >
              {wf.domain} · {domain.name}
            </span>
            <span
              className="flex items-center gap-2"
              style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: risk.text }}
            >
              <span style={{ width: 6, height: 6, borderRadius: 3, background: risk.dot }} />
              {risk.label}
            </span>
            {wf.metrics.requiresGoverningBody ? (
              <span
                style={{
                  fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 600,
                  letterSpacing: 0.6, textTransform: 'uppercase', color: CI.orange,
                }}
              >
                GB approval required
              </span>
            ) : null}
          </div>
          <div
            style={{
              fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 600,
              letterSpacing: 0.6, color: CI.muted, textTransform: 'uppercase',
            }}
          >
            {wf.id}
          </div>
          <h1
            style={{
              marginTop: 4,
              fontFamily: 'Montserrat, sans-serif', fontWeight: 600,
              fontSize: 24, color: CI.ink, lineHeight: 1.25, letterSpacing: -0.2,
            }}
          >
            {titleCase(wf.title)}
          </h1>
        </div>

        {/* Fact column */}
        <div className="flex-none" style={{ width: 260 }}>
          <FactGrid wf={wf} />
        </div>
      </div>

      {/* Tab strip (inline, no sticky chrome) */}
      <div
        className="flex items-center gap-1"
        style={{
          marginTop: 20,
          borderBottom: `1px solid ${CI.line}`,
        }}
      >
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                fontFamily: 'Montserrat, sans-serif', fontSize: 13,
                fontWeight: active ? 600 : 500,
                color: active ? CI.teal : CI.inkSoft,
                padding: '10px 16px',
                borderBottom: `2px solid ${active ? CI.teal : 'transparent'}`,
                marginBottom: -1,
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab body */}
      <div className="flex-1 min-h-0" style={{ paddingTop: 20 }}>
        {tab === 'process'    && <ProcessTab wf={wf} />}
        {tab === 'steps'      && <StepsTab wf={wf} />}
        {tab === 'forms'      && <FormsTab wf={wf} />}
        {tab === 'approvals'  && <ApprovalsTab wf={wf} />}
        {tab === 'escalation' && <EscalationTab wf={wf} />}
        {tab === 'audit'      && <AuditTab wf={wf} />}
      </div>
    </div>
  );
}

/* ── Fact grid (top-right) ────────────────────────────────────────── */
function FactGrid({ wf }: { wf: Workflow }) {
  const entries: Array<[string, string]> = [
    ['Cadence',    `${CADENCE_LABEL[wf.cadence.interval] ?? 'On demand'} · ${wf.cadence.kind.replace('_', '-')}`],
    ['Steps',      String(wf.metrics.stepCount)],
    ['Forms',      String(wf.metrics.formCount)],
    ['Policies',   String(wf.metrics.policyCount)],
    ['Primary',    wf.roles.primary[0] ?? '—'],
  ];
  return (
    <dl
      style={{
        background: CI.canvas,
        border: `1px solid ${CI.line}`, borderRadius: 8,
        padding: '12px 16px',
      }}
    >
      {entries.map(([k, v], i) => (
        <div
          key={k}
          className="flex items-start justify-between gap-4"
          style={{
            padding: '6px 0',
            borderTop: i === 0 ? 'none' : `1px solid ${CI.lineSoft}`,
          }}
        >
          <dt
            style={{
              fontFamily: 'Roboto, sans-serif', fontSize: 11,
              color: CI.muted, textTransform: 'uppercase', letterSpacing: 0.6,
              minWidth: 68,
            }}
          >{k}</dt>
          <dd
            style={{
              fontFamily: 'Roboto, sans-serif', fontSize: 12,
              color: CI.ink, textAlign: 'right', lineHeight: 1.4,
            }}
          >{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ── Tabs ─────────────────────────────────────────────────────────── */

function ProcessTab({ wf }: { wf: Workflow }) {
  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      <div className="col-span-8 overflow-hidden">
        <Section title="Process overview">
          <p style={bodyStyle}>{wf.processOverview}</p>
        </Section>
        <Section title="Triggers">
          <ul style={listStyle}>
            {wf.triggers.map((t, i) => (
              <li key={i}>
                <span
                  style={{
                    fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 600,
                    letterSpacing: 0.6, color: CI.teal, textTransform: 'uppercase',
                    marginRight: 8,
                  }}
                >
                  {t.kind.replace('_', '-')}
                </span>
                <span>{t.description}</span>
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Inputs">
          <ul style={listStyle}>
            {wf.inputs.map((i, idx) => <li key={idx}>{i}</li>)}
          </ul>
        </Section>
        <Section title="Outputs">
          <p style={bodyStyle}>{wf.outputs}</p>
        </Section>
      </div>
      <div className="col-span-4 overflow-hidden">
        <Section title="Responsible roles">
          <RoleBlock label="Primary"    roles={wf.roles.primary} />
          <RoleBlock label="Supporting" roles={wf.roles.supporting} />
          <RoleBlock label="Approval"   roles={wf.roles.approval} />
        </Section>
        <Section title="Regulatory anchors">
          <div className="flex flex-wrap gap-2">
            {wf.regulatoryAnchors.length === 0 ? (
              <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: CI.muted }}>
                None declared in §1.
              </span>
            ) : wf.regulatoryAnchors.map((r, i) => (
              <span
                key={i}
                style={{
                  fontFamily: 'Roboto, sans-serif', fontSize: 11, color: CI.ink,
                  padding: '4px 8px', border: `1px solid ${CI.line}`, borderRadius: 4,
                  background: CI.paper,
                }}
              >
                {r}
              </span>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

function StepsTab({ wf }: { wf: Workflow }) {
  const [cursor, setCursor] = useState(0);
  const steps = wf.steps;
  if (steps.length === 0) {
    return <div style={{ fontFamily: 'Roboto, sans-serif', color: CI.muted, fontSize: 13 }}>
      Step table not present in source for {wf.id}.
    </div>;
  }
  const step = steps[cursor];
  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Rail list */}
      <div className="col-span-4 min-h-0 overflow-auto" style={{ paddingRight: 4 }}>
        {steps.map((s, i) => {
          const active = i === cursor;
          return (
            <button
              key={s.order}
              onClick={() => setCursor(i)}
              className="w-full text-left"
              style={{
                padding: 12,
                borderLeft: `2px solid ${active ? CI.teal : 'transparent'}`,
                background: active ? CI.tealSoft : 'transparent',
                borderBottom: `1px solid ${CI.lineSoft}`,
              }}
            >
              <div className="flex items-baseline gap-2">
                <span
                  style={{
                    fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 600,
                    color: active ? CI.teal : CI.muted, minWidth: 28,
                  }}
                >
                  {String(s.order).padStart(2, '0')}
                </span>
                <span
                  style={{
                    fontFamily: 'Roboto, sans-serif', fontSize: 13,
                    color: active ? CI.ink : CI.inkSoft, lineHeight: 1.4,
                  }}
                >
                  {s.action}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      {/* Detail pane */}
      <div className="col-span-8 min-h-0 flex flex-col">
        <Section title={`Step ${step.order}`}>
          <p style={bodyStyle}>{step.action}</p>
        </Section>
        <div className="grid grid-cols-2 gap-4">
          <KeyValue label="Role" value={step.role} />
          <KeyValue label="Deadline" value={step.deadline} />
        </div>
        <Section title="Forms" compact>
          {step.formIds.length === 0 ? (
            <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: CI.muted }}>
              {step.formRaw || '—'}
            </div>
          ) : (
            <ul style={listStyle}>
              {step.formIds.map((id) => (
                <li key={id}>
                  <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>{id}</span>
                  {' — '}
                  <span>{formTitle(id)}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
        <div className="flex items-center justify-between" style={{ marginTop: 'auto' }}>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: CI.muted }}>
            {cursor + 1} of {steps.length} authored steps
          </div>
          <div className="flex items-center gap-2">
            <PagerButton disabled={cursor === 0} onClick={() => setCursor((c) => Math.max(0, c - 1))}>
              ← Prev step
            </PagerButton>
            <PagerButton disabled={cursor >= steps.length - 1} onClick={() => setCursor((c) => Math.min(steps.length - 1, c + 1))}>
              Next step →
            </PagerButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormsTab({ wf }: { wf: Workflow }) {
  const [openFormId, setOpenFormId] = useState<string | null>(null);

  const handlePrint = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`/forms/${id}`, '_blank');
  }, []);

  const handleDownload = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = `/forms/${id}`;
    a.target = '_blank';
    a.rel = 'noopener';
    a.click();
  }, []);

  if (wf.requiredForms.length === 0) {
    return <div style={{ fontFamily: 'Roboto, sans-serif', color: CI.muted, fontSize: 13 }}>No forms referenced.</div>;
  }

  return (
    <div className="flex h-full min-h-0 gap-4">
      {/* Card grid */}
      <div
        className="flex-none overflow-auto"
        style={{
          width: openFormId ? 280 : '100%',
          display: 'grid',
          gridTemplateColumns: openFormId ? '1fr' : 'repeat(2, 1fr)',
          gridAutoRows: 'max-content',
          gap: 12,
          paddingRight: 4,
          alignContent: 'start',
          transition: 'width 180ms ease',
        }}
      >
        {wf.requiredForms.map((id) => {
          const isActive = openFormId === id;
          return (
            <div
              key={id}
              style={{
                border: `1px solid ${isActive ? CI.teal : CI.line}`,
                borderRadius: 8,
                padding: '12px 14px',
                background: isActive ? CI.tealSoft : CI.paper,
                cursor: 'pointer',
                transition: 'border-color 150ms, background 150ms',
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.borderColor = CI.teal;
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.borderColor = CI.line;
              }}
              onClick={() => setOpenFormId(id === openFormId ? null : id)}
            >
              {/* ID + title */}
              <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: 12, color: isActive ? CI.teal : CI.ink }}>
                {id}
              </div>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: CI.inkSoft, marginTop: 3, marginBottom: 12, lineHeight: 1.4 }}>
                {formTitle(id)}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setOpenFormId(id === openFormId ? null : id); }}
                  style={{
                    flex: 1,
                    fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 600,
                    padding: '6px 0', borderRadius: 6,
                    background: isActive ? CI.teal : CI.teal,
                    color: '#fff', border: 'none', cursor: 'pointer',
                    letterSpacing: 0.4,
                  }}
                >
                  {isActive ? '← Close' : 'Fill Out'}
                </button>
                <button
                  onClick={(e) => handlePrint(id, e)}
                  title="Print form"
                  style={{
                    padding: '6px 10px', borderRadius: 6,
                    border: `1px solid ${CI.line}`, background: CI.paper,
                    color: CI.inkSoft, cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = CI.teal; (e.currentTarget as HTMLElement).style.color = CI.teal; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = CI.line; (e.currentTarget as HTMLElement).style.color = CI.inkSoft; }}
                >
                  <PrintIcon />
                </button>
                <button
                  onClick={(e) => handleDownload(id, e)}
                  title="Download form"
                  style={{
                    padding: '6px 10px', borderRadius: 6,
                    border: `1px solid ${CI.line}`, background: CI.paper,
                    color: CI.inkSoft, cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = CI.teal; (e.currentTarget as HTMLElement).style.color = CI.teal; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = CI.line; (e.currentTarget as HTMLElement).style.color = CI.inkSoft; }}
                >
                  <DownloadIcon />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inline form viewer panel */}
      {openFormId && (
        <div
          className="flex-1 min-w-0 flex flex-col overflow-hidden"
          style={{
            border: `1px solid ${CI.line}`,
            borderRadius: 8,
            background: CI.paper,
          }}
        >
          {/* Panel header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-none"
            style={{ borderBottom: `1px solid ${CI.line}` }}
          >
            <div>
              <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: 13, color: CI.ink }}>
                {openFormId}
              </div>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: CI.muted, marginTop: 2 }}>
                {formTitle(openFormId)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.open(`/forms/${openFormId}`, '_blank')}
                style={{
                  fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 600,
                  padding: '6px 14px', borderRadius: 6,
                  background: CI.teal, color: '#fff',
                  border: 'none', cursor: 'pointer', letterSpacing: 0.4,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <PrintIcon color="#fff" /> Print / Download
              </button>
              <button
                onClick={() => setOpenFormId(null)}
                style={{
                  fontFamily: 'Roboto, sans-serif', fontSize: 12,
                  padding: '6px 12px', borderRadius: 6,
                  border: `1px solid ${CI.line}`, background: CI.paper,
                  color: CI.inkSoft, cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Embedded form */}
          <div className="flex-1 min-h-0 overflow-auto">
            <FormViewer formId={openFormId} formSource="workflow" enableEmbeddedSigning />
          </div>
        </div>
      )}
    </div>
  );
}

function PrintIcon({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9V2h12v7" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="2" y="9" width="20" height="9" rx="2" stroke={color} strokeWidth="1.6"/>
      <path d="M6 15h12v7H6z" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v13m0 0-4-4m4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 17v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

function ApprovalsTab({ wf }: { wf: Workflow }) {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-8">
        <Section title="Approvals (§8)">
          <ul style={listStyle}>
            {wf.approvals.map((a, i) => (
              <li key={i}>
                {a.requiresGoverningBody ? (
                  <span
                    style={{
                      fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 600,
                      letterSpacing: 0.6, color: CI.orange, textTransform: 'uppercase',
                      marginRight: 8,
                    }}
                  >
                    GB
                  </span>
                ) : null}
                <span>{a.description}</span>
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Authored source">
          <pre style={preStyle}>{wf.approvalsRaw}</pre>
        </Section>
      </div>
      <div className="col-span-4">
        <Section title="SLA / deadlines">
          <p style={bodyStyle}>{wf.sla}</p>
        </Section>
      </div>
    </div>
  );
}

function EscalationTab({ wf }: { wf: Workflow }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <Section title="Escalation logic (§11)">
        <p style={bodyStyle}>{wf.escalationLogic}</p>
      </Section>
      <Section title="Failure conditions (§12)">
        <p style={bodyStyle}>{wf.failureConditions}</p>
      </Section>
    </div>
  );
}

function AuditTab({ wf }: { wf: Workflow }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <Section title="Audit requirements (§13)">
        <p style={bodyStyle}>{wf.auditRequirements}</p>
      </Section>
      <Section title="Policy references (§1)">
        <ul style={listStyle}>
          {wf.policyReferences.map((p, i) => <li key={i}>{p}</li>)}
        </ul>
      </Section>
    </div>
  );
}

/* ── Tiny primitives ──────────────────────────────────────────────── */

const bodyStyle: React.CSSProperties = {
  fontFamily: 'Roboto, sans-serif', fontSize: 13, color: CI.ink, lineHeight: 1.6,
};
const listStyle: React.CSSProperties = {
  fontFamily: 'Roboto, sans-serif', fontSize: 13, color: CI.ink,
  lineHeight: 1.6, paddingLeft: 18, listStyle: 'disc',
};
const preStyle: React.CSSProperties = {
  fontFamily: 'Roboto, sans-serif', fontSize: 12, color: CI.inkSoft,
  whiteSpace: 'pre-wrap', lineHeight: 1.6,
};

function Section({
  title, children, compact,
}: { title: string; children: React.ReactNode; compact?: boolean }) {
  return (
    <section style={{ marginBottom: compact ? 12 : 18 }}>
      <h3
        style={{
          fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 600,
          color: CI.muted, textTransform: 'uppercase', letterSpacing: 0.8,
          marginBottom: 8,
        }}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        border: `1px solid ${CI.line}`, borderRadius: 8, padding: '10px 12px',
        background: CI.paper,
      }}
    >
      <div
        style={{
          fontFamily: 'Roboto, sans-serif', fontSize: 11,
          color: CI.muted, textTransform: 'uppercase', letterSpacing: 0.6,
        }}
      >{label}</div>
      <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: CI.ink, marginTop: 4, lineHeight: 1.4 }}>
        {value || '—'}
      </div>
    </div>
  );
}

function RoleBlock({ label, roles }: { label: string; roles: string[] }) {
  if (roles.length === 0) return null;
  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          fontFamily: 'Roboto, sans-serif', fontSize: 11,
          color: CI.muted, textTransform: 'uppercase', letterSpacing: 0.6,
          marginBottom: 4,
        }}
      >{label}</div>
      <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: CI.ink, lineHeight: 1.5 }}>
        {roles.join(', ')}
      </div>
    </div>
  );
}

function PagerButton({
  children, disabled, onClick,
}: { children: React.ReactNode; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        fontFamily: 'Roboto, sans-serif', fontSize: 12,
        padding: '6px 12px', borderRadius: 6,
        border: `1px solid ${CI.line}`, background: CI.paper,
        color: disabled ? CI.muted : CI.ink,
        opacity: disabled ? 0.5 : 1, cursor: disabled ? 'default' : 'pointer',
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.borderColor = CI.teal; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = CI.line; }}
    >
      {children}
    </button>
  );
}

function titleCase(raw: string): string {
  if (!raw) return raw;
  const words = raw.toLowerCase().split(/\s+/);
  return words
    .map((w) => {
      if (/^(and|of|or|the|to|in|on|by|for|at|a|an)$/.test(w)) return w;
      if (/^[a-z]{2,3}$/.test(w)) return w.toUpperCase();
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(' ');
}
