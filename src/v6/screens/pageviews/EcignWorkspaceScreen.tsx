import {
  BadgeCheck,
  Ban,
  Clock,
  FileCheck2,
  Fingerprint,
  IdCard,
  KeyRound,
  LockKeyhole,
  PenLine,
  ScrollText,
  Server,
  ShieldCheck,
  Stamp,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useParams, useSearchParams } from 'react-router-dom';
import { MetricGrid, ToneTag, toneGlassSurfaceClasses, toneSurfaceClasses, type MetricTileData } from '../../components';
import { Badge } from '../../primitives';
import { type Tone } from '../../tokens';
import { cx } from '../../utils/classNames';
import { SIGNER_HIERARCHY_RULES } from '@/policy/ecign/signerHierarchy';
import { ECIGN_PERMISSION_ROLES } from '@/policy/ecign/permissionRoles';
import { ECIGN_AGREEMENT_VERSION, getCurrentConsentTextHash } from '@/policy/ecign/ecignAgreement';
import type { ECIgnPermissionRole, SignatureRequirementStatus } from '@/policy/ecign/types';
import { resolveCanonicalFormId } from '@/policy/data/formIdAliases';

/* ─────────────────────────────────────────────────────────────────────────
   eCIgn Workspace — Stage-B Path A (static, source-grounded).

   Every value rendered here comes from client-importable, source-grounded
   eCIgn configuration: the signer-role authority hierarchy, the eCIgn
   permission-role ladder, the canonical signing lifecycle / certificate
   schema, and the versioned E-SIGN Act enrollment agreement (with its real
   deterministic content hash). NO per-instance signature data is shown:
   signer names, signature status, form-instance IDs, timestamps, locked
   package hashes, evidence IDs, and the audit trail are recorded only in the
   server eCIgn store and require a later API-backed Path B. Those sections
   are rendered as explicit "source-unavailable" panels — never fabricated.
   ───────────────────────────────────────────────────────────────────────── */

const CONSENT_TEXT_HASH = getCurrentConsentTextHash();

interface LifecycleStage {
  detail: string;
  icon: LucideIcon;
  key: string;
  label: string;
  model: string;
  tone: Tone;
}

// Canonical signing lifecycle — model names + fields taken verbatim from the
// eCIgn type contract (ECIgnConsentProfile → ECIgnSignatureProfile →
// ECIgnSignatureRecord → ECIgnCertificate). Structure only; no instance state.
const SIGNING_LIFECYCLE: readonly LifecycleStage[] = [
  {
    detail: 'One-time E-SIGN Act enrollment consent captured per signer; records the consent version and consent-text hash.',
    icon: ShieldCheck,
    key: 'CONSENT',
    label: 'Enrollment consent',
    model: 'ECIgnConsentProfile',
    tone: 'green',
  },
  {
    detail: 'Reusable drawn, typed, or uploaded signature profile with a profile hash, bound to the active consent profile.',
    icon: IdCard,
    key: 'PROFILE',
    label: 'Signature profile',
    model: 'ECIgnSignatureProfile',
    tone: 'teal',
  },
  {
    detail: 'Per-document signature record: signer role, required permission, signing intent, signed timestamp, and document hash before/after.',
    icon: PenLine,
    key: 'SIGN',
    label: 'Signature execution',
    model: 'ECIgnSignatureRecord',
    tone: 'amber',
  },
  {
    detail: 'Canonical certificate statement plus validity flags (active consent, active signature profile, required permission role held).',
    icon: Stamp,
    key: 'CERTIFY',
    label: 'Certificate generation',
    model: 'ECIgnCertificate',
    tone: 'green',
  },
];

// Real signature-requirement status vocabulary (SignatureRequirementStatus).
// This documents the allowed states — it does not assert any instance state.
const REQUIREMENT_STATUS: readonly { status: SignatureRequirementStatus; tone: Tone }[] = [
  { status: 'pending', tone: 'slate' },
  { status: 'ready', tone: 'teal' },
  { status: 'signed', tone: 'green' },
  { status: 'reviewed', tone: 'teal' },
  { status: 'rejected', tone: 'orange' },
  { status: 'not_required', tone: 'slate' },
  { status: 'blocked', tone: 'amber' },
];

// Permission-role ladder semantics, documented in permissionRoles.ts.
// The four hierarchical roles satisfy any lower requirement ("or higher");
// witness/system are discrete, non-escalating capabilities.
const HIERARCHICAL_PERMISSIONS = new Set<ECIgnPermissionRole>([
  'eCIgner',
  'eCIgn Reviewer',
  'eCIgn Final Approver',
  'eCIgn Administrator',
]);

// Certificate field groups — names verbatim from the ECIgnCertificate type.
// Schema only: values populate at signing time via the API-backed store.
const CERTIFICATE_SCHEMA: readonly { fields: string; group: string }[] = [
  { fields: 'signerDisplayName · signerRole · requiredPermissionRole · signerUserId', group: 'Signer' },
  { fields: 'eventId · workflowId · taskId · formId · formInstanceId', group: 'Context' },
  { fields: 'consentProfileId · consentVersion · consentTextHash · consentAcceptedAt', group: 'Consent' },
  { fields: 'signatureProfileId · signatureProfileHash · signatureMethod · signedAt · signatureIntentMethod', group: 'Signature' },
  { fields: 'documentHashBeforeSignature · documentHashAfterSignature', group: 'Document integrity' },
  { fields: 'signedIp · signedUserAgent · signedDeviceId', group: 'Evidence' },
  { fields: 'hadActiveConsentProfile · hadActiveSignatureProfile · hadRequiredPermissionRole · generatedAt', group: 'Validity' },
];

interface UnavailablePanel {
  detail: string;
  icon: LucideIcon;
  title: string;
}

// Per-instance data that lives only in the server eCIgn store — shown as
// honest source-unavailable panels, not fabricated values.
const SOURCE_UNAVAILABLE: readonly UnavailablePanel[] = [
  {
    detail: 'Signer names, emails, and user IDs are recorded against each signature instance in the server eCIgn store.',
    icon: Users,
    title: 'Signer instances & identities',
  },
  {
    detail: 'Live signed / reviewed / rejected status is tracked per form instance, not in static configuration.',
    icon: FileCheck2,
    title: 'Signature status per instance',
  },
  {
    detail: 'Form instance identifiers and document versions are issued at runtime when a packet is opened.',
    icon: ScrollText,
    title: 'Form instance IDs & versions',
  },
  {
    detail: 'Signed timestamps and consent acceptance times are written when a signature executes.',
    icon: Clock,
    title: 'Timestamps',
  },
  {
    detail: 'Document and manifest hashes — and the locked package state — are sealed at signing time.',
    icon: LockKeyhole,
    title: 'Locked package & document hashes',
  },
  {
    detail: 'Evidence artifact IDs and the audit-event trail are held in the server eCIgn store.',
    icon: Fingerprint,
    title: 'Evidence IDs & audit trail',
  },
];

const ecignMetrics: readonly MetricTileData[] = [
  { helper: 'Canonical authority models', label: 'Signing domains', tone: 'teal', value: String(SIGNER_HIERARCHY_RULES.length) },
  { helper: 'eCIgn execution permissions', label: 'Permission roles', tone: 'amber', value: String(ECIGN_PERMISSION_ROLES.length) },
  { helper: 'Consent through certificate', label: 'Lifecycle stages', tone: 'green', value: String(SIGNING_LIFECYCLE.length) },
  { helper: 'Re-consent on version change', label: 'Agreement version', tone: 'teal', value: ECIGN_AGREEMENT_VERSION },
];

export function EcignWorkspaceScreen() {
  const { formId } = useParams();
  const [searchParams] = useSearchParams();
  const rawFormInstanceId = searchParams.get('form_instance_id') || undefined;
  const canonFormId = formId ? resolveCanonicalFormId(formId) ?? formId : undefined;
  const formInstanceId = rawFormInstanceId; // preserve exactly as provided (real records)
  return (
    <section className="grid gap-xl" data-hash-id="ecign-workspace" data-route="/forms/:formId/esign" data-template="ecign">
      <MetricGrid metrics={ecignMetrics} />

      {(canonFormId || formInstanceId) && (
        <div className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-md overflow-hidden text-sm">
          <span className="font-medium">Context: </span>
          {canonFormId && <span>Form {canonFormId} </span>}
          {formInstanceId && <span className="text-brand-teal">· formInstanceId: {formInstanceId}</span>}
          <span className="text-muted"> (real record; no fabrication)</span>
        </div>
      )}

      <section className={cx('rounded-lg p-xl', toneGlassSurfaceClasses.teal)} aria-label="eCIgn data source notice">
        <div className="flex flex-wrap items-start gap-md">
          <span className="grid h-tap w-tap flex-none place-items-center rounded-md bg-surface-glass backdrop-blur-md shadow-glass-inset">
            <Server aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
          </span>
          <div className="min-w-0">
            <ToneTag tone="teal">Source-grounded configuration</ToneTag>
            <h2 className="mt-md text-h2 font-medium text-ink">eCIgn signing model</h2>
            <p className="mt-sm max-w-content text-sm text-secondary">
              This workspace shows the source-grounded eCIgn signing configuration: the signer-role authority hierarchy,
              the eCIgn permission ladder, the signing lifecycle and certificate schema, and the versioned E-SIGN Act
              enrollment agreement. Live signature instances — signer identities, signature status, form-instance IDs,
              timestamps, locked package hashes, evidence IDs, and the audit trail — are served by the eCIgn store and
              require a later API-backed reconnection. No signer, signature, package, or audit data is fabricated here.
              {formInstanceId ? ` Current context preserves formInstanceId=${formInstanceId}.` : ''}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl overflow-hidden shadow-rest" aria-labelledby="ecign-hierarchy-heading">
        <div className="mb-lg flex flex-wrap items-start justify-between gap-md">
          <div>
            <ToneTag tone="teal">Authority model</ToneTag>
            <h2 className="mt-md text-h2 font-medium text-ink" id="ecign-hierarchy-heading">Signing role hierarchy</h2>
            <p className="mt-xs max-w-content text-sm text-muted">
              Per-domain owner, reviewer, signer, and final-approver roles that govern who may execute a signature.
            </p>
          </div>
          <Badge variant="count">{SIGNER_HIERARCHY_RULES.length} domains</Badge>
        </div>
        <div className="grid gap-md tablet-l:grid-cols-2 desktop:grid-cols-3">
          {SIGNER_HIERARCHY_RULES.map((rule) => (
            <article className={cx('rounded-lg p-lg', toneGlassSurfaceClasses.slate)} key={rule.domain}>
              <div className="mb-md flex flex-wrap items-center justify-between gap-sm">
                <h3 className="text-body font-medium text-ink">{rule.domain}</h3>
                {rule.governingBodyRequired ? <ToneTag tone="amber">Governing body</ToneTag> : null}
              </div>
              <dl className="grid gap-sm">
                <RoleRow label="Owner" value={rule.ownerRole} />
                <RoleRow label="Reviewers" value={rule.reviewerRoles.join(' · ')} />
                <RoleRow label="Signers" value={rule.signerRoles.join(' · ')} />
                <RoleRow label="Final approval" value={rule.finalApproverRoles.join(' · ')} />
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-xl desktop:grid-cols-2">
        <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl overflow-hidden shadow-rest" aria-labelledby="ecign-lifecycle-heading">
          <div className="mb-lg">
            <ToneTag tone="green">Signing lifecycle</ToneTag>
            <h2 className="mt-md text-h2 font-medium text-ink" id="ecign-lifecycle-heading">Lifecycle model</h2>
            <p className="mt-xs max-w-content text-sm text-muted">
              The canonical consent-to-certificate path. Structure only — no per-instance progress is shown.
            </p>
          </div>
          <div className="grid gap-md">
            {SIGNING_LIFECYCLE.map((stage) => (
              <LifecycleCard stage={stage} key={stage.key} />
            ))}
          </div>
        </section>

        <div className="grid content-start gap-xl">
          <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl overflow-hidden shadow-rest" aria-labelledby="ecign-permission-heading">
            <div className="mb-lg flex flex-wrap items-start justify-between gap-md">
              <div>
                <ToneTag tone="amber">Permission ladder</ToneTag>
                <h2 className="mt-md text-h2 font-medium text-ink" id="ecign-permission-heading">eCIgn permission roles</h2>
              </div>
              <span className="grid h-tap w-tap flex-none place-items-center rounded-md bg-tone-amber-bg">
                <KeyRound aria-hidden="true" className="h-icon-sm w-icon-sm text-tone-amber-text" />
              </span>
            </div>
            <p className="mb-md max-w-content text-sm text-muted">
              Hierarchical roles satisfy any lower signing requirement (&ldquo;or higher&rdquo;); witness and system are
              discrete, non-escalating capabilities.
            </p>
            <ul className="grid gap-sm">
              {ECIGN_PERMISSION_ROLES.map((role) => (
                <li className="flex flex-wrap items-center justify-between gap-sm rounded-md border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-md" key={role}>
                  <span className="text-sm text-ink">{role}</span>
                  <ToneTag tone={HIERARCHICAL_PERMISSIONS.has(role) ? 'teal' : 'slate'}>
                    {HIERARCHICAL_PERMISSIONS.has(role) ? 'Hierarchical' : 'Discrete'}
                  </ToneTag>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl overflow-hidden shadow-rest" aria-labelledby="ecign-status-heading">
            <div className="mb-lg">
              <ToneTag tone="teal">Status vocabulary</ToneTag>
              <h2 className="mt-md text-h2 font-medium text-ink" id="ecign-status-heading">Requirement states</h2>
              <p className="mt-xs max-w-content text-sm text-muted">
                Allowed signature-requirement states. Live state per instance is source-unavailable below.
              </p>
            </div>
            <div className="flex flex-wrap gap-sm">
              {REQUIREMENT_STATUS.map((entry) => (
                <ToneTag tone={entry.tone} key={entry.status}>{entry.status}</ToneTag>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="grid gap-xl desktop:grid-cols-2">
        <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl overflow-hidden shadow-rest" aria-labelledby="ecign-consent-heading">
          <div className="mb-lg flex flex-wrap items-start justify-between gap-md">
            <div>
              <ToneTag tone="green">E-SIGN Act consent</ToneTag>
              <h2 className="mt-md text-h2 font-medium text-ink" id="ecign-consent-heading">Enrollment agreement</h2>
              <p className="mt-xs max-w-content text-sm text-muted">
                Captured once per signer; re-accepted when the version changes. Hash proves the exact accepted text.
              </p>
            </div>
            <span className="grid h-tap w-tap flex-none place-items-center rounded-md bg-tone-green-bg">
              <ShieldCheck aria-hidden="true" className="h-icon-sm w-icon-sm text-tone-green-text" />
            </span>
          </div>
          <dl className="grid gap-sm">
            <div className="rounded-md border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-md">
              <dt className="text-tag uppercase tracking-tag text-muted">Agreement version</dt>
              <dd className="mt-xs text-sm text-ink">{ECIGN_AGREEMENT_VERSION}</dd>
            </div>
            <div className="rounded-md border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-md">
              <dt className="text-tag uppercase tracking-tag text-muted">Consent text hash</dt>
              <dd className="mt-xs break-all text-sm text-ink">{CONSENT_TEXT_HASH}</dd>
            </div>
            <div className="rounded-md border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-md">
              <dt className="text-tag uppercase tracking-tag text-muted">Binding</dt>
              <dd className="mt-xs text-sm text-secondary">
                The accepted electronic signature is legally equivalent to a handwritten signature for agency
                compliance, workflow execution, audit, and evidence where electronic signature is permitted.
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl overflow-hidden shadow-rest" aria-labelledby="ecign-certificate-heading">
          <div className="mb-lg flex flex-wrap items-start justify-between gap-md">
            <div>
              <ToneTag tone="teal">Certificate schema</ToneTag>
              <h2 className="mt-md text-h2 font-medium text-ink" id="ecign-certificate-heading">Evidence certificate fields</h2>
              <p className="mt-xs max-w-content text-sm text-muted">
                Fields a real certificate records. Values populate at signing time via the API-backed store.
              </p>
            </div>
            <span className="grid h-tap w-tap flex-none place-items-center rounded-md bg-tone-teal-bg">
              <BadgeCheck aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
            </span>
          </div>
          <dl className="grid gap-sm">
            {CERTIFICATE_SCHEMA.map((row) => (
              <div className="rounded-md border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-md" key={row.group}>
                <dt className="text-tag uppercase tracking-tag text-muted">{row.group}</dt>
                <dd className="mt-xs break-words text-sm text-ink">{row.fields}</dd>
              </div>
            ))}
          </dl>
        </section>
      </section>

      <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl overflow-hidden shadow-rest" aria-labelledby="ecign-unavailable-heading">
        <div className="mb-lg flex flex-wrap items-start justify-between gap-md">
          <div>
            <ToneTag tone="slate">Source unavailable</ToneTag>
            <h2 className="mt-md text-h2 font-medium text-ink" id="ecign-unavailable-heading">Live signature data — Path B</h2>
            <p className="mt-xs max-w-content text-sm text-muted">
              The following are recorded only in the server eCIgn store and require a later API-backed reconnection.
              They are intentionally not shown here rather than fabricated.
            </p>
          </div>
          <span className="grid h-tap w-tap flex-none place-items-center rounded-md bg-surface-glass backdrop-blur-md shadow-glass-inset">
            <Ban aria-hidden="true" className="h-icon-sm w-icon-sm text-muted" />
          </span>
        </div>
        <div className="grid gap-md tablet-l:grid-cols-2 desktop:grid-cols-3">
          {SOURCE_UNAVAILABLE.map((panel) => (
            <UnavailableCard panel={panel} key={panel.title} />
          ))}
        </div>
      </section>
    </section>
  );
}

function RoleRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-md">
      <dt className="text-tag uppercase tracking-tag text-muted">{label}</dt>
      <dd className="mt-xs text-sm text-ink">{value}</dd>
    </div>
  );
}

function LifecycleCard({ stage }: { stage: LifecycleStage }) {
  const Icon = stage.icon;

  return (
    <article className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg overflow-hidden">
      <div className="flex items-start gap-md">
        <span className={cx('grid h-tap w-tap flex-none place-items-center rounded-md', toneSurfaceClasses[stage.tone])}>
          <Icon aria-hidden="true" className="h-icon-sm w-icon-sm" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-xs flex flex-wrap items-center justify-between gap-sm">
            <h3 className="text-sm font-medium text-ink">{stage.label}</h3>
            <ToneTag tone={stage.tone}>{stage.model}</ToneTag>
          </div>
          <p className="text-xs text-muted">{stage.detail}</p>
        </div>
      </div>
    </article>
  );
}

function UnavailableCard({ panel }: { panel: UnavailablePanel }) {
  const Icon = panel.icon;

  return (
    <article className={cx('rounded-lg p-lg', toneGlassSurfaceClasses.slate)}>
      <div className="mb-md flex flex-wrap items-start justify-between gap-md">
        <span className="grid h-tap w-tap place-items-center rounded-md bg-surface-glass backdrop-blur-md shadow-glass-inset">
          <Icon aria-hidden="true" className="h-icon-sm w-icon-sm text-muted" />
        </span>
        <ToneTag tone="slate">Path B</ToneTag>
      </div>
      <h3 className="text-body font-light text-ink">{panel.title}</h3>
      <p className="mt-xs text-sm text-secondary">{panel.detail}</p>
    </article>
  );
}

export default EcignWorkspaceScreen;
