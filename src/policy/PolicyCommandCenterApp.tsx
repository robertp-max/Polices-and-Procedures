import { Navigate, Route, Routes } from 'react-router-dom';
import { CommandCenterLayout } from '@/policy/components/CommandCenterLayout';
import { DashboardPage } from '@/policy/pages/DashboardPage';
import { DraftPolicyPage } from '@/policy/pages/DraftPolicyPage';
import { DraftsPage } from '@/policy/pages/DraftsPage';
import { GovernancePage } from '@/policy/pages/GovernancePage';
import { LibraryPage } from '@/policy/pages/LibraryPage';
import { MasterCalendarPage } from '@/policy/pages/MasterCalendarPage';
import { PolicyDetailPage } from '@/policy/pages/PolicyDetailPage';
import { PrintPage } from '@/policy/pages/PrintPage';
import { PublishPage } from '@/policy/pages/PublishPage';
import { ReviewPage } from '@/policy/pages/ReviewPage';
import { TaxonomyPage } from '@/policy/pages/TaxonomyPage';

export default function PolicyCommandCenterApp() {
  return (
    <CommandCenterLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/calendar" element={<MasterCalendarPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/library/:policyId" element={<PolicyDetailPage />} />
        <Route path="/taxonomy" element={<TaxonomyPage />} />
        <Route path="/governance" element={<GovernancePage />} />
        <Route path="/drafts" element={<DraftsPage />} />
        <Route path="/drafts/:policyId" element={<DraftPolicyPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/publish" element={<PublishPage />} />
        <Route path="/print/:policyId" element={<PrintPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </CommandCenterLayout>
  );
}
