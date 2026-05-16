/**
 * useFormDraft — minimal form-draft persistence hook
 * (Stabilization R-01 + R-04 + R-06 + R-08).
 *
 * Goal: survive browser refresh, tab background/foreground, and accidental close
 * on long-form surfaces (Onboarding V2 activation, eventually CES task forms).
 *
 * Scope (intentionally small):
 *   - localStorage only (Evidence-Center-class IndexedDB blob persistence is
 *     MVP plan §3 / L329 territory, not Stabilization scope).
 *   - Versioned keys so a schema bump invalidates drafts cleanly.
 *   - Debounced writes (default 400 ms) so typing-storms don't thrash storage.
 *   - `visibilitychange` + `pagehide` + `beforeunload` flush so backgrounding
 *     a tab persists the latest draft (R-04).
 *   - Optional TTL so overnight drafts can be auto-expired (R-06):
 *     pass `staleAfterMs`. When a stored draft exceeds the TTL on rehydrate,
 *     it is discarded and `isStale` is `true` so the UI can surface a
 *     "we cleared an older draft" notice.
 *   - Step checkpointing for multi-step / multi-section forms (R-08):
 *     `markStep(stepName)` flushes the draft synchronously (skipping debounce)
 *     and stamps the step name in the envelope. On rehydrate, `lastStep` is
 *     returned so the UI can resume at the correct section.
 *
 * Out of scope (deliberately):
 *   - Server-side draft sync (post-Wave-0)
 *   - Cross-tab BroadcastChannel reconciliation (multi-tab handling deferred)
 *   - eCign integration (Protected Subsystem; needs Architecture review)
 *
 * Usage:
 *   const { draft, setDraft, clearDraft, isStale, lastStep, markStep } =
 *     useFormDraft<MyDraft>({
 *       key: 'onboardingV2.activation',
 *       version: 1,
 *       initial: SEED,
 *       staleAfterMs: 24 * 60 * 60 * 1000, // discard drafts older than 24h
 *     });
 *
 *   // when user advances past a logical step
 *   markStep('roles-confirmed');
 *
 *   // after successful submit
 *   clearDraft();
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_PREFIX = 'ci-form-draft.v1';

interface StoredEnvelope<T> {
  v: number;
  ts: number;
  data: T;
  /** Optional name of the most recently checkpointed step. R-08. */
  step?: string;
}

interface InitialReadResult<T> {
  data: T;
  isStale: boolean;
  lastStep?: string;
}

export interface UseFormDraftOptions<T> {
  /**
   * Stable identifier for this form. Combined with `version` to form the
   * localStorage key. Choose a dotted scope (e.g. `onboardingV2.activation`).
   */
  key: string;
  /**
   * Schema version. Bump when the shape of `T` changes incompatibly so that
   * stale drafts are discarded on rehydrate instead of crashing the UI.
   */
  version: number;
  /**
   * Initial value when no draft is stored (or when stored draft is invalid /
   * expired). Treated as a stable seed; do not pass a new object every render.
   */
  initial: T;
  /**
   * Debounce window for writes. Default 400 ms. Set to 0 to write synchronously
   * (not recommended for typing-heavy fields).
   */
  debounceMs?: number;
  /**
   * Optional: discard drafts older than this many ms on rehydrate.
   * Undefined = never expire. Useful for long-idle-recovery (R-06).
   */
  staleAfterMs?: number;
}

export interface UseFormDraftResult<T> {
  /** Current draft value. Always returns the most recent local state. */
  draft: T;
  /**
   * Replace the draft (or use functional updater). Triggers a debounced
   * localStorage write.
   */
  setDraft: (next: T | ((prev: T) => T)) => void;
  /**
   * Clear the persisted draft. Call this after a successful submit so the
   * next visit starts fresh.
   */
  clearDraft: () => void;
  /**
   * `true` after the first effect tick — i.e. once we've checked storage and
   * either loaded an existing draft or kept the initial value. Components
   * should avoid rendering interactive form fields until this is `true` to
   * prevent a flash-of-empty-form.
   */
  hasRehydrated: boolean;
  /**
   * `true` if a draft was found but its age exceeded `staleAfterMs`. The hook
   * will have already discarded it; this flag lets the UI surface a "We
   * cleared an older draft" notice if desired. Always `false` when
   * `staleAfterMs` is undefined.
   */
  isStale: boolean;
  /**
   * Name of the most recently checkpointed step (R-08), if the rehydrated
   * envelope had one. `undefined` on first visit, after `clearDraft()`, or if
   * `markStep` has never been called. Use to resume a multi-step form at the
   * correct section.
   */
  lastStep: string | undefined;
  /**
   * Checkpoint the current draft at a named step (R-08). Flushes synchronously
   * (skipping any pending debounce window) and writes the step name into the
   * envelope. Safe to call frequently; idempotent when called with the same
   * step name and no draft change.
   */
  markStep: (stepName: string) => void;
}

function buildStorageKey(key: string, version: number): string {
  return `${STORAGE_PREFIX}:${key}:v${version}`;
}

function safeReadEnvelope<T>(storageKey: string): StoredEnvelope<T> | null {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !('v' in parsed) ||
      !('ts' in parsed) ||
      !('data' in parsed)
    ) {
      return null;
    }
    return parsed as StoredEnvelope<T>;
  } catch {
    return null;
  }
}

function safeWriteEnvelope<T>(storageKey: string, envelope: StoredEnvelope<T>): void {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(envelope));
  } catch {
    // localStorage may throw on quota / privacy mode. Failing soft is correct
    // for a draft-persistence layer — drafts are best-effort by definition.
  }
}

function safeRemove(storageKey: string): void {
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // intentional swallow; see safeWriteEnvelope
  }
}

/**
 * Read storage during render-time `useState` initialization. Returns the
 * resolved initial draft + whether a stale draft was discarded. Pure so it
 * can run inside the lazy initializer without violating the React rule
 * against setState-in-effect.
 */
function readInitial<T>(
  storageKey: string,
  version: number,
  initial: T,
  staleAfterMs: number | undefined,
): InitialReadResult<T> {
  if (typeof window === 'undefined') return { data: initial, isStale: false };
  const stored = safeReadEnvelope<T>(storageKey);
  if (!stored) return { data: initial, isStale: false };
  if (stored.v !== version) {
    safeRemove(storageKey);
    return { data: initial, isStale: false };
  }
  const isExpired =
    typeof staleAfterMs === 'number' &&
    Number.isFinite(staleAfterMs) &&
    Date.now() - stored.ts > staleAfterMs;
  if (isExpired) {
    safeRemove(storageKey);
    return { data: initial, isStale: true };
  }
  return {
    data: stored.data,
    isStale: false,
    lastStep: typeof stored.step === 'string' ? stored.step : undefined,
  };
}

export function useFormDraft<T>(options: UseFormDraftOptions<T>): UseFormDraftResult<T> {
  const { key, version, initial, debounceMs = 400, staleAfterMs } = options;
  const storageKey = useMemo(() => buildStorageKey(key, version), [key, version]);

  // Lazy initializer reads storage during render, eliminating the post-mount
  // setState-in-effect pattern. Cost: if `key`/`version`/`staleAfterMs` change
  // after mount, we do not re-rehydrate. Documented contract: those inputs
  // are stable per usage.
  const [initialState] = useState<InitialReadResult<T>>(() =>
    readInitial<T>(storageKey, version, initial, staleAfterMs),
  );
  const [draft, setDraftState] = useState<T>(initialState.data);

  const draftRef = useRef<T>(initialState.data);
  const writeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepRef = useRef<string | undefined>(initialState.lastStep);

  const flush = useCallback(() => {
    if (writeTimerRef.current !== null) {
      clearTimeout(writeTimerRef.current);
      writeTimerRef.current = null;
    }
    safeWriteEnvelope<T>(storageKey, {
      v: version,
      ts: Date.now(),
      data: draftRef.current,
      step: stepRef.current,
    });
  }, [storageKey, version]);

  // Flush-on-interrupt (R-04): visibilitychange + pagehide + beforeunload.
  // We deliberately register all three because browsers behave differently:
  //   - Mobile Safari fires `pagehide` reliably; not `beforeunload`.
  //   - Desktop Chrome fires `beforeunload`; visibilitychange covers tab switch.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    const onPageHide = () => flush();
    const onBeforeUnload = () => flush();

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [flush]);

  // Cleanup pending debounce on unmount (and flush so we don't lose
  // up-to-the-millisecond edits).
  useEffect(() => {
    return () => {
      if (writeTimerRef.current !== null) {
        flush();
      }
    };
  }, [flush]);

  const setDraft = useCallback(
    (next: T | ((prev: T) => T)) => {
      setDraftState(prev => {
        const resolved =
          typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        draftRef.current = resolved;
        if (debounceMs <= 0) {
          safeWriteEnvelope<T>(storageKey, {
            v: version,
            ts: Date.now(),
            data: resolved,
            step: stepRef.current,
          });
        } else {
          if (writeTimerRef.current !== null) {
            clearTimeout(writeTimerRef.current);
          }
          writeTimerRef.current = setTimeout(() => {
            writeTimerRef.current = null;
            safeWriteEnvelope<T>(storageKey, {
              v: version,
              ts: Date.now(),
              data: draftRef.current,
              step: stepRef.current,
            });
          }, debounceMs);
        }
        return resolved;
      });
    },
    [storageKey, version, debounceMs],
  );

  const clearDraft = useCallback(() => {
    if (writeTimerRef.current !== null) {
      clearTimeout(writeTimerRef.current);
      writeTimerRef.current = null;
    }
    draftRef.current = initial;
    stepRef.current = undefined;
    setDraftState(initial);
    safeRemove(storageKey);
  }, [initial, storageKey]);

  // R-08: partial-save at logical step boundaries. Writes synchronously
  // (bypassing the debounce window) and stamps the step name into the
  // envelope so a rehydrate can resume at the same section.
  const markStep = useCallback(
    (stepName: string) => {
      stepRef.current = stepName;
      flush();
    },
    [flush],
  );

  // After a lazy-initialized read, hasRehydrated is true on first render —
  // there is no second pass to wait for. Surfaced as a constant for API
  // compatibility with components that gate render on this flag.
  return {
    draft,
    setDraft,
    clearDraft,
    hasRehydrated: true,
    isStale: initialState.isStale,
    lastStep: initialState.lastStep,
    markStep,
  };
}
