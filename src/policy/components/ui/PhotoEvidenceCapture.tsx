/**
 * PhotoEvidenceCapture — canonical mobile-first photo capture primitive.
 *
 * Purpose: MVP P1-EVIDENCE-001 surface. Provides rear-camera capture on mobile
 * (via `<input capture="environment">`) and silent file-picker fallback on
 * desktop. Standardises downscaling, MIME validation, and JPEG re-encoding in
 * one reusable primitive so all consumers get identical output.
 *
 * Why this exists:
 *   The app currently uses raw `<input type="file">` in EvidenceCenterPage and
 *   WorkflowExecutionPanel without standardised downscale, MIME validation, or
 *   rear-camera attribute. This primitive consolidates that behaviour and
 *   ensures consistent dimensions and quality across all capture surfaces.
 *
 * Out of scope (deliberate):
 *   - No `getUserMedia` / live camera preview stream.
 *   - No IndexedDB storage (caller owns persistence — pair with EVIDENCE-001
 *     cache layer for blob persistence).
 *   - No FormSigningWorkspace integration (Protected Subsystem; Wave 3+).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, ImagePlus } from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB pre-downscale guard
const DEFAULT_MAX_DIMENSION = 2000;
const DEFAULT_QUALITY = 0.85;

// ─── Public types ─────────────────────────────────────────────────────────────

export interface PhotoEvidenceCaptureValue {
  /** Captured/selected image as data URL (JPEG). */
  dataUrl: string;
  /** Same image as a Blob for IndexedDB-class storage. */
  blob: Blob;
  widthPx: number;
  heightPx: number;
  /** ISO timestamp of capture. */
  capturedAt: string;
  /** Approximate size in bytes (data URL length). */
  approxBytes: number;
}

export interface PhotoEvidenceCaptureProps {
  /** Called after a successful capture/selection (post-downscale). */
  onCapture: (value: PhotoEvidenceCaptureValue) => void;
  /** Called on errors (denied permission, no camera, file too large). */
  onError?: (error: Error) => void;
  /** Max long-edge in px before downscale. Default 2000. */
  maxDimension?: number;
  /** JPEG output quality 0..1. Default 0.85. */
  quality?: number;
  /** Accessible label for the trigger. Default 'Capture photo evidence'. */
  ariaLabel?: string;
  /** Visible button label. Default 'Add photo'. */
  buttonLabel?: string;
  /** Disable the trigger. */
  disabled?: boolean;
  /**
   * Show a thumbnail preview after capture (not persisted in component state —
   * caller owns the value).
   */
  showPreview?: boolean;
  /** Optional className passthrough on the root container. */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PhotoEvidenceCapture({
  onCapture,
  onError,
  maxDimension = DEFAULT_MAX_DIMENSION,
  quality = DEFAULT_QUALITY,
  ariaLabel = 'Capture photo evidence',
  buttonLabel = 'Add photo',
  disabled = false,
  showPreview = false,
  className,
}: PhotoEvidenceCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Blob URL for the preview thumbnail. Stored in a ref so we can revoke it
  // reliably on the next capture or on unmount without stale-state races.
  const previewBlobUrlRef = useRef<string | null>(null);

  // The preview <img> src — either a blob: URL (preferred) or null.
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  // Callback refs so async closures always invoke the latest props without
  // requiring processFile to be recreated on every parent render.
  const onCaptureRef = useRef(onCapture);
  const onErrorRef = useRef(onError);
  useEffect(() => { onCaptureRef.current = onCapture; }, [onCapture]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  // Revoke the preview blob URL on unmount.
  useEffect(() => {
    return () => {
      if (previewBlobUrlRef.current) {
        URL.revokeObjectURL(previewBlobUrlRef.current);
        previewBlobUrlRef.current = null;
      }
    };
  }, []); // runs once on unmount

  // ── Core processing pipeline ───────────────────────────────────────────────

  const processFile = useCallback(
    (file: File) => {
      // Empty file — silent no-op.
      if (file.size === 0) return;

      // 25 MB pre-downscale guard.
      if (file.size > MAX_FILE_BYTES) {
        onErrorRef.current?.(new Error('File too large'));
        return;
      }

      // MIME guard — must be image/*.
      if (!file.type.startsWith('image/')) {
        onErrorRef.current?.(new Error('Unsupported file type'));
        return;
      }

      const capturedAt = new Date().toISOString();

      const reader = new FileReader();

      reader.onerror = () => {
        onErrorRef.current?.(new Error('Could not decode image'));
      };

      reader.onload = (readerEvent) => {
        const rawDataUrl = readerEvent.target?.result as string | undefined;
        if (!rawDataUrl) {
          onErrorRef.current?.(new Error('Could not decode image'));
          return;
        }

        const img = new Image();

        img.onerror = () => {
          onErrorRef.current?.(new Error('Could not decode image'));
        };

        img.onload = () => {
          const origW = img.naturalWidth;
          const origH = img.naturalHeight;
          const longEdge = Math.max(origW, origH);

          // Downscale if long-edge exceeds maxDimension; preserve aspect ratio.
          let targetW = origW;
          let targetH = origH;
          if (longEdge > maxDimension) {
            const scale = maxDimension / longEdge;
            targetW = Math.round(origW * scale);
            targetH = Math.round(origH * scale);
          }

          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            onErrorRef.current?.(new Error('Could not decode image'));
            return;
          }

          ctx.drawImage(img, 0, 0, targetW, targetH);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                onErrorRef.current?.(new Error('Could not decode image'));
                return;
              }

              // Re-read the JPEG blob as a data URL for the value object.
              const blobReader = new FileReader();

              blobReader.onerror = () => {
                onErrorRef.current?.(new Error('Could not decode image'));
              };

              blobReader.onload = (blobReaderEvent) => {
                const finalDataUrl = blobReaderEvent.target?.result as string | undefined;
                if (!finalDataUrl) {
                  onErrorRef.current?.(new Error('Could not decode image'));
                  return;
                }

                // Preview: revoke previous blob URL, create new one.
                if (showPreview) {
                  if (previewBlobUrlRef.current) {
                    URL.revokeObjectURL(previewBlobUrlRef.current);
                  }
                  previewBlobUrlRef.current = URL.createObjectURL(blob);
                  setPreviewSrc(previewBlobUrlRef.current);
                }

                onCaptureRef.current({
                  dataUrl: finalDataUrl,
                  blob,
                  widthPx: targetW,
                  heightPx: targetH,
                  capturedAt,
                  approxBytes: finalDataUrl.length,
                });

                // Return focus to the trigger after async processing completes.
                buttonRef.current?.focus();
              };

              blobReader.readAsDataURL(blob);
            },
            'image/jpeg',
            quality,
          );
        };

        img.src = rawDataUrl;
      };

      reader.readAsDataURL(file);
    },
    // maxDimension and quality are primitive props — fine as stable deps here.
    // onCapture/onError are read from refs so they don't trigger recreation.
    [maxDimension, quality, showPreview],
  );

  // ── Event handlers ─────────────────────────────────────────────────────────

  const handleButtonClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      // Reset so the same file path can be re-selected next time.
      e.target.value = '';
      if (!file) return;
      processFile(file);
    },
    [processFile],
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={`inline-flex flex-col gap-2${className ? ` ${className}` : ''}`}>
      {/*
       * Hidden file input.
       * - capture="environment" opens the rear camera on iOS/Android.
       * - On desktop the browser ignores the capture attribute and shows the
       *   standard file picker — no permission prompt required.
       * - aria-hidden because the visible button below is the accessible trigger.
       */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        aria-hidden
        tabIndex={-1}
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />

      {/* Trigger button — minimum 44 px touch target per WCAG 2.5.5. */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleButtonClick}
        disabled={disabled}
        aria-label={ariaLabel}
        className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80 active:scale-[0.98]"
        style={{
          minHeight: '44px',
          color: 'var(--ci-text-primary)',
          background: 'var(--ci-surface-elevated)',
          border: '1px solid var(--ci-border)',
        }}
      >
        <Camera size={16} aria-hidden />
        <span>{buttonLabel}</span>
        <ImagePlus size={14} aria-hidden style={{ opacity: 0.6 }} />
      </button>

      {/* Optional immediate-feedback thumbnail (max 120 px). */}
      {showPreview && previewSrc ? (
        <div
          className="overflow-hidden rounded"
          style={{
            width: '120px',
            height: '120px',
            border: '1px solid var(--ci-border)',
            background: 'var(--ci-surface)',
            flexShrink: 0,
          }}
        >
          <img
            src={previewSrc}
            alt="Captured photo preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      ) : null}
    </div>
  );
}
