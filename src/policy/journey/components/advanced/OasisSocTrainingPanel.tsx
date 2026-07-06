import React, { useEffect, useRef, useState } from 'react';
import { useJourneyStore } from '../../stores/journeyStore';
import { CareIndeedCard } from '@/components/theme/CareIndeedCard';
import { CareIndeedButton } from '@/components/theme/CareIndeedButton';
import { CareIndeedEyebrow } from '@/components/theme/CareIndeedEyebrow';
import { ArrowLeft, Play } from 'lucide-react';

interface Props {
  moduleId: string;
  onComplete?: (score: number, passed: boolean, artifact?: any) => void;
}

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

export const OasisSocTrainingPanel: React.FC<Props> = ({ moduleId, onComplete }) => {
  const [isStarted, setIsStarted] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const store = useJourneyStore();
  const storeRef = useRef(store);
  storeRef.current = store;

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data as SimulatorMessage | undefined;
      if (!data || data.source !== SIMULATOR_MESSAGE_SOURCE) return;
      if (data.type !== 'course-complete') return;

      const score = data.score ?? 0;
      const passed = data.passed ?? score >= 80;
      
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

  if (isStarted) {
    return (
      <div className="relative w-full h-full flex flex-col bg-canvas theme-ci-light-orange">
        {/* Back navigation header for seamless exiting */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-ci-border">
          <button
            type="button"
            onClick={() => setIsStarted(false)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-ci-teal hover:text-ci-teal-deep transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Simulator Overview
          </button>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            RN-ADV-03 Simulator Mode
          </span>
        </div>
        <div className="flex-1 w-full overflow-hidden">
          <iframe
            src={SIMULATOR_URL}
            title="OASIS-E2 Start of Care Assessment"
            allow="autoplay; fullscreen"
            style={{ display: 'block', width: '100%', height: '100%', border: 'none', background: 'transparent' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="theme-ci-light-orange bg-canvas min-h-screen py-12 px-6 md:px-12 lg:px-16 flex flex-col justify-start items-center">
      <div className="max-w-4xl w-full text-left space-y-8">
        
        {/* Header Block */}
        <div className="space-y-4">
          <CareIndeedEyebrow>
            ADVANCED TRAINING &bull; RN-ADV-03
          </CareIndeedEyebrow>
          <h1 className="text-4xl md:text-5xl font-extrabold text-ci-teal-deep tracking-tight">
            OASIS-E2 Start of Care Assessment
          </h1>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-3xl pt-2">
            A hands-on simulator for completing the OASIS-E2 at Start of Care. You will work a realistic home health chart end to end: review clinical artifacts, select accurate item responses, link the evidence that supports them, and defend your rationale – the same standard surveyors hold your documentation to.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          
          <CareIndeedCard variant="grid-outline">
            <h3 className="text-base font-bold text-ci-teal-deep mb-2">13 SOC sections</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Work Disclosure through Section O exactly as documented at Start of Care.
            </p>
          </CareIndeedCard>

          <CareIndeedCard variant="grid-outline">
            <h3 className="text-base font-bold text-ci-teal-deep mb-2">20 chart artifacts</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Review referrals, H&P, med lists, and wound care notes, then attach evidence anchors to each OASIS item.
            </p>
          </CareIndeedCard>

          <CareIndeedCard variant="grid-outline">
            <h3 className="text-base font-bold text-ci-teal-deep mb-2">Item-level coding</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Code GG self-care and mobility, M0300 wounds, behavioral items, and medications with instant rationale feedback.
            </p>
          </CareIndeedCard>

          <CareIndeedCard variant="grid-outline">
            <h3 className="text-base font-bold text-ci-teal-deep mb-2">Guided narration</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Every section and item includes clinical narration explaining the correct response.
            </p>
          </CareIndeedCard>

          <CareIndeedCard variant="grid-outline">
            <h3 className="text-base font-bold text-ci-teal-deep mb-2">3-field scoring</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Each item is scored on response, evidence, and rationale; 80% is required to pass the final review.
            </p>
          </CareIndeedCard>

          <CareIndeedCard variant="grid-tinted">
            <h3 className="text-base font-bold text-ci-teal-deep mb-2">Estimated time</h3>
            <p className="text-sm text-ci-teal leading-relaxed font-medium">
              45–60 minutes. Progress is saved section by section; your score reports to your training record on completion.
            </p>
          </CareIndeedCard>

        </div>

        {/* CTA Actions Panel */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pt-6 border-t border-ci-border">
          <CareIndeedButton
            variant="primary"
            shape="rounded"
            onClick={() => setIsStarted(true)}
            className="w-full sm:w-auto"
          >
            Start Training
          </CareIndeedButton>
          
          <CareIndeedButton
            variant="outline"
            shape="rounded"
            onClick={() => setIsStarted(true)}
            className="w-full sm:w-auto flex items-center gap-2"
          >
            <Play size={14} className="fill-current" />
            Watch Demo
          </CareIndeedButton>

          <span className="text-xs text-gray-400 font-medium">
            No PHI &mdash; demo training data only.
          </span>
        </div>

      </div>
    </div>
  );
};
