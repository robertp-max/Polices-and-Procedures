/**
 * SignaturePad — canonical ui/ signature capture primitive.
 *
 * Purpose: reusable, compliance-grade signature pad for all policy/workflow
 * signing flows. 320 px is the hard floor for canvas height per Lead 16 C5
 * binding — never allow smaller.
 *
 * Why this exists alongside journey/components/SignaturePad.tsx:
 *   The journey/ version is tightly coupled to the engagement-prototype UX
 *   (gold gradient, black glass aesthetic, requireName pattern). This ui/
 *   version is the canonical primitive for compliance signing flows in Wave 3
 *   (policy attestations, shift sign-offs, FormSigningWorkspace). It consumes
 *   ci-* semantic tokens and is theme-agnostic.
 *
 * Persistence:
 *   localStorage only this session. Partial-stroke recovery uses the same
 *   StoredEnvelope<T> pattern as useFormDraft (v / ts / data fields).
 *   IndexedDB blob persistence is MVP-P1-EVIDENCE-001 / Wave 2 territory —
 *   explicitly out of scope here.
 *
 * Out of scope (deliberate):
 *   - IndexedDB, encrypted storage, remote sync.
 *   - Raw signature strokes stay in localStorage until consumer calls
 *     clearSignaturePadDraft(storageKey) after "Apply Signature".
 *   - Integration with FormSigningWorkspace (Protected Subsystem,
 *     Wave 3 owner-led patch territory).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Lead 16 C5 binding: 320 px is the absolute floor. */
const MIN_HEIGHT_FLOOR = 320;
const DEFAULT_STROKE_WIDTH = 2;
/** Mirrors DEBOUNCE_MS pattern from useFormDraft (300 ms for stroke events). */
const PERSIST_DEBOUNCE_MS = 300;

// ─── Public types ─────────────────────────────────────────────────────────────

export interface SignaturePadValue {
  /** PNG data URL of the final flattened signature. Empty string if cleared. */
  dataUrl: string;
  /** Width in CSS px the signature was captured at. */
  widthPx: number;
  /** Height in CSS px the signature was captured at. */
  heightPx: number;
  /** True if user has actually drawn at least one stroke. */
  hasContent: boolean;
}

export interface SignaturePadProps {
  /**
   * Persistence key (localStorage). When set, partial strokes auto-save and
   * rehydrate on mount. Pass undefined to disable persistence.
   */
  storageKey?: string;
  /**
   * Schema version for the persisted envelope. Bump to invalidate old saves.
   * Default 1.
   */
  storageVersion?: number;
  /** Initial value (dataUrl); used when no persisted state exists. */
  initialValue?: string;
  /** Called on each finished stroke (pointerup), and on clear. */
  onChange?: (value: SignaturePadValue) => void;
  /** Called when user clicks Clear. */
  onClear?: () => void;
  /**
   * Minimum canvas height in CSS px. Default 320 (MVP Lead 16 C5 binding).
   * Floor is always enforced at 320 — smaller values are silently clamped up.
   */
  minHeight?: number;
  /** Accessible label for the canvas. Default 'Signature pad'. */
  ariaLabel?: string;
  /** Show the "Sign here" placeholder guideline. Default true. */
  showGuide?: boolean;
  /** Disable interaction (read-only display of initialValue). Default false. */
  disabled?: boolean;
  className?: string;
}

// ─── Internal types ───────────────────────────────────────────────────────────

type StrokePoint = { x: number; y: number; pressure: number };
type Stroke = StrokePoint[];

interface PersistedData {
  strokes: Stroke[];
}

/** Mirrors StoredEnvelope<T> from useFormDraft. */
interface StoredEnvelope {
  v: number;
  ts: number;
  data: PersistedData;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

function safeReadEnvelope(key: string): StoredEnvelope | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(key);
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
    return parsed as StoredEnvelope;
  } catch {
    return null;
  }
}

function safeWriteEnvelope(key: string, envelope: StoredEnvelope): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(envelope));
    }
  } catch {
    // Quota / privacy mode: draft persistence is best-effort by design.
  }
}

/**
 * Remove the persisted draft for the given storage key.
 *
 * Call this after the consumer has successfully applied the signature
 * (e.g. after "Apply Signature" completes). The consumer owns flush timing;
 * this component intentionally does NOT auto-remove on unmount.
 */
export function clearSignaturePadDraft(storageKey: string): void {
  try {
    if (typeof window !== 'undefined') localStorage.removeItem(storageKey);
  } catch {
    // intentional swallow
  }
}

// ─── Canvas helpers ───────────────────────────────────────────────────────────

function resolveCssVar(el: HTMLElement | null, varName: string, fallback: string): string {
  if (!el || typeof window === 'undefined') return fallback;
  return getComputedStyle(el).getPropertyValue(varName).trim() || fallback;
}

function drawGuide(
  ctx: CanvasRenderingContext2D,
  cssW: number,
  cssH: number,
  guideColor: string,
): void {
  const baselineY = cssH * 0.7; // 30% from bottom
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = guideColor;
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(cssW * 0.05, baselineY);
  ctx.lineTo(cssW * 0.95, baselineY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.globalAlpha = 0.55;
  ctx.fillStyle = guideColor;
  ctx.font = '13px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Sign here', cssW / 2, baselineY - 8);
  ctx.restore();
}

function drawStroke(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
  strokeColor: string,
): void {
  if (stroke.length === 0) return;

  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = strokeColor;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (stroke.length === 1) {
    const p = stroke[0];
    const r = Math.max(0.5, DEFAULT_STROKE_WIDTH / 2);
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  // Average pressure across the stroke for consistent line width.
  const avgPressure =
    stroke.reduce((sum, p) => sum + (p.pressure > 0 ? p.pressure : 0.5), 0) /
    stroke.length;
  ctx.lineWidth = Math.max(1, Math.min(DEFAULT_STROKE_WIDTH * (0.5 + avgPressure) * 2, 8));

  ctx.beginPath();
  ctx.moveTo(stroke[0].x, stroke[0].y);

  if (stroke.length === 2) {
    ctx.lineTo(stroke[1].x, stroke[1].y);
  } else {
    // Quadratic curves through midpoints — standard signature smoothing.
    // Segment: start → first midpoint; then for each consecutive pair
    // (p[i], p[i+1]) control = p[i], endpoint = midpoint(p[i], p[i+1]).
    const firstMid = {
      x: (stroke[0].x + stroke[1].x) / 2,
      y: (stroke[0].y + stroke[1].y) / 2,
    };
    ctx.lineTo(firstMid.x, firstMid.y);

    for (let i = 1; i < stroke.length - 1; i++) {
      const mid = {
        x: (stroke[i].x + stroke[i + 1].x) / 2,
        y: (stroke[i].y + stroke[i + 1].y) / 2,
      };
      ctx.quadraticCurveTo(stroke[i].x, stroke[i].y, mid.x, mid.y);
    }

    ctx.lineTo(stroke[stroke.length - 1].x, stroke[stroke.length - 1].y);
  }

  ctx.stroke();
}

function renderAllStrokes(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  dpr: number,
  strokes: Stroke[],
  currentStroke: Stroke,
  showGuide: boolean,
  hasContent: boolean,
  strokeColor: string,
  guideColor: string,
): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const cssW = canvas.width / dpr;
  const cssH = canvas.height / dpr;

  if (showGuide && !hasContent && currentStroke.length === 0) {
    drawGuide(ctx, cssW, cssH, guideColor);
  }

  for (const stroke of strokes) {
    drawStroke(ctx, stroke, strokeColor);
  }

  if (currentStroke.length > 0) {
    drawStroke(ctx, currentStroke, strokeColor);
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SignaturePad({
  storageKey,
  storageVersion = 1,
  initialValue,
  onChange,
  onClear,
  minHeight,
  ariaLabel = 'Signature pad',
  showGuide = true,
  disabled = false,
  className,
}: SignaturePadProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // All drawing state held in refs to avoid stale-closure issues in rAF callbacks.
  const strokesRef = useRef<Stroke[]>([]);
  const currentStrokeRef = useRef<Stroke>([]);
  const isDrawingRef = useRef(false);
  const hasContentRef = useRef(false);
  const showGuideRef = useRef(showGuide);
  const dprRef = useRef<number>(1);

  // Callback refs — always hold latest without causing dep-chain rerenders.
  const onChangeRef = useRef(onChange);
  const onClearRef = useRef(onClear);

  // Timer handles
  const rafRef = useRef<number | null>(null);
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derived UI state (drives button enabled/disabled + sr-only span)
  const [hasContent, setHasContent] = useState(false);
  const [canUndo, setCanUndo] = useState(false);

  const effectiveMinHeight = Math.max(MIN_HEIGHT_FLOOR, minHeight ?? MIN_HEIGHT_FLOOR);

  // Keep callback refs fresh on every render.
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => { onClearRef.current = onClear; }, [onClear]);
  useEffect(() => { showGuideRef.current = showGuide; }, [showGuide]);

  // ── Canvas sizing ──────────────────────────────────────────────────────────

  const fitCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
    dprRef.current = dpr;

    const cssW = container.clientWidth || 300;
    const cssH = effectiveMinHeight;
    const newW = Math.round(cssW * dpr);
    const newH = Math.round(cssH * dpr);

    if (canvas.width !== newW || canvas.height !== newH) {
      canvas.width = newW;
      canvas.height = newH;
    }

    canvas.style.width = '100%';
    canvas.style.height = `${cssH}px`;
  }, [effectiveMinHeight]);

  // ── Render pass (stable — reads all values from refs) ─────────────────────

  const render = useCallback(() => {
    rafRef.current = null;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const strokeColor = resolveCssVar(canvas, '--ci-text-primary', 'black');
    const guideColor = resolveCssVar(canvas, '--ci-text-muted', 'gray');

    renderAllStrokes(
      ctx,
      canvas,
      dprRef.current,
      strokesRef.current,
      currentStrokeRef.current,
      showGuideRef.current,
      hasContentRef.current,
      strokeColor,
      guideColor,
    );
  }, []); // stable — all data read from refs

  const scheduleRender = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(render);
  }, [render]); // render is stable

  // ── Persistence (stable — reads key/version from refs) ────────────────────

  const storageKeyRef = useRef(storageKey);
  const storageVersionRef = useRef(storageVersion);
  useEffect(() => { storageKeyRef.current = storageKey; }, [storageKey]);
  useEffect(() => { storageVersionRef.current = storageVersion; }, [storageVersion]);

  const schedulePersist = useCallback(() => {
    const key = storageKeyRef.current;
    if (!key) return;
    if (persistTimerRef.current !== null) clearTimeout(persistTimerRef.current);
    persistTimerRef.current = setTimeout(() => {
      persistTimerRef.current = null;
      const k = storageKeyRef.current;
      if (!k) return;
      safeWriteEnvelope(k, {
        v: storageVersionRef.current,
        ts: Date.now(),
        data: { strokes: strokesRef.current },
      });
    }, PERSIST_DEBOUNCE_MS);
  }, []); // stable

  // ── Emit onChange ──────────────────────────────────────────────────────────

  const emitChange = useCallback((clear = false) => {
    const cb = onChangeRef.current;
    if (!cb) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = dprRef.current;
    if (clear) {
      cb({
        dataUrl: '',
        widthPx: Math.round(canvas.width / dpr),
        heightPx: Math.round(canvas.height / dpr),
        hasContent: false,
      });
    } else {
      cb({
        dataUrl: canvas.toDataURL('image/png'),
        widthPx: Math.round(canvas.width / dpr),
        heightPx: Math.round(canvas.height / dpr),
        hasContent: true,
      });
    }
  }, []); // stable — reads from refs

  // ── Mount: fit + rehydrate ─────────────────────────────────────────────────

  useEffect(() => {
    fitCanvas();

    if (storageKey) {
      const stored = safeReadEnvelope(storageKey);
      if (
        stored &&
        stored.v === storageVersion &&
        stored.data &&
        Array.isArray(stored.data.strokes) &&
        stored.data.strokes.length > 0
      ) {
        strokesRef.current = stored.data.strokes;
        hasContentRef.current = true;
        setHasContent(true);
        setCanUndo(true);
        scheduleRender();
        return;
      }
    }

    if (initialValue) {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const dpr = dprRef.current;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.drawImage(img, 0, 0, canvas.width / dpr, canvas.height / dpr);
      };
      img.src = initialValue;
    } else {
      scheduleRender();
    }
    // Intentionally only runs on mount; deps are stable refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── ResizeObserver — refit + replay strokes ────────────────────────────────

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => {
      fitCanvas();
      scheduleRender();
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [fitCanvas, scheduleRender]);

  // ── Re-render when showGuide or hasContent change ─────────────────────────

  useEffect(() => {
    showGuideRef.current = showGuide;
    scheduleRender();
  }, [showGuide, scheduleRender]);

  useEffect(() => {
    scheduleRender();
  }, [hasContent, scheduleRender]);

  // ── Unmount: flush pending persist ────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (persistTimerRef.current !== null) {
        clearTimeout(persistTimerRef.current);
        const key = storageKeyRef.current;
        if (key && strokesRef.current.length > 0) {
          safeWriteEnvelope(key, {
            v: storageVersionRef.current,
            ts: Date.now(),
            data: { strokes: strokesRef.current },
          });
        }
      }
    };
  }, []); // runs once on unmount

  // ── Pointer event handlers ─────────────────────────────────────────────────

  const getPoint = useCallback((e: React.PointerEvent<HTMLCanvasElement>): StrokePoint => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure ?? 0,
    };
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (disabled) return;
      e.preventDefault();
      (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
      isDrawingRef.current = true;
      currentStrokeRef.current = [getPoint(e)];
      scheduleRender();
    },
    [disabled, getPoint, scheduleRender],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current || disabled) return;
      e.preventDefault();
      currentStrokeRef.current.push(getPoint(e));
      scheduleRender();
    },
    [disabled, getPoint, scheduleRender],
  );

  const finishStroke = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current || disabled) return;
      e.preventDefault();
      isDrawingRef.current = false;
      currentStrokeRef.current.push(getPoint(e));

      const finished = currentStrokeRef.current;
      currentStrokeRef.current = [];

      if (finished.length > 0) {
        strokesRef.current = [...strokesRef.current, finished];
        hasContentRef.current = true;
        setHasContent(true);
        setCanUndo(true);
        schedulePersist();
        emitChange(false);
      }
      scheduleRender();
    },
    [disabled, emitChange, getPoint, schedulePersist, scheduleRender],
  );

  // ── Clear ──────────────────────────────────────────────────────────────────

  const handleClear = useCallback(() => {
    strokesRef.current = [];
    currentStrokeRef.current = [];
    isDrawingRef.current = false;
    hasContentRef.current = false;
    setHasContent(false);
    setCanUndo(false);

    if (persistTimerRef.current !== null) {
      clearTimeout(persistTimerRef.current);
      persistTimerRef.current = null;
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    onClearRef.current?.();
    emitChange(true);
    scheduleRender();
  }, [emitChange, scheduleRender]);

  // ── Undo ───────────────────────────────────────────────────────────────────

  const handleUndo = useCallback(() => {
    if (strokesRef.current.length === 0) return;
    strokesRef.current = strokesRef.current.slice(0, -1);
    const stillHasContent = strokesRef.current.length > 0;
    hasContentRef.current = stillHasContent;
    setHasContent(stillHasContent);
    setCanUndo(stillHasContent);
    schedulePersist();
    emitChange(!stillHasContent);
    scheduleRender();
  }, [emitChange, schedulePersist, scheduleRender]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className={`relative flex flex-col gap-2${className ? ` ${className}` : ''}`}>
      {/* Canvas wrapper */}
      <div
        className="relative rounded-md overflow-hidden"
        style={{
          border: '1px solid var(--ci-border)',
          background: 'var(--ci-surface)',
        }}
      >
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={ariaLabel}
          style={{
            display: 'block',
            width: '100%',
            height: `${effectiveMinHeight}px`,
            touchAction: 'none',
            cursor: disabled ? 'not-allowed' : 'crosshair',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishStroke}
          onPointerLeave={finishStroke}
          onPointerCancel={finishStroke}
        />
        {hasContent && <span className="sr-only">Signature captured</span>}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleUndo}
          disabled={!canUndo || disabled}
          aria-label="Undo last stroke"
          className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80"
          style={{
            minHeight: '32px',
            color: 'var(--ci-text-secondary)',
            border: '1px solid var(--ci-border)',
            background: 'var(--ci-surface)',
          }}
        >
          <RotateCcw size={13} aria-hidden />
          Undo
        </button>

        <button
          type="button"
          onClick={handleClear}
          disabled={disabled}
          aria-label="Clear signature"
          className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80"
          style={{
            minHeight: '32px',
            color: 'var(--ci-text-secondary)',
            border: '1px solid var(--ci-border)',
            background: 'var(--ci-surface)',
          }}
        >
          <Trash2 size={13} aria-hidden />
          Clear
        </button>
      </div>
    </div>
  );
}
