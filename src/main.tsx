import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './auth/AuthProvider'
import { ModalProvider } from './contexts/ModalContext'

// ── Stale-chunk recovery ──────────────────────────────────────────
// After a deploy, the browser may still hold an old index.html that
// references JS chunk hashes that were deleted from S3. CloudFront's
// SPA 404→index.html catch returns text/html, causing
// "Failed to load module script" errors. On any such error, reload
// once to pick up the new index.html (guarded against infinite loops).
window.addEventListener('error', (e) => {
  const msg = e.message ?? '';
  if (
    (msg.includes('Failed to fetch dynamically imported module') ||
     msg.includes('error loading dynamically imported module') ||
     msg.includes('Expected a JavaScript-or-Wasm module script')) &&
    !sessionStorage.getItem('ci_chunk_reload_v1')
  ) {
    sessionStorage.setItem('ci_chunk_reload_v1', '1');
    window.location.reload();
  }
});
window.addEventListener('unhandledrejection', (e) => {
  const msg = String(e.reason ?? '');
  if (
    (msg.includes('Failed to fetch dynamically imported module') ||
     msg.includes('error loading dynamically imported module')) &&
    !sessionStorage.getItem('ci_chunk_reload_v1')
  ) {
    sessionStorage.setItem('ci_chunk_reload_v1', '1');
    window.location.reload();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ModalProvider>
        <App />
      </ModalProvider>
    </AuthProvider>
  </StrictMode>,
)
