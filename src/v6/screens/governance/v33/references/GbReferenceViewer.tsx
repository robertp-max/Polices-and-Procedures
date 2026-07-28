// In-portal viewer for controlled Governing Body reference documents
// (review blocker 6). Renders the bundled document in a sandboxed iframe via
// srcDoc — no network URL exists for the document, and the viewer mounts only
// inside the authenticated /governance portal shell.

import { useEffect } from 'react';
import { ShieldAlert, X } from 'lucide-react';
import { getGbReferenceDoc, type GbReferenceDocId } from './referenceDocs';
import './gbReferenceViewer.css';

export default function GbReferenceViewer({ docId, onClose }: { docId: GbReferenceDocId; onClose: () => void }) {
  const doc = getGbReferenceDoc(docId);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="gb-refviewer-overlay" role="dialog" aria-modal="true" aria-label={doc.title}>
      <div className="gb-refviewer-panel">
        <header className="gb-refviewer-bar">
          <div className="gb-refviewer-title">
            <strong>{doc.title}</strong>
            <span className="gb-refviewer-notice">
              <ShieldAlert size={14} aria-hidden="true" /> {doc.controlNotice}
            </span>
          </div>
          <button type="button" className="gb-refviewer-close" onClick={onClose} aria-label="Close reference document">
            <X size={18} aria-hidden="true" /> Close
          </button>
        </header>
        <iframe
          className="gb-refviewer-frame"
          title={doc.title}
          // Static controlled HTML only: no scripts, no same-origin access,
          // no navigation out of the sandbox.
          sandbox=""
          srcDoc={doc.html}
        />
      </div>
    </div>
  );
}
