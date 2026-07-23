import { useLocation } from 'react-router-dom';
import { GovernanceAcademyPlayer } from '../governance/GovernanceAcademyPlayer';
import { GovernanceOffice } from '../governance/GovernanceOffice';
import '../governance/governance-office.css';

export function GovernanceScreen() {
  const { pathname } = useLocation();
  return /^\/governance\/academy\/modules\/[^/]+\/?$/.test(pathname)
    ? <GovernanceAcademyPlayer />
    : <GovernanceOffice />;
}
