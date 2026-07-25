"use client";

import { AlertTriangle } from "lucide-react";
import { HANDBOOK_META } from "../_lib/handbook";

/**
 * Controlled-draft banner (Master Correction / handbook plan §3). While the
 * handbook is not effective, this appears on every handbook surface — visible
 * header, screen-reader text, and (via CSS) print output. It must not be
 * removed until an approved build sets acknowledgmentEnabled/effective.
 */
export function HandbookDraftBanner() {
  if (!HANDBOOK_META.notEffective) return null;
  return (
    <div className="hb-draft-banner" role="note" aria-label="Handbook status">
      <AlertTriangle aria-hidden="true" />
      <div>
        <strong>{HANDBOOK_META.watermark}</strong>
        <span>
          {HANDBOOK_META.documentId} · {HANDBOOK_META.version} — for counsel and policy-owner
          review only. Do not distribute for acknowledgment until every release gate is closed.
        </span>
      </div>
      <span className="sr-only">
        Counsel-review draft. Not effective. Employee acknowledgment is disabled.
      </span>
    </div>
  );
}
