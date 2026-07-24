import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { GovernanceAcademyPlayer } from '../governance/GovernanceAcademyPlayer';
import { GovernanceOffice } from '../governance/GovernanceOffice';
import MyJourneyApp from '../governance/v33/MyJourneyApp';
import '../governance/governance-office.css';
import '../governance/v33/v33-globals.css';
import '../governance/v33/gb-academy/styles.css';
import '../governance/v33/compliance/compliance.css';
import '../governance/v33/qapi/qapi2026.css';
import '../governance/v33/qapi/components/qapiDepth.css';
import '../governance/v33/forms/forms.css';

type PortalVersion = 'v1' | 'v2' | 'v3';

const VERSION_TITLE: Record<PortalVersion, string> = {
  v1: 'V1 — corrective office',
  v2: 'V2 — premium office',
  v3: 'V3 — Governing Body portal (enhanced)',
};

/** Floating V1/V2/V3 toggle — always visible in every version (bottom-left of the portal). */
function PortalVersionToggle({ version, onSelect }: { version: PortalVersion; onSelect: (next: PortalVersion) => void }) {
  return (
    <div
      className={`gb-portal-version-fab is-${version}`}
      role="group"
      aria-label="Governing Body portal version"
      title={VERSION_TITLE[version]}
    >
      {(['v1', 'v2', 'v3'] as const).map((option) => (
        <button
          key={option}
          type="button"
          className={version === option ? 'is-on' : ''}
          onClick={() => onSelect(option)}
          aria-pressed={version === option}
          title={VERSION_TITLE[option]}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function GovernanceScreen() {
  const { pathname } = useLocation();
  const [version, setVersion] = useState<PortalVersion>(() => {
    try {
      const stored = localStorage.getItem('gb-portal-version');
      return stored === 'v1' || stored === 'v2' || stored === 'v3' ? stored : 'v3';
    } catch { return 'v3'; }
  });
  const select = (next: PortalVersion) => {
    setVersion(next);
    try { localStorage.setItem('gb-portal-version', next); } catch { /* ignore */ }
  };

  // V3 = the v33 premium office with the enhanced Governing Body portal surfaces.
  if (version === 'v3') {
    return (
      <>
        <div className="v33-scope">
          <MyJourneyApp />
        </div>
        <PortalVersionToggle version={version} onSelect={select} />
      </>
    );
  }

  // V2 = the v33 premium office (unchanged, its own full-screen shell).
  if (version === 'v2') {
    return (
      <>
        <div className="v33-scope">
          <MyJourneyApp />
        </div>
        <PortalVersionToggle version={version} onSelect={select} />
      </>
    );
  }

  // V1 = the corrective office / academy player.
  const v1 = /^\/governance\/academy\/modules\/[^/]+\/?$/.test(pathname)
    ? <GovernanceAcademyPlayer />
    : <GovernanceOffice />;
  return (
    <>
      {v1}
      <PortalVersionToggle version={version} onSelect={select} />
    </>
  );
}
