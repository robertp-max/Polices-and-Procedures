// V3CesBoardPreview.tsx — V3 Veil Glass CES Kanban Board
// Visual layer only. Replaces CES navy/orange board/ components with V3 glass system.

import { useState } from 'react';

const V3 = {
  glass2: 'rgba(255, 255, 255, 0.04)',
  teal: '#007970',
  tealLight: '#00D1C1',
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  borderDefault: 'rgba(255, 255, 255, 0.33)',
} as const;

interface KanbanTask {
  id: string;
  code: string;
  title: string;
  assignee: string;
  domain: string;
  dueDate: string;
  isOverdue: boolean;
  hasEvidence: boolean;
  signaturesPending: number;
}

type Column = 'backlog' | 'in-progress' | 'review' | 'done';

const COLUMNS: { key: Column; label: string; count: number }[] = [
  { key: 'backlog', label: 'Backlog', count: 4 },
  { key: 'in-progress', label: 'In Progress', count: 6 },
  { key: 'review', label: 'Under Review', count: 3 },
  { key: 'done', label: 'Done', count: 8 },
];

const TASKS: Record<Column, KanbanTask[]> = {
  'backlog': [
    { id: 'T-048', code: 'QA-WP-12', title: 'Review OAPS-layer KPI results', assignee: 'J. Smith', domain: 'Clinical', dueDate: 'May 24', isOverdue: false, hasEvidence: false, signaturesPending: 0 },
    { id: 'T-049', code: 'QA-WP-04', title: 'Review PIP execution logs', assignee: 'M. Doe', domain: 'Clinical', dueDate: 'May 25', isOverdue: false, hasEvidence: false, signaturesPending: 0 },
    { id: 'T-050', code: 'GV-WP-01', title: 'Package Governing Body report', assignee: 'Admin', domain: 'Governance', dueDate: 'May 26', isOverdue: false, hasEvidence: false, signaturesPending: 0 },
    { id: 'T-051', code: 'IT-WP-25', title: 'Security audit results compilation', assignee: 'T. Lee', domain: 'IT', dueDate: 'May 27', isOverdue: false, hasEvidence: false, signaturesPending: 0 },
  ],
  'in-progress': [
    { id: 'T-041', code: 'QA-WP-11', title: 'Distribute agenda & pre-read packet', assignee: 'J. Smith', domain: 'Clinical', dueDate: 'May 20', isOverdue: false, hasEvidence: true, signaturesPending: 1 },
    { id: 'T-042', code: 'CL-WP-25', title: 'Review aggregate quality trends', assignee: 'E. Vance', domain: 'Clinical', dueDate: 'May 18', isOverdue: true, hasEvidence: true, signaturesPending: 2 },
    { id: 'T-043', code: 'CC-WP-22', title: 'Review compliance/billing audit results', assignee: 'S. Caldwell', domain: 'Compliance', dueDate: 'May 19', isOverdue: true, hasEvidence: false, signaturesPending: 0 },
    { id: 'T-044', code: 'DM-WP-18', title: 'Review HO audit results', assignee: 'M. Sterling', domain: 'Data', dueDate: 'May 21', isOverdue: false, hasEvidence: true, signaturesPending: 0 },
    { id: 'T-052', code: 'SF-WP-03', title: 'Emergency evacuation drill documentation', assignee: 'R. Kim', domain: 'Safety', dueDate: 'May 22', isOverdue: false, hasEvidence: false, signaturesPending: 1 },
    { id: 'T-053', code: 'CL-WP-30', title: 'Infection control quarterly report', assignee: 'E. Vance', domain: 'Clinical', dueDate: 'May 20', isOverdue: false, hasEvidence: true, signaturesPending: 0 },
  ],
  'review': [
    { id: 'T-038', code: 'DM-WP-15', title: 'Data/safety audit results review', assignee: 'J. Smith', domain: 'Data', dueDate: 'May 22', isOverdue: false, hasEvidence: true, signaturesPending: 1 },
    { id: 'T-039', code: 'IT-WP-21', title: 'IT/security audit results review', assignee: 'T. Lee', domain: 'IT', dueDate: 'May 23', isOverdue: false, hasEvidence: true, signaturesPending: 0 },
    { id: 'T-054', code: 'HR-WP-08', title: 'Annual competency verification batch', assignee: 'M. Doe', domain: 'HR', dueDate: 'May 24', isOverdue: false, hasEvidence: true, signaturesPending: 2 },
  ],
  'done': [
    { id: 'T-030', code: 'SF-WP-01', title: 'Fire drill log upload', assignee: 'M. Doe', domain: 'Safety', dueDate: 'May 16', isOverdue: false, hasEvidence: true, signaturesPending: 0 },
    { id: 'T-031', code: 'HP-WP-05', title: 'HIPAA annual training certification', assignee: 'All Staff', domain: 'Compliance', dueDate: 'May 14', isOverdue: false, hasEvidence: true, signaturesPending: 0 },
    { id: 'T-032', code: 'CL-WP-20', title: 'Patient satisfaction survey Q1 analysis', assignee: 'S. Caldwell', domain: 'Clinical', dueDate: 'May 12', isOverdue: false, hasEvidence: true, signaturesPending: 0 },
  ],
};

export default function V3CesBoardPreview() {
  const [filterDomain, setFilterDomain] = useState<string | null>(null);
  const domains = Array.from(new Set(Object.values(TASKS).flat().map(t => t.domain)));

  return (
    <div className="v3-page-animate" style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ color: V3.textPrimary, fontSize: 18, fontWeight: 600, margin: 0 }}>CES Board — Sprint 9</h1>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => setFilterDomain(null)} style={{
            padding: '5px 12px', fontSize: 11, borderRadius: 6, border: 'none', cursor: 'pointer',
            background: !filterDomain ? V3.teal : V3.glass2,
            color: !filterDomain ? '#FFF' : V3.textTertiary,
          }}>All</button>
          {domains.map(d => (
            <button key={d} onClick={() => setFilterDomain(d)} style={{
              padding: '5px 12px', fontSize: 11, borderRadius: 6, border: 'none', cursor: 'pointer',
              background: filterDomain === d ? V3.teal : V3.glass2,
              color: filterDomain === d ? '#FFF' : V3.textTertiary,
            }}>{d}</button>
          ))}
        </div>
      </div>

      {/* Kanban columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, flex: 1, minHeight: 0 }}>
        {COLUMNS.map(col => {
          const tasks = TASKS[col.key].filter(t => !filterDomain || t.domain === filterDomain);
          return (
            <div key={col.key} style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              {/* Column header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', marginBottom: 8 }}>
                <span style={{ color: V3.textSecondary, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{col.label}</span>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: V3.glass2, color: V3.textTertiary }}>{tasks.length}</span>
              </div>
              {/* Task cards */}
              <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tasks.map(task => (
                  <div key={task.id} style={{
                    padding: 14, borderRadius: 12, cursor: 'pointer',
                    background: V3.glass2,
                    border: `1px solid ${task.isOverdue ? 'rgba(248, 113, 113, 0.3)' : V3.borderDefault}`,
                    transition: 'all 0.33s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: V3.tealLight, fontWeight: 600 }}>{task.code}</span>
                      {task.isOverdue && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'rgba(248, 113, 113, 0.12)', color: '#F87171' }}>OVERDUE</span>}
                    </div>
                    <div style={{ color: V3.textPrimary, fontSize: 13, fontWeight: 500, marginBottom: 8, lineHeight: 1.4 }}>{task.title}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: V3.textTertiary, fontSize: 11 }}>{task.assignee}</span>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {task.hasEvidence && <span style={{ fontSize: 10, color: V3.tealLight }}>📎</span>}
                        {task.signaturesPending > 0 && <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 4, background: 'rgba(251, 191, 36, 0.12)', color: '#FBBF24' }}>✍ {task.signaturesPending}</span>}
                        <span style={{ color: V3.textTertiary, fontSize: 11 }}>{task.dueDate}</span>
                      </div>
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: V3.glass2, color: V3.textTertiary }}>{task.domain}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 16, padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', color: V3.textTertiary, fontSize: 11 }}>
        Visual preview only — real CES board uses CesBoardPage + board/ components, CesCard primitives, drag-and-drop, SprintTaskPanel, and WorkflowExecutionPanel.
      </div>
    </div>
  );
}
