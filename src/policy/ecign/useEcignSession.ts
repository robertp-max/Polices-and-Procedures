/**
 * useEcignSession — orchestrates the full server-side signature lifecycle
 * (consent → instance → disclose → verify → review-ack → sign → lock).
 * The existing 3-step UI calls `commitSignature(...)` once at "Confirm
 * Signature" time and this hook walks the full state machine, capturing
 * any guardrail rejection from the backend.
 */
import { useCallback, useState } from 'react';
import { ecignApi, EcignApiError, ATTESTATION_TEXT, sha256Hex, HIGH_IMPACT_FORMS } from './api';
import { DEMO_SESSION } from '@/policy/components/FormSignatureContext';

export interface CommitArgs {
  formId:              string;
  formVersion:         string;   // semver
  fieldId:             string;
  signaturePngDataUrl: string;
  templateSnapshot?:   string;   // optional inline HTML / hash basis
  workflowInstanceId?: string;
  eventId?:            string;
}

export interface CommitResult {
  instanceId:    string;
  signatureId:   string;
  documentHash:  string;
  manifestHash:  string;
  lockedAtUtc:   string;
}

export interface SessionStatus {
  phase:    'idle' | 'consent' | 'instance' | 'disclose' | 'verify' | 'review' | 'sign' | 'lock' | 'done' | 'error';
  message:  string;
  error?:   { code: string; message: string };
  result?:  CommitResult;
}

export function useEcignSession() {
  const [status, setStatus] = useState<SessionStatus>({ phase: 'idle', message: '' });

  const reset = useCallback(() => setStatus({ phase: 'idle', message: '' }), []);

  const commitSignature = useCallback(async (args: CommitArgs): Promise<CommitResult | null> => {
    try {
      /* 0. Register document version (idempotent on append-only store) */
      const documentVersionId = `${args.formId}@${args.formVersion}`;
      const templateSnapshot  = args.templateSnapshot ?? `${args.formId}@${args.formVersion}`;
      try {
        await fetch('/api/ecign/versions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id':    DEMO_SESSION.id,
            'X-User-Name':  DEMO_SESSION.name,
            'X-User-Role':  DEMO_SESSION.role,
            'X-User-Email': DEMO_SESSION.email,
            'X-User-Tier':  String(DEMO_SESSION.tier),
          },
          body: JSON.stringify({
            version_id:       documentVersionId,
            form_id:          args.formId,
            semver:           args.formVersion,
            template_snapshot: templateSnapshot,
            effective_at_utc: new Date().toISOString(),
          }),
        });
      } catch { /* swallow — append-only, duplicates are harmless */ }

      /* 1. Disclosure & consent (G1) */
      setStatus({ phase: 'consent', message: 'Recording disclosure consent…' });
      const disc = await ecignApi.getCurrentDisclosure();
      await ecignApi.recordConsent(disc.disclosure_version);

      /* 2. MFA step-up for high-impact forms (G2) */
      let mfaToken: string | undefined;
      if (HIGH_IMPACT_FORMS.has(args.formId)) {
        const su = await ecignApi.stepUp('otp');
        mfaToken = su.mfa_token;
      }

      /* 3. Create form instance */
      setStatus({ phase: 'instance', message: 'Opening signature instance…' });
      const inst = await ecignApi.createInstance({
        form_id:              args.formId,
        document_version_id:  documentVersionId,
        required_signers:     [{
          role:     DEMO_SESSION.role,
          tier:     DEMO_SESSION.tier,
          user_id:  DEMO_SESSION.id,
          field_id: args.fieldId,
        }],
        workflow_instance_id: args.workflowInstanceId,
        event_id:             args.eventId,
      }, mfaToken);

      /* 4. Walk the state machine (G7) */
      setStatus({ phase: 'disclose', message: 'Acknowledging disclosure…' });
      await ecignApi.disclose(inst.instance_id);

      setStatus({ phase: 'verify', message: 'Verifying identity…' });
      await ecignApi.verify(inst.instance_id);

      setStatus({ phase: 'review', message: 'Recording document review…' });
      await ecignApi.reviewAck(inst.instance_id);

      /* 5. Apply signature (G1, G2, G5, G7) */
      setStatus({ phase: 'sign', message: 'Applying signature…' });
      const attestation_text_hash = await sha256Hex(ATTESTATION_TEXT);
      const sig = await ecignApi.applySignature(inst.instance_id, {
        field_id:              args.fieldId,
        signature_png_b64:     args.signaturePngDataUrl,
        attestation_text_hash,
      }, mfaToken);

      /* 6. Lock (G3, evaluateOnLock) */
      setStatus({ phase: 'lock', message: 'Locking document & emitting compliance state…' });
      const lock = await ecignApi.lock(inst.instance_id, mfaToken);

      const result: CommitResult = {
        instanceId:   inst.instance_id,
        signatureId:  sig.signature_id,
        documentHash: lock.document_hash,
        manifestHash: lock.manifest_hash,
        lockedAtUtc:  lock.locked_at_utc,
      };
      setStatus({ phase: 'done', message: 'Document signed and locked.', result });
      return result;
    } catch (e) {
      const err = e instanceof EcignApiError
        ? { code: e.code, message: e.message }
        : { code: 'CLIENT_ERROR', message: e instanceof Error ? e.message : String(e) };
      setStatus({ phase: 'error', message: err.message, error: err });
      return null;
    }
  }, []);

  return { status, commitSignature, reset };
}
