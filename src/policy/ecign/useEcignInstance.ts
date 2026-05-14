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
  ecignApi, EcignApiError, ATTESTATION_TEXT, sha256Hex, HIGH_IMPACT_FORMS, getEcignClientMode,
} from './api';
import { useEcignSignerIdentity } from './signerIdentity';

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

const LS_KEY = (formId: string, fieldId: string, signerId: string) =>
  `ecign:instance:${formId}:${fieldId}:${signerId}`;

const LS_KEY_SHARED = (formId: string, formInstanceId: string) =>
  `ecign:shared_instance:${formId}:${formInstanceId}`;

export interface UseInstanceArgs {
  formId:              string;
  formVersion:         string;
  fieldId:             string;
  workflowInstanceId?: string;
  eventId?:            string;
  formInstanceId?:     string;
  sharedInstance?:     boolean;
  signerSlots?:        Array<{ field_id: string; role: string; tier: number; user_id?: string }>;
  signerIndex?:        number;
  totalSigners?:       number;
}

export interface InstanceError { code: string; message: string }

export function useEcignInstance(args: UseInstanceArgs) {
  const signer = useEcignSignerIdentity();
  const [instance, setInstance] = useState<InstanceShape | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<InstanceError | null>(null);
  const [busy,     setBusy]     = useState<string | null>(null);
  const [mfaToken, setMfaToken] = useState<string | null>(null);

  const captureError = useCallback((e: unknown) => {
    const err = e instanceof EcignApiError
      ? {
          code: e.code,
          message: e.code === 'ECIGN_BACKEND_UNAVAILABLE'
            ? 'eCIgn backend is unavailable. Use DEMO_LOCAL mode or enable configured fallback.'
            : e.message,
        }
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
  const useShared = args.sharedInstance === true && !!args.formInstanceId;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const lsKey = useShared
          ? LS_KEY_SHARED(args.formId, args.formInstanceId!)
          : LS_KEY(args.formId, args.fieldId, signer.id);
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
          await ecignApi.registerVersion({
            version_id:        documentVersionId,
            form_id:           args.formId,
            semver:            args.formVersion,
            template_snapshot: `${args.formId}@${args.formVersion}`,
            effective_at_utc:  new Date().toISOString(),
          });
        } catch { /* non-fatal */ }

        const requiredSigners = useShared && args.signerSlots?.length
          ? args.signerSlots.map(s => ({
              role:     s.role,
              tier:     s.tier,
              user_id:  s.user_id,
              field_id: s.field_id,
            }))
          : [{
              role:     signer.role,
              tier:     signer.tier,
              user_id:  signer.id,
              field_id: args.fieldId,
            }];

        const created = await ecignApi.createInstance({
          form_id:             args.formId,
          document_version_id: documentVersionId,
          required_signers:    requiredSigners,
          workflow_instance_id: args.workflowInstanceId,
          event_id:             args.eventId,
        }) as unknown as InstanceShape;

        const inst = await ecignApi.getInstance(created.instance_id) as unknown as InstanceShape;
        if (!inst?.instance_id) {
          throw new EcignApiError(500, 'ECIGN_PERSISTENCE_FAILED', 'Session was not persisted and reloadable.', created);
        }

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
  }, [args.eventId, args.fieldId, args.formId, args.formVersion, args.formInstanceId, args.workflowInstanceId, useShared, signer.id, signer.role, signer.tier]);

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
      await ecignApi.verify(instance.instance_id, token);
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
    mode: getEcignClientMode(),
    acceptConsent, verifyIdentity, acknowledgeReview,
    applySignature,
    lockDocument,
    refresh,
    signerIndex:  args.signerIndex,
    totalSigners: args.totalSigners,
  };
}
