import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './shell/AppShell'
import { DocShell } from './shell/DocShell'
import TodayScreen from './screens/TodayScreen'
import PatientsScreen from './screens/PatientsScreen'
import PatientChartScreen from './screens/PatientChartScreen'
import ReferralIntakeScreen from './screens/ReferralIntakeScreen'
import ScheduleScreen from './screens/ScheduleScreen'
import ClinicalScreen from './screens/ClinicalScreen'
import OrdersScreen from './screens/OrdersScreen'
import QualityScreen from './screens/QualityScreen'
import BillingScreen from './screens/BillingScreen'
import ReportsScreen from './screens/ReportsScreen'
import BusinessPlanScreen from './screens/BusinessPlanScreen'
import RequirementsScreen from './screens/RequirementsScreen'
import MvpPolicyScreen from './screens/MvpPolicyScreen'
import DomainScreen from './screens/DomainScreen'
import DesignSystemScreen from './screens/DesignSystemScreen'
import WorkQueueScreen from './screens/WorkQueueScreen'
import EpisodesScreen from './screens/EpisodesScreen'
import OasisAssessmentsScreen from './screens/OasisAssessmentsScreen'
import MedicationsScreen from './screens/MedicationsScreen'
import FieldVisitsScreen from './screens/FieldVisitsScreen'
import AideSupervisionScreen from './screens/AideSupervisionScreen'
import AuthorizationsScreen from './screens/AuthorizationsScreen'
import BeneficiaryNoticesScreen from './screens/BeneficiaryNoticesScreen'
import QapiProgrammeScreen from './screens/QapiProgrammeScreen'
import CmsQualityScreen from './screens/CmsQualityScreen'
import CompetencyScreen from './screens/CompetencyScreen'
import EmergencyPrepScreen from './screens/EmergencyPrepScreen'
import LegalEvidenceScreen from './screens/LegalEvidenceScreen'
import MessagesScreen from './screens/MessagesScreen'
import DocumentsScreen from './screens/DocumentsScreen'
import FormsLibraryScreen from './screens/FormsLibraryScreen'
import VendorsBaaScreen from './screens/VendorsBaaScreen'
import DataExportsScreen from './screens/DataExportsScreen'
import UsersAccessScreen from './screens/UsersAccessScreen'
import OrgMasterScreen from './screens/OrgMasterScreen'
import InteroperabilityScreen from './screens/InteroperabilityScreen'
import AiGovernanceScreen from './screens/AiGovernanceScreen'
import SecurityReliabilityScreen from './screens/SecurityReliabilityScreen'
import MigrationScreen from './screens/MigrationScreen'
import TraceabilityScreen from './screens/TraceabilityScreen'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/today" replace />} />
        <Route path="/today" element={<TodayScreen />} />
        <Route path="/work-queue" element={<WorkQueueScreen />} />
        <Route path="/patients" element={<PatientsScreen />} />
        <Route path="/patients/:patientId" element={<PatientChartScreen />} />
        <Route path="/patients/:patientId/:tab" element={<PatientChartScreen />} />
        <Route path="/intake" element={<ReferralIntakeScreen />} />
        <Route path="/schedule" element={<ScheduleScreen />} />
        <Route path="/clinical" element={<ClinicalScreen />} />
        <Route path="/episodes" element={<EpisodesScreen />} />
        <Route path="/oasis" element={<OasisAssessmentsScreen />} />
        <Route path="/orders" element={<OrdersScreen />} />
        <Route path="/medications" element={<MedicationsScreen />} />
        <Route path="/field-visits" element={<FieldVisitsScreen />} />
        <Route path="/aide-supervision" element={<AideSupervisionScreen />} />
        <Route path="/quality" element={<QualityScreen />} />
        <Route path="/qapi" element={<QapiProgrammeScreen />} />
        <Route path="/cms-quality" element={<CmsQualityScreen />} />
        <Route path="/competency" element={<CompetencyScreen />} />
        <Route path="/emergency" element={<EmergencyPrepScreen />} />
        <Route path="/billing" element={<BillingScreen />} />
        <Route path="/authorizations" element={<AuthorizationsScreen />} />
        <Route path="/beneficiary-notices" element={<BeneficiaryNoticesScreen />} />
        <Route path="/reports" element={<ReportsScreen />} />
        <Route path="/data-exports" element={<DataExportsScreen />} />
        <Route path="/legal-evidence" element={<LegalEvidenceScreen />} />
        <Route path="/messages" element={<MessagesScreen />} />
        <Route path="/documents" element={<DocumentsScreen />} />
        <Route path="/forms" element={<FormsLibraryScreen />} />
        <Route path="/vendors" element={<VendorsBaaScreen />} />
        <Route path="/users-access" element={<UsersAccessScreen />} />
        <Route path="/org-master" element={<OrgMasterScreen />} />
        <Route path="/interoperability" element={<InteroperabilityScreen />} />
        <Route path="/ai-governance" element={<AiGovernanceScreen />} />
        <Route path="/security" element={<SecurityReliabilityScreen />} />
        <Route path="/migration" element={<MigrationScreen />} />
        <Route path="/traceability" element={<TraceabilityScreen />} />
        {/* Residual unknown domains still resolve honestly */}
        <Route path="/domain/:domainId" element={<DomainScreen />} />
        <Route path="*" element={<Navigate to="/today" replace />} />
      </Route>
      <Route element={<DocShell />}>
        <Route path="/business-plan" element={<BusinessPlanScreen />} />
        <Route path="/requirements" element={<RequirementsScreen />} />
        <Route path="/mvp-policy" element={<MvpPolicyScreen />} />
      </Route>
      <Route path="/design-system" element={<DesignSystemScreen />} />
    </Routes>
  )
}
