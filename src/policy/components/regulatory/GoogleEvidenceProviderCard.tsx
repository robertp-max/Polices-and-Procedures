import { useEffect, useState } from 'react';
import { Cloud, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { CalendarApi, type EvidenceHealthResponse } from '@/policy/services/calendarApi';

/* ═══════════════════════════════════════════════════════════════
   GoogleEvidenceProviderCard
   ----------------------------------------------------------------
   Small, read-only status card for the Evidence Center sidebar.
   Surfaces the Google Calendar + Drive evidence provider and its
   reachability without touching the page's protected fetch/identity
   logic. Files are uploaded from task/swimlane workspaces (where the
   event/task/form context is known); this card indexes the provider.
   ═══════════════════════════════════════════════════════════════ */

export function GoogleEvidenceProviderCard() {
  const [health, setHealth] = useState<EvidenceHealthResponse | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    CalendarApi.evidenceHealth()
      .then(h => { if (active) setHealth(h); })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, []);

  const enabled = health?.enabled ?? false;
  const reachable = health?.drive.reachable ?? false;
  const rootId = health?.rootFolderId;

  return (
    <div>
      <div className="flex items-center gap-2">
        <Cloud size={16} className="text-[var(--v3-teal-light)]" />
        <h3 className="text-sm font-semibold tracking-tight text-[var(--v3-text-primary)]">Google Calendar / Drive evidence</h3>
      </div>
      <p className="mt-1.5 text-xs text-[var(--v3-text-secondary)] leading-relaxed">
        Drive stores the actual files; the matching Calendar event attaches and indexes them.
        Upload Google-backed evidence from a task or event swimlane workspace, where the
        event/task/form context is known.
      </p>

      <div className="mt-2 flex flex-col gap-1 text-[11px]">
        {failed ? (
          <span className="inline-flex items-center gap-1.5 text-[var(--v3-text-tertiary)]">
            <AlertTriangle size={12} /> Provider status unavailable (backend offline).
          </span>
        ) : health == null ? (
          <span className="text-[var(--v3-text-tertiary)]">Checking provider status…</span>
        ) : (
          <>
            <span className={`inline-flex items-center gap-1.5 ${enabled && reachable ? 'ci-text-success' : 'text-[var(--v3-text-tertiary)]'}`}>
              {enabled && reachable ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
              {!enabled ? 'Evidence provider disabled' : reachable ? 'Shared Drive reachable' : 'Shared Drive unreachable'}
            </span>
            <span className="text-[var(--v3-text-tertiary)]">provider: {health.provider}</span>
            {rootId ? (
              <a
                href={`https://drive.google.com/drive/folders/${rootId}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[var(--v3-teal-light)]"
              >
                Open Drive evidence root <ExternalLink size={11} />
              </a>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
