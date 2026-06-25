import CareIndeedOnboardingLMS from "./CareIndeedOnboardingLMS";
import { JourneyLearningShell } from "./JourneyLearningShell";

export function JourneyOverviewScreen() {
  return (
    <JourneyLearningShell
      title="My Learning"
      subtitle="Required compliance and clinical training."
    >
      <CareIndeedOnboardingLMS />
    </JourneyLearningShell>
  );
}

export default JourneyOverviewScreen;
