import { Navigate, Route, Routes } from 'react-router-dom';
import { CommandCenterLayout } from '@/policy/components/CommandCenterLayout';
import { DashboardPage } from '@/policy/pages/DashboardPage';
import { GovernancePage } from '@/policy/pages/GovernancePage';
import { LibraryPage } from '@/policy/pages/LibraryPage';
import { MasterCalendarPage } from '@/policy/pages/MasterCalendarPage';
import { MasterControlInventoryPage } from '@/policy/pages/MasterControlInventoryPage';
import { PolicyDetailPage } from '@/policy/pages/PolicyDetailPage';
import { PrintPage } from '@/policy/pages/PrintPage';
import { TaxonomyPage } from '@/policy/pages/TaxonomyPage';

export default function PolicyCommandCenterApp() {
  return (
    <CommandCenterLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/calendar" element={<MasterCalendarPage />} />
        <Route path="/compliance/master-controls" element={<MasterControlInventoryPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/library/:policyId" element={<PolicyDetailPage />} />
        <Route path="/taxonomy" element={<TaxonomyPage />} />
        <Route path="/governance" element={<GovernancePage />} />
        <Route path="/print/:policyId" element={<PrintPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </CommandCenterLayout>
  );
}
