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

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/today" replace />} />
        <Route path="/today" element={<TodayScreen />} />
        <Route path="/patients" element={<PatientsScreen />} />
        <Route path="/patients/:patientId" element={<PatientChartScreen />} />
        <Route path="/patients/:patientId/:tab" element={<PatientChartScreen />} />
        <Route path="/intake" element={<ReferralIntakeScreen />} />
        <Route path="/schedule" element={<ScheduleScreen />} />
        <Route path="/clinical" element={<ClinicalScreen />} />
        <Route path="/orders" element={<OrdersScreen />} />
        <Route path="/quality" element={<QualityScreen />} />
        <Route path="/billing" element={<BillingScreen />} />
        <Route path="/reports" element={<ReportsScreen />} />
        <Route path="*" element={<Navigate to="/today" replace />} />
      </Route>
      <Route element={<DocShell />}>
        <Route path="/business-plan" element={<BusinessPlanScreen />} />
        <Route path="/requirements" element={<RequirementsScreen />} />
      </Route>
    </Routes>
  )
}
