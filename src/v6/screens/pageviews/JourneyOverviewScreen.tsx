import CareIndeedOnboardingLMS from "./CareIndeedOnboardingLMS";
import { JourneyLearningShell } from "./JourneyLearningShell";
import { LearnerProvider } from '@/policy/journey/lib/learnerState';

export function JourneyOverviewScreen() {
  return (
    <JourneyLearningShell
      title="My Learning"
      subtitle="Required compliance and clinical training."
    >
      <LearnerProvider>
        <CareIndeedOnboardingLMS />
      </LearnerProvider>
    </JourneyLearningShell>
  );
}

export default JourneyOverviewScreen;
