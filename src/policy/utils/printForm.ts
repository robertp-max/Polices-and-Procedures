/* ═══════════════════════════════════════════════════════════════════════
   printForm — open the browser print preview for /forms/:id/print without
   spawning a new browser tab.

   Strategy: mount an off-screen iframe that loads the dedicated print
   route; once the iframe document reports "load", invoke its print()
   method so the host window surfaces the native Save-as-PDF / Print
   dialog. The iframe is removed after the dialog closes (afterprint)
   or via a safety-net timeout so the DOM stays clean.

   Preserves formInstanceId (for audit/evidence linkage) and resolves
   legacy aliases to canonical IDs (V2 parity with V1 form print/download).
   ═══════════════════════════════════════════════════════════════════════ */

import { resolveCanonicalFormId } from '@/policy/data/formIdAliases';

export function printForm(formId: string, formInstanceId?: string): void {
  if (!formId) return;

  const canon = resolveCanonicalFormId(formId) ?? formId;

  const existing = document.getElementById('ci-print-frame') as HTMLIFrameElement | null;
  existing?.remove();

  const iframe = document.createElement('iframe');
  iframe.id = 'ci-print-frame';
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  const params = new URLSearchParams();
  if (formInstanceId) params.set('form_instance_id', formInstanceId);
  const qs = params.toString();
  iframe.src = `/forms/${encodeURIComponent(canon)}/print${qs ? `?${qs}` : ''}`;

  const cleanup = () => {
    try { iframe.remove(); } catch { /* no-op */ }
  };

  let printed = false;
  const triggerPrint = () => {
    if (printed) return;
    printed = true;
    try {
      const frameWin = iframe.contentWindow;
      if (!frameWin) return;
      frameWin.focus();
      frameWin.print();
      frameWin.addEventListener('afterprint', cleanup, { once: true });
      // Safety net — if afterprint never fires (some browsers), drop after 60s.
      window.setTimeout(cleanup, 60_000);
    } catch {
      cleanup();
    }
  };

  iframe.addEventListener('load', () => {
    // FormWorkspaceScreen (print route) has 650ms auto-print; trigger ours
    // after settle so fonts/layout finish (iframe path for printForm util).
    window.setTimeout(triggerPrint, 400);
  });

  document.body.appendChild(iframe);
}
