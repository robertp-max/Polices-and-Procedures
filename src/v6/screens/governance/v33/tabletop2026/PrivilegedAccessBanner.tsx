// Visible label for a PRIVILEGED tabletop session (Super Admin / UAT Reviewer).
//
// A privileged tier bypasses readiness prerequisites, so the session must never
// look like an official one. This banner is the required labeling; the copy is
// contractual (see compliance/accessMode.ts PRIVILEGED_ACCESS_BANNERS).

import React from 'react';
import { ShieldCheck } from 'lucide-react';

import { PRIVILEGED_ACCESS_BANNERS, type PrivilegedAccessMode } from '../compliance/accessMode';

export interface PrivilegedAccessBannerProps {
  mode: PrivilegedAccessMode | null | undefined;
}

export default function PrivilegedAccessBanner({ mode }: PrivilegedAccessBannerProps): React.ReactElement | null {
  if (!mode) return null;
  const copy = PRIVILEGED_ACCESS_BANNERS[mode];
  return (
    <div className="bs-privileged-banner" role="status" data-access-mode={mode}>
      <style>{BANNER_STYLE}</style>
      <span className="bs-privileged-crest" aria-hidden="true">
        <ShieldCheck size={16} />
      </span>
      <div>
        <strong>{copy.label}</strong>
        <p>{copy.body}</p>
      </div>
    </div>
  );
}

const BANNER_STYLE = `
.bs-privileged-banner {
  display: flex; align-items: flex-start; gap: 11px; padding: 12px 15px;
  color: #4a3a10; background: #f7edd4; border: 1px solid #e6d5ad; border-left: 3px solid #b8912f;
  border-radius: 8px;
}
.bs-privileged-crest { flex: none; color: #8a6a1f; margin-top: 1px; }
.bs-privileged-banner strong { display: block; font-size: 11.5px; font-weight: 700; letter-spacing: .02em; }
.bs-privileged-banner p { margin: 3px 0 0; font-size: 10.5px; line-height: 1.55; }
`;
