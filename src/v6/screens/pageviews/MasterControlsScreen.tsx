import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, ClipboardCheck, FileSignature, FolderOpen, History, ShieldCheck, X } from 'lucide-react';
import { DataTable, MetricGrid, SurfaceCard, ToneTag, type DataTableColumn, type MetricTileData, type SurfaceCardData } from '../../components';
import { hasRequiredDocumentationBody, loadMasterControlInventorySeed } from '@/policy/data/masterControlInventory';
import {
  getMasterControlDocumentation,
} from '@/policy/data/masterControlDocumentation.generated';
import type { MasterControlDocumentationRecord, MasterControlDocumentationSection, MasterControlDocumentRef, MasterControlItem, MasterControlReadinessStatus } from '@/policy/types/masterControlInventory';

type MasterControlRow = Record<string, string>;
type DossierTab = 'summary' | 'documents' | 'evidence' | 'workflow' | 'signoff' | 'audit' | 'documentation';

const tabs: readonly { id: DossierTab; label: string }[] = [
  { id: 'summary', label: 'Summary' },
  { id: 'documents', label: 'Required Documents' },
  { id: 'evidence', label: 'Evidence Requirements' },
  { id: 'workflow', label: 'Workflow & Tasks' },
  { id: 'signoff', label: 'Sign-Off' },
  { id: 'audit', label: 'Audit Trail' },
  { id: 'documentation', label: 'Documentation' },
];

const masterControlColumns: readonly DataTableColumn<MasterControlRow>[] = [
  { key: 'controlId', label: 'Control ID' },
  { key: 'controlName', label: 'Control name' },
  { key: 'category', label: 'Category' },
  { key: 'domain', label: 'Domain' },
  { key: 'riskTier', label: 'Risk tier' },
  { key: 'sourceStatus', label: 'Source status' },
  { key: 'readiness', label: 'Readiness', status: true },
  { key: 'linkedPolicies', label: 'Linked Policies' },
];

const controlCards = [
  {
    body: 'Rows open survey-ready dossiers with source documents, evidence criteria, verification rules, and sign-off obligations.',
    icon: ShieldCheck,
    progress: 100,
    status: 'validated',
    title: 'Control dossiers',
    tone: 'teal',
  },
  {
    body: 'Admission packet documents are represented as templates only. Completed patient packets attach at runtime under PHI-safe authorization.',
    icon: FolderOpen,
    progress: 88,
    status: 'ready',
    title: 'Document-backed',
    tone: 'teal',
  },
  {
    body: 'Readiness is computed from configuration, required evidence, sign-off requirements, and source posture. Seed data alone cannot mark OK.',
    icon: ClipboardCheck,
    progress: 74,
    status: 'review-required',
    title: 'Readiness gates',
    tone: 'orange',
  },
] satisfies readonly SurfaceCardData[];

function readinessLabel(status: MasterControlReadinessStatus): string {
  if (status === 'OK') return 'ok';
  if (status === 'BLOCKED') return 'blocked';
  if (status === 'DOCUMENTATION_MISSING') return 'documentation-missing';
  if (status === 'NOT_CONFIGURED') return 'not-configured';
  return 'needs-attention';
}

function toRow(item: MasterControlItem): MasterControlRow {
  return {
    controlId: item.id,
    controlName: item.name,
    category: item.category,
    domain: item.domain,
    riskTier: item.riskTier,
    sourceStatus: item.sourceStatus,
    readiness: readinessLabel(item.readinessStatus),
    linkedPolicies: item.sourcePolicyIds.join(', '),
  };
}

function buildMetrics(items: readonly MasterControlItem[]): readonly MetricTileData[] {
  const total = items.length;
  const high = items.filter((item) => item.riskTier === 'HIGH').length;
  const configured = items.filter((item) => item.readinessStatus !== 'NOT_CONFIGURED').length;
  const blocked = items.filter((item) => item.readinessStatus === 'BLOCKED').length;
  return [
    { label: 'Controls', value: String(total), helper: 'Dossier inventory', tone: 'teal' },
    { label: 'High', value: String(high), helper: 'High-risk controls', tone: 'orange' },
    { label: 'Configured', value: String(configured), helper: 'Docs + evidence + signoff', tone: 'green' },
    { label: 'Blocked', value: String(blocked), helper: 'Runtime evidence/signoff needed', tone: 'orange' },
  ];
}

export function MasterControlsScreen() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<readonly MasterControlItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const requestedControlId = searchParams.get('control')?.trim().toUpperCase() ?? null;

  useEffect(() => {
    let mounted = true;
    loadMasterControlInventorySeed().then((loaded) => {
      if (!mounted) return;
      setItems(loaded);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!requestedControlId || items.length === 0) return;
    if (items.some((item) => item.id.toUpperCase() === requestedControlId)) {
      setSelectedId(requestedControlId);
    }
  }, [items, requestedControlId]);

  const rows = useMemo(() => items.map(toRow), [items]);
  const selected = useMemo(() => items.find((item) => item.id === selectedId) ?? null, [items, selectedId]);

  const openDossier = (controlId: string) => {
    setSelectedId(controlId);
    const next = new URLSearchParams(searchParams);
    next.set('control', controlId);
    setSearchParams(next, { replace: true });
  };

  const closeDossier = () => {
    setSelectedId(null);
    const next = new URLSearchParams(searchParams);
    next.delete('control');
    setSearchParams(next, { replace: true });
  };

  return (
    <section className="grid gap-xl" data-hash-id="master-controls" data-route="/compliance/master-controls">
      <MetricGrid metrics={buildMetrics(items)} />

      <section className="grid gap-xl desktop:grid-cols-6" aria-label="Master controls inventory and readiness">
        <div className="grid content-start gap-lg desktop:col-span-4">
          <DataTable
            columns={masterControlColumns}
            label="Master controls inventory matrix"
            rows={rows}
            onRowClick={(row) => openDossier(row.controlId)}
          />
        </div>

        <aside className="grid content-start gap-lg desktop:col-span-2" aria-label="Master controls context cards">
          {controlCards.map((card) => (
            <SurfaceCard card={card} key={card.title} />
          ))}
        </aside>
      </section>

      {selected && <ControlDossierModal control={selected} onClose={closeDossier} />}
    </section>
  );
}

function ControlDossierModal({ control, onClose }: { control: MasterControlItem; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<DossierTab>('summary');

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-ink/35 px-lg py-xl backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`${control.id} control dossier`}>
      <div className="flex max-h-[92vh] w-[min(1180px,96vw)] flex-col overflow-hidden rounded-lg border border-hairline bg-white shadow-hover">
        <header className="flex items-start justify-between gap-lg border-b border-hairline px-xl py-lg">
          <div className="min-w-0">
            <div className="mb-sm flex flex-wrap items-center gap-sm">
              <ToneTag tone={control.riskTier === 'HIGH' ? 'orange' : 'teal'}>{control.riskTier}</ToneTag>
              <ToneTag tone={control.readinessStatus === 'BLOCKED' ? 'orange' : 'teal'}>{control.readinessStatus}</ToneTag>
              <span className="text-xs uppercase tracking-tag text-muted">{control.id}</span>
            </div>
            <h2 className="text-h2 font-medium text-ink">{control.name}</h2>
            <p className="mt-xs max-w-4xl text-sm text-muted">{control.modalSummary}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close dossier" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-hairline text-muted hover:text-ink">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>

        <nav className="flex gap-sm overflow-x-auto border-b border-hairline px-xl py-sm" aria-label="Control dossier tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 rounded-md px-md py-sm text-xs font-medium uppercase tracking-tag transition ${activeTab === tab.id ? 'bg-brand-teal text-on-brand' : 'text-secondary hover:bg-surface-hover'}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="min-h-0 flex-1 overflow-auto px-xl py-lg">
          {activeTab === 'summary' && <SummaryTab control={control} />}
          {activeTab === 'documents' && <DocumentsTab control={control} onOpenDocumentation={() => setActiveTab('documentation')} />}
          {activeTab === 'evidence' && <EvidenceTab control={control} />}
          {activeTab === 'workflow' && <WorkflowTab control={control} />}
          {activeTab === 'signoff' && <SignoffTab control={control} />}
          {activeTab === 'audit' && <AuditTab control={control} />}
          {activeTab === 'documentation' && <DocumentationTab control={control} />}
        </div>
      </div>
    </div>
  );
}

function SummaryTab({ control }: { control: MasterControlItem }) {
  return (
    <div className="grid gap-lg desktop:grid-cols-[1.3fr_0.7fr]">
      <section className="grid gap-md">
        <InfoGrid rows={[
          ['Control ID', control.id],
          ['Category', control.category],
          ['Domain', control.domain],
          ['Owner', control.requiredOwner],
          ['Source status', control.sourceStatus],
          ['Last verified', control.verification.lastVerifiedDate ?? 'No runtime verification yet'],
          ['Next due', control.verification.nextVerificationDate ?? 'Due on next scheduled verification'],
          ['Escalation owner', control.verification.escalationOwner],
        ]} />
        <DossierPanel title="Failure Risk" body={control.failureRisk} />
        <DossierPanel title="Surveyor Prompt" body={control.surveyorPrompt} />
        <DossierPanel title="Operator Instructions" body={control.operatorInstructions} />
      </section>
      <aside className="grid content-start gap-md">
        <IconPanel icon={ShieldCheck} title="Readiness Formula" body={control.verification.readinessFormula} />
        <IconPanel icon={ClipboardCheck} title="Trigger Condition" body={control.verification.triggerCondition} />
        <IconPanel icon={History} title="Overdue Rule" body={control.verification.overdueRule} />
      </aside>
    </div>
  );
}

function DocumentsTab({ control, onOpenDocumentation }: { control: MasterControlItem; onOpenDocumentation: () => void }) {
  const [expandedIds, setExpandedIds] = useState<readonly string[]>([]);
  const toggle = (documentId: string) => {
    setExpandedIds((current) =>
      current.includes(documentId) ? current.filter((id) => id !== documentId) : [...current, documentId],
    );
  };

  return (
    <div className="grid gap-md">
      {control.documentRefs.map((doc) => {
        const documentation = resolveDocumentation(control, doc.documentId);
        const expanded = expandedIds.includes(doc.documentId);
        return (
          <article key={doc.documentId} className="rounded-lg border border-hairline bg-surface-glass p-lg">
            <button
              type="button"
              onClick={() => toggle(doc.documentId)}
              aria-expanded={expanded}
              className="flex w-full flex-wrap items-start justify-between gap-md text-left focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-brand-teal"
            >
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-tag text-brand-teal">{doc.documentId}</p>
                <h3 className="mt-xs text-lg font-medium text-ink">{doc.title}</h3>
                <p className="mt-sm text-sm text-muted">{doc.evidenceUse}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-sm">
                <ToneTag>{doc.documentType}</ToneTag>
                {doc.templateOnly && <ToneTag tone="orange">Template only</ToneTag>}
                {doc.required && <ToneTag tone="teal">Required</ToneTag>}
                {!hasRequiredDocumentationBody(documentation) && <ToneTag tone="orange">Documentation Missing</ToneTag>}
                <ChevronDown className={`h-5 w-5 text-muted transition ${expanded ? 'rotate-180' : ''}`} aria-hidden />
              </div>
            </button>
            <InfoGrid compact rows={[
              ['Source location', doc.sourceLocation],
              ['Owner role', doc.ownerRole],
              ['Version', documentation?.version ?? doc.version ?? 'Version controlled at source'],
              ['Effective date', documentation?.effectiveDate ?? doc.effectiveDate ?? 'Tracked at source'],
            ]} />
            {expanded && <ExpandedDocumentCard control={control} doc={doc} documentation={documentation} onOpenFull={onOpenDocumentation} />}
          </article>
        );
      })}
    </div>
  );
}

function resolveDocumentation(control: MasterControlItem, documentId: string): MasterControlDocumentationRecord | undefined {
  return control.documentationRecords.find((record) => record.documentId === documentId) ?? getMasterControlDocumentation(documentId);
}

function ExpandedDocumentCard({
  control,
  doc,
  documentation,
  onOpenFull,
}: {
  control: MasterControlItem;
  doc: MasterControlDocumentRef;
  documentation?: MasterControlDocumentationRecord;
  onOpenFull: () => void;
}) {
  const latestLog = control.verificationLogs[0];
  return (
    <div className="mt-lg grid gap-md border-t border-hairline pt-lg">
      {doc.templateOnly && (
        <div className="rounded-md border border-tone-orange-border bg-tone-orange-bg p-md text-sm text-tone-orange-text">
          Template/control documentation only. Do not store PHI in seed documentation.
        </div>
      )}
      {hasRequiredDocumentationBody(documentation) ? (
        <>
          <DocumentationBody sections={documentation.body} />
          <InfoGrid compact rows={[
            ['Linked policies', documentation.linkedPolicyIds.join(', ') || 'None'],
            ['Linked controls', documentation.linkedControlIds.join(', ') || control.id],
            ['Evidence requirements', documentation.evidenceRequirementIds.join(', ') || 'None'],
            ['Required signoffs', documentation.requiredSignoffIds.join(', ') || 'None'],
          ]} />
        </>
      ) : (
        <MissingDocumentationPanel documentId={doc.documentId} title={doc.title} ownerRole={doc.ownerRole} />
      )}
      <section className="rounded-md bg-white/70 p-md">
        <h4 className="text-xs font-medium uppercase tracking-tag text-muted">Verification Status</h4>
        <InfoGrid compact rows={[
          ['Current period', latestLog ? `${latestLog.verificationPeriodStart} to ${latestLog.verificationPeriodEnd}` : 'No runtime verification yet'],
          ['Last checked by', latestLog?.performedByName ?? 'No runtime verification yet'],
          ['Last checked date', latestLog?.performedAt ?? 'No runtime verification yet'],
          ['Signature status', latestLog?.signatureStatus ?? 'pending'],
          ['Open deficiencies', String(latestLog?.deficienciesFound.length ?? 0)],
          ['Next due date', latestLog?.nextDueDate ?? control.verification.nextVerificationDate ?? 'Next scheduled verification'],
        ]} />
      </section>
      <div className="flex flex-wrap justify-end gap-sm">
        <button type="button" onClick={onOpenFull} className="rounded-md border border-brand-teal px-md py-sm text-xs font-medium uppercase tracking-tag text-brand-teal hover:bg-tone-teal-bg">
          View Full Documentation
        </button>
      </div>
    </div>
  );
}

function DocumentationBody({ sections }: { sections: readonly MasterControlDocumentationSection[] }) {
  return (
    <div className="grid gap-md">
      {sections.map((section) => (
        <section key={section.sectionId} className="rounded-md bg-white/70 p-md">
          <h4 className="text-sm font-medium text-ink">{section.heading}</h4>
          {section.body && <p className="mt-sm text-sm leading-relaxed text-secondary">{section.body}</p>}
          {section.bullets && (
            <ul className="mt-sm grid gap-xs pl-md text-sm text-secondary">
              {section.bullets.map((bullet) => <li className="list-disc" key={bullet}>{bullet}</li>)}
            </ul>
          )}
          {section.table && <DocumentationTable rows={section.table} />}
        </section>
      ))}
    </div>
  );
}

function DocumentationTable({ rows }: { rows: readonly Record<string, string>[] }) {
  const columns = Object.keys(rows[0] ?? {});
  if (columns.length === 0) return null;
  return (
    <div className="mt-md overflow-x-auto rounded-md border border-hairline">
      <table className="min-w-full text-left text-xs">
        <thead className="bg-surface-glass uppercase tracking-tag text-muted">
          <tr>{columns.map((column) => <th className="px-md py-sm" key={column}>{column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-hairline">
              {columns.map((column) => <td className="px-md py-sm text-secondary" key={column}>{row[column]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MissingDocumentationPanel({ documentId, title, ownerRole }: { documentId: string; title: string; ownerRole: string }) {
  return (
    <section className="rounded-md border border-tone-orange-border bg-tone-orange-bg p-md text-tone-orange-text">
      <h4 className="text-sm font-medium uppercase tracking-tag">DOCUMENTATION MISSING</h4>
      <p className="mt-sm text-sm">This required document has metadata but no rendered documentation body.</p>
      <InfoGrid compact rows={[
        ['Recommended document ID', documentId],
        ['Recommended title', title],
        ['Owner role', ownerRole],
        ['Draft status', 'Needs Claude draft'],
      ]} />
    </section>
  );
}

function EvidenceTab({ control }: { control: MasterControlItem }) {
  return (
    <div className="grid gap-md">
      {control.evidenceRequirements.map((evidence) => (
        <article key={evidence.evidenceId} className="rounded-lg border border-hairline bg-surface-glass p-lg">
          <div className="flex flex-wrap items-start justify-between gap-md">
            <div>
              <p className="text-xs uppercase tracking-tag text-brand-teal">{evidence.evidenceId}</p>
              <h3 className="mt-xs text-lg font-medium text-ink">{evidence.label}</h3>
              <p className="mt-sm text-sm text-muted">{evidence.description}</p>
            </div>
            <button type="button" className="rounded-md border border-hairline px-md py-sm text-xs font-medium uppercase tracking-tag text-secondary hover:bg-surface-hover">
              Attach Evidence
            </button>
          </div>
          <div className="mt-md grid gap-md desktop:grid-cols-2">
            <ListPanel title="Acceptable Evidence" items={evidence.acceptableEvidence} />
            <ListPanel title="Not Acceptable" items={evidence.unacceptableEvidence} />
          </div>
          <InfoGrid compact rows={[
            ['Cadence', evidence.cadence],
            ['Responsible role', evidence.responsibleRole],
            ['Due rule', evidence.dueRule],
            ['Retention', evidence.retentionRule],
            ['Runtime status', 'Missing until attached and reviewed'],
          ]} />
        </article>
      ))}
    </div>
  );
}

function WorkflowTab({ control }: { control: MasterControlItem }) {
  return (
    <div className="grid gap-md desktop:grid-cols-2">
      <IconPanel icon={ClipboardCheck} title="Recurring Tasks" body={`${control.verification.frequency} verification, evidence review, deficiency correction, and owner attestation.`} />
      <IconPanel icon={FolderOpen} title="Triggered Tasks" body={control.triggerCondition} />
      <IconPanel icon={FileSignature} title="Linked Workflows" body={control.linkedWorkflowIds.length ? control.linkedWorkflowIds.join(', ') : 'No workflow linked'} />
      <IconPanel icon={History} title="Escalation" body={`${control.escalationOwner}. Due rule: ${control.verification.overdueRule}`} />
    </div>
  );
}

function SignoffTab({ control }: { control: MasterControlItem }) {
  return (
    <div className="grid gap-md">
      {control.signoffRequirements.map((signoff) => (
        <article key={signoff.signoffId} className="rounded-lg border border-hairline bg-surface-glass p-lg">
          <div className="flex flex-wrap items-start justify-between gap-md">
            <div>
              <p className="text-xs uppercase tracking-tag text-brand-teal">{signoff.signoffId}</p>
              <h3 className="mt-xs text-lg font-medium text-ink">{signoff.signerLabel}</h3>
              <p className="mt-sm text-sm text-muted">{signoff.attestationText}</p>
            </div>
            <button type="button" className="rounded-md border border-brand-teal px-md py-sm text-xs font-medium uppercase tracking-tag text-brand-teal hover:bg-tone-teal-bg">
              Sign
            </button>
          </div>
          <InfoGrid compact rows={[
            ['Role', signoff.role],
            ['Cadence', signoff.cadence],
            ['Required for readiness', signoff.requiredForReadiness ? 'Yes' : 'No'],
            ['Runtime status', 'Missing until signed'],
          ]} />
        </article>
      ))}
      <VerificationLogPanel control={control} />
    </div>
  );
}

function AuditTab({ control }: { control: MasterControlItem }) {
  return (
    <div className="grid gap-md">
      {control.auditTrail.map((entry) => (
        <article key={entry.id} className="rounded-lg border border-hairline bg-surface-glass p-lg">
          <p className="text-xs uppercase tracking-tag text-brand-teal">{entry.eventType}</p>
          <h3 className="mt-xs text-base font-medium text-ink">{entry.summary}</h3>
          <p className="mt-sm text-sm text-muted">{entry.actorRole}{entry.occurredAt ? ` · ${entry.occurredAt}` : ''}</p>
        </article>
      ))}
      <VerificationLogPanel control={control} />
      <DossierPanel title="Runtime audit events" body="Evidence added, sign-off completed, status changed, verification completed, and export generated events append here when users operate the dossier." />
    </div>
  );
}

function DocumentationTab({ control }: { control: MasterControlItem }) {
  const documentationOptions = useMemo(
    () => control.documentRefs.map((ref) => ({ ref, record: resolveDocumentation(control, ref.documentId) })),
    [control],
  );
  const [selectedDocId, setSelectedDocId] = useState(control.documentRefs[0]?.documentId ?? '');
  const selected = documentationOptions.find((entry) => entry.ref.documentId === selectedDocId) ?? documentationOptions[0];

  return (
    <div className="grid gap-lg desktop:grid-cols-1">
      <aside className="grid content-start gap-sm">
        {documentationOptions.map(({ ref, record }) => {
          const missing = !hasRequiredDocumentationBody(record);
          return (
            <button
              key={ref.documentId}
              type="button"
              onClick={() => setSelectedDocId(ref.documentId)}
              className={`rounded-lg border p-md text-left transition ${selectedDocId === ref.documentId ? 'border-brand-teal bg-tone-teal-bg' : 'border-hairline bg-white/70 hover:bg-surface-hover'}`}
            >
              <p className="text-[10px] uppercase tracking-tag text-brand-teal">{ref.documentId}</p>
              <p className="mt-xs text-sm font-medium text-ink">{ref.title}</p>
              <div className="mt-sm flex flex-wrap gap-xs">
                {ref.templateOnly && <ToneTag tone="orange">Template Only</ToneTag>}
                {missing ? <ToneTag tone="orange">Missing</ToneTag> : <ToneTag tone="teal">Approved</ToneTag>}
              </div>
            </button>
          );
        })}
      </aside>
      <section className="rounded-lg border border-hairline bg-surface-glass p-lg">
        {selected?.record ? (
          <DocumentationReader record={selected.record} fallbackRef={selected.ref} />
        ) : (
          <MissingDocumentationPanel documentId={selectedDocId || 'MCDOC-TBD'} title={selected?.ref.title ?? 'Documentation record'} ownerRole={selected?.ref.ownerRole ?? control.requiredOwner} />
        )}
      </section>
    </div>
  );
}

function DocumentationReader({ record, fallbackRef }: { record: MasterControlDocumentationRecord; fallbackRef: MasterControlDocumentRef }) {
  const hasBody = hasRequiredDocumentationBody(record);
  return (
    <div className="grid gap-md">
      <div className="flex flex-wrap items-start justify-between gap-md">
        <div>
          <p className="text-xs uppercase tracking-tag text-brand-teal">{record.documentId}</p>
          <h3 className="mt-xs text-xl font-medium text-ink">{record.title}</h3>
          <p className="mt-sm text-sm text-muted">{record.sourceLocation}</p>
        </div>
        <div className="flex flex-wrap gap-sm">
          <ToneTag>{record.documentType}</ToneTag>
          {record.templateOnly && <ToneTag tone="orange">Template Only</ToneTag>}
          {hasBody ? <ToneTag tone="teal">Documentation Ready</ToneTag> : <ToneTag tone="orange">Documentation Missing</ToneTag>}
        </div>
      </div>
      <div className="rounded-md border border-tone-orange-border bg-tone-orange-bg p-md text-sm text-tone-orange-text">
        Template/control documentation only. Do not store PHI in seed data. Completed patient copies attach later as runtime evidence only.
      </div>
      <InfoGrid compact rows={[
        ['Control ID', record.controlId],
        ['Owner role', record.ownerRole],
        ['Approver', record.approverRole ?? 'Not configured'],
        ['Version', record.version],
        ['Effective date', record.effectiveDate],
        ['Last reviewed', record.lastReviewedDate ?? 'No runtime review yet'],
        ['Next review', record.nextReviewDate ?? 'Next scheduled review'],
        ['Linked policies', record.linkedPolicyIds.join(', ')],
        ['Linked controls', record.linkedControlIds.join(', ')],
        ['Evidence requirements', record.evidenceRequirementIds.join(', ')],
        ['Required signoffs', record.requiredSignoffIds.join(', ')],
      ]} />
      {hasBody ? (
        <DocumentationBody sections={record.body} />
      ) : (
        <MissingDocumentationPanel documentId={fallbackRef.documentId} title={fallbackRef.title} ownerRole={fallbackRef.ownerRole} />
      )}
      <div className="flex flex-wrap justify-end gap-sm">
        <button type="button" className="rounded-md border border-hairline px-md py-sm text-xs font-medium uppercase tracking-tag text-secondary hover:bg-surface-hover">
          Open Source
        </button>
        <button type="button" className="rounded-md border border-hairline px-md py-sm text-xs font-medium uppercase tracking-tag text-secondary hover:bg-surface-hover">
          Export
        </button>
      </div>
    </div>
  );
}

function VerificationLogPanel({ control }: { control: MasterControlItem }) {
  return (
    <section className="rounded-lg border border-hairline bg-surface-glass p-lg">
      <div className="flex flex-wrap items-center justify-between gap-md">
        <div>
          <h3 className="text-sm font-medium uppercase tracking-tag text-brand-teal">Verification / Sign-Off Log</h3>
          <p className="mt-xs text-sm text-muted">Shows verifier name, role/title, verification period, evidence reviewed, findings, deficiencies, corrective action, next due date, signature/eCIgn status, and audit ID.</p>
        </div>
        <button type="button" className="rounded-md border border-brand-teal px-md py-sm text-xs font-medium uppercase tracking-tag text-brand-teal hover:bg-tone-teal-bg">
          Add Verification Entry
        </button>
      </div>
      <div className="mt-md grid gap-md">
        {control.verificationLogs.map((log) => {
          const correctiveActionRequired = log.deficienciesFound.some((item) => item.correctiveActionRequired);
          return (
            <article key={log.logId} className="rounded-md bg-white/70 p-md">
              <div className="flex flex-wrap items-start justify-between gap-md">
                <div>
                  <p className="text-xs uppercase tracking-tag text-brand-teal">{log.logId}</p>
                  <h4 className="mt-xs text-base font-medium text-ink">{log.performedByName} - {log.performedByRole}</h4>
                  <p className="mt-xs text-sm text-muted">{log.findingsSummary}</p>
                </div>
                <ToneTag tone={log.signatureStatus === 'signed' ? 'teal' : 'orange'}>{log.signatureStatus}</ToneTag>
              </div>
              <InfoGrid compact rows={[
                ['Verifier name', log.performedByName],
                ['Role / title', log.performedByRole],
                ['Verification period', `${log.verificationPeriodStart} to ${log.verificationPeriodEnd}`],
                ['Performed date/time', log.performedAt],
                ['Evidence reviewed', `${log.evidenceReviewed.length} item(s)`],
                ['Findings', log.findingsSummary],
                ['Deficiencies', `${log.deficienciesFound.length} item(s)`],
                ['Corrective action required', correctiveActionRequired ? 'Yes' : 'No'],
                ['Next due date', log.nextDueDate],
                ['Signature/eCIgn status', log.signatureStatus],
                ['Signed by', log.signedByName ? `${log.signedByName} (${log.signedByRole ?? 'role not recorded'})` : 'No completed sign-off seeded'],
                ['Signed date/time', log.signedAt ?? 'No completed sign-off seeded'],
                ['Audit trail ID', log.auditTrailId],
                ['Readiness', `${log.readinessBefore} -> ${log.readinessAfter}`],
              ]} />
              <ListPanel title="Evidence Reviewed" items={log.evidenceReviewed.map((item) => `${item.title}: ${item.status}${item.notes ? ` - ${item.notes}` : ''}`)} />
              {log.deficienciesFound.length > 0 && (
                <ListPanel
                  title="Deficiencies"
                  items={log.deficienciesFound.map((item) => {
                    const action = item.correctiveActionRequired ? 'corrective action required' : 'no corrective action required';
                    const due = item.dueDate ? `; due ${item.dueDate}` : '';
                    const actionId = item.correctiveActionId ? `; action ${item.correctiveActionId}` : '';
                    return `${item.severity}: ${item.description} (${action}${due}${actionId})`;
                  })}
                />
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function InfoGrid({ rows, compact = false }: { rows: readonly (readonly [string, string])[]; compact?: boolean }) {
  return (
    <dl className={`mt-md grid gap-sm ${compact ? 'desktop:grid-cols-2' : 'desktop:grid-cols-3'}`}>
      {rows.map(([label, value]) => (
        <div key={`${label}-${value}`} className="rounded-md bg-white/70 p-md">
          <dt className="text-[10px] uppercase tracking-tag text-muted">{label}</dt>
          <dd className="mt-xs text-sm text-ink">{value || 'Not configured'}</dd>
        </div>
      ))}
    </dl>
  );
}

function DossierPanel({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-lg border border-hairline bg-surface-glass p-lg">
      <h3 className="text-sm font-medium uppercase tracking-tag text-brand-teal">{title}</h3>
      <p className="mt-sm text-sm leading-relaxed text-secondary">{body}</p>
    </section>
  );
}

function IconPanel({ icon: Icon, title, body }: { icon: typeof ShieldCheck; title: string; body: string }) {
  return (
    <section className="rounded-lg border border-hairline bg-surface-glass p-lg">
      <Icon className="h-5 w-5 text-brand-teal" aria-hidden />
      <h3 className="mt-md text-sm font-medium uppercase tracking-tag text-brand-teal">{title}</h3>
      <p className="mt-sm text-sm leading-relaxed text-secondary">{body}</p>
    </section>
  );
}

function ListPanel({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <section className="rounded-md bg-white/70 p-md">
      <h4 className="text-xs font-medium uppercase tracking-tag text-muted">{title}</h4>
      <ul className="mt-sm grid gap-xs text-sm text-secondary">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
}

export default MasterControlsScreen;
