/**
 * useEcignInstance — UI state-machine driver. The backend is the single
 * source of truth: every action calls a backend endpoint, then the
 * instance is re-fetched. The UI never sets `state` itself.
 *
 *   created  → CONSENT screen          (POST /consents + /disclose)
 *   disclosed → IDENTITY screen        (POST /identity/step-up + /verify)
 *   verified  → REVIEW screen          (POST /review-ack)
 *   reviewed  → SIGNATURE screen       (POST /signatures → backend transitions to attested)
 *   attested  → ATTESTATION screen     (POST /lock)
 *   signed_locked → FINALIZE screen    (terminal; download / print / 2nd sig)
 */
import { useCallback, useEffect, useState } from 'react';
import {
  ecignApi, EcignApiError, ATTESTATION_TEXT, sha256Hex, HIGH_IMPACT_FORMS,
} from './api';
import { DEMO_SESSION } from '@/policy/components/FormSignatureContext';

export type BackendState =
  | 'created' | 'disclosed' | 'verified' | 'reviewed'
  | 'attested' | 'signed_locked' | 'voided' | 'expired';

export type UiStepKey =
  | 'CONSENT' | 'IDENTITY_VERIFIED' | 'REVIEW_ACK'
  | 'SIGNED' | 'ATTESTED' | 'LOCKED';

export interface UiStep { key: UiStepKey; label: string; backend: BackendState }

export const UI_STEPS: ReadonlyArray<UiStep> = [
  { key: 'CONSENT',           label: 'Consent',     backend: 'created'       },
  { key: 'IDENTITY_VERIFIED', label: 'Identity',    backend: 'disclosed'     },
  { key: 'REVIEW_ACK',        label: 'Review',      backend: 'verified'      },
  { key: 'SIGNED',            label: 'Signature',   backend: 'reviewed'      },
  { key: 'ATTESTED',          label: 'Attestation', backend: 'attested'      },
  { key: 'LOCKED',            label: 'Finalize',    backend: 'signed_locked' },
];

export function backendToUi(state: BackendState): UiStepKey {
  const found = UI_STEPS.find(s => s.backend === state);
  return found ? found.key : 'CONSENT';
}

export interface InstanceShape {
  instance_id: string;
  form_id: string;
  document_version_id: string;
  state: BackendState;
  required_signers: Array<{ role: string; tier: number; user_id?: string; field_id: string }>;
  document_hash?: string;
  manifest_hash?: string;
  locked_at_utc?: string;
  attestation_confirmed_at?: string;
  review_acknowledged_at?: string;
  mfa_verified_at?: string;
  consent_id?: string;
  [k: string]: unknown;
}

const LS_KEY = (formId: string, fieldId: string) =>
  `ecign:instance:${formId}:${fieldId}`;

export interface UseInstanceArgs {
  formId:              string;
  formVersion:         string;
  fieldId:             string;
  workflowInstanceId?: string;
  eventId?:            string;
}

export interface InstanceError { code: string; message: string }

export function useEcignInstance(args: UseInstanceArgs) {
  const [instance, setInstance] = useState<InstanceShape | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<InstanceError | null>(null);
  const [busy,     setBusy]     = useState<string | null>(null);
  const [mfaToken, setMfaToken] = useState<string | null>(null);

  const captureError = useCallback((e: unknown) => {
    const err = e instanceof EcignApiError
      ? { code: e.code, message: e.message }
      : { code: 'CLIENT_ERROR', message: e instanceof Error ? e.message : String(e) };
    setError(err);
  }, []);

  const refresh = useCallback(async (id: string) => {
    try {
      const cur = await ecignApi.getInstance(id) as unknown as InstanceShape;
      setInstance(cur);
      setError(null);
      return cur;
    } catch (e) { captureError(e); return null; }
  }, [captureError]);

  /* ── Bootstrap: recover existing instance, or create a new one ── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const lsKey = LS_KEY(args.formId, args.fieldId);
        const existingId = typeof window !== 'undefined'
          ? window.localStorage.getItem(lsKey) : null;

        if (existingId) {
          try {
            const cur = await ecignApi.getInstance(existingId) as unknown as InstanceShape;
            if (!cancelled) setInstance(cur);
            return;
          } catch {
            if (typeof window !== 'undefined') window.localStorage.removeItem(lsKey);
          }
        }

        // Idempotent version registration (append-only store, dupes are no-ops)
        const documentVersionId = `${args.formId}@${args.formVersion}`;
        try {
          await fetch('/api/ecign/versions', {
            method: 'POST',
            headers: {
              'Content-Type':  'application/json',
              'X-User-Id':     DEMO_SESSION.id,
              'X-User-Name':   DEMO_SESSION.name,
              'X-User-Role':   DEMO_SESSION.role,
              'X-User-Email':  DEMO_SESSION.email,
              'X-User-Tier':   String(DEMO_SESSION.tier),
            },
            body: JSON.stringify({
              version_id:        documentVersionId,
              form_id:           args.formId,
              semver:            args.formVersion,
              template_snapshot: `${args.formId}@${args.formVersion}`,
              effective_at_utc:  new Date().toISOString(),
            }),
          });
        } catch { /* non-fatal */ }

        const inst = await ecignApi.createInstance({
          form_id:             args.formId,
          document_version_id: documentVersionId,
          required_signers: [{
            role:     DEMO_SESSION.role,
            tier:     DEMO_SESSION.tier,
            user_id:  DEMO_SESSION.id,
            field_id: args.fieldId,
          }],
          workflow_instance_id: args.workflowInstanceId,
          event_id:             args.eventId,
        }) as unknown as InstanceShape;

        if (cancelled) return;
        if (typeof window !== 'undefined') window.localStorage.setItem(lsKey, inst.instance_id);
        setInstance(inst);
      } catch (e) {
        if (!cancelled) captureError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  // bootstrap once for these props
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [args.formId, args.formVersion, args.fieldId]);

  /* ── State-machine actions: each calls backend, then refreshes ── */

  const acceptConsent = useCallback(async () => {
    if (!instance) return;
    setBusy('consent');
    try {
      const disc = await ecignApi.getCurrentDisclosure();
      await ecignApi.recordConsent(disc.disclosure_version);
      await ecignApi.disclose(instance.instance_id);
      await refresh(instance.instance_id);
    } catch (e) { captureError(e); }
    finally { setBusy(null); }
  }, [instance, refresh, captureError]);

  const verifyIdentity = useCallback(async () => {
    if (!instance) return;
    setBusy('identity');
    try {
      let token: string | undefined;
      if (HIGH_IMPACT_FORMS.has(args.formId)) {
        const su = await ecignApi.stepUp('otp');
        token = su.mfa_token;
        setMfaToken(token);
      }
      // Verify must carry the X-MFA-Token header when produced
      const res = await fetch(`/api/ecign/instances/${instance.instance_id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'X-User-Id':     DEMO_SESSION.id,
          'X-User-Name':   DEMO_SESSION.name,
          'X-User-Role':   DEMO_SESSION.role,
          'X-User-Email':  DEMO_SESSION.email,
          'X-User-Tier':   String(DEMO_SESSION.tier),
          ...(token ? { 'X-MFA-Token': token } : {}),
        },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null) as { error?: { code?: string; message?: string } } | null;
        throw new EcignApiError(res.status,
          body?.error?.code ?? 'UNKNOWN',
          body?.error?.message ?? `HTTP ${res.status}`, body);
      }
      await refresh(instance.instance_id);
    } catch (e) { captureError(e); }
    finally { setBusy(null); }
  }, [instance, refresh, captureError, args.formId]);

  const acknowledgeReview = useCallback(async () => {
    if (!instance) return;
    setBusy('review');
    try {
      await ecignApi.reviewAck(instance.instance_id);
      await refresh(instance.instance_id);
    } catch (e) { captureError(e); }
    finally { setBusy(null); }
  }, [instance, refresh, captureError]);

  const applySignature = useCallback(async (
    signaturePngDataUrl: string,
    evidence?: {
      geo?: { city?: string; region?: string; country?: string; postal?: string; org?: string };
      device?: { name?: string; manufacturer?: string; model?: string; processor?: string; os?: string; os_version?: string; platform?: string };
    },
  ) => {
    if (!instance) return;
    setBusy('sign');
    try {
      const attestation_text_hash = await sha256Hex(ATTESTATION_TEXT);
      await ecignApi.applySignature(instance.instance_id, {
        field_id:              args.fieldId,
        signature_png_b64:     signaturePngDataUrl,
        attestation_text_hash,
        geo: evidence?.geo,
        device: evidence?.device,
      }, mfaToken ?? undefined);
      await refresh(instance.instance_id);
    } catch (e) { captureError(e); }
    finally { setBusy(null); }
  }, [instance, args.fieldId, mfaToken, refresh, captureError]);

  const lockDocument = useCallback(async () => {
    if (!instance) return;
    setBusy('lock');
    try {
      await ecignApi.lock(instance.instance_id, mfaToken ?? undefined);
      await refresh(instance.instance_id);
    } catch (e) { captureError(e); }
    finally { setBusy(null); }
  }, [instance, mfaToken, refresh, captureError]);

  return {
    instance, loading, error, busy,
    acceptConsent, verifyIdentity, acknowledgeReview,
    applySignature,
    lockDocument,
    refresh,
  };
}
