/* ═══════════════════════════════════════════════════════════════════════
   printForm — open the browser print preview for /forms/:id/print without
   spawning a new browser tab.

   Strategy: mount an off-screen iframe that loads the dedicated print
   route; once the iframe document reports "load", invoke its print()
   method so the host window surfaces the native Save-as-PDF / Print
   dialog. The iframe is removed after the dialog closes (afterprint)
   or via a safety-net timeout so the DOM stays clean.
   ═══════════════════════════════════════════════════════════════════════ */

export function printForm(formId: string): void {
  if (!formId) return;

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
  iframe.src = `/forms/${formId}/print`;

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
    // FormPrintView has its own 700ms auto-print timer; trigger ours after
    // a similar settle-delay so fonts/SVG finish laying out first.
    window.setTimeout(triggerPrint, 400);
  });

  document.body.appendChild(iframe);
}
