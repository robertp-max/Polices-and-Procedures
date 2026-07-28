import { useEffect } from 'react';
import MyJourneyApp from '../governance/v33/MyJourneyApp';
import '../governance/governance-office.css';
import '../governance/v33/v33-globals.css';
import '../governance/v33/gb-academy/styles.css';
import '../governance/v33/compliance/compliance.css';
import '../governance/v33/qapi/qapi2026.css';
import '../governance/v33/qapi/components/qapiDepth.css';
import '../governance/v33/forms/forms.css';
import '../governance/v33/tabletop2026/tabletop2026.css';

export function GovernanceScreen() {
  useEffect(() => {
    try { localStorage.removeItem('gb-portal-version'); } catch { /* ignore stale preference cleanup */ }
  }, []);

  return (
    <div className="v33-scope">
      <MyJourneyApp />
    </div>
  );
}
