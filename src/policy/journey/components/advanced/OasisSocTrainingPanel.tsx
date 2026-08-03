import React, { useEffect, useRef } from 'react';
import { useJourneyStore } from '../../stores/journeyStore';

interface Props {
  moduleId: string;
  onComplete?: (score: number, passed: boolean, artifact?: any) => void;
}

/** Static bundle of the full CI-ION OASIS-E2 SOC simulator (built from
 *  CI-ION_OASIS-E2_SOC and copied into public/). `theme=journey` switches the
 *  simulator to the Journey light/teal look with no CI-ION branding. It
 *  reports progress to this host via postMessage — see handleMessage. */
const SIMULATOR_URL = '/advanced-training/oasis-e2-soc/index.html?theme=journey';
const SIMULATOR_MESSAGE_SOURCE = 'ci-ion-oasis-e2-soc';

interface SimulatorMessage {
  source: string;
  type: 'section-complete' | 'course-complete';
  sectionId?: string;
  score: number | null;
  passed: boolean | null;
  completedSections?: string[];
  sectionScores?: Record<string, { raw: number; passed: boolean }>;
}

/**
 * GAO-03: oasis_lab variant — full OASIS-E2 SOC simulator, rendered
 * full-bleed in the Journey theme, with completion bridged into the
 * Journey evidence/store contract.
 */
export const OasisSocTrainingPanel: React.FC<Props> = ({ moduleId, onComplete }) => {
  const onCompleteRef = useRef(onComplete);
  const store = useJourneyStore();
  const storeRef = useRef(store);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    storeRef.current = store;
  }, [store]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data as SimulatorMessage | undefined;
      if (!data || data.source !== SIMULATOR_MESSAGE_SOURCE) return;
      if (data.type !== 'course-complete') return;

      const score = data.score ?? 0;
      const passed = data.passed ?? score >= 80;
      // Persist to the Journey store directly — this panel is self-contained
      // and no longer relies on the shared AdvancedTrainingPlayer wrapper.
      try {
        const s = storeRef.current;
        s.recordLearnerCompletion(s.currentEmployeeId, moduleId, passed, score, 'OASIS-E2 SOC simulator completed');
      } catch {
        // non-fatal in demo
      }
      onCompleteRef.current?.(score, passed, {
        policy_id: 'CL-CP-001',
        workflow_id: 'wf-rn-adv-03-oasis',
        event_id: 'evt-rn-adv-03-complete',
        module_id: moduleId,
        learner_id: 'demo-learner',
        timestamp: new Date().toISOString(),
        assessment_score: score,
        completion_artifact_type: 'oasis-soc-simulator',
        noPhi: true,
        type: 'oasis-soc-simulator',
        simulator: 'OASIS-E2 SOC',
        completedSections: data.completedSections ?? [],
        sectionScores: data.sectionScores ?? {},
        score,
        moduleId,
        policyId: 'CL-CP-001',
        workflowId: 'wf-rn-adv-03-oasis',
        eventId: 'evt-rn-adv-03-complete',
        learnerId: 'demo-learner',
        artifactType: 'oasis-soc-simulator',
      });
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [moduleId]);

  return (
    <iframe
      src={SIMULATOR_URL}
      title="OASIS-E2 Start of Care Assessment"
      allow="autoplay; fullscreen"
      style={{ display: 'block', width: '100%', height: '100%', border: 'none', background: 'transparent' }}
    />
  );
};
